"use client"

import React from "react"
import { KeyRound, Mail } from "lucide-react"
import type { DockView, EmailItem } from "./types"

type MailListProps = {
  emails: EmailItem[]
  activeView: DockView
  activeNamespace: string
  activeTag: string
  isVaultView: boolean
  vaultUnlocked: boolean
  isLoading?: boolean
  onRequirePasskey: () => void
  onOpen?: (email: EmailItem) => void
}

export default function MailList({
  emails,
  activeView,
  activeNamespace,
  activeTag,
  isVaultView,
  vaultUnlocked,
  isLoading,
  onRequirePasskey,
  onOpen,
}: MailListProps) {
  const showLockedVaultMessage = activeView === "vault" && !vaultUnlocked

  return (
    <article
      className="card-lift rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-right"
      onClick={() => {
        if (isVaultView && !vaultUnlocked) {
          onRequirePasskey()
        }
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm text-foreground">
            {activeView === "vault" ? "secret-inbox" : "public-inbox"} / {activeNamespace}
          </h2>
          <p className="text-xs text-muted-foreground">tag: {activeTag}</p>
        </div>
        <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground">
          {emails.length} mails
        </span>
      </div>

      {showLockedVaultMessage ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center scale-in">
          <KeyRound className="mb-3 size-7 text-destructive icon-breathe" />
          <p className="mb-1 text-sm font-semibold text-foreground">Vault is locked</p>
          <p className="text-xs text-muted-foreground">Use the Vault control in the dock and pass the challenge.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer h-16 w-full rounded-xl" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email, index) => (
            <div
              key={email.id}
              onClick={() => onOpen && onOpen(email)}
              role="button"
              tabIndex={0}
              className={`email-row-enter card-lift hover-shine rounded-xl border border-border/60 bg-background/40 p-3 cursor-pointer ${
                email.sensitive && !vaultUnlocked
                  ? "blur-sm opacity-60 saturate-50 scale-[0.995]"
                  : "blur-0 opacity-100 saturate-100 scale-100"
              } ${
                isVaultView
                  ? "hover:border-destructive/40 hover:bg-destructive/5"
                  : "hover:border-primary/40 hover:bg-primary/5"
              }`}
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className={`size-3 ${isVaultView ? "text-destructive/60" : "text-primary/60"}`} />
                  <span className={`font-mono text-xs ${isVaultView ? "text-destructive" : "text-primary"}`}>
                    {email.tag}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{email.receivedAt}</span>
              </div>
              <p className="text-sm text-foreground">{email.subject}</p>
            </div>
          ))}

          {!emails.length && (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center scale-in">
              <Mail className="mb-2 size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No emails matched this view.</p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
