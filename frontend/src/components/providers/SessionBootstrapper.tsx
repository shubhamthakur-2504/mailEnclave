"use client"

import { useEffect } from "react"
import { refreshSessionRequest } from "@/lib/api/auth-api"
import { useAuthStore } from "@/stores/auth-store"

export default function SessionBootstrapper() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setReady = useAuthStore((state) => state.setReady)

  useEffect(() => {
    const bootstrap = async () => {
      // If we have no access token, attempt a silent refresh (cookie-based).
      if (!accessToken) {
        try {
          await refreshSessionRequest()
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
  }, [accessToken, setReady])

  return null
}
