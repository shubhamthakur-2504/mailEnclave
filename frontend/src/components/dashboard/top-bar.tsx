"use client"

import React, { useRef, useEffect, useState } from "react"
import { ChevronDown, Command, Lock, Plus, Search, Unlock, X } from "lucide-react"

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
  hidden?: boolean
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
  hidden = false,
}: TopBarProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [mobileNsOpen, setMobileNsOpen] = useState(false)

  // Close desktop namespace dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (namespaceMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggleNamespaceMenu()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [namespaceMenuOpen, onToggleNamespaceMenu])

  // Close mobile namespace dropdown on outside click
  const mobileNsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!mobileNsOpen) return
    const handler = (e: MouseEvent) => {
      if (mobileNsRef.current && !mobileNsRef.current.contains(e.target as Node)) setMobileNsOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [mobileNsOpen])

  return (
    <div
      className={`relative z-50 hidden md:grid transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        hidden
          ? "mb-0 -translate-y-6 grid-rows-[0fr] opacity-0 pointer-events-none"
          : "mb-5 translate-y-0 grid-rows-[1fr] opacity-100"
      }`}
      style={hidden ? { overflow: "hidden" } : { overflow: "visible" }}
    >
      <div className="min-h-0">

        {/* ═══════════════════════ MOBILE LAYOUT ═══════════════════════ */}
        <div className="md:hidden space-y-2.5 pb-1 fade-in-up">

          {/* Row 1: Namespace selector + Vault badge */}
          <div className="flex items-center gap-2">
            {/* Namespace — tappable dropdown trigger */}
            <div className="relative min-w-0 flex-1" ref={mobileNsRef}>
              <button
                type="button"
                onClick={() => { if (!disableMenu) setMobileNsOpen((v) => !v) }}
                className={`gradient-border flex w-full items-center justify-between rounded-xl border border-border bg-card/80 px-3 py-2 text-left backdrop-blur-md transition-all duration-300 ${
                  disableMenu ? "cursor-default opacity-80" : "active:scale-[0.98]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground leading-none">Namespace</p>
                  <p className="mt-0.5 truncate font-mono text-sm font-medium text-foreground">{activeNamespace}</p>
                </div>
                <ChevronDown className={`ml-1 size-3.5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${mobileNsOpen ? "rotate-180 text-primary" : ""}`} />
              </button>

              {/* Mobile namespace dropdown */}
              {mobileNsOpen && !disableMenu && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-2xl border border-border bg-card/98 p-3 shadow-[0_16px_48px_rgba(3,7,18,0.5)] backdrop-blur-3xl scale-in">
                  <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Namespaces</p>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto pr-0.5 scrollbar-thin">
                    {namespaces.map((item, i) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => { onSelectNamespace(item); setMobileNsOpen(false) }}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 active:scale-[0.97] ${
                          activeNamespace === item
                            ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_10px_var(--glow-primary)]"
                            : "border-border/50 bg-background/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <span className="truncate font-mono mr-2">{item}</span>
                        {activeNamespace === item && (
                          <span className="flex-shrink-0 rounded-full border border-primary/40 px-1.5 py-0.5 text-[9px] text-primary">active</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { onOpenAddNamespace(); setMobileNsOpen(false) }}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-[0_0_14px_var(--glow-primary)] transition-all active:scale-[0.97]"
                  >
                    <Plus className="size-3.5" />
                    Add namespace
                  </button>
                </div>
              )}
            </div>

            {/* Vault badge — compact */}
            <div
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all duration-300 ${
                isVaultView
                  ? "border-destructive/40 bg-destructive/10"
                  : "border-border bg-card/80"
              }`}
            >
              {vaultUnlocked ? (
                <Unlock className={`size-3.5 ${isVaultView ? "text-destructive" : "text-primary"}`} />
              ) : (
                <Lock className={`size-3.5 icon-breathe ${isVaultView ? "text-destructive" : "text-primary"}`} />
              )}
              <span className={`text-[11px] font-semibold ${
                vaultUnlocked
                  ? isVaultView ? "text-destructive" : "text-primary"
                  : "text-primary"
              }`}>
                {vaultUnlocked ? "Open" : "Locked"}
              </span>
            </div>
          </div>

          {/* Row 2: Search bar */}
          <div className="relative flex items-center rounded-xl border border-border bg-card/80 px-3 backdrop-blur-md transition-all duration-300 search-glow gradient-border">
            <Search className="size-3.5 flex-shrink-0 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={onSearchFocus}
              placeholder="Search tags or namespaces…"
              className="h-9 w-full bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            {search && (
              <button type="button" onClick={() => onSearchChange("")}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors active:scale-90">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════ DESKTOP 3-COLUMN LAYOUT ═══════════════════════ */}
        <div className="hidden md:grid gap-3 grid-cols-[1fr_1.2fr_1fr] pb-1">

          {/* Namespace selector */}
          <div className="relative fade-in-up fade-in-up-delay-1" ref={menuRef}>
            <button
              type="button"
              onClick={() => { if (disableMenu) return; onToggleNamespaceMenu() }}
              className={`gradient-border flex w-full items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2 text-left transition-all duration-300 ${
                disableMenu
                  ? "cursor-default opacity-80"
                  : "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_6px_20px_rgba(91,106,245,0.08)]"
              }`}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Active Namespace</p>
                <p className="font-mono text-sm text-foreground">{activeNamespace}</p>
              </div>
              <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-300 ${namespaceMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {namespaceMenuOpen && !disableMenu ? (
              <div className="absolute left-0 top-[calc(100%+0.6rem)] z-20 w-full rounded-2xl border border-border bg-background/95 p-3 shadow-[0_18px_60px_rgba(3,7,18,0.5)] backdrop-blur-3xl scale-in">
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Namespaces</p>
                <div className="max-h-44 space-y-2 overflow-auto pr-1 scrollbar-thin">
                  {namespaces.map((item, i) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSelectNamespace(item)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 hover-shine ${
                        activeNamespace === item
                          ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_12px_var(--glow-primary)]"
                          : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="font-mono">{item}</span>
                      {activeNamespace === item ? (
                        <span className="rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary badge-bounce">
                          active
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onOpenAddNamespace}
                  className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_28px_var(--glow-primary)] active:scale-[0.97]"
                >
                  Add namespace
                </button>
              </div>
            ) : null}
          </div>

          {/* Search bar */}
          <div className="relative flex items-center rounded-xl border border-border bg-background/50 px-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 search-glow gradient-border fade-in-up fade-in-up-delay-2">
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

          {/* Vault status */}
          <div
            className={`flex items-center justify-end rounded-xl border px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 fade-in-up fade-in-up-delay-3 ${
              isVaultView ? "border-destructive/40 bg-destructive/10" : "border-border bg-background/50"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <span>
                {vaultUnlocked ? (
                  <Unlock className={`size-4 transition-all duration-300 ${isVaultView ? "text-destructive" : "text-primary"}`} />
                ) : (
                  <Lock className={`size-4 transition-all duration-300 icon-breathe ${isVaultView ? "text-destructive" : "text-primary"}`} />
                )}
              </span>
              <span className="font-medium text-foreground">Vault Status:</span>
              <span className={`font-semibold transition-colors duration-300 ${vaultUnlocked ? (isVaultView ? "text-destructive" : "text-primary") : "text-primary"}`}>
                {vaultUnlocked ? "Decrypted" : "Locked"}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
