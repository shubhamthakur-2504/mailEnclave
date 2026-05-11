"use client"

import React from "react"
import { Tag } from "lucide-react"
import type { TagItem } from "./types"

type TagsPanelProps = {
  tags: TagItem[]
  activeTag: string
  isVaultView: boolean
  vaultUnlocked: boolean
  onSelectTag: (tag: string) => void
  onRequirePasskey: () => void
}

export default function TagsPanel({
  tags,
  activeTag,
  isVaultView,
  vaultUnlocked,
  onSelectTag,
  onRequirePasskey,
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
        {tags.map((tag, index) => (
          <button
            key={tag.name}
            type="button"
            onClick={() => {
              if (isVaultView && !vaultUnlocked) {
                onRequirePasskey()
                return
              }
              onSelectTag(tag.name)
            }}
            className={`email-row-enter hover-shine flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${
              activeTag === tag.name
                ? isVaultView
                  ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_12px_rgba(239,68,68,0.25)] pulse-glow-destructive"
                  : "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(91,106,245,0.25)] pulse-glow-primary"
                : "border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="font-mono">{tag.name}</span>
            <span className={`count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px] ${
              activeTag === tag.name ? "badge-bounce" : ""
            }`}>
              {tag.count}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
