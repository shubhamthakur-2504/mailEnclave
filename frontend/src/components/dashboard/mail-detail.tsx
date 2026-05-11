"use client"

import React, { useEffect, useState } from "react"
import { ArrowLeft, Clock, User } from "lucide-react"
import type { EmailItem } from "./types"

type Props = {
  email?: any
  onClose: () => void
}

export default function MailDetail({ email, onClose }: Props) {
  if (!email) {
    return null
  }

  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Trigger mount animation
    requestAnimationFrame(() => setMounted(true))

    const check = () => {
      try {
        const hasDark = document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDark(!!hasDark)
      } catch (e) {
        setIsDark(false)
      }
    }

    check()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener?.('change', check)
    return () => mq.removeEventListener?.('change', check)
  }, [])

  return (
    <section className={`w-full rounded-2xl border border-border bg-card p-4 transition-all duration-500 ease-out ${
      mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]"
    }`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-background/50 border border-border/50 px-3 py-1.5 text-sm text-foreground hover:bg-background/80 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(91,106,245,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.95]"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back
          </button>
          <div className="fade-in-up fade-in-up-delay-1">
            <h3 className="text-lg font-semibold text-foreground">{email.subject}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                {email.from ?? 'Unknown sender'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {new Date(email.receivedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-4 w-full overflow-hidden rounded-xl bg-white shadow-sm border border-black/5 fade-in-up fade-in-up-delay-2 transition-all duration-500`}>
        <iframe
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          className="w-full border-0"
          style={{ minHeight: '600px', height: 'calc(100vh - 140px)' }}
          srcDoc={email.htmlBody ?? `<pre style="font-family: system-ui, sans-serif; padding: 1rem; margin: 0; white-space: pre-wrap;">${email.text ?? '<i>(no body)</i>'}</pre>`}
          title="Email content"
        />
      </div>
    </section>
  )
}
