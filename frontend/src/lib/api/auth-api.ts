import type { AuthSession } from "@/lib/session"
import { rawApi } from "@/lib/api/transport"
import { protectedApi } from "@/lib/api/http"
import { useAuthStore } from "@/stores/auth-store"

export type AuthCredentials = {
  email: string
  password: string
}

type AuthApiResponse = {
  accessToken: string
  user: { id: string; email: string; hasVaultPin?: boolean }
}

const normalizeSession = (data: AuthApiResponse): AuthSession => ({
  accessToken: data.accessToken,
  user: data.user,
})

export const sendSignupOtpRequest = async (payload: AuthCredentials) => {
  const { data } = await rawApi.post<{ message: string }>("/auth/signup/otp", payload)
  return data
}

export const signupRequest = async (payload: AuthCredentials & { otp: string }) => {
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

export const setupVaultRequest = async (pin: string) => {
  const { data } = await protectedApi.put('/auth/vault', { pin })
  return data
}

export const verifyVaultRequest = async (pin: string) => {
  const { data } = await protectedApi.post('/auth/vault/verify', { pin })
  return data
}

export const changePasswordRequest = async (oldPassword: string, newPassword: string) => {
  const { data } = await protectedApi.put('/auth/password', { oldPassword, newPassword })
  return data
}

export const resetVaultPinRequest = async (password: string, newPin: string, confirmPin: string) => {
  const { data } = await protectedApi.put('/auth/vault/reset', { password, newPin, confirmPin })
  return data
}
