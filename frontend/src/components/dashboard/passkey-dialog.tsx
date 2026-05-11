"use client"

import React from "react"
import { Shield, Fingerprint } from "lucide-react"
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
      <DialogContent className="border-border bg-popover backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className={`size-5 ${isVaultView ? "text-destructive" : "text-primary"} icon-breathe`} />
            <DialogTitle className="font-mono text-foreground">Passkey Challenge</DialogTitle>
          </div>
          <DialogDescription>Enter passkey to decrypt sensitive messages in <span className="font-mono text-foreground/80">{activeNamespace}</span>.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <Input
              type="password"
              value={passkey}
              onChange={(event) => onPasskeyChange(event.target.value)}
              placeholder="Enter passkey"
              className="border-border bg-background/50 pr-10 transition-all duration-300 focus:border-primary/60 focus:shadow-[0_0_0_3px_rgba(124,135,247,0.12)]"
              autoFocus
            />
            <Fingerprint className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
          </div>
          {passkeyError ? (
            <p className="text-xs text-destructive fade-in-up">{passkeyError}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">Demo passkey: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground/80">4242</code></p>

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
              className={`rounded-full transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] ${
                isVaultView
                  ? "bg-destructive text-white hover:brightness-110 shadow-[0_0_18px_var(--glow-destructive)]"
                  : "bg-primary text-primary-foreground hover:brightness-110 shadow-[0_0_18px_var(--glow-primary)]"
              }`}
            >
              Unlock Vault
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
