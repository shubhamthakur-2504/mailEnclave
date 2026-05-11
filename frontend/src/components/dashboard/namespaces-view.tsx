"use client"

import React from "react"
import { Globe2, CheckCircle2 } from "lucide-react"
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
      <aside className="card-lift rounded-2xl border border-border bg-card p-5 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-left">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe2 className="size-3 text-muted-foreground" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Namespaces</p>
          </div>
          <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2 py-0.5 text-[11px] text-muted-foreground">
            {namespaces.length} total
          </span>
        </div>
        <div className="space-y-2">
          {namespaces.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => onSelectNamespace(item)}
              className={`email-row-enter hover-shine flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
                activeNamespace === item
                  ? "border-primary/60 bg-primary/10 text-primary shadow-[0_0_12px_var(--glow-primary)] pulse-glow-primary"
                  : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <span className="font-mono">{item}</span>
              {activeNamespace === item ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary badge-bounce">
                  <CheckCircle2 className="size-2.5" />
                  active
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <Button
          type="button"
          onClick={onOpenAddDialog}
          className="mt-4 w-full rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_28px_var(--glow-primary)] active:scale-[0.97]"
        >
          Add namespace
        </Button>
      </aside>

      <article className="card-lift rounded-2xl border border-border bg-card p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-right">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-mono text-sm text-foreground">namespace manager</h2>
            <p className="text-xs text-muted-foreground">Switch or add environments without leaving this screen.</p>
          </div>
          <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground">
            active: {activeNamespace}
          </span>
        </div>
        <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center scale-in">
          <Globe2 className="mb-3 size-7 text-primary icon-breathe" />
          <p className="mb-1 text-sm font-semibold text-foreground">Namespace manager</p>
          <p className="text-xs text-muted-foreground">Select a namespace on the left or add a new one.</p>
        </div>
      </article>
    </div>
  )
}
