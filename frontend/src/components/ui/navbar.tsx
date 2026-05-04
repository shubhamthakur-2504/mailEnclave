"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"

export default function Navbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [mounted, setMounted] = useState(false)

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

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full border-b border-border px-5 md:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <Link href="/" className="font-semibold tracking-tight text-foreground transition-colors duration-200 hover:text-foreground/80">
          Mail<span className="hero-gradient-text">Enclave</span>
        </Link>
        <Link href="#features" className="hidden md:inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
          Features
        </Link>
        <Link href="#getting-started" className="hidden md:inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground">
          Start
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle theme"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent text-foreground/80 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/45 hover:text-foreground active:scale-95 dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          {mounted ? (
            theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>
    </nav>
  )
}
