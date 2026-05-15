"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, Sun, LogOut, Shield, ExternalLink, Menu, X } from "lucide-react"
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
        document.documentElement.classList.add("dark")
        setTheme("dark")
      }
    } catch (e) {}
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
    try { localStorage.setItem("theme", next) } catch (e) {}
    document.documentElement.classList.toggle("dark", next === "dark")
  }

  const handleLogout = async () => {
    try { await logoutRequest() } catch (e) { console.warn("Logout API error", e) }
    clearSession()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <nav className="glass-panel sticky top-0 z-50 w-full border-b border-border px-5 md:px-8 py-3 fade-in-up">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* Left — brand + desktop nav links */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group inline-flex items-center gap-1.5 font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-foreground/80">
              <Shield className="size-4 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Mail<span className="hero-gradient-text">Enclave</span>
            </Link>

            {/* Desktop nav links — home */}
            {isHome && (
              <div className="hidden md:flex items-center gap-4">
                <Link href="#how-it-works" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">How It Works</Link>
                <Link href="#features" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">Features</Link>
                <Link href="#getting-started" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">Setup Guide</Link>
                <Link href="/about" className="text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">About</Link>
              </div>
            )}

            {/* Desktop — About link on other pages */}
            {!isHome && !isDashboard && (
              <Link href="/" className="hidden md:inline-flex text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">Home</Link>
            )}

            {/* Desktop — Dashboard link for logged-in users not on dashboard */}
            {mounted && user && !isDashboard && (
              <Link href="/dashboard" className="hidden md:inline-flex items-center gap-1 text-sm text-primary font-medium transition-all duration-200 hover:-translate-y-0.5 hover:text-primary/80">
                Dashboard
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>

          {/* Right — desktop auth + theme */}
          <div className="flex items-center gap-2">
            {/* Testmail.app link — desktop only */}
            {isHome && (
              <a href="https://testmail.app" target="_blank" rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground hover:bg-background/50">
                Testmail.app
                <ExternalLink className="size-3" />
              </a>
            )}

            {/* Desktop auth buttons */}
            {mounted ? (
              user ? (
                <div className="hidden md:flex items-center gap-3 fade-in-up">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium text-foreground">{user.email}</span>
                    <span className="text-xs text-muted-foreground">Member</span>
                  </div>
                  <button type="button" onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 hover:-translate-y-0.5 active:scale-[0.95]">
                    <LogOut className="size-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1">
                  <Link href="/login" className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:text-foreground hover:-translate-y-0.5 hover:bg-background/50">Sign in</Link>
                  <Link href="/register" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_6px_20px_var(--glow-primary)] active:scale-[0.97]">Get Started</Link>
                </div>
              )
            ) : null}

            {/* Mobile: logout icon on dashboard */}
            {mounted && user && isDashboard && (
              <button type="button" onClick={handleLogout} title="Logout"
                className="flex md:hidden items-center justify-center size-9 rounded-full border border-border/50 text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 active:scale-[0.95]">
                <LogOut className="size-4" />
              </button>
            )}

            {/* Theme toggle — always visible */}
            <button type="button" onClick={toggle} aria-label="Toggle theme"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/80 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/45 hover:text-foreground hover:rotate-12 active:scale-90 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              {mounted ? (
                theme === "dark" ? <Sun className="size-4 transition-transform duration-500" /> : <Moon className="size-4 transition-transform duration-500" />
              ) : <Moon className="size-4" />}
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Mobile: hamburger — only shown when NOT on dashboard */}
            {!isDashboard && (
              <button type="button" onClick={() => setMobileMenuOpen((v) => !v)} aria-label="Open menu"
                className="flex md:hidden items-center justify-center size-9 rounded-full border border-border/50 text-foreground/80 transition-all duration-300 hover:border-primary/40 hover:text-primary active:scale-90">
                {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════ MOBILE MENU SHEET (non-dashboard pages only) ══════════════ */}
      {/* Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Slide-down sheet */}
      <div className={`fixed left-0 right-0 top-[53px] z-40 md:hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}>
        <div className="mx-3 rounded-2xl border border-border bg-card/95 shadow-[0_16px_48px_rgba(3,7,18,0.5)] backdrop-blur-3xl">

          {/* Nav links section */}
          <div className="px-4 pt-4 pb-2">
            {isHome && (
              <div className="space-y-1">
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Navigate</p>
                {[
                  { href: "#how-it-works", label: "How It Works" },
                  { href: "#features", label: "Features" },
                  { href: "#getting-started", label: "Setup Guide" },
                  { href: "/about", label: "About" },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all hover:border-border/60 hover:bg-background/50 hover:text-foreground active:scale-[0.97]">
                    {label}
                  </Link>
                ))}
                {/* Testmail link */}
                <a href="https://testmail.app" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all hover:border-border/60 hover:bg-background/50 hover:text-foreground">
                  Testmail.app
                  <ExternalLink className="size-3" />
                </a>
              </div>
            )}

            {!isHome && !isDashboard && (
              <Link href="/" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-all hover:border-border/60 hover:bg-background/50 hover:text-foreground">
                Home
              </Link>
            )}

            {/* Dashboard link for logged-in users */}
            {mounted && user && !isDashboard && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/10">
                Dashboard
                <ExternalLink className="size-3" />
              </Link>
            )}
          </div>

          {/* Divider + auth section */}
          <div className="border-t border-border/50 px-4 py-3">
            {mounted && (
              user ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{user.email}</p>
                    <p className="text-[10px] text-muted-foreground">Member</p>
                  </div>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                    className="flex items-center gap-1.5 rounded-lg border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                    <LogOut className="size-3.5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl border border-border/60 bg-background/50 py-2.5 text-center text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] transition-all hover:brightness-110">
                    Get Started
                  </Link>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </>
  )
}


