"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, Sun, LogOut, Shield, ExternalLink } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { logoutRequest } from "@/lib/api/auth-api"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const isDashboard = pathname.startsWith("/dashboard")
  const isHome = pathname === "/"

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
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-border px-5 md:px-8 py-3 fade-in-up">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left — brand + nav links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group inline-flex items-center gap-1.5 font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-foreground/80">
            <Shield className="size-4 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            Mail<span className="hero-gradient-text">Enclave</span>
          </Link>

          {isHome && (
            <div className="hidden md:flex items-center gap-4">
              <Link href="#how-it-works" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
                How It Works
              </Link>
              <Link href="#features" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
                Features
              </Link>
              <Link href="#getting-started" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
                Setup Guide
              </Link>
            </div>
          )}

          {mounted && user && !isDashboard && (
            <Link href="/dashboard" className="hidden md:inline-flex items-center gap-1 text-sm text-primary font-medium transition-all duration-200 hover:-translate-y-0.5 hover:text-primary/80">
              Dashboard
              <ExternalLink className="size-3" />
            </Link>
          )}
        </div>

        {/* Right — auth + theme + external */}
        <div className="flex items-center gap-2">
          {isHome && (
            <a
              href="https://testmail.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:bg-background/50"
            >
              Testmail.app
              <ExternalLink className="size-3" />
            </a>
          )}

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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 hover:-translate-y-0.5 active:scale-[0.95]"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Link href="/login" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:-translate-y-0.5 hover:bg-background/50">
                  Sign in
                </Link>
                <Link href="/register" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_20px_var(--glow-primary)] active:scale-[0.97]">
                  Get Started
                </Link>
              </div>
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
      </div>
    </nav>
  )
}
