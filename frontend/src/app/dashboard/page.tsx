'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addConfigRequest, getConfigEmailsRequest, listConfigsRequest, getPrivateTagsRequest, addPrivateTagRequest, removePrivateTagRequest } from '@/lib/api/config-api'
import { useAuthStore } from '@/stores/auth-store'
import { setupVaultRequest, verifyVaultRequest } from '@/lib/api/auth-api'
import { subscribeConfigEvents } from '@/lib/api/config-api'
import Dock from '@/components/dashboard/dock'
import MailList from '@/components/dashboard/mail-list'
import MailDetail from '@/components/dashboard/mail-detail'
import NamespacesView from '@/components/dashboard/namespaces-view'
import NamespaceDialog from '@/components/dashboard/namespace-dialog'
import PasskeyDialog from '@/components/dashboard/passkey-dialog'
import TagsPanel from '@/components/dashboard/tags-panel'
import TopBar from '@/components/dashboard/top-bar'
import type { DockView, EmailItem, TagItem } from '@/components/dashboard/types'
import type { UserConfig } from '@/lib/api/config-api'

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isOpenSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (!isOpenSearch) {
        return
      }
      event.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    let isMounted = true
    const loadNamespaces = async () => {
      try {
        const configs = await listConfigsRequest()
        if (!isMounted) {
          return
        }
        setConfigs(configs)
        setActiveNamespace((current) => {
          if (!configs.length) {
            return current
          }
          const namespaces = configs.map((config) => config.namespace)
          return namespaces.includes(current) ? current : namespaces[0]
        })
      } catch (error) {
        // keep local state if fetch fails
      }
    }

    loadNamespaces()
    return () => {
      isMounted = false
    }
  }, [])

  // Load private tags when active config changes
  useEffect(() => {
    if (!activeConfig) {
      setPrivateTags([])
      return
    }

    let isMounted = true
    const loadPrivateTags = async () => {
      try {
        const tags = await getPrivateTagsRequest(activeConfig.id)
        if (isMounted) {
          setPrivateTags(tags.map((t) => t.tag))
        }
      } catch {
        if (isMounted) {
          setPrivateTags([])
        }
      }
    }

    loadPrivateTags()
    return () => {
      isMounted = false
    }
  }, [activeConfig])

  useEffect(() => {
    if (!activeConfig) {
      setEmails([])
      return
    }

    let isMounted = true
    let eventSource: EventSource | null = null

    const loadEmails = async () => {
      try {
        setIsEmailsLoading(true)
        const inbox = await getConfigEmailsRequest(activeConfig.id, { limit: 100 })
        if (!isMounted) {
          return
        }

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
        }))

        setEmails(mappedEmails)
      } catch (error) {
        if (isMounted) {
          setEmails([])
        }
      } finally {
        if (isMounted) {
          setIsEmailsLoading(false)
        }
      }
    }

    const connectStream = () => {
      if (!accessToken) return
      const es = subscribeConfigEvents(activeConfig.id, accessToken, (payload) => {
        setEmails((prev) => {
          // avoid duplicates by db id or testmail id
          if (prev.find((e) => e.id === payload.id || (e.id && e.id === payload.testmailId))) {
            return prev
          }

          const newItem: EmailItem = {
            id: payload.id ?? `${activeConfig.namespace}-${payload.tag ?? 'mail'}-${payload.receivedAt}`,
            tag: payload.tag ?? 'untagged',
            subject: payload.subject ?? '(no subject)',
            namespace: activeConfig.namespace,
            receivedAt: new Date(payload.receivedAt).toLocaleString(),
            isPrivate: !!payload.isPrivate,
            sensitive: false,
          }

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
    if (activeView === 'namespaces') {
      setNamespaceMenuOpen(false)
    }
  }, [activeView])

  const publicEmails = useMemo(() => emails.filter((item) => item.namespace === activeNamespace && !item.isPrivate), [emails, activeNamespace])
  const privateEmails = useMemo(() => emails.filter((item) => item.namespace === activeNamespace && item.isPrivate), [emails, activeNamespace])
  const visibleEmails = isVaultView ? privateEmails : publicEmails

  const tags = useMemo<TagItem[]>(() => {
    const scoped = visibleEmails
    const counts = scoped.reduce<Record<string, number>>((acc, item) => {
      acc[item.tag] = (acc[item.tag] || 0) + 1
      return acc
    }, {})

    return [
      { name: 'all', count: scoped.length },
      ...Object.entries(counts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({ name, count })),
    ]
  }, [visibleEmails])

  useEffect(() => {
    if (!tags.find((tag) => tag.name === activeTag)) {
      setActiveTag('all')
    }
  }, [tags, activeTag])

  const filteredEmails = useMemo(() => {
    const scoped = visibleEmails
    const inTag = activeTag === 'all' ? scoped : scoped.filter((item) => item.tag === activeTag)
    const query = search.trim().toLowerCase()
    const matched = query
      ? inTag.filter((item) => {
        const from = item.from ?? ''
        return item.tag.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query) || from.toLowerCase().includes(query)
      })
      : inTag

    return matched
  }, [activeTag, search, visibleEmails])

  const handleVaultClick = () => {
    setActiveView('vault')
    if (vaultUnlocked) {
      setVaultUnlocked(false)
      return
    }
    promptPasskey()
  }

  const promptPasskey = () => {
    setPasskey('')
    setPasskeyError('')
    setPasskeyDialogOpen(true)
  }

  const handlePasskeySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (passkey.length < 4) {
      setPasskeyError('Passkey must be at least 4 characters.')
      return
    }

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

  const handleAddNamespace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = newNamespace.trim()
    const apiKey = newApiKey.trim()
    if (!next) {
      setNamespaceError('Enter a namespace')
      return
    }
    if (!apiKey) {
      setNamespaceError('Enter an API key')
      return
    }
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
    } catch (error) {
      setNamespaceError('Unable to add namespace')
    } finally {
      setIsSavingNamespace(false)
    }
  }

  // ── Private tag handlers ─────────────────────────────────────

  const handleMakePrivate = useCallback(async (tag: string) => {
    if (!activeConfig) return
    try {
      await addPrivateTagRequest(activeConfig.id, tag)
      // Update local private tags list
      setPrivateTags((prev) => prev.includes(tag) ? prev : [...prev, tag])
      // Mark all emails with this tag as private locally
      setEmails((prev) =>
        prev.map((email) =>
          email.tag === tag && email.namespace === activeNamespace
            ? { ...email, isPrivate: true }
            : email
        )
      )
    } catch {
      // ignore error
    }
  }, [activeConfig, activeNamespace])

  const handleMakePublic = useCallback(async (tag: string) => {
    if (!activeConfig) return
    try {
      await removePrivateTagRequest(activeConfig.id, tag)
      // Remove from local private tags list
      setPrivateTags((prev) => prev.filter((t) => t !== tag))
      // Mark all emails with this tag as public locally
      setEmails((prev) =>
        prev.map((email) =>
          email.tag === tag && email.namespace === activeNamespace
            ? { ...email, isPrivate: false }
            : email
        )
      )
    } catch {
      // ignore error
    }
  }, [activeConfig, activeNamespace])

  return (
    <main className={`noise-overlay relative min-h-screen overflow-hidden px-4 pt-6 md:px-8 transition-all duration-500 ${openEmail ? 'pb-6' : 'pb-32'}`}>
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div
          className={`absolute -left-1/4 -top-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-500/20' : 'bg-blue-500/20'
            }`}
        />
        <div
          className={`absolute right-[-6rem] top-10 h-[28rem] w-[28rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-400/20' : 'bg-indigo-500/20'
            }`}
        />
        <div
          className={`absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full blur-3xl transition-all duration-700 ${isVaultView ? 'bg-rose-300/15' : 'bg-blue-400/15'
            }`}
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
            if (isVaultView && !vaultUnlocked) {
              promptPasskey()
            }
          }}
          isVaultView={isVaultView}
          vaultUnlocked={vaultUnlocked}
          disableMenu={activeView === 'namespaces'}
          hidden={!!openEmail}
        />

        {activeView === 'namespaces' ? (
          <div key="namespaces-view" className="view-transition">
            <NamespacesView
              namespaces={namespaces}
              activeNamespace={activeNamespace}
              onSelectNamespace={(namespace) => {
                setActiveNamespace(namespace)
                setActiveTag('all')
              }}
              onOpenAddDialog={() => setNamespaceDialogOpen(true)}
            />
          </div>
        ) : (
          <div key={`inbox-${activeView}`} className={`view-transition grid gap-4 md:grid-cols-[220px_1fr]`}>
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
              />
            )}
            {openEmail ? (
              <div className="order-2">
                <MailDetail email={openEmail} onClose={() => { setOpenEmailId(null); setOpenEmail(null); }} />
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
                      // mark read
                      await (await import('@/lib/api/emails-api')).markEmailReadRequest(email.id)
                    } catch (err) {
                      // ignore
                    }
                  })()
                }}
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
          if (view === 'namespaces') {
            setNamespaceMenuOpen(false)
          }
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
        onNamespaceChange={(value) => {
          setNewNamespace(value)
          setNamespaceError('')
        }}
        onApiKeyChange={(value) => {
          setNewApiKey(value)
          setNamespaceError('')
        }}
        onSubmit={handleAddNamespace}
      />
    </main>
  )
}
