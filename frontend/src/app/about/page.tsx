"use client"

import React from "react"
import Link from "next/link"
import {
  Shield,
  FlaskConical,
  User,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Database,
  ServerCrash,
  MonitorCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Zap,
  Lock,
  Mail,
  HardDrive,
} from "lucide-react"

/* ─────────────────────────── Data ─────────────────────────── */

const useCases = [
  {
    icon: <FlaskConical className="size-6" />,
    title: "QA & Integration Testers",
    color: "primary",
    points: [
      "Test your app's email flows (signup, OTP, password reset) without a real inbox",
      "Use tag-per-feature to isolate test cases — e.g. otp, welcome, invoice",
      "Vault sensitive tags (like 2FA codes) behind a PIN so they don't leak",
      "Real-time delivery via SSE — no manual refresh needed during test runs",
      "Persist test emails across sessions so you can revisit previous runs",
    ],
  },
  {
    icon: <User className="size-6" />,
    title: "Personal Use — Unlimited Addresses",
    color: "accent",
    points: [
      "You get one namespace but unlimited tags — effectively unlimited email addresses",
      "Use it as a catch-all: yournamespace.anything@inbox.testmail.app always delivers",
      "Separate services by tag: namespace.shopping, namespace.newsletters, namespace.alerts",
      "All mail is stored persistently in our database — not just in Testmail's buffer",
      "Vault personal or sensitive tags (banking alerts, recovery codes) behind your PIN",
    ],
  },
]

const limitations = [
  {
    icon: <ServerCrash className="size-5" />,
    title: "Server cold-start delay",
    body: "Our backend is deployed on Azure Container Apps and may scale to zero during periods of inactivity. Your first request after idle time may take 15–30 seconds for a cold start. The landing page silently wakes the server when you visit — so opening the dashboard is usually instant.",
    severity: "warn",
  },
  {
    icon: <Database className="size-5" />,
    title: "Database on a free tier",
    body: "Our PostgreSQL database runs on a free tier with limited compute and storage. It handles everyday workloads well but may be slower under heavy concurrent load. We don't impose any artificial row limits — your storage grows as you use it.",
    severity: "warn",
  },
  {
    icon: <Clock className="size-5" />,
    title: "Testmail free-tier: 1-day email buffer",
    body: "Testmail.app's free tier only buffers incoming emails for 24 hours. If our server is asleep when an email arrives, the mail will not be fetched and will be lost after 24 hours. Keep the dashboard open to receive emails in real-time via SSE — that guarantees delivery.",
    severity: "error",
  },
  {
    icon: <HardDrive className="size-5" />,
    title: "Testmail free-tier: 100 emails / month cap",
    body: "The Testmail free tier allows up to 100 incoming emails per month per namespace. MailEnclave does not control this limit — it is enforced by Testmail. If you need more, upgrade your Testmail plan. We will store whatever Testmail delivers to us.",
    severity: "warn",
  },
  {
    icon: <Lock className="size-5" />,
    title: "We only provide UI + persistent storage",
    body: "MailEnclave is not an email provider. We do not host any mail server. All email delivery is handled by Testmail.app — your namespace, your API key, their infrastructure. Our role is to fetch, encrypt the full body content with AES-256, store, and display those emails securely.",
    severity: "info",
  },
  {
    icon: <Zap className="size-5" />,
    title: "Real-time only while connected",
    body: "The live SSE stream only runs while your browser tab is open and connected. Emails that arrive when you are offline are still fetched on your next visit (as long as they are within Testmail's 24-hour buffer).",
    severity: "info",
  },
]

const tips = [
  {
    icon: <MonitorCheck className="size-5" />,
    title: "Keep the dashboard tab open during testing",
    body: "The SSE stream is active while the dashboard is open. This ensures every incoming email is captured immediately and saved to our database — bypassing Testmail's 24-hour buffer concern entirely.",
  },
  {
    icon: <Wifi className="size-5" />,
    title: "Visit the landing page to wake the server",
    body: "Our landing page fires a silent health-check request on load. Opening mailenclave.app before your test session ensures the backend is warm before emails arrive.",
  },
  {
    icon: <WifiOff className="size-5" />,
    title: "Avoid relying on offline delivery for critical tests",
    body: "If the server is asleep and you are not connected, emails delivered during that window may be missed. Schedule important test runs while you have the dashboard open.",
  },
  {
    icon: <Mail className="size-5" />,
    title: "Use one tag per test scenario",
    body: "Tags are your primary organizational unit. Use descriptive names like otp-flow-2024, signup-v2-test, or invoice-email so you can revisit specific test scenarios without filtering noise.",
  },
  {
    icon: <Shield className="size-5" />,
    title: "Vault high-sensitivity tags",
    body: "Tags that receive recovery codes, 2FA seeds, or financial alerts should live in the vault. Set your vault PIN on first use — it adds a second layer of protection even if your account is compromised. Email bodies are already encrypted at rest; the vault PIN adds access-control on top.",
  },
  {
    icon: <BookOpen className="size-5" />,
    title: "Check Testmail quota before bulk tests",
    body: "If you are running automated test suites that send many emails, monitor your Testmail monthly quota. Once the 100-email free limit is hit, new emails will not be delivered until the month resets.",
  },
]

