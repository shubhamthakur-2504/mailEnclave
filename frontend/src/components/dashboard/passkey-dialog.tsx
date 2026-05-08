"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type PasskeyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeNamespace: string
  passkey: string
  passkeyError: string
  isVaultView: boolean
  onPasskeyChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function PasskeyDialog({
  open,
  onOpenChange,
  activeNamespace,
  passkey,
  passkeyError,
  isVaultView,
  onPasskeyChange,
  onSubmit,
}: PasskeyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/25 bg-slate-950/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">Passkey Challenge</DialogTitle>
          <DialogDescription>Enter passkey to decrypt sensitive messages in {activeNamespace}.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="password"
            value={passkey}
            onChange={(event) => onPasskeyChange(event.target.value)}
            placeholder="Enter passkey"
            className="border-white/20 bg-white/5"
            autoFocus
          />
          {passkeyError ? <p className="text-xs text-destructive">{passkeyError}</p> : null}
          <p className="text-xs text-muted-foreground">Demo passkey: 4242</p>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-white/20 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className={isVaultView ? "bg-rose-500 text-slate-950 hover:bg-rose-400" : "bg-indigo-500 text-white hover:bg-indigo-400"}
            >
              Unlock Vault
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
