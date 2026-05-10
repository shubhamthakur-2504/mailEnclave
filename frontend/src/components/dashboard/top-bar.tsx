"use client"

import React from "react"
import { ChevronDown, Command, Lock, Search, Unlock } from "lucide-react"

type TopBarProps = {
  activeNamespace: string
  namespaces: string[]
  namespaceMenuOpen: boolean
  onToggleNamespaceMenu: () => void
  onSelectNamespace: (namespace: string) => void
  onOpenAddNamespace: () => void
  search: string
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  isVaultView: boolean
  vaultUnlocked: boolean
  disableMenu: boolean
}

export default function TopBar({
  activeNamespace,
  namespaces,
  namespaceMenuOpen,
  onToggleNamespaceMenu,
  onSelectNamespace,
  onOpenAddNamespace,
  search,
  onSearchChange,
  onSearchFocus,
  isVaultView,
  vaultUnlocked,
  disableMenu,
}: TopBarProps) {
  return (
    <div className="mb-5 grid gap-3 md:grid-cols-[1fr_1.2fr_1fr]">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (disableMenu) return
            onToggleNamespaceMenu()
          }}
          className={`flex w-full items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-left transition-all duration-300 ${
            disableMenu
              ? "cursor-default opacity-80"
              : "hover:-translate-y-0.5 hover:border-primary/50"
          }`}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Active Namespace</p>
            <p className="font-mono text-sm text-foreground">{activeNamespace}</p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>

        {namespaceMenuOpen && !disableMenu ? (
          <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 w-full rounded-2xl border border-border bg-popover p-3 shadow-[0_18px_60px_rgba(3,7,18,0.5)] backdrop-blur-2xl">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Namespaces</p>
            <div className="max-h-44 space-y-2 overflow-auto pr-1">
              {namespaces.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelectNamespace(item)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 ${
                    activeNamespace === item
                      ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                      : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="font-mono">{item}</span>
                  {activeNamespace === item ? (
                    <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary">
                      active
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenAddNamespace}
              className="mt-3 w-full rounded-full bg-indigo-500/90 py-2 text-xs font-semibold text-white shadow-[0_0_18px_rgba(99,102,241,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.6)]"
            >
              Add namespace
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative flex items-center rounded-xl border border-border bg-background/50 px-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={onSearchFocus}
          placeholder="Find tags or namespaces"
          className="h-10 w-full bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <div className="hidden items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-[11px] text-muted-foreground md:flex">
          <Command className="size-3" />
          <span>K</span>
        </div>
      </div>

      <div
        className={`flex items-center justify-end rounded-xl border px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 ${
          isVaultView ? "border-destructive/40 bg-destructive/10" : "border-border bg-background/50"
        }`}
      >
        <div className="flex items-center gap-2 text-sm">
          {vaultUnlocked ? (
            <Unlock className={isVaultView ? "size-4 text-destructive" : "size-4 text-primary"} />
          ) : (
            <Lock className={isVaultView ? "size-4 text-destructive" : "size-4 text-primary"} />
          )}
          <span className="font-medium text-foreground">Vault Status:</span>
          <span className={vaultUnlocked ? (isVaultView ? "text-destructive" : "text-primary") : "text-primary"}>
            {vaultUnlocked ? "Decrypted" : "Locked"}
          </span>
        </div>
      </div>
    </div>
  )
}
