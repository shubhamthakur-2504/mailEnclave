export type DockView = "inbox" | "vault" | "namespaces" | "settings"

export type ReadFilter = "all" | "read" | "unread"

export type TagItem = {
  name: string
  count: number
}

export type EmailItem = {
  id: string
  tag: string
  subject: string
  namespace: string
  receivedAt: string
  from?: string | null
  text?: string | null
  isPrivate?: boolean
  sensitive: boolean
  isRead?: boolean
  isNew?: boolean
}
