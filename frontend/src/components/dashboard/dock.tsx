"use client"

import React from "react"
import { CheckCircle2, Globe2, Inbox, KeyRound, Settings } from "lucide-react"
import type { DockView } from "./types"

type DockProps = {
  activeView: DockView
  vaultUnlocked: boolean
  onSelectView: (view: DockView) => void
  onVaultClick: () => void
}

export default function Dock({ activeView, vaultUnlocked, onSelectView, onVaultClick }: DockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[min(92vw,680px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-black/35 px-2 py-2 backdrop-blur-2xl shadow-[0_12px_40px_rgba(5,10,24,0.4)]">
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
            ? "border-rose-400/60 bg-rose-400/12 text-rose-200 shadow-[0_0_16px_rgba(244,63,94,0.25)]"
            : "border-indigo-400/60 bg-indigo-400/12 text-indigo-200 shadow-[0_0_16px_rgba(99,102,241,0.25)]"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/25 hover:text-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
