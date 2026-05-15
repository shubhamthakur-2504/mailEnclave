"use client"

import React, { useEffect, useState } from "react"
import { ArrowLeft, Clock, User } from "lucide-react"
import type { EmailItem } from "./types"
import { sanitizeEmailHtml } from "@/lib/sanitize-html"

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
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 w-full">
          <button
            onClick={onClose}
            className="group flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-background/50 border border-border/50 px-3 py-1.5 text-sm text-foreground hover:bg-background/80 hover:border-primary/40 hover:shadow-[0_4px_16px_rgba(91,106,245,0.08)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.95]"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back
          </button>
          <div className="fade-in-up fade-in-up-delay-1 min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground break-words leading-snug">{email.subject}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 min-w-0 max-w-full">
                <User className="size-3 flex-shrink-0" />
                <span className="truncate">{email.from ?? 'Unknown sender'}</span>
              </span>
              <span className="inline-flex items-center gap-1 flex-shrink-0">
                <Clock className="size-3 flex-shrink-0" />
                {new Date(email.receivedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-4 w-full overflow-x-auto overflow-y-hidden rounded-xl bg-white shadow-sm border border-black/5 fade-in-up fade-in-up-delay-2 transition-all duration-500`}>
        <iframe
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          className="w-full border-0 bg-white"
          style={{ minWidth: '100%', minHeight: '300px', height: 'calc(100dvh - 180px)' }}
          srcDoc={sanitizeEmailHtml(email.htmlBody, email.text)}
          title="Email content"
        />
      </div>
    </section>
  )
}
