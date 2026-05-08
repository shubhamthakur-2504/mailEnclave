"use client"

import React from "react"
import { KeyRound } from "lucide-react"
import type { DockView, EmailItem } from "./types"

type MailListProps = {
  emails: EmailItem[]
  activeView: DockView
  activeNamespace: string
  activeTag: string
  isVaultView: boolean
  vaultUnlocked: boolean
  onRequirePasskey: () => void
}

export default function MailList({
  emails,
  activeView,
  activeNamespace,
  activeTag,
  isVaultView,
  vaultUnlocked,
  onRequirePasskey,
}: MailListProps) {
  const showLockedVaultMessage = activeView === "vault" && !vaultUnlocked

  return (
    <article
      className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur-md transition-all duration-300 hover:border-white/30"
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
        <span className="text-xs text-muted-foreground">{emails.length} mails</span>
      </div>

      {showLockedVaultMessage ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-rose-300/40 bg-rose-500/5 p-6 text-center">
          <KeyRound className="mb-3 size-7 text-rose-300" />
          <p className="mb-1 text-sm font-semibold text-foreground">Vault is locked</p>
          <p className="text-xs text-muted-foreground">Use the Vault control in the dock and pass the challenge.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-[filter,opacity,transform,background-color,border-color] duration-200 ease-out hover:scale-[1.01] ${
                email.sensitive && !vaultUnlocked
                  ? "blur-sm opacity-60 saturate-50 scale-[0.995]"
                  : "blur-0 opacity-100 saturate-100 scale-100"
              } ${
                isVaultView
                  ? "hover:border-rose-300/40 hover:bg-rose-400/5"
                  : "hover:border-indigo-300/40 hover:bg-indigo-400/5"
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className={`font-mono text-xs ${isVaultView ? "text-rose-300" : "text-indigo-300"}`}>
                  {email.tag}
                </span>
                <span className="text-xs text-muted-foreground">{email.receivedAt}</span>
              </div>
              <p className="text-sm text-foreground">{email.subject}</p>
            </div>
          ))}

          {!emails.length && (
            <div className="rounded-xl border border-dashed border-white/20 p-4 text-center text-sm text-muted-foreground">
              No emails matched this view.
            </div>
          )}
        </div>
      )}
    </article>
  )
}
