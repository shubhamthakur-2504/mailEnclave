"use client"

import React from "react"
import { CheckCircle2, Globe2, Inbox, KeyRound, Settings } from "lucide-react"
import type { DockView } from "./types"

type DockProps = {
  activeView: DockView
  vaultUnlocked: boolean
  onSelectView: (view: DockView) => void
  onVaultClick: () => void
  hidden?: boolean
}

export default function Dock({ activeView, vaultUnlocked, onSelectView, onVaultClick, hidden = false }: DockProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-40 w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl border border-border bg-card/80 px-2 py-2 shadow-[0_12px_40px_rgba(5,10,24,0.15)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] dark:shadow-[0_12px_40px_rgba(5,10,24,0.4)] ${
        hidden
          ? "translate-y-[150%] scale-90 opacity-0 pointer-events-none"
          : "translate-y-0 scale-100 opacity-100"
      }`}
    >
      <div className="grid grid-cols-4 gap-2">
        <DockButton
          active={activeView === "inbox"}
          label="Inbox"
          icon={<Inbox className="size-4" />}
          onClick={() => onSelectView("inbox")}
        />
        <DockButton
          active={activeView === "vault"}
          label={vaultUnlocked ? "Vault Open" : "Vault"}
          icon={vaultUnlocked ? <CheckCircle2 className="size-4" /> : <KeyRound className="size-4" />}
          onClick={onVaultClick}
          isVault
        />
        <DockButton
          active={activeView === "namespaces"}
          label="Namespaces"
          icon={<Globe2 className="size-4" />}
          onClick={() => onSelectView("namespaces")}
        />
        <DockButton
          active={activeView === "settings"}
          label="Security"
          icon={<Settings className="size-4" />}
          onClick={() => onSelectView("settings")}
        />
      </div>
    </div>
  )
}

type DockButtonProps = {
  active: boolean
  label: string
  icon: React.ReactNode
  onClick: () => void
  isVault?: boolean
}

function DockButton({ active, label, icon, onClick, isVault = false }: DockButtonProps) {
  const isVaultLabel = isVault || label.toLowerCase().includes("vault")

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition-all duration-300 hover:-translate-y-1 hover:scale-[1.04] active:scale-[0.97] hover-shine ${
        active
          ? isVaultLabel
            ? "border-destructive/60 bg-destructive/10 text-destructive pulse-glow-destructive"
            : "border-primary/60 bg-primary/10 text-primary pulse-glow-primary"
          : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      <span className={`transition-transform duration-300 ${active ? "icon-breathe" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {active && (
        <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-current opacity-60 badge-bounce" />
      )}
    </button>
  )
}
