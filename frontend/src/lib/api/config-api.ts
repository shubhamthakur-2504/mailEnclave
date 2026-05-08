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

export const deleteConfigRequest = async (id: string) => {
  const { data } = await protectedApi.delete<{ message: string; config: UserConfig }>(`/config/${id}`)
  return data
}

export const getDashboardStatsRequest = async () => {
  const { data } = await protectedApi.get<{ stats: DashboardStats }>("/config/dashboard/stats")
  return data.stats
}
