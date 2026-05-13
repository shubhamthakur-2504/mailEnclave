'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  addConfigRequest,
  updateConfigRequest,
  getConfigEmailsRequest,
  listConfigsRequest,
  getPrivateTagsRequest,
  addPrivateTagRequest,
  removePrivateTagRequest,
  deleteConfigRequest,
  deleteEmailRequest,
  deleteTagEmailsRequest,
} from '@/lib/api/config-api'
import { useAuthStore } from '@/stores/auth-store'
import { setupVaultRequest, verifyVaultRequest } from '@/lib/api/auth-api'
import { subscribeConfigEvents } from '@/lib/api/config-api'
import Dock from '@/components/dashboard/dock'
import MailList from '@/components/dashboard/mail-list'
import MailDetail from '@/components/dashboard/mail-detail'
import NamespacesView from '@/components/dashboard/namespaces-view'
import NamespaceDialog from '@/components/dashboard/namespace-dialog'
import PasskeyDialog from '@/components/dashboard/passkey-dialog'
import SettingsView from '@/components/dashboard/settings-view'
import TagsPanel from '@/components/dashboard/tags-panel'
import TopBar from '@/components/dashboard/top-bar'
import type { DockView, EmailItem, TagItem } from '@/components/dashboard/types'
import type { UserConfig } from '@/lib/api/config-api'

// How long the "new" badge is shown (ms) — matches CSS animation (7s fade + 0.6s)
const NEW_BADGE_TTL = 8000

