import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthSession, AuthUser } from "@/lib/session"

type AuthStoreState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isReady: boolean
  setSession: (session: AuthSession) => void
  updateTokens: (tokens: Pick<AuthSession, "accessToken" | "refreshToken">) => void
  clearSession: () => void
  setReady: (value: boolean) => void
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isReady: false,
      setSession: (session) =>
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }),
      updateTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      clearSession: () =>
        set((state) => {
          if (state.user || state.accessToken || state.refreshToken) {
            console.info("[auth] session cleared")
          }

          return {
            user: null,
            accessToken: null,
            refreshToken: null,
          }
        }),
      setReady: (value) => set({ isReady: value }),
    }),
    {
      name: "mailenclave-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
