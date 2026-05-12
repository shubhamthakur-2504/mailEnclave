import { protectedApi } from "@/lib/api/http"

export type TestmailConfigPayload = {
  namespace: string
  apiKey: string
}

export type UserConfig = {
  id: string
  namespace: string
  createdAt: string
  _count: {
    emails: number
  }
}

export type DashboardStats = {
  linkedConfigs: number
  totalEmails: number
  memberSince: string
  email: string
}

export type TestmailEmail = {
  id?: string
  tag?: string
  subject?: string
  timestamp?: number
  text?: string
  html?: string
  from?: string
  isPrivate?: boolean
}

export type TestmailInboxResponse = {
  result: string
  message: string | null
  count: number
  limit: number
  offset: number
  emails: TestmailEmail[]
  config: {
    id: string
    namespace: string
  }
}

export const saveTestmailConfig = async (payload: TestmailConfigPayload) => {
  const { data } = await protectedApi.post("/config/testmail", payload)
  return data as { message: string; config: unknown }
}

export const listConfigsRequest = async () => {
  const { data } = await protectedApi.get<{ configs: UserConfig[] }>("/config")
  return data.configs
}

export const getConfigRequest = async (id: string) => {
  const { data } = await protectedApi.get<{ config: UserConfig }>(`/config/${id}`)
  return data.config
}

export const addConfigRequest = async (payload: TestmailConfigPayload) => {
  const { data } = await protectedApi.post<{ message: string; config: UserConfig }>("/config/testmail", payload)
  return data.config
}

export const updateConfigRequest = async (id: string, payload: Partial<TestmailConfigPayload>) => {
  const { data } = await protectedApi.put<{ message: string; config: UserConfig }>(`/config/${id}`, payload)
  return data.config
}

export const deleteConfigRequest = async (id: string) => {
  const { data } = await protectedApi.delete<{ message: string; config: UserConfig }>(`/config/${id}`)
  return data
}

export const getDashboardStatsRequest = async () => {
  const { data } = await protectedApi.get<{ stats: DashboardStats }>("/config/dashboard/stats")
  return data.stats
}

export const getConfigEmailsRequest = async (
  id: string,
  params?: {
    tag?: string
    tag_prefix?: string
    timestamp_from?: number
    timestamp_to?: number
    limit?: number
    offset?: number
    livequery?: boolean
    headers?: boolean
    spam_report?: boolean
  }
) => {
  const { data } = await protectedApi.get<TestmailInboxResponse>(`/config/${id}/emails`, { params })
  return data
}

export const subscribeConfigEvents = (
  id: string,
  token: string | null | undefined,
  onEmailNew?: (payload: { id: string; testmailId: string; tag: string; subject: string; receivedAt: number; isPrivate?: boolean }) => void
) => {
  if (!token) return null

  const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/config/${id}/subscribe`)
  url.searchParams.set('token', token)

  const es = new EventSource(url.toString())

  if (onEmailNew) {
    es.addEventListener('email:new', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(String(e.data))
        onEmailNew(payload)
      } catch (err) {
        // ignore
      }
    })
  }

  return es
}

/* ── Private tag management ──────────────────────────────────── */

export type PrivateTag = {
  tag: string
}

export const getPrivateTagsRequest = async (configId: string) => {
  const { data } = await protectedApi.get<{ privateTags: PrivateTag[] }>(`/config/${configId}/private-tags`)
  return data.privateTags
}

export const addPrivateTagRequest = async (configId: string, tag: string) => {
  const { data } = await protectedApi.post<{ message: string; privateTag: PrivateTag; backfilled: number }>(
    `/config/${configId}/private-tags`,
    { tag }
  )
  return data
}

export const removePrivateTagRequest = async (configId: string, tag: string) => {
  const { data } = await protectedApi.delete<{ message: string; deleted: number; backfilled: number }>(
    `/config/${configId}/private-tags/${encodeURIComponent(tag)}`
  )
  return data
}
