"use client"

import React from "react"
import { Tag, Lock, Unlock, ShieldCheck, ShieldOff } from "lucide-react"
import type { TagItem } from "./types"

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
}: TagsPanelProps) {
  return (
    <aside className="card-lift rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-left">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Tag className="size-3 text-muted-foreground" />
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tags</p>
        </div>
        <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
          {tags.length - 1} groups
        </span>
      </div>

      <div className="space-y-2">
        {tags.map((tag, index) => {
          const isPrivate = privateTags.includes(tag.name)
          const isAllTag = tag.name === "all"

          return (
            <div
              key={tag.name}
              className={`email-row-enter group flex w-full items-center rounded-xl border text-xs transition-all duration-300 hover:-translate-y-0.5 ${
                activeTag === tag.name
                  ? isVaultView
                    ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_12px_rgba(239,68,68,0.25)] pulse-glow-destructive"
                    : "border-primary bg-primary/10 text-primary shadow-[0_0_12px_var(--glow-primary)] pulse-glow-primary"
                  : "border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Tag select button */}
              <button
                type="button"
                onClick={() => {
                  if (isVaultView && !vaultUnlocked) {
                    onRequirePasskey()
                    return
                  }
                  onSelectTag(tag.name)
                }}
                className="hover-shine flex flex-1 items-center justify-between px-3 py-2 text-left active:scale-[0.97]"
              >
                <span className="flex items-center gap-1.5 font-mono">
                  {isPrivate && !isAllTag && (
                    <Lock className="size-2.5 text-destructive/70" />
                  )}
                  {tag.name}
                </span>
                <span className={`count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] ${
                  activeTag === tag.name ? "badge-bounce" : ""
                }`}>
                  {tag.count}
                </span>
              </button>

              {/* Privacy toggle — only for real tags (not "all"), and only in non-vault view when we have handlers */}
              {!isAllTag && !isVaultView && onMakePrivate && onMakePublic && (
                <button
                  type="button"
                  title={isPrivate ? "Make tag public" : "Make tag private"}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isPrivate) {
                      onMakePublic(tag.name)
                    } else {
                      onMakePrivate(tag.name)
                    }
                  }}
                  className={`mr-2 flex items-center justify-center rounded-lg border p-1.5 transition-all duration-300 hover:scale-110 active:scale-90 ${
                    isPrivate
                      ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:shadow-[0_0_10px_var(--glow-destructive)]"
                      : "border-border/50 bg-background/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_10px_var(--glow-primary)]"
                  }`}
                >
                  {isPrivate ? (
                    <ShieldCheck className="size-3" />
                  ) : (
                    <ShieldOff className="size-3" />
                  )}
                </button>
              )}

              {/* In vault view, show unlock button for private tags */}
              {!isAllTag && isVaultView && vaultUnlocked && onMakePublic && isPrivate && (
                <button
                  type="button"
                  title="Make tag public (remove from vault)"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMakePublic(tag.name)
                  }}
                  className="mr-2 flex items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 p-1.5 text-destructive transition-all duration-300 hover:scale-110 hover:bg-destructive/20 hover:shadow-[0_0_10px_var(--glow-destructive)] active:scale-90"
                >
                  <Unlock className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-3">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ShieldOff className="size-2.5" />
          <span>Public</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-destructive/70">
          <ShieldCheck className="size-2.5" />
          <span>Private</span>
        </div>
      </div>
    </aside>
  )
}