export default function DashboardPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const [configs, setConfigs] = useState<UserConfig[]>([])
  const [activeNamespace, setActiveNamespace] = useState('acme-prod.testmail.app')
  const [activeTag, setActiveTag] = useState<string>('all')
  const [activeView, setActiveView] = useState<DockView>('inbox')
  const [search, setSearch] = useState('')
  const [vaultUnlocked, setVaultUnlocked] = useState(false)
  const [passkeyDialogOpen, setPasskeyDialogOpen] = useState(false)
  const [passkey, setPasskey] = useState('')
  const [passkeyError, setPasskeyError] = useState('')
  const [namespaceMenuOpen, setNamespaceMenuOpen] = useState(false)
  const [newNamespace, setNewNamespace] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [namespaceError, setNamespaceError] = useState('')
  const [namespaceDialogOpen, setNamespaceDialogOpen] = useState(false)
  const [isSavingNamespace, setIsSavingNamespace] = useState(false)
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [isEmailsLoading, setIsEmailsLoading] = useState(false)
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setHasVaultPin = useAuthStore((state) => state.setHasVaultPin)
  const [openEmailId, setOpenEmailId] = useState<string | null>(null)
  const [openEmail, setOpenEmail] = useState<any | null>(null)
  const [privateTags, setPrivateTags] = useState<string[]>([])
  const [isSubmittingPasskey, setIsSubmittingPasskey] = useState(false)
  const isVaultView = activeView === 'vault'
  const hasVaultPin = user?.hasVaultPin ?? false
  const namespaces = useMemo(() => configs.map((config) => config.namespace), [configs])
  const activeConfig = useMemo(
    () => configs.find((config) => config.namespace === activeNamespace),
    [configs, activeNamespace]
  )

  // ── Keyboard shortcut: Ctrl/Cmd+K → focus search ─────────────────────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (!isOpenSearch) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // ── Load configs ─────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const loadNamespaces = async () => {
      try {
        const configs = await listConfigsRequest()
        if (!isMounted) return
        setConfigs(configs)
        setActiveNamespace((current) => {
          if (!configs.length) return current
          const namespaces = configs.map((config) => config.namespace)
          return namespaces.includes(current) ? current : namespaces[0]
        })
      } catch {
        // keep local state if fetch fails
      }
    }
    loadNamespaces()
    return () => { isMounted = false }
  }, [])

  // ── Load private tags when active config changes ──────────────────────────
  useEffect(() => {
    if (!activeConfig) { setPrivateTags([]); return }
    let isMounted = true
    const loadPrivateTags = async () => {
      try {
        const tags = await getPrivateTagsRequest(activeConfig.id)
        if (isMounted) setPrivateTags(tags.map((t) => t.tag))
      } catch {
        if (isMounted) setPrivateTags([])
      }
    }
    loadPrivateTags()
    return () => { isMounted = false }
  }, [activeConfig])

  // ── Load emails + SSE stream ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeConfig) { setEmails([]); return }
    let isMounted = true
    let eventSource: EventSource | null = null

    const loadEmails = async () => {
      try {
        setIsEmailsLoading(true)
        const inbox = await getConfigEmailsRequest(activeConfig.id, { limit: 100 })
        if (!isMounted) return

        const mappedEmails: EmailItem[] = inbox.emails.map((email, index) => ({
          id: email.id ?? `${activeConfig.namespace}-${email.tag ?? 'mail'}-${email.timestamp ?? index}`,
          tag: email.tag ?? 'untagged',
          subject: email.subject ?? '(no subject)',
          namespace: activeConfig.namespace,
          receivedAt: email.timestamp ? new Date(email.timestamp).toLocaleString() : 'just now',
          from: email.from ?? null,
          text: email.text ?? null,
          isPrivate: !!email.isPrivate,
          sensitive: false,
          isRead: !!(email as any).isRead,
          isNew: false,
        }))

        setEmails(mappedEmails)
      } catch {
        if (isMounted) setEmails([])
      } finally {
        if (isMounted) setIsEmailsLoading(false)
      }
    }

    const connectStream = () => {
      if (!accessToken) return
      const es = subscribeConfigEvents(activeConfig.id, accessToken, (payload) => {
        setEmails((prev) => {
          if (prev.find((e) => e.id === payload.id || (e.id && e.id === payload.testmailId))) return prev

          const newItem: EmailItem = {
            id: payload.id ?? `${activeConfig.namespace}-${payload.tag ?? 'mail'}-${payload.receivedAt}`,
            tag: payload.tag ?? 'untagged',
            subject: payload.subject ?? '(no subject)',
            namespace: activeConfig.namespace,
            receivedAt: new Date(payload.receivedAt).toLocaleString(),
            isPrivate: !!payload.isPrivate,
            sensitive: false,
            isRead: false,
            isNew: true,
          }

          // Clear the "new" flag after TTL
          setTimeout(() => {
            setEmails((prev) => prev.map((e) => e.id === newItem.id ? { ...e, isNew: false } : e))
          }, NEW_BADGE_TTL)

          return [newItem, ...prev]
        })
      })
      eventSource = es
    }

    void loadEmails()
    connectStream()

    return () => {
      isMounted = false
      eventSource?.close()
    }
  }, [activeConfig, accessToken])

  useEffect(() => {
    if (activeView === 'namespaces') setNamespaceMenuOpen(false)
  }, [activeView])

  const publicEmails = useMemo(() => emails.filter((item) => item.namespace === activeNamespace && !item.isPrivate), [emails, activeNamespace])
  const privateEmails = useMemo(() => emails.filter((item) => item.namespace === activeNamespace && item.isPrivate), [emails, activeNamespace])
  const visibleEmails = isVaultView ? privateEmails : publicEmails

  const tags = useMemo<TagItem[]>(() => {
    const counts = visibleEmails.reduce<Record<string, number>>((acc, item) => {
      acc[item.tag] = (acc[item.tag] || 0) + 1
      return acc
    }, {})
    return [
      { name: 'all', count: visibleEmails.length },
      ...Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count })),
    ]
  }, [visibleEmails])

  useEffect(() => {
    if (!tags.find((tag) => tag.name === activeTag)) setActiveTag('all')
  }, [tags, activeTag])

  const filteredEmails = useMemo(() => {
    const inTag = activeTag === 'all' ? visibleEmails : visibleEmails.filter((item) => item.tag === activeTag)
    const query = search.trim().toLowerCase()
    return query
      ? inTag.filter((item) => {
          const from = item.from ?? ''
          return item.tag.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query) || from.toLowerCase().includes(query)
        })
      : inTag
  }, [activeTag, search, visibleEmails])

  // ── Vault ─────────────────────────────────────────────────────────────────
  const handleVaultClick = () => {
    setActiveView('vault')
    if (vaultUnlocked) { setVaultUnlocked(false); return }
    promptPasskey()
  }

  const promptPasskey = () => {
    setPasskey('')
    setPasskeyError('')
    setPasskeyDialogOpen(true)
  }

  const handlePasskeySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (passkey.length < 4) { setPasskeyError('Passkey must be at least 4 characters.'); return }
    try {
      setIsSubmittingPasskey(true)
      setPasskeyError('')
      if (hasVaultPin) {
        await verifyVaultRequest(passkey)
      } else {
        await setupVaultRequest(passkey)
        setHasVaultPin(true)
      }
      setVaultUnlocked(true)
      setPasskeyDialogOpen(false)
      setPasskey('')
    } catch (error: any) {
      setPasskeyError(error?.response?.data?.error || 'Invalid passkey. Try again.')
      setPasskey('')
    } finally {
      setIsSubmittingPasskey(false)
    }
  }

  // ── Add namespace ─────────────────────────────────────────────────────────
  const handleAddNamespace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = newNamespace.trim()
    const apiKey = newApiKey.trim()
    if (!next) { setNamespaceError('Enter a namespace'); return }
    if (!apiKey) { setNamespaceError('Enter an API key'); return }
    if (namespaces.some((item) => item.toLowerCase() === next.toLowerCase())) {
      setNamespaceError('Namespace already exists')
      return
    }
    try {
      setIsSavingNamespace(true)
      const createdConfig = await addConfigRequest({ namespace: next, apiKey })
      setConfigs((prev) => [...prev, createdConfig])
      setActiveNamespace(next)
      setNewNamespace('')
      setNewApiKey('')
      setNamespaceError('')
      setNamespaceMenuOpen(false)
      setNamespaceDialogOpen(false)
    } catch {
      setNamespaceError('Unable to add namespace')
    } finally {
      setIsSavingNamespace(false)
    }
  }

  // ── Delete namespace (requires account password) ──────────────────────────
  const handleDeleteNamespace = useCallback(async (id: string, password: string) => {
    await deleteConfigRequest(id, password)
    // Remove from local state
    setConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id)
      // Switch to first remaining namespace
      if (next.length > 0) setActiveNamespace(next[0].namespace)
      return next
    })
    setEmails((prev) => prev.filter((e) => e.namespace !== activeNamespace))
    toast.success('Namespace deleted successfully')
  }, [activeNamespace])

  // ── Delete email ─────────────────────────────────────────────────────────
  const handleDeleteEmail = useCallback(async (email: EmailItem) => {
    // Private emails require vault to be unlocked
    if (email.isPrivate && !vaultUnlocked) {
      promptPasskey()
      return
    }
    try {
      await deleteEmailRequest(email.id)
      setEmails((prev) => prev.filter((e) => e.id !== email.id))
      toast.success('Email deleted')
    } catch {
      toast.error('Failed to delete email')
    }
  }, [vaultUnlocked])

  // ── Delete tag (all emails under it) ─────────────────────────────────────
  const handleDeleteTag = useCallback(async (tagName: string, isPrivate: boolean) => {
    if (!activeConfig) return
    // Private tags require vault to be unlocked (checked in TagsPanel already, but double-check)
    if (isPrivate && !vaultUnlocked) {
      promptPasskey()
      return
    }
    try {
      await deleteTagEmailsRequest(activeConfig.id, tagName)
      setEmails((prev) => prev.filter((e) => !(e.tag === tagName && e.namespace === activeNamespace)))
      // Also remove from private tags list if it was private
      if (isPrivate) setPrivateTags((prev) => prev.filter((t) => t !== tagName))
      if (activeTag === tagName) setActiveTag('all')
      toast.success(`Tag "${tagName}" and all its emails deleted`)
    } catch {
      toast.error(`Failed to delete tag "${tagName}"`)
    }
  }, [activeConfig, activeNamespace, activeTag, vaultUnlocked])

  // ── Private tag handlers ──────────────────────────────────────────────────
  const handleMakePrivate = useCallback(async (tag: string) => {
    if (!activeConfig) return
    try {
      await addPrivateTagRequest(activeConfig.id, tag)
      setPrivateTags((prev) => prev.includes(tag) ? prev : [...prev, tag])
      setEmails((prev) => prev.map((email) =>
        email.tag === tag && email.namespace === activeNamespace ? { ...email, isPrivate: true } : email
      ))
    } catch { /* ignore */ }
  }, [activeConfig, activeNamespace])

  const handleMakePublic = useCallback(async (tag: string) => {
    if (!activeConfig) return
    try {
      await removePrivateTagRequest(activeConfig.id, tag)
      setPrivateTags((prev) => prev.filter((t) => t !== tag))
      setEmails((prev) => prev.map((email) =>
        email.tag === tag && email.namespace === activeNamespace ? { ...email, isPrivate: false } : email
      ))
    } catch { /* ignore */ }
  }, [activeConfig, activeNamespace])

  return (
    <main className={`noise-overlay relative min-h-screen overflow-hidden px-4 pt-6 md:px-8 transition-all duration-500 ${openEmail ? 'pb-6' : 'pb-32'}`}>
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div
          className={`absolute -left-1/4 -top-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-500/20' : 'bg-blue-500/20'}`}
        />
        <div
          className={`absolute right-[-6rem] top-10 h-[28rem] w-[28rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-400/20' : 'bg-indigo-500/20'}`}
        />
        <div
          className={`absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-300/15' : 'bg-blue-400/15'}`}
        />
        {/* Floating particles */}
        <div className="particle" style={{ left: '10%', top: '15%' }} />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
        <div className="particle" />
      </div>

      <section className="w-full p-4 md:p-6 fade-in-up">
        <TopBar
          activeNamespace={activeNamespace}
          namespaces={namespaces}
          namespaceMenuOpen={namespaceMenuOpen}
          onToggleNamespaceMenu={() => setNamespaceMenuOpen((open) => !open)}
          onSelectNamespace={(namespace) => {
            setActiveNamespace(namespace)
            setActiveTag('all')
            setNamespaceMenuOpen(false)
          }}
          onOpenAddNamespace={() => {
            setNamespaceDialogOpen(true)
            setNamespaceMenuOpen(false)
          }}
          search={search}
          onSearchChange={setSearch}
          onSearchFocus={() => {
            if (isVaultView && !vaultUnlocked) promptPasskey()
          }}
          isVaultView={isVaultView}
          vaultUnlocked={vaultUnlocked}
          disableMenu={activeView === 'namespaces'}
          hidden={!!openEmail}
        />

        {activeView === 'settings' ? (
          <div key="settings-view" className="view-transition">
            <SettingsView
              userEmail={user?.email ?? ''}
              hasVaultPin={hasVaultPin}
              onVaultPinReset={() => {
                setVaultUnlocked(false)
                setHasVaultPin(true)
              }}
            />
          </div>
        ) : activeView === 'namespaces' ? (
          <div key="namespaces-view" className="view-transition">
            <NamespacesView
              namespaces={namespaces}
              activeNamespace={activeNamespace}
              activeConfigId={activeConfig?.id}
              configs={configs}
              onSelectNamespace={(namespace) => {
                setActiveNamespace(namespace)
                setActiveTag('all')
              }}
              onOpenAddDialog={() => setNamespaceDialogOpen(true)}
              onUpdateNamespace={async (id, newNamespace, newApiKey) => {
                try {
                  const payload: any = {}
                  if (newNamespace && newNamespace !== activeNamespace) payload.namespace = newNamespace
                  if (newApiKey) payload.apiKey = newApiKey
                  if (Object.keys(payload).length > 0) {
                    await updateConfigRequest(id, payload)
                    toast.success('Namespace updated successfully')
                    setConfigs(configs.map((c) => c.id === id ? { ...c, namespace: newNamespace || c.namespace } : c))
                    if (payload.namespace) setActiveNamespace(payload.namespace)
                  }
                } catch (error: any) {
                  toast.error(error?.response?.data?.error || 'Failed to update namespace')
                }
              }}
              onDeleteNamespace={handleDeleteNamespace}
            />
          </div>
        ) : (
          /* ── Inbox grid: wide tags column → shrinks when mail opens ── */
          <div
            key={`inbox-${activeView}`}
            className="view-transition grid gap-4"
            style={{
              gridTemplateColumns: openEmail ? '200px 1fr' : '300px 1fr',
              transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isVaultView && !vaultUnlocked ? (
              <aside className="card-lift rounded-2xl border border-border bg-card p-4 backdrop-blur-md transition-all duration-300 hover:border-primary/30 slide-in-left">
                <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center scale-in">
                  <p className="mb-1 text-sm font-semibold text-foreground">Vault is locked</p>
                  <p className="text-xs text-muted-foreground">Unlock the vault to reveal private tags and mail.</p>
                </div>
              </aside>
            ) : (
              <TagsPanel
                tags={tags}
                activeTag={activeTag}
                isVaultView={isVaultView}
                vaultUnlocked={vaultUnlocked}
                onSelectTag={setActiveTag}
                onRequirePasskey={promptPasskey}
                privateTags={privateTags}
                onMakePrivate={handleMakePrivate}
                onMakePublic={handleMakePublic}
                onDeleteTag={handleDeleteTag}
                collapsed={!!openEmail}
              />
            )}
            {openEmail ? (
              <div className="order-2">
                <MailDetail email={openEmail} onClose={() => { setOpenEmailId(null); setOpenEmail(null) }} />
              </div>
            ) : (
              <MailList
                emails={filteredEmails}
                activeView={activeView}
                activeNamespace={activeNamespace}
                activeTag={activeTag}
                isVaultView={isVaultView}
                vaultUnlocked={vaultUnlocked}
                isLoading={isEmailsLoading}
                onRequirePasskey={promptPasskey}
                onOpen={(email) => {
                  setOpenEmailId(email.id)
                  void (async () => {
                    try {
                      const full = await (await import('@/lib/api/emails-api')).getEmailRequest(email.id)
                      setOpenEmail(full)
                      // Mark read locally immediately
                      setEmails((prev) => prev.map((e) => e.id === email.id ? { ...e, isRead: true } : e))
                      await (await import('@/lib/api/emails-api')).markEmailReadRequest(email.id)
                    } catch {
                      // ignore
                    }
                  })()
                }}
                onDelete={handleDeleteEmail}
                privateTags={privateTags}
                onMakePrivate={handleMakePrivate}
                onMakePublic={handleMakePublic}
              />
            )}
          </div>
        )}
      </section>

      <Dock
        activeView={activeView}
        vaultUnlocked={vaultUnlocked}
        onSelectView={(view) => {
          setActiveView(view)
          if (view === 'namespaces') setNamespaceMenuOpen(false)
        }}
        onVaultClick={handleVaultClick}
        hidden={!!openEmail}
      />

      <PasskeyDialog
        open={passkeyDialogOpen}
        onOpenChange={setPasskeyDialogOpen}
        activeNamespace={activeNamespace}
        passkey={passkey}
        passkeyError={passkeyError}
        isVaultView={isVaultView}
        hasVaultPin={hasVaultPin}
        isLoading={isSubmittingPasskey}
        onPasskeyChange={setPasskey}
        onSubmit={handlePasskeySubmit}
      />

      <NamespaceDialog
        open={namespaceDialogOpen}
        onOpenChange={setNamespaceDialogOpen}
        newNamespace={newNamespace}
        newApiKey={newApiKey}
        namespaceError={namespaceError}
        isSaving={isSavingNamespace}
        onNamespaceChange={(value) => { setNewNamespace(value); setNamespaceError('') }}
        onApiKeyChange={(value) => { setNewApiKey(value); setNamespaceError('') }}
        onSubmit={handleAddNamespace}
      />
    </main>
  )
}
