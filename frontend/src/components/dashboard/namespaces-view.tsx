"use client"

import React from "react"
import { Globe2, CheckCircle2, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

type NamespacesViewProps = {
  namespaces: string[]
  activeNamespace: string
  activeConfigId?: string
  onSelectNamespace: (namespace: string) => void
  onOpenAddDialog: () => void
  onUpdateNamespace?: (id: string, namespace: string, apiKey: string) => Promise<void>
  onDeleteNamespace?: (id: string, password: string) => Promise<void>
  configs?: Array<{ id: string; namespace: string }>
}

export default function NamespacesView({
  namespaces,
  activeNamespace,
  activeConfigId,
  onSelectNamespace,
  onOpenAddDialog,
  onUpdateNamespace,
  onDeleteNamespace,
  configs = [],
}: NamespacesViewProps) {
  const [editNamespace, setEditNamespace] = React.useState(activeNamespace)
  const [editApiKey, setEditApiKey] = React.useState("")
  const [isUpdating, setIsUpdating] = React.useState(false)

  // Delete namespace state
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [deletePassword, setDeletePassword] = React.useState("")
  const [showDeletePassword, setShowDeletePassword] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState("")
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    setEditNamespace(activeNamespace)
    setEditApiKey("")
    // Reset delete state when switching namespaces
    setShowDeleteConfirm(false)
    setDeletePassword("")
    setDeleteError("")
  }, [activeNamespace])

  const handleDeleteNamespace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deletePassword.trim()) {
      setDeleteError("Account password is required")
      return
    }
    if (!activeConfigId || !onDeleteNamespace) return

    setIsDeleting(true)
    setDeleteError("")
    try {
      await onDeleteNamespace(activeConfigId, deletePassword)
      setShowDeleteConfirm(false)
      setDeletePassword("")
    } catch (err: any) {
      setDeleteError(err?.response?.data?.error || "Incorrect password. Deletion cancelled.")
    } finally {
      setIsDeleting(false)
    }
  }

  const getConfigIdForNamespace = (ns: string) =>
    configs.find((c) => c.namespace === ns)?.id

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-[280px_1fr]">
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
              <span className="font-mono truncate mr-2">{item}</span>
              {activeNamespace === item ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-primary/40 px-2 py-0.5 text-[10px] text-primary badge-bounce">
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
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-mono text-sm text-foreground">namespace manager</h2>
            <p className="text-xs text-muted-foreground">Switch or add environments without leaving this screen.</p>
          </div>
          <span className="count-badge rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground truncate max-w-[180px]">
            active: {activeNamespace}
          </span>
        </div>

        {activeConfigId ? (
          <div className="mt-6 scale-in space-y-6">
            {/* Edit form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (activeConfigId && onUpdateNamespace) {
                  setIsUpdating(true)
                  try {
                    await onUpdateNamespace(activeConfigId, editNamespace, editApiKey)
                    setEditApiKey("")
                  } finally {
                    setIsUpdating(false)
                  }
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Namespace Name</label>
                <input
                  type="text"
                  value={editNamespace}
                  onChange={(e) => setEditNamespace(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">API Key</label>
                <input
                  type="password"
                  placeholder="********"
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">Leave blank to keep current API key unchanged.</p>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isUpdating || !editNamespace.trim()}
                  className="rounded-full bg-primary px-6 text-primary-foreground shadow-[0_0_18px_var(--glow-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97]"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>

            {/* Danger Zone — Delete Namespace */}
            {onDeleteNamespace && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  Permanently delete the namespace <span className="font-mono font-medium text-foreground">{activeNamespace}</span>. This will delete
                  <span className="font-medium text-destructive"> all tags, emails, and private vault data</span> associated with it. This action
                  cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-all duration-200 hover:bg-destructive/20 hover:shadow-[0_0_12px_var(--glow-destructive)] active:scale-[0.97]"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Namespace
                  </button>
                ) : (
                  <form onSubmit={handleDeleteNamespace} className="space-y-3">
                    <p className="text-xs font-medium text-foreground">
                      Enter your account password to confirm deletion:
                    </p>
                    <div className="relative">
                      <input
                        type={showDeletePassword ? "text" : "password"}
                        placeholder="Account password"
                        value={deletePassword}
                        onChange={(e) => { setDeletePassword(e.target.value); setDeleteError("") }}
                        className="w-full rounded-xl border border-destructive/40 bg-background/50 px-3 py-2 pr-9 text-sm text-foreground outline-none transition-all focus:border-destructive/60 focus:ring-1 focus:ring-destructive/40"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showDeletePassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                    {deleteError && (
                      <p className="text-xs text-destructive">{deleteError}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError("") }}
                        className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isDeleting || !deletePassword.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/60 bg-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive transition-all duration-200 hover:bg-destructive/30 disabled:opacity-50"
                      >
                        <Trash2 className="size-3.5" />
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center scale-in">
            <Globe2 className="mb-3 size-7 text-primary icon-breathe" />
            <p className="mb-1 text-sm font-semibold text-foreground">Namespace manager</p>
            <p className="text-xs text-muted-foreground">Select a namespace on the left or add a new one.</p>
          </div>
        )}
      </article>
    </div>
  )
}
