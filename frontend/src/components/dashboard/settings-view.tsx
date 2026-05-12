"use client"

import React, { useState } from "react"
import { KeyRound, Lock, Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { changePasswordRequest, resetVaultPinRequest } from "@/lib/api/auth-api"
import { toast } from "sonner"

type SettingsViewProps = {
  userEmail: string
  hasVaultPin: boolean
  onVaultPinReset?: () => void
}

function SettingsCard({ title, description, icon, children }: {
  title: string
  description: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="card-lift rounded-2xl border border-border bg-card p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 fade-in-up">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background/50 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function PasswordInput({ id, label, value, onChange, placeholder }: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 pr-10 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsView({ userEmail, hasVaultPin, onVaultPinReset }: SettingsViewProps) {
  // Change password form
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Reset vault PIN form
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isResettingPin, setIsResettingPin] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pinResetPassword, setPinResetPassword] = useState("")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    try {
      setIsChangingPassword(true)
      await changePasswordRequest(oldPassword, newPassword)
      toast.success("Password changed successfully")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPin !== confirmPin) {
      toast.error("PINs do not match")
      return
    }
    if (newPin.length < 4) {
      toast.error("PIN must be at least 4 characters")
      return
    }
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmResetPin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinResetPassword) {
      toast.error("Please enter your account password")
      return
    }

    try {
      setIsResettingPin(true)
      await resetVaultPinRequest(pinResetPassword, newPin, confirmPin)
      toast.success("Vault PIN reset successfully")
      setPinResetPassword("")
      setNewPin("")
      setConfirmPin("")
      setIsConfirmDialogOpen(false)
      onVaultPinReset?.()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to reset vault PIN")
    } finally {
      setIsResettingPin(false)
    }
  }

  return (
    <div className="space-y-6 slide-in-right">
      {/* Header */}
      <div className="fade-in-up">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Security Settings</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage credentials for <span className="font-medium text-foreground">{userEmail}</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Change Password */}
        <SettingsCard
          title="Change Password"
          description="Update your account login password. Requires your current password."
          icon={<Lock className="size-4" />}
        >
          <form onSubmit={handleChangePassword} className="space-y-3">
            <PasswordInput
              id="old-password"
              label="Current Password"
              value={oldPassword}
              onChange={setOldPassword}
            />
            <PasswordInput
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min. 8 characters"
            />
            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
            {newPassword && confirmPassword && (
              <div className={`flex items-center gap-1.5 text-xs transition-all ${newPassword === confirmPassword ? "text-green-500" : "text-destructive"}`}>
                <CheckCircle2 className="size-3" />
                {newPassword === confirmPassword ? "Passwords match" : "Passwords do not match"}
              </div>
            )}
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_0_14px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97]"
              >
                {isChangingPassword ? "Saving…" : "Update Password"}
              </Button>
            </div>
          </form>
        </SettingsCard>

        {/* Reset Vault PIN */}
        <SettingsCard
          title="Reset Vault PIN"
          description={hasVaultPin ? "Change the PIN that protects your private vault and tags." : "Set a new PIN to protect your private vault and tags."}
          icon={<KeyRound className="size-4" />}
        >
          <form onSubmit={handleResetPin} className="space-y-4">
            <div>
              <label htmlFor="new-pin" className="mb-1.5 block text-xs font-medium text-foreground">
                {hasVaultPin ? "New Vault PIN" : "Set Vault PIN"}
              </label>
              <input
                id="new-pin"
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Min. 4 characters"
                className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="confirm-pin" className="mb-1.5 block text-xs font-medium text-foreground">Confirm PIN</label>
              <input
                id="confirm-pin"
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter PIN"
                className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                autoComplete="off"
              />
            </div>
            {newPin && confirmPin && (
              <div className={`flex items-center gap-1.5 text-xs transition-all ${newPin === confirmPin ? "text-green-500" : "text-destructive"}`}>
                <CheckCircle2 className="size-3" />
                {newPin === confirmPin ? "PINs match" : "PINs do not match"}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              {hasVaultPin
                ? "Resetting your PIN will lock the vault. You'll need to unlock it with the new PIN."
                : "Once set, private tags will only be visible after entering this PIN."}
            </p>
            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isResettingPin || !newPin || !confirmPin}
                className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_0_14px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97]"
              >
                {isResettingPin ? "Saving…" : hasVaultPin ? "Reset Vault PIN" : "Set Vault PIN"}
              </Button>
            </div>
          </form>
        </SettingsCard>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="border-border bg-popover/95 backdrop-blur-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Lock className="size-5 text-primary" />
              <DialogTitle className="font-mono text-foreground">Confirm Identity</DialogTitle>
            </div>
            <DialogDescription>
              Please enter your account password to authorize resetting your vault PIN.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmResetPin} className="space-y-4">
            <PasswordInput
              id="confirm-reset-password"
              label="Account Password"
              value={pinResetPassword}
              onChange={setPinResetPassword}
              placeholder="Your login password"
            />

            <DialogFooter className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                className="rounded-full border-border bg-transparent text-foreground hover:bg-background/50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isResettingPin || !pinResetPassword}
                className="rounded-full bg-primary px-6 text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] hover:brightness-110 active:scale-[0.97]"
              >
                {isResettingPin ? "Resetting..." : "Confirm & Reset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info panel */}
      <div className="fade-in-up rounded-2xl border border-border/50 bg-background/30 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Security tip: </span>
          Use a strong, unique password and a memorable but hard-to-guess vault PIN. Your vault PIN is never sent anywhere in plaintext — it is always hashed before storage.
        </p>
      </div>
    </div>
  )
}
