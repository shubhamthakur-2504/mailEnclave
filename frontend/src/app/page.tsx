"use client"

import { useEffect, useState } from "react"
import React from "react"
import Link from "next/link"
import { useAuthStore } from "@/stores/auth-store"
import { fetchHealth } from "@/lib/api/health-api"
import {
  Shield,
  Lock,
  Tag,
  Fingerprint,
  ArrowRight,
  Sparkles,
  Mail,
  Globe2,
  ExternalLink,
  KeyRound,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  ShieldCheck,
  Inbox,
  CheckCircle2,
  ChevronRight,
  Zap,
} from "lucide-react"

/* ────────────────────────── Data ────────────────────────── */

const features = [
  {
    title: "AES-256 Encrypted Storage",
    body: "Your Testmail.app API keys, email subjects, and full message bodies (HTML + plain text) are encrypted at rest with AES-256-CBC. Nothing readable is ever written to disk in plain text.",
    icon: <Lock className="size-5" />,
  },
  {
    title: "End-to-End Body Privacy",
    body: "Email body content is encrypted before being saved to the database and decrypted only on-demand when you open a message — so even a database breach exposes no readable content.",
    icon: <ShieldCheck className="size-5" />,
  },
  {
    title: "Private Tag Vaulting",
    body: "Mark any email tag as private to move it behind a PIN-protected vault. Keep OTP tags accessible while locking recovery and 2FA data.",
    icon: <Tag className="size-5" />,
  },
  {
    title: "Hardened Sessions",
    body: "JWT access tokens paired with rotating opaque refresh tokens and reuse detection. Sessions auto-expire and cannot be replayed.",
    icon: <Fingerprint className="size-5" />,
  },
  {
    title: "Multi-Namespace Support",
    body: "Connect multiple Testmail.app namespaces under one account. Switch between staging, production, and QA environments instantly.",
    icon: <Globe2 className="size-5" />,
  },
  {
    title: "Real-Time SSE Streaming",
    body: "Incoming emails appear in your inbox instantly via Server-Sent Events — no polling, no refresh button. Just live data.",
    icon: <Zap className="size-5" />,
  },
  {
    title: "Public + Private Inbox Split",
    body: "Emails are automatically sorted into public and private inboxes based on your tag rules. Toggle visibility without data loss.",
    icon: <EyeOff className="size-5" />,
  },
]

const steps = [
  {
    number: "01",
    title: "Create a Testmail.app Account",
    description: "Sign up for a free Testmail.app account to get your namespace and API key.",
    details: [
      "Go to testmail.app/signup and create an account (no credit card required)",
      "You'll receive a namespace like acme-prod and an API key",
      "Emails are sent to {namespace}.{tag}@inbox.testmail.app",
      "Each unique {tag} creates a separate mailbox automatically",
    ],
    icon: <Mail className="size-5" />,
    link: { label: "Sign up at Testmail.app", href: "https://testmail.app/signup/" },
  },
  {
    number: "02",
    title: "Create Your MailEnclave Account",
    description: "Register on MailEnclave to connect your Testmail namespace securely.",
    details: [
      "Click \"Get Started\" above or go to the Register page",
      "Create your account with email and password",
      "Your credentials are hashed with bcrypt — we never store plain passwords",
    ],
    icon: <UserPlus className="size-5" />,
    link: { label: "Register on MailEnclave", href: "/register" },
  },
  {
    number: "03",
    title: "Connect Your Namespace",
    description: "Link your Testmail namespace and API key from the dashboard.",
    details: [
      "Open the Dashboard and click the Namespaces tab in the dock",
      "Click \"Add namespace\" and paste your Testmail namespace",
      "Paste your Testmail API key — it's encrypted with AES-256 before storage",
      "Your namespace is ready: emails will appear in real-time",
    ],
    icon: <Settings className="size-5" />,
  },
  {
    number: "04",
    title: "Secure Sensitive Tags",
    description: "Move high-risk email tags into the vault for PIN-protected access.",
    details: [
      "In the Inbox view, each tag shows a shield icon on hover",
      "Click the shield to mark a tag as private — it moves to the vault instantly",
      "Open the Vault from the dock and enter your PIN to view private emails",
      "Remove tags from the vault anytime to make them public again",
    ],
    icon: <ShieldCheck className="size-5" />,
  },
]

const howItWorks = [
  {
    step: "Send",
    label: "Send test emails",
    detail: "Send emails to {namespace}.{tag}@inbox.testmail.app from your app or manually.",
    icon: <Mail className="size-6" />,
  },
  {
    step: "Sync",
    label: "MailEnclave fetches & encrypts",
    detail: "We poll Testmail's API, encrypt sensitive payloads, and stream updates via SSE.",
    icon: <Shield className="size-6" />,
  },
  {
    step: "Browse",
    label: "View in your dashboard",
    detail: "Read emails in the public inbox or unlock the vault for private tags — all in one UI.",
    icon: <Inbox className="size-6" />,
  },
]

/* ────────────────────────── Component ────────────────────────── */