const severityStyle: Record<string, string> = {
  error: "border-destructive/40 bg-destructive/5 text-destructive",
  warn: "border-amber-400/40 bg-amber-400/5 text-amber-500 dark:text-amber-400",
  info: "border-primary/30 bg-primary/5 text-primary",
}

const severityIcon: Record<string, React.ReactNode> = {
  error: <XCircle className="size-4 flex-shrink-0 mt-0.5" />,
  warn: <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />,
  info: <Info className="size-4 flex-shrink-0 mt-0.5" />,
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function AboutPage() {
  return (
    <div className="noise-overlay relative min-h-screen">
      <div className="frost-scene" aria-hidden>
        <div className="frost-orb frost-orb-1" />
        <div className="frost-orb frost-orb-2" />
        <div className="frost-orb frost-orb-3" />
      </div>

      <main className="relative z-10 px-6 pb-24 pt-14 md:pt-20">
        <div className="mx-auto max-w-4xl">

          {/* ── Hero ── */}
          <div className="mb-14 text-center fade-in-up">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs tracking-wide text-muted-foreground glass-panel">
              <Shield className="size-3 text-primary" />
              Honest about what we are — and what we are not
            </p>
            <h1 className="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              About <span className="hero-gradient-text">MailEnclave</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              MailEnclave is a secure, open-source front-end layer over the{" "}
              <a href="https://testmail.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-2">
                Testmail.app
              </a>{" "}
              email testing API. We add persistent storage, AES-256 encryption, PIN-protected vaulting, and a
              polished real-time dashboard — so your test emails are actually useful and private.
            </p>
          </div>

          {/* ── Who is it for ── */}
          <section className="mb-14 fade-in-up fade-in-up-delay-1">
            <h2 className="mb-6 text-xl md:text-2xl font-bold text-foreground">Who is it for?</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {useCases.map((uc) => (
                <div key={uc.title} className="glass-card card-lift gradient-border rounded-2xl p-6">
                  <div className={`mb-4 inline-flex items-center justify-center rounded-xl p-3 ${
                    uc.color === "primary" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                  }`}>
                    {uc.icon}
                  </div>
                  <h3 className="mb-3 text-base font-semibold text-foreground">{uc.title}</h3>
                  <ul className="space-y-2">
                    {uc.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-3.5 flex-shrink-0 text-primary/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ── Limitations ── */}
          <section className="mb-14 fade-in-up fade-in-up-delay-2">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">Known Limitations</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              We run on free-tier infrastructure to keep this project free for everyone. Here is exactly what that means for you.
            </p>
            <div className="space-y-3">
              {limitations.map((lim) => (
                <div
                  key={lim.title}
                  className={`flex gap-3 rounded-xl border p-4 ${severityStyle[lim.severity]}`}
                >
                  {severityIcon[lim.severity]}
                  <div>
                    <p className="text-sm font-semibold">{lim.title}</p>
                    <p className="mt-0.5 text-sm opacity-80 leading-relaxed">{lim.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tips for best experience ── */}
          <section className="mb-14 fade-in-up fade-in-up-delay-3">
            <h2 className="mb-6 text-xl md:text-2xl font-bold text-foreground">Tips for the Best Experience</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {tips.map((tip) => (
                <div key={tip.title} className="glass-card card-lift rounded-2xl p-5">
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-primary/10 p-2.5 text-primary">
                    {tip.icon}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-foreground">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── What we are not ── */}
          <section className="mb-14 fade-in-up fade-in-up-delay-4">
            <h2 className="mb-4 text-xl md:text-2xl font-bold text-foreground">What MailEnclave Is Not</h2>
            <div className="glass-card rounded-2xl p-6 space-y-3">
              {[
                "Not a real email provider — we cannot send emails, only receive them via Testmail",
                "Not a replacement for Testmail.app — you still need a Testmail account and API key",
                "Not a production email inbox — Testmail is designed for testing, not personal mail at scale",
                "Not infinitely scalable on the free tier — heavy usage may hit Testmail's monthly email cap",
                "Not a guarantee of uptime — free-tier servers sleep; keep the dashboard open for live delivery",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <XCircle className="mt-0.5 size-4 flex-shrink-0 text-destructive/60" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="fade-in-up glass-panel gradient-border rounded-2xl p-8 text-center">
            <Shield className="mx-auto mb-3 size-8 text-primary icon-breathe" />
            <h3 className="text-xl font-bold text-foreground">Ready to get started?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Create a free Testmail account, register on MailEnclave, and you will have a secure private inbox in under 5 minutes.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_var(--glow-primary)] active:scale-[0.97]"
              >
                Create Account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://testmail.app/signup/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:bg-background/60 active:scale-[0.97]"
              >
                Get Testmail Account
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
