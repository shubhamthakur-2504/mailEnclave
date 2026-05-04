import type { AuthSession } from "@/lib/session"
import { rawApi } from "@/lib/api/transport"
import { useAuthStore } from "@/stores/auth-store"

export type AuthCredentials = {
  email: string
  password: string
}

type AuthApiResponse = AuthSession

const normalizeSession = (data: AuthApiResponse): AuthSession => ({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  user: data.user,
})

export const signupRequest = async (payload: AuthCredentials) => {
  const { data } = await rawApi.post<AuthApiResponse>("/auth/signup", payload)
  const session = normalizeSession(data)
  useAuthStore.getState().setSession(session)
  return session
}

export const loginRequest = async (payload: AuthCredentials) => {
  const { data } = await rawApi.post<AuthApiResponse>("/auth/login", payload)
  const session = normalizeSession(data)
  useAuthStore.getState().setSession(session)
  return session
}

export const refreshSessionRequest = async (refreshTokenArg?: string) => {
  const refreshToken = refreshTokenArg ?? useAuthStore.getState().refreshToken

  if (!refreshToken) {
    throw new Error("Missing refresh token")
  }

  const { data } = await rawApi.post<AuthApiResponse>("/auth/refresh", {
    refreshToken,
  })

  const session = normalizeSession(data)
  useAuthStore.getState().setSession(session)
  return session
}

export const logoutRequest = () => {
  useAuthStore.getState().clearSession()
}
