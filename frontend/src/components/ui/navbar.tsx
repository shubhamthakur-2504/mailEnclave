"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, Sun, LogOut, Shield } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { logoutRequest } from "@/lib/api/auth-api"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const isDashboard = pathname.startsWith("/dashboard")

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem("theme") as "dark" | "light" | null
      if (stored) {
        setTheme(stored)
        document.documentElement.classList.toggle("dark", stored === "dark")
      } else {
        // default to dark
        document.documentElement.classList.add("dark")
        setTheme("dark")
      }
    } catch (e) {
      // ignore
    }
  }, [])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    try {
      localStorage.setItem("theme", next)
    } catch (e) {}
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  const handleLogout = async () => {
    try {
      await logoutRequest()
    } catch (e) {
      // proceed to clear session even if logout API failed
      console.warn('Logout API error', e)
    }

    clearSession()
    router.push("/")
    router.refresh()
  }

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-border px-5 md:px-8 py-3 flex items-center justify-between fade-in-up">
      <div className="flex items-center gap-5">
        <Link href="/" className="group inline-flex items-center gap-1.5 font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-foreground/80">
          <Shield className="size-4 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          Mail<span className="hero-gradient-text">Enclave</span>
        </Link>
        {mounted && user && !isDashboard && (
          <Link href="/dashboard" className="hidden md:inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
            Dashboard
          </Link>
        )}
        <Link href="#features" className="hidden md:inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
          Features
        </Link>
        <Link href="#getting-started" className="hidden md:inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
          Start
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {mounted ? (
          user ? (
            <div className="hidden md:flex items-center gap-3 fade-in-up">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-medium text-foreground">{user.email}</span>
                <span className="text-xs text-muted-foreground">Member</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:bg-white/20 hover:text-foreground hover:-translate-y-0.5 active:scale-[0.95] dark:hover:bg-white/10"
              >
                <LogOut className="size-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:-translate-y-0.5">
                Login
              </Link>
              <Link href="/register" className="hidden sm:inline-flex rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:-translate-y-0.5">
                Register
              </Link>
            </>
          )
        ) : null}
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/80 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/45 hover:text-foreground hover:rotate-12 active:scale-90 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="size-4 transition-transform duration-500" /> : <Moon className="size-4 transition-transform duration-500" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </nav>
  )
}
