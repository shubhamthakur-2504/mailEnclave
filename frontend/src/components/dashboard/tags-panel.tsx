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
    <aside className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur-md transition-all duration-300 hover:border-white/30">
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
                  ? "border-rose-300/60 bg-rose-500/12 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                  : "border-indigo-300/60 bg-indigo-400/12 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/30 hover:text-foreground"
            }`}
          >
            <span className="font-mono">{tag.name}</span>
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px]">{tag.count}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
