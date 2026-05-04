import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { API_BASE_URL } from "@/lib/api/transport"
import { refreshSessionRequest } from "@/lib/api/auth-api"
import { useAuthStore } from "@/stores/auth-store"

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<unknown> | null = null

const redirectToLogin = () => {
  if (typeof window === "undefined") {
    return
  }

  if (window.location.pathname !== "/login") {
    window.location.replace("/login")
  }
}

export const protectedApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
})

protectedApi.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken

  if (accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

protectedApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry || originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error)
    }

    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      useAuthStore.getState().clearSession()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refreshSessionRequest(refreshToken)
      }

      await refreshPromise

      const newAccessToken = useAuthStore.getState().accessToken
      if (!newAccessToken) {
        throw error
      }

      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return protectedApi(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().clearSession()
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      refreshPromise = null
    }
  }
)