export default function Home() {
  const user = useAuthStore((state) => state.user)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Silently wake the backend so it is warm before the user navigates to the dashboard
    fetchHealth().catch(() => { /* ignore — server may still be starting */ })
  }, [])

  return (
    <div className="noise-overlay relative flex-1 overflow-hidden">
      <div className="frost-scene" aria-hidden>
        <div className="frost-orb frost-orb-1" />
        <div className="frost-orb frost-orb-2" />
        <div className="frost-orb frost-orb-3" />
      </div>

      <main className="relative z-10">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
          <div className="mx-auto max-w-5xl text-center">
            <p className="fade-in-up inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs tracking-wide text-muted-foreground glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30">
              <Sparkles className="size-3 text-primary" />
              Open-source Testmail.app client with built-in encryption
            </p>
            <h1 className="fade-in-up fade-in-up-delay-1 mt-8 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              Your Testmail Inbox,
              <span className="hero-gradient-text block">Encrypted & Vaulted</span>
            </h1>
            <p className="fade-in-up fade-in-up-delay-2 mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              MailEnclave wraps the{" "}
              <a href="https://testmail.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2">
                Testmail.app
              </a>{" "}
              API with AES-256 encryption, PIN-protected private tags, and real-time SSE streaming.
              Connect your namespace, secure sensitive tags, and browse everything from one dashboard.
            </p>
            <div className="fade-in-up fade-in-up-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
              {mounted && !user && (
                <>
                  <Link
                    href="/register"
                    className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_var(--glow-primary)] active:translate-y-0 active:scale-[0.97]"
                  >
                    Get Started Free
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="glass-panel rounded-xl px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-white/70 hover:shadow-lg dark:hover:bg-white/10 active:translate-y-0 active:scale-[0.97]"
                  >
                    Sign in
                  </Link>
                </>
              )}
              {mounted && user && (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_var(--glow-primary)] active:translate-y-0 active:scale-[0.97]"
                >
                  Open Dashboard
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>

            {/* Email format hint */}
            <div className="fade-in-up fade-in-up-delay-4 mt-10 mx-auto max-w-lg">
              <div className="glass-card rounded-xl p-4 text-left">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-2">Testmail address format</p>
                <code className="block rounded-lg bg-background/80 border border-border/60 px-4 py-2.5 font-mono text-sm text-foreground">
                  <span className="text-primary">{"{namespace}"}</span>
                  <span className="text-muted-foreground">.</span>
                  <span className="text-accent">{"{tag}"}</span>
                  <span className="text-muted-foreground">@inbox.testmail.app</span>
                </code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Each <span className="text-accent font-mono">{"{tag}"}</span> creates a unique mailbox. Use tags like <code className="text-foreground/70 font-mono">otp</code>, <code className="text-foreground/70 font-mono">recovery</code>, <code className="text-foreground/70 font-mono">signup</code> to organize emails.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
        <section id="how-it-works" className="px-6 pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center fade-in-up">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">How It Works</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Three steps from test email to secured inbox.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((item, index) => (
                <div
                  key={item.step}
                  className="glass-card card-lift hover-shine gradient-border rounded-2xl p-6 text-center fade-in-up relative"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {/* Connector line (hidden on mobile and last item) */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                      <ChevronRight className="size-5 text-primary/40" />
                    </div>
                  )}
                  <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3.5 text-primary">
                    {item.icon}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-1">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FEATURES ═══════════════════ */}
        <section id="features" className="px-6 pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 fade-in-up">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">What Makes It Different</h2>
              <p className="mt-3 text-muted-foreground max-w-3xl">Not just an inbox viewer — a secure layer between your tests and the cloud.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="glass-card card-lift hover-shine gradient-border rounded-2xl p-6 fade-in-up"
                  style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                >
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ GETTING STARTED GUIDE ═══════════════════ */}
        <section id="getting-started" className="px-6 pb-20 md:pb-28">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center fade-in-up">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Setup Guide</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">From zero to a running secure inbox in under 5 minutes.</p>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="glass-card gradient-border card-lift rounded-2xl overflow-hidden fade-in-up"
                  style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Step number circle */}
                      <div className="flex-shrink-0 flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary">
                        {step.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">Step {step.number}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>

                        <ul className="mt-3 space-y-1.5">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="size-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>

                        {step.link && (
                          <div className="mt-4">
                            {step.link.href.startsWith("http") ? (
                              <a
                                href={step.link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-medium text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-[0_6px_20px_var(--glow-primary)] active:scale-[0.97]"
                              >
                                {step.link.label}
                                <ExternalLink className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </a>
                            ) : (
                              <Link
                                href={step.link.href}
                                className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-medium text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-[0_6px_20px_var(--glow-primary)] active:scale-[0.97]"
                              >
                                {step.link.label}
                                <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ FOOTER CTA ═══════════════════ */}
        <section className="px-6 pb-20">
          <div className="fade-in-up mx-auto max-w-3xl glass-panel gradient-border rounded-2xl p-8 md:p-10 text-center">
            <KeyRound className="mx-auto mb-4 size-8 text-primary icon-breathe" />
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">Ready to secure your test emails?</h3>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
              Create your account, connect a Testmail namespace, and start vaulting sensitive tags — all in under 5 minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {mounted && !user && (
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_var(--glow-primary)] active:scale-[0.97]"
                >
                  Create Free Account
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              )}
              <a
                href="https://testmail.app/signup/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-background/80 hover:shadow-lg active:scale-[0.97]"
              >
                Get Testmail Account
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════ FOOTER ═══════════════════ */}
        <footer className="border-t border-border px-6 py-8">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Shield className="size-3.5 text-primary" />
              <span>Mail<span className="text-foreground font-medium">Enclave</span></span>
              <span className="text-border mx-2">·</span>
              <span>Open-source secure email client</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="https://testmail.app/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Testmail Docs
              </a>
              <a href="https://testmail.app/pricing/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Testmail Pricing
              </a>
              <a href="https://status.testmail.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                API Status
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
