import React from "react"

const features = [
  {
    title: "Encrypted Storage",
    body: "AES-256 protection for API keys and sensitive email payloads. OTP and recovery flows stay private at rest.",
  },
  {
    title: "Tag Vaulting",
    body: "Lock high-risk tags behind a PIN. Keep `otp.*` convenient and protect `recovery.*` and `2fa.*` data.",
  },
  {
    title: "Session Security",
    body: "JWT access + rotating opaque refresh tokens with reuse detection to minimize session hijack risk.",
  },
]

export default function Home() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="frost-scene" aria-hidden>
        <div className="frost-orb frost-orb-1" />
        <div className="frost-orb frost-orb-2" />
        <div className="frost-orb frost-orb-3" />
      </div>

      <main className="relative z-10">
        <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="mx-auto max-w-5xl text-center">
            <p className="inline-flex rounded-full border border-border px-4 py-1 text-xs tracking-wide text-muted-foreground glass-panel transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg">
              Public beta - Testmail.app integration live
            </p>
            <h1 className="mt-8 text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-foreground">
              The Private Vault for
              <span className="hero-gradient-text block">Developer Emails</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
              MailEnclave is a secure, multi-tenant wrapper for the Testmail.app API with encrypted storage,
              vault PIN protection, and hardened session handling.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#features" className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(91,106,245,0.28)] active:translate-y-0">
                Explore Features
              </a>
              <a href="#getting-started" className="glass-panel rounded-xl px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-lg dark:hover:bg-white/10 active:translate-y-0">
                Getting Started
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 pb-16 md:pb-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 md:mb-10">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">Built for zero-compromise security</h2>
              <p className="mt-3 text-muted-foreground max-w-3xl">Security primitives first, developer experience second to none.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <article key={feature.title} className="glass-card rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(91,106,245,0.14)]">
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="getting-started" className="px-6 pb-20">
          <div className="mx-auto max-w-4xl glass-panel rounded-2xl p-6 md:p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(91,106,245,0.12)]">
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground">Getting started</h3>
            <ol className="mt-4 list-decimal pl-5 space-y-2 text-muted-foreground">
              <li>Configure backend env variables and run migrations from `backend/`.</li>
              <li>Start frontend with `npm run dev` from `frontend/`.</li>
              <li>Use `/auth` and `/config` flows to onboard your namespace and secure credentials.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
