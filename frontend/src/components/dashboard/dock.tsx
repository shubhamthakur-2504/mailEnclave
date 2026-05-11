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
      className={`fixed bottom-6 left-1/2 z-40 w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl border border-border bg-card/80 px-2 py-2 shadow-[0_12px_40px_rgba(5,10,24,0.15)] backdrop-blur-2xl transition-all duration-500 ease-in-out dark:shadow-[0_12px_40px_rgba(5,10,24,0.4)] ${
        hidden ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
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
}

function DockButton({ active, label, icon, onClick }: DockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition-all duration-300 hover:-translate-y-0.5 ${
        active
          ? label.toLowerCase().includes("vault")
            ? "border-destructive/60 bg-destructive/10 text-destructive shadow-[0_0_16px_rgba(244,63,94,0.25)]"
            : "border-primary/60 bg-primary/10 text-primary shadow-[0_0_16px_rgba(99,102,241,0.25)]"
          : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
