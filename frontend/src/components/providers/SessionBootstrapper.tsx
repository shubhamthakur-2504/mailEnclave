"use client"

import { useEffect } from "react"
import { refreshSessionRequest } from "@/lib/api/auth-api"
import { useAuthStore } from "@/stores/auth-store"

export default function SessionBootstrapper() {
  const setReady = useAuthStore((state) => state.setReady)

  useEffect(() => {
    const bootstrap = async () => {
      const publicRoutes = new Set(["/", "/login", "/register"])
      const pathname = window.location.pathname

      if (publicRoutes.has(pathname)) {
        setReady(true)
        return
      }

      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) {
        try {
          await refreshSessionRequest()
        } catch {
          useAuthStore.getState().clearSession()
          window.location.replace("/login")
        }
      }

      setReady(true)
    }

    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setReady])

  return null
}
