import type { AuthSession } from "@/lib/session"
import { rawApi } from "@/lib/api/transport"
import { useAuthStore } from "@/stores/auth-store"

export type AuthCredentials = {
  email: string
  password: string
}

type AuthApiResponse = {
  accessToken: string
  user: { id: string; email: string }
}

const normalizeSession = (data: AuthApiResponse): AuthSession => ({
  accessToken: data.accessToken,
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

export const refreshSessionRequest = async () => {
  const { data } = await rawApi.post<AuthApiResponse>("/auth/refresh")
  const session = normalizeSession(data)
  useAuthStore.getState().setSession(session)
  return session
}

export const logoutRequest = async () => {
  try {
    await rawApi.post('/auth/logout')
  } catch (e) {
    console.warn('Logout request failed', e)
  }

  useAuthStore.getState().clearSession()
}
