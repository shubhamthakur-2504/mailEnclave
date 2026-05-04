"use client"

import { useEffect } from "react"
import { refreshSessionRequest } from "@/lib/api/auth-api"
import { useAuthStore } from "@/stores/auth-store"

export default function SessionBootstrapper() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const setReady = useAuthStore((state) => state.setReady)

  useEffect(() => {
    const bootstrap = async () => {
      // If we have a refresh token but no access token, try to refresh once on load.
      if (refreshToken && !accessToken) {
        try {
          await refreshSessionRequest(refreshToken)
        } catch {
          useAuthStore.getState().clearSession()
          if (window.location.pathname !== "/login") {
            window.location.replace("/login")
          }
        }
      }

      setReady(true)
    }

    void bootstrap()
  }, [accessToken, refreshToken, setReady])

  return null
}
