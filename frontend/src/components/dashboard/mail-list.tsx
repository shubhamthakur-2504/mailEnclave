"use client"

import React from "react"
import { KeyRound, Mail, ShieldCheck, ShieldOff } from "lucide-react"
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
  privateTags?: string[]
  onMakePrivate?: (tag: string) => void
  onMakePublic?: (tag: string) => void
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
  privateTags = [],
  onMakePrivate,
  onMakePublic,
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
          {emails.map((email, index) => {
            const tagIsPrivate = privateTags.includes(email.tag)

            return (
              <div
                key={email.id}
                className={`email-row-enter group card-lift hover-shine rounded-xl border border-border/60 bg-background/40 p-3 ${
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
                <div className="flex items-start gap-2">
                  {/* Main email content — clickable */}
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => onOpen && onOpen(email)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className={`size-3 ${isVaultView ? "text-destructive/60" : "text-primary/60"}`} />
                        <span className={`font-mono text-xs ${isVaultView ? "text-destructive" : "text-primary"}`}>
                          {email.tag}
                        </span>
                        {tagIsPrivate && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-destructive/30 bg-destructive/5 px-1.5 py-0.5 text-[9px] font-medium text-destructive">
                            <ShieldCheck className="size-2" />
                            vault
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{email.receivedAt}</span>
                    </div>
                    <p className="text-sm text-foreground">{email.subject}</p>
                  </div>

                  {/* Privacy toggle button */}
                  {onMakePrivate && onMakePublic && !isVaultView && (
                    <button
                      type="button"
                      title={tagIsPrivate ? `Make "${email.tag}" tag public` : `Move "${email.tag}" tag to vault`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (tagIsPrivate) {
                          onMakePublic(email.tag)
                        } else {
                          onMakePrivate(email.tag)
                        }
                      }}
                      className={`mt-1 flex-shrink-0 rounded-lg border p-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 active:scale-90 ${
                        tagIsPrivate
                          ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-[0_0_10px_var(--glow-destructive)]"
                          : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_10px_var(--glow-primary)]"
                      }`}
                    >
                      {tagIsPrivate ? (
                        <ShieldCheck className="size-3.5" />
                      ) : (
                        <ShieldOff className="size-3.5" />
                      )}
                    </button>
                  )}

                  {/* In vault view, show button to make public */}
                  {onMakePublic && isVaultView && vaultUnlocked && tagIsPrivate && (
                    <button
                      type="button"
                      title={`Make "${email.tag}" tag public`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onMakePublic(email.tag)
                      }}
                      className="mt-1 flex-shrink-0 rounded-lg border border-destructive/40 bg-destructive/10 p-1.5 text-destructive opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-destructive/20 hover:shadow-[0_0_10px_var(--glow-destructive)] active:scale-90"
                    >
                      <ShieldOff className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {!emails.length && (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center scale-in">
              <Mail className="mb-2 size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {isVaultView ? "No private emails in the vault." : "No emails matched this view."}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
