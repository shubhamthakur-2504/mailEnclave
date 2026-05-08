'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { addConfigRequest, listConfigsRequest } from '@/lib/api/config-api'
import Dock from '@/components/dashboard/dock'
import MailList from '@/components/dashboard/mail-list'
import NamespacesView from '@/components/dashboard/namespaces-view'
import NamespaceDialog from '@/components/dashboard/namespace-dialog'
import PasskeyDialog from '@/components/dashboard/passkey-dialog'
import TagsPanel from '@/components/dashboard/tags-panel'
import TopBar from '@/components/dashboard/top-bar'
import type { DockView, EmailItem, TagItem } from '@/components/dashboard/types'

export default function DashboardPage() {
  const searchRef = useRef<HTMLInputElement>(null)
  const [namespaces, setNamespaces] = useState<string[]>([])
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
  const [emails] = useState<EmailItem[]>([])
  const isVaultView = activeView === 'vault'

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
        const list = configs.map((config) => config.namespace)
        if (!isMounted) {
          return
        }
        setNamespaces(list)
        setActiveNamespace((current) => {
          if (!list.length) {
            return current
          }
          return list.includes(current) ? current : list[0]
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

  useEffect(() => {
    if (activeView === 'namespaces') {
      setNamespaceMenuOpen(false)
    }
  }, [activeView])

  const tags = useMemo<TagItem[]>(() => {
    const inNamespace = emails.filter((item) => item.namespace === activeNamespace)
    const scoped = isVaultView ? inNamespace.filter((item) => item.sensitive) : inNamespace.filter((item) => !item.sensitive)
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
  }, [activeNamespace, emails, isVaultView])

  useEffect(() => {
    if (!tags.find((tag) => tag.name === activeTag)) {
      setActiveTag('all')
    }
  }, [tags, activeTag])

  const filteredEmails = useMemo(() => {
    const inNamespace = emails.filter((item) => item.namespace === activeNamespace)
    const scoped = isVaultView ? inNamespace.filter((item) => item.sensitive) : inNamespace.filter((item) => !item.sensitive)
    const inTag = activeTag === 'all' ? scoped : scoped.filter((item) => item.tag === activeTag)
    const query = search.trim().toLowerCase()
    const matched = query
      ? inTag.filter((item) => item.tag.toLowerCase().includes(query) || item.subject.toLowerCase().includes(query))
      : inTag

    return matched
  }, [activeNamespace, activeTag, emails, isVaultView, search])

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

  const handlePasskeySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (passkey !== '4242') {
      setPasskeyError('Invalid passkey. Try again.')
      return
    }

    setVaultUnlocked(true)
    setPasskeyDialogOpen(false)
    setPasskeyError('')
    setPasskey('')
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
      await addConfigRequest({ namespace: next, apiKey })
      setNamespaces((prev) => [...prev, next])
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

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-32 pt-6 md:px-8">
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div
          className={`absolute -left-1/4 -top-1/3 h-[34rem] w-[34rem] rounded-full blur-3xl transition-all duration-500 ${
            isVaultView ? 'bg-rose-500/20' : 'bg-blue-500/20'
          }`}
        />
        <div
          className={`absolute right-[-6rem] top-10 h-[28rem] w-[28rem] rounded-full blur-3xl transition-all duration-500 ${
            isVaultView ? 'bg-rose-400/20' : 'bg-indigo-500/20'
          }`}
        />
        <div
          className={`absolute bottom-[-10rem] left-1/3 h-[30rem] w-[30rem] rounded-full blur-3xl transition-all duration-500 ${
            isVaultView ? 'bg-rose-300/15' : 'bg-blue-400/15'
          }`}
        />
      </div>

      <section className="w-full p-4 md:p-6">
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
        />

        {activeView === 'namespaces' ? (
          <NamespacesView
            namespaces={namespaces}
            activeNamespace={activeNamespace}
            onSelectNamespace={(namespace) => {
              setActiveNamespace(namespace)
              setActiveTag('all')
            }}
            onOpenAddDialog={() => setNamespaceDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <TagsPanel
              tags={tags}
              activeTag={activeTag}
              isVaultView={isVaultView}
              vaultUnlocked={vaultUnlocked}
              onSelectTag={setActiveTag}
              onRequirePasskey={promptPasskey}
            />
            <MailList
              emails={filteredEmails}
              activeView={activeView}
              activeNamespace={activeNamespace}
              activeTag={activeTag}
              isVaultView={isVaultView}
              vaultUnlocked={vaultUnlocked}
              onRequirePasskey={promptPasskey}
            />
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
      />

      <PasskeyDialog
        open={passkeyDialogOpen}
        onOpenChange={setPasskeyDialogOpen}
        activeNamespace={activeNamespace}
        passkey={passkey}
        passkeyError={passkeyError}
        isVaultView={isVaultView}
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
