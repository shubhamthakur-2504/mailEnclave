"use client"

import React from "react"
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
          <DialogTitle className="font-mono text-foreground">Add namespace</DialogTitle>
          <DialogDescription>Connect a Testmail namespace and API key.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            value={newNamespace}
            onChange={(event) => onNamespaceChange(event.target.value)}
            placeholder="e.g. acme-prod.testmail.app"
            className="border-border bg-background/50"
            autoFocus
          />
          <Input
            value={newApiKey}
            onChange={(event) => onApiKeyChange(event.target.value)}
            placeholder="Testmail API key"
            className="border-border bg-background/50"
            type="password"
          />
          {namespaceError ? <p className="text-xs text-destructive">{namespaceError}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border bg-transparent rounded-full text-foreground hover:bg-background/50">
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-indigo-500/90 text-white shadow-[0_0_18px_rgba(99,102,241,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.6)]"
              disabled={isSaving}
            >
              {isSaving ? "Adding..." : "Add namespace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
