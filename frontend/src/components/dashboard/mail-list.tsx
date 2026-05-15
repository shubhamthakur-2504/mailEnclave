"use client"

import React, { useState } from "react"
import { KeyRound, Mail, ShieldCheck, ShieldOff, Trash2, CircleDot, Circle, Eye, EyeOff, Filter, Sparkles } from "lucide-react"
import type { DockView, EmailItem, ReadFilter } from "./types"

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
  onDelete?: (email: EmailItem) => void
  privateTags?: string[]
  onMakePrivate?: (tag: string) => void
  onMakePublic?: (tag: string) => void
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
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
  onDelete,
  privateTags = [],
  onMakePrivate,
  onMakePublic,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: MailListProps) {
  const showLockedVaultMessage = activeView === "vault" && !vaultUnlocked
  const [readFilter, setReadFilter] = useState<ReadFilter>("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const visibleEmails = React.useMemo(() => {
    if (readFilter === "read") return emails.filter((e) => e.isRead)
    if (readFilter === "unread") return emails.filter((e) => !e.isRead)
    return emails
  }, [emails, readFilter])

  const unreadCount = emails.filter((e) => !e.isRead).length
  const readCount = emails.filter((e) => e.isRead).length

  const handleDelete = async (e: React.MouseEvent, email: EmailItem) => {
    e.stopPropagation()
    if (!onDelete) return
    setDeletingId(email.id)
    try {
      await onDelete(email)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <article
      className="card-lift min-w-0 w-full rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-right"
      onClick={() => {
        if (isVaultView && !vaultUnlocked) {
          onRequirePasskey()
        }
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <h2 className="font-mono text-sm text-foreground truncate">
            {activeView === "vault" ? "secret-inbox" : "public-inbox"} / {activeNamespace}
          </h2>
          <p className="text-xs text-muted-foreground">tag: {activeTag}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Read/Unread filter */}
          {!showLockedVaultMessage && !isLoading && emails.length > 0 && (
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 p-0.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReadFilter("all") }}
                title="Show all"
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
                  readFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Filter className="size-2.5" />
                All
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReadFilter("unread") }}
                title="Show unread"
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
                  readFilter === "unread"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CircleDot className="size-2.5" />
                Unread {unreadCount > 0 && <span className="ml-0.5 tabular-nums">({unreadCount})</span>}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setReadFilter("read") }}
                title="Show read"
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-all duration-200 ${
                  readFilter === "read"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Circle className="size-2.5" />
                Read {readCount > 0 && <span className="ml-0.5 tabular-nums">({readCount})</span>}
              </button>
            </div>
          )}
          <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground">
            {visibleEmails.length} mails
          </span>
        </div>
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
          {visibleEmails.map((email, index) => {
            const tagIsPrivate = privateTags.includes(email.tag)
            const isUnread = !email.isRead
            const isNew = !!email.isNew
            const isDeleting = deletingId === email.id

            return (
              <div
                key={email.id}
                className={`email-row-enter group card-lift relative rounded-xl border p-3 transition-all duration-200 ${
                  isDeleting ? "scale-95 opacity-50" : ""
                } ${
                  email.sensitive && !vaultUnlocked
                    ? "blur-sm opacity-60 saturate-50 scale-[0.995]"
                    : "blur-0 opacity-100 saturate-100 scale-100"
                } ${
                  isVaultView
                    ? "hover:border-destructive/40 hover:bg-destructive/5"
                    : "hover:border-primary/40 hover:bg-primary/5"
                } ${
                  isUnread
                    ? "border-primary/50 bg-primary/8 dark:bg-primary/10 shadow-[0_0_0_1px_var(--tw-shadow-color)] shadow-primary/20"
                    : "border-border/60 bg-background/30"
                }`}
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* Unread accent stripe */}
                {isUnread && (
                  <div className={`absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full ${isVaultView ? "bg-destructive" : "bg-primary"}`} />
                )}

                <div className="flex items-start gap-2">
                  {/* Main email content — clickable */}
                  <div
                    className="min-w-0 flex-1 cursor-pointer relative"
                    onClick={() => onOpen && onOpen(email)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onOpen && onOpen(email)}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Read/Unread indicator dot */}
                        {isUnread ? (
                          <CircleDot className={`size-3 flex-shrink-0 ${isVaultView ? "text-destructive" : "text-primary"}`} />
                        ) : (
                          <Circle className="size-3 flex-shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={`font-mono text-xs ${isVaultView ? "text-destructive" : "text-primary"} ${isUnread ? "font-semibold" : "font-normal opacity-80"}`}>
                          {email.tag}
                        </span>
                        {tagIsPrivate && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-destructive/30 bg-destructive/5 px-1.5 py-0.5 text-[9px] font-medium text-destructive">
                            <ShieldCheck className="size-2" />
                            vault
                          </span>
                        )}
                        {/* "NEW" badge — shown for ~8s via CSS animation, then fades */}
                        {isNew && (
                          <span className="new-mail-badge inline-flex items-center gap-0.5 rounded-full border border-emerald-400/50 bg-emerald-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-500 dark:text-emerald-400">
                            <Sparkles className="size-2" />
                            new
                          </span>
                        )}
                      </div>
                      <span className={`flex-shrink-0 text-xs ${isUnread ? "text-foreground/70 font-medium" : "text-muted-foreground"}`}>
                        {email.receivedAt}
                      </span>
                    </div>
                    <p className={`text-sm ${isUnread ? "font-semibold text-foreground" : "font-normal text-foreground/70 dark:text-foreground/60"}`}>
                      {email.subject}
                    </p>
                    {email.from && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                        {email.from}
                      </p>
                    )}
                  </div>

                  {/* Action buttons column */}
                  <div className="flex flex-col items-center gap-1.5 mt-0.5">
                    {/* Delete email button */}
                    {onDelete && (
                      <button
                        type="button"
                        title="Delete email"
                        disabled={isDeleting}
                        onClick={(e) => handleDelete(e, email)}
                        className="flex-shrink-0 rounded-lg border border-border/50 bg-background/50 p-1.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:shadow-[0_0_10px_var(--glow-destructive)] active:scale-90"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}

                    {/* Privacy toggle button (public inbox only) */}
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
                        className={`flex-shrink-0 rounded-lg border p-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 active:scale-90 ${
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
                        className="flex-shrink-0 rounded-lg border border-destructive/40 bg-destructive/10 p-1.5 text-destructive opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-destructive/20 hover:shadow-[0_0_10px_var(--glow-destructive)] active:scale-90"
                      >
                        <ShieldOff className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {!visibleEmails.length && (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center scale-in">
              <Mail className="mb-2 size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {isVaultView
                  ? "No private emails in the vault."
                  : readFilter !== "all"
                  ? `No ${readFilter} emails matched this view.`
                  : "No emails matched this view."}
              </p>
            </div>
          )}

          {/* Load more */}
          {hasMore && visibleEmails.length > 0 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-5 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-[0_0_14px_var(--glow-primary)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {isLoadingMore ? (
                  <><span className="spinner size-3" />Loading...</>
                ) : (
                  "Load more emails"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
