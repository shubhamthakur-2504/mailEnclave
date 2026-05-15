"use client"

import React, { useEffect, useRef, useState } from "react"
import { AlertTriangle, ChevronDown, Lock, ShieldCheck, ShieldOff, Tag, Trash2, Unlock } from "lucide-react"
import type { TagItem } from "./types"

// ─────────────────────────────────────────────────────────────────────────────
// Mobile-only compact tag dropdown
// ─────────────────────────────────────────────────────────────────────────────
type MobileTagsDropdownProps = {
  tags: TagItem[]
  activeTag: string
  isVaultView: boolean
  vaultUnlocked: boolean
  onSelectTag: (tag: string) => void
  onRequirePasskey: () => void
  privateTags: string[]
  onMakePrivate?: (tag: string) => void
  onMakePublic?: (tag: string) => void
  onDeleteTag?: (tag: string, isPrivate: boolean) => Promise<void>
  deletingTag: string | null
  setDeletingTag: (v: string | null) => void
  confirmDeleteTag: string | null
  setConfirmDeleteTag: (v: string | null) => void
}

function MobileTagsDropdown({
  tags,
  activeTag,
  isVaultView,
  vaultUnlocked,
  onSelectTag,
  onRequirePasskey,
  privateTags,
  onMakePrivate,
  onMakePublic,
  onDeleteTag,
  deletingTag,
  setDeletingTag,
  confirmDeleteTag,
  setConfirmDeleteTag,
}: MobileTagsDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside tap
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const activeTagData = tags.find((t) => t.name === activeTag) ?? tags[0]
  const activeIsPrivate = privateTags.includes(activeTag)

  const handleDelete = async (tagName: string) => {
    if (!onDeleteTag) return
    const isPrivate = privateTags.includes(tagName)
    setDeletingTag(tagName)
    setConfirmDeleteTag(null)
    try { await onDeleteTag(tagName, isPrivate) }
    finally { setDeletingTag(null) }
  }

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger row: shows only the active tag ── */}
      <div
        className={`card-lift flex items-center justify-between rounded-2xl border bg-card px-4 py-3 backdrop-blur-md transition-all duration-300 ${
          isVaultView
            ? "border-destructive/40 hover:border-destructive/60"
            : "border-border hover:border-primary/40"
        }`}
      >
        {/* Left: tag icon label */}
        <div className="flex items-center gap-2">
          <Tag className={`size-3 ${isVaultView ? "text-destructive/70" : "text-muted-foreground"}`} />
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tag</span>
        </div>

        {/* Centre: active tag chip */}
        <button
          type="button"
          onClick={() => {
            if (isVaultView && !vaultUnlocked) { onRequirePasskey(); return }
            setOpen((v) => !v)
          }}
          className="flex flex-1 items-center justify-center gap-1.5"
        >
          {activeIsPrivate && activeTag !== "all" && (
            <Lock className="size-2.5 flex-shrink-0 text-destructive/70" />
          )}
          <span
            className={`font-mono text-sm font-semibold ${
              isVaultView ? "text-destructive" : "text-primary"
            }`}
          >
            {activeTagData?.name ?? activeTag}
          </span>
          <span className={`count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] tabular-nums ${
            isVaultView ? "text-destructive/70" : "text-muted-foreground"
          }`}>
            {activeTagData?.count ?? 0}
          </span>
        </button>

        {/* Right: groups count + chevron toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{tags.length - 1} groups</span>
          <button
            type="button"
            onClick={() => {
              if (isVaultView && !vaultUnlocked) { onRequirePasskey(); return }
              setOpen((v) => !v)
            }}
            className={`flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground transition-all duration-300 hover:border-primary/40 hover:text-primary active:scale-90 ${
              open ? "rotate-180 border-primary/40 text-primary" : ""
            }`}
            aria-label={open ? "Close tags" : "Open tags"}
          >
            <ChevronDown className="size-3.5 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* ── Slide-down panel ── */}
      <div
        className={`overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-1.5 rounded-2xl border border-border bg-card/95 p-2 backdrop-blur-xl shadow-[0_16px_48px_rgba(3,7,18,0.35)]">
          <div className="max-h-96 space-y-1 overflow-y-auto pr-0.5 scrollbar-thin">
            {tags.map((tag, index) => {
              const active = activeTag === tag.name
              const priv = privateTags.includes(tag.name)
              const isAllTag = tag.name === "all"
              const isConfirming = confirmDeleteTag === tag.name
              const isDeleting = deletingTag === tag.name

              const rowColor = active
                ? isVaultView
                  ? "border-destructive/60 bg-destructive/10 text-destructive"
                  : "border-primary/60 bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:border-border/60 hover:text-foreground"

              return (
                <div
                  key={tag.name}
                  className={`rounded-xl border transition-all duration-150 ${rowColor} ${isDeleting ? "opacity-40 scale-95" : ""}`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {isConfirming ? (
                    <div className="flex flex-col gap-2 p-2.5">
                      <div className="flex items-start gap-1.5 text-[10px] text-destructive">
                        <AlertTriangle className="size-3 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">Delete <span className="font-mono font-semibold">"{tag.name}"</span> and all its emails?</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setConfirmDeleteTag(null)}
                          className="flex-1 rounded-lg border border-border/60 bg-background/60 py-1.5 text-center text-[10px] text-muted-foreground transition-all hover:text-foreground">
                          Cancel
                        </button>
                        <button type="button" onClick={() => handleDelete(tag.name)}
                          className="flex-1 rounded-lg border border-destructive/50 bg-destructive/15 py-1.5 text-center text-[10px] font-medium text-destructive transition-all hover:bg-destructive/25">
                          Delete all
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2.5">
                      {priv && !isAllTag && <Lock className="size-2.5 flex-shrink-0 text-destructive/70" />}
                      <button
                        type="button"
                        onClick={() => {
                          if (isVaultView && !vaultUnlocked) { onRequirePasskey(); return }
                          onSelectTag(tag.name)
                          setOpen(false)
                        }}
                        className="min-w-0 flex-1 truncate text-left font-mono text-xs active:scale-[0.97]"
                      >
                        {tag.name}
                      </button>
                      <span className="flex-shrink-0 rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] tabular-nums">
                        {tag.count}
                      </span>
                      {/* Action buttons */}
                      {!isAllTag && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                          {!isVaultView && onMakePrivate && onMakePublic && (
                            <button type="button"
                              title={priv ? "Make public" : "Move to vault"}
                              onClick={(e) => { e.stopPropagation(); priv ? onMakePublic(tag.name) : onMakePrivate(tag.name) }}
                              className={`rounded-md border p-1 transition-all hover:scale-110 active:scale-90 ${
                                priv
                                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                                  : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-primary"
                              }`}>
                              {priv ? <ShieldCheck className="size-3" /> : <ShieldOff className="size-3" />}
                            </button>
                          )}
                          {isVaultView && vaultUnlocked && onMakePublic && priv && (
                            <button type="button" title="Remove from vault"
                              onClick={(e) => { e.stopPropagation(); onMakePublic(tag.name) }}
                              className="rounded-md border border-destructive/40 bg-destructive/10 p-1 text-destructive transition-all hover:scale-110">
                              <Unlock className="size-3" />
                            </button>
                          )}
                          {onDeleteTag && (
                            <button type="button" title={`Delete "${tag.name}"`}
                              disabled={isDeleting}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (priv && !vaultUnlocked) { onRequirePasskey(); return }
                                setConfirmDeleteTag(tag.name)
                              }}
                              className="rounded-md border border-border/50 bg-background/40 p-1 text-muted-foreground transition-all hover:border-destructive/40 hover:text-destructive hover:scale-110 active:scale-90">
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


type TagsPanelProps = {
  tags: TagItem[]
  activeTag: string
  isVaultView: boolean
  vaultUnlocked: boolean
  onSelectTag: (tag: string) => void
  onRequirePasskey: () => void
  privateTags?: string[]
  onMakePrivate?: (tag: string) => void
  onMakePublic?: (tag: string) => void
  onDeleteTag?: (tag: string, isPrivate: boolean) => Promise<void>
  /** When true (mail detail open), panel shrinks and hides action buttons */
  collapsed?: boolean
}

export default function TagsPanel({
  tags,
  activeTag,
  isVaultView,
  vaultUnlocked,
  onSelectTag,
  onRequirePasskey,
  privateTags = [],
  onMakePrivate,
  onMakePublic,
  onDeleteTag,
  collapsed = false,
}: TagsPanelProps) {
  const [deletingTag, setDeletingTag] = useState<string | null>(null)
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<string | null>(null)

  const handleDeleteTag = async (tagName: string) => {
    if (!onDeleteTag) return
    const isPrivate = privateTags.includes(tagName)
    setDeletingTag(tagName)
    setConfirmDeleteTag(null)
    try {
      await onDeleteTag(tagName, isPrivate)
    } finally {
      setDeletingTag(null)
    }
  }

  const showActions = !collapsed && (onDeleteTag || onMakePrivate || onMakePublic)

  return (
    <div>
      {/* ── Mobile: compact dropdown trigger ── */}
      <div className="block md:hidden">
        <MobileTagsDropdown
          tags={tags}
          activeTag={activeTag}
          isVaultView={isVaultView}
          vaultUnlocked={vaultUnlocked}
          onSelectTag={onSelectTag}
          onRequirePasskey={onRequirePasskey}
          privateTags={privateTags}
          onMakePrivate={onMakePrivate}
          onMakePublic={onMakePublic}
          onDeleteTag={onDeleteTag}
          deletingTag={deletingTag}
          setDeletingTag={setDeletingTag}
          confirmDeleteTag={confirmDeleteTag}
          setConfirmDeleteTag={setConfirmDeleteTag}
        />
      </div>

      {/* ── Desktop: full vertical sidebar ── */}
      <aside className="hidden md:block card-lift rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-left">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="size-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tags</p>
          </div>
          <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
            {tags.length - 1} groups
          </span>
        </div>

        {/* Tag list */}
        <div className="space-y-1.5">
          {tags.map((tag, index) => {
            const active = activeTag === tag.name
            const priv = privateTags.includes(tag.name)
            const isAllTag = tag.name === "all"
            const isConfirming = confirmDeleteTag === tag.name
            const isDeleting = deletingTag === tag.name

            const activeColor = active
              ? isVaultView
                ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_12px_rgba(239,68,68,0.25)] pulse-glow-destructive"
                : "border-primary bg-primary/10 text-primary shadow-[0_0_12px_var(--glow-primary)] pulse-glow-primary"
              : "border-border/60 bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"

            return (
              <div
                key={tag.name}
                className={`email-row-enter group rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${activeColor} ${isDeleting ? "opacity-50 scale-95" : ""}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* ── Inline delete confirmation ── */}
                {isConfirming ? (
                  <div className="flex flex-col gap-2 p-2.5">
                    <div className="flex items-start gap-1.5 text-[10px] text-destructive">
                      <AlertTriangle className="size-3 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        Delete <span className="font-mono font-semibold break-all">"{tag.name}"</span> and all its emails?
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteTag(null)}
                        className="flex-1 rounded-lg border border-border/60 bg-background/60 py-1.5 text-center text-[10px] text-muted-foreground transition-all hover:bg-background hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag.name)}
                        className="flex-1 rounded-lg border border-destructive/50 bg-destructive/15 py-1.5 text-center text-[10px] font-medium text-destructive transition-all hover:bg-destructive/25"
                      >
                        Delete all
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Main row: [lock] [name…] [count] [actions] ── */
                  <div className="flex items-center gap-1.5 px-3 py-2.5 text-xs">
                    {/* Lock icon for private tags */}
                    {priv && !isAllTag && (
                      <Lock className="size-2.5 flex-shrink-0 text-destructive/70" />
                    )}

                    {/* Tag name — clickable, truncated, tooltip on hover */}
                    <button
                      type="button"
                      title={tag.name}
                      onClick={() => {
                        if (isVaultView && !vaultUnlocked) {
                          onRequirePasskey()
                          return
                        }
                        onSelectTag(tag.name)
                      }}
                      className="min-w-0 flex-1 truncate text-left font-mono text-xs active:scale-[0.97] hover-shine"
                    >
                      {tag.name}
                    </button>

                    {/* Count badge — always visible */}
                    <span
                      className={`count-badge flex-shrink-0 rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] tabular-nums ${
                        active ? "badge-bounce" : ""
                      }`}
                    >
                      {tag.count}
                    </span>

                    {/* ── Action buttons — hidden when collapsed, animated out ── */}
                    {!isAllTag && showActions && (
                      <div
                        className="flex flex-shrink-0 items-center gap-1 overflow-hidden transition-all duration-400 ease-in-out"
                        style={{
                          maxWidth: collapsed ? "0px" : "72px",
                          opacity: collapsed ? 0 : 1,
                        }}
                      >
                        {/* Vault toggle (non-vault view) */}
                        {!isVaultView && onMakePrivate && onMakePublic && (
                          <button
                            type="button"
                            title={priv ? "Make tag public" : "Move tag to vault"}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (priv) onMakePublic(tag.name)
                              else onMakePrivate(tag.name)
                            }}
                            className={`flex-shrink-0 rounded-md border p-1 transition-all duration-200 hover:scale-110 active:scale-90 ${
                              priv
                                ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-[0_0_8px_var(--glow-destructive)]"
                                : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_8px_var(--glow-primary)]"
                            }`}
                          >
                            {priv ? <ShieldCheck className="size-3" /> : <ShieldOff className="size-3" />}
                          </button>
                        )}

                        {/* Unvault button (vault view) */}
                        {isVaultView && vaultUnlocked && onMakePublic && priv && (
                          <button
                            type="button"
                            title="Remove from vault"
                            onClick={(e) => {
                              e.stopPropagation()
                              onMakePublic(tag.name)
                            }}
                            className="flex-shrink-0 rounded-md border border-destructive/40 bg-destructive/10 p-1 text-destructive transition-all hover:bg-destructive/20 hover:scale-110 hover:shadow-[0_0_8px_var(--glow-destructive)]"
                          >
                            <Unlock className="size-3" />
                          </button>
                        )}

                        {/* Delete tag */}
                        {onDeleteTag && (
                          <button
                            type="button"
                            title={`Delete all emails in "${tag.name}"`}
                            disabled={isDeleting}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (priv && !vaultUnlocked) {
                                onRequirePasskey()
                                return
                              }
                              setConfirmDeleteTag(tag.name)
                            }}
                            className="flex-shrink-0 rounded-md border border-border/50 bg-background/40 p-1 text-muted-foreground transition-all duration-200 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive hover:scale-110 active:scale-90"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div
          className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3 overflow-hidden transition-all duration-400 ease-in-out"
          style={{ maxHeight: collapsed ? "0px" : "40px", opacity: collapsed ? 0 : 1, marginTop: collapsed ? 0 : undefined, paddingTop: collapsed ? 0 : undefined, borderTopWidth: collapsed ? 0 : undefined }}
        >
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldOff className="size-2.5" />
            <span>Public</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-destructive/70">
            <ShieldCheck className="size-2.5" />
            <span>Private</span>
          </div>
          {onDeleteTag && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Trash2 className="size-2.5" />
              <span>Del tag</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
