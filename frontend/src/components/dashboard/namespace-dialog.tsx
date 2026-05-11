"use client"

import React from "react"
import { Globe2, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type NamespaceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  newNamespace: string
  newApiKey: string
  namespaceError: string
  isSaving: boolean
  onNamespaceChange: (value: string) => void
  onApiKeyChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function NamespaceDialog({
  open,
  onOpenChange,
  newNamespace,
  newApiKey,
  namespaceError,
  isSaving,
  onNamespaceChange,
  onApiKeyChange,
  onSubmit,
}: NamespaceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-popover backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Globe2 className="size-5 text-primary icon-breathe" />
            <DialogTitle className="font-mono text-foreground">Add namespace</DialogTitle>
          </div>
          <DialogDescription>Connect a Testmail namespace and API key.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <Input
              value={newNamespace}
              onChange={(event) => onNamespaceChange(event.target.value)}
              placeholder="e.g. acme-prod.testmail.app"
              className="border-border bg-background/50 pr-10 transition-all duration-300 focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(124,135,247,0.12)]"
              autoFocus
            />
            <Globe2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
          </div>
          <div className="relative">
            <Input
              value={newApiKey}
              onChange={(event) => onApiKeyChange(event.target.value)}
              placeholder="Testmail API key"
              className="border-border bg-background/50 pr-10 transition-all duration-300 focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(124,135,247,0.12)]"
              type="password"
            />
            <Key className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
          </div>
          {namespaceError ? (
            <p className="text-xs text-destructive fade-in-up">{namespaceError}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border bg-transparent rounded-full text-foreground hover:bg-background/50 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-primary text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_0_28px_var(--glow-primary)] active:scale-[0.97]"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner" />
                  Adding...
                </span>
              ) : (
                "Add namespace"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
