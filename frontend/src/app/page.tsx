"use client"

import { useEffect, useState } from "react"
import React from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store"
import { Shield, Lock, Tag, Fingerprint, ArrowRight, Sparkles } from "lucide-react"

const features = [
  {
    title: "Encrypted Storage",
    body: "AES-256 protection for API keys and sensitive email payloads. OTP and recovery flows stay private at rest.",
    icon: <Lock className="size-5" />,
  },
  {
    title: "Tag Vaulting",
    body: "Lock high-risk tags behind a PIN. Keep `otp.*` convenient and protect `recovery.*` and `2fa.*` data.",
    icon: <Tag className="size-5" />,
  },
  {
    title: "Session Security",
    body: "JWT access + rotating opaque refresh tokens with reuse detection to minimize session hijack risk.",
    icon: <Fingerprint className="size-5" />,
  },
]

export default function Home() {
  const user = useAuthStore((state) => state.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="noise-overlay relative flex-1 overflow-hidden">
      <div className="frost-scene" aria-hidden>
        <div className="frost-orb frost-orb-1" />
        <div className="frost-orb frost-orb-2" />
        <div className="frost-orb frost-orb-3" />
      </div>

      <main className="relative z-10">
        <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="fade-in-up inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1 text-xs tracking-wide text-muted-foreground glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30">
              <Sparkles className="size-3 text-primary" />
              Public beta - Testmail.app integration live
            </p>
            <h1 className="fade-in-up fade-in-up-delay-1 mt-8 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              The Private Vault for
              <span className="hero-gradient-text block">Developer Emails</span>
            </h1>
            <p className="fade-in-up fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              MailEnclave is a secure, multi-tenant wrapper for the Testmail.app API with encrypted storage,
              vault PIN protection, and hardened session handling.
            </p>
            <div className="fade-in-up fade-in-up-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              {mounted && !user && (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(91,106,245,0.28)] active:translate-y-0 active:scale-[0.97]"
                  >
                    Create account
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="glass-panel rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg dark:hover:bg-white/10 active:translate-y-0 active:scale-[0.97]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section id="features" className="px-6 pb-16 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 md:mb-10 fade-in-up">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Built for zero-compromise security</h2>
              <p className="mt-3 text-muted-foreground max-w-3xl">Security primitives first, developer experience second to none.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`glass-card card-lift hover-shine gradient-border rounded-2xl p-6 fade-in-up`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="getting-started" className="px-6 pb-20">
          <div className="fade-in-up mx-auto max-w-4xl glass-panel gradient-border card-lift rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground">Getting started</h3>
            <ol className="mt-4 list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>Configure backend env variables and run migrations from <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80 text-sm">backend/</code>.</li>
              <li>Start frontend with <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80 text-sm">npm run dev</code> from <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80 text-sm">frontend/</code>.</li>
              <li>Use <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80 text-sm">/auth</code> and <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80 text-sm">/config</code> flows to onboard your namespace and secure credentials.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
