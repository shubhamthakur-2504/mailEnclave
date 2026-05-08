export type DockView = "inbox" | "vault" | "namespaces" | "settings"

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
  sensitive: boolean
}
