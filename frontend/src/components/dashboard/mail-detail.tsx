"use client"

import React, { useEffect, useState } from "react"
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

  useEffect(() => {
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
    <section className="w-full rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="rounded bg-background/50 border border-border/50 px-3 py-1 text-sm text-foreground hover:bg-background/80 transition-colors">Back</button>
          <div>
            <h3 className="text-lg font-semibold">{email.subject}</h3>
            <p className="text-sm text-muted-foreground">From: {email.from ?? 'unknown'}</p>
            <p className="text-xs text-muted-foreground">Received: {new Date(email.receivedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className={`mt-6 w-full overflow-hidden rounded-xl bg-white shadow-sm border border-black/5`}>
        <iframe
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
          className="w-full border-0"
          style={{ minHeight: '600px', height: 'calc(100vh - 250px)' }}
          srcDoc={email.htmlBody ?? `<pre style="font-family: system-ui, sans-serif; padding: 1rem; margin: 0; white-space: pre-wrap;">${email.text ?? '<i>(no body)</i>'}</pre>`}
          title="Email content"
        />
      </div>
    </section>
  )
}
