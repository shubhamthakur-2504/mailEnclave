import { protectedApi } from '@/lib/api/http'

export const getEmailRequest = async (id: string) => {
  const { data } = await protectedApi.get<{ email: any }>(`/emails/${id}`)
  return data.email
}

export const markEmailReadRequest = async (id: string) => {
  const { data } = await protectedApi.patch<{ success: boolean }>(`/emails/${id}/read`)
  return data
}
