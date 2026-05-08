"use client"

import React from "react"
import { Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type NamespacesViewProps = {
  namespaces: string[]
  activeNamespace: string
  onSelectNamespace: (namespace: string) => void
  onOpenAddDialog: () => void
}

export default function NamespacesView({
  namespaces,
  activeNamespace,
  onSelectNamespace,
  onOpenAddDialog,
}: NamespacesViewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/30">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Namespaces</p>
          <span className="text-[11px] text-muted-foreground">{namespaces.length} total</span>
        </div>
        <div className="space-y-2">
          {namespaces.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectNamespace(item)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 ${
                activeNamespace === item
                  ? "border-indigo-300/60 bg-indigo-400/12 text-indigo-200 shadow-[0_0_12px_rgba(99,102,241,0.25)]"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/30 hover:text-foreground"
              }`}
            >
              <span className="font-mono">{item}</span>
              {activeNamespace === item ? (
                <span className="rounded-full border border-indigo-300/40 px-2 py-0.5 text-[10px] text-indigo-200">
                  active
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <Button
          type="button"
          onClick={onOpenAddDialog}
          className="mt-4 w-full rounded-full bg-indigo-500/90 text-white shadow-[0_0_18px_rgba(99,102,241,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.6)]"
        >
          Add namespace
        </Button>
      </aside>

      <article className="rounded-2xl border border-white/15 bg-black/20 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-mono text-sm text-foreground">namespace manager</h2>
            <p className="text-xs text-muted-foreground">Switch or add environments without leaving this screen.</p>
          </div>
          <span className="text-xs text-muted-foreground">active: {activeNamespace}</span>
        </div>
        <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-indigo-300/30 bg-indigo-500/5 p-6 text-center">
          <Globe2 className="mb-3 size-7 text-indigo-300" />
          <p className="mb-1 text-sm font-semibold text-foreground">Namespace manager</p>
          <p className="text-xs text-muted-foreground">Select a namespace on the left or add a new one.</p>
        </div>
      </article>
    </div>
  )
}
