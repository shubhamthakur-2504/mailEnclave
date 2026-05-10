"use client"

import React from "react"
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
    <aside className="rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tags</p>
        <span className="text-[11px] text-muted-foreground">{tags.length - 1} groups</span>
      </div>
      <div className="space-y-2">
        {tags.map((tag) => (
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
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-300 hover:-translate-y-0.5 ${
              activeTag === tag.name
                ? isVaultView
                  ? "border-destructive bg-destructive/10 text-destructive shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                  : "border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(91,106,245,0.25)]"
                : "border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            <span className="font-mono">{tag.name}</span>
            <span className="rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[10px]">{tag.count}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
