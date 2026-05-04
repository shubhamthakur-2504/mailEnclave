import { protectedApi } from "@/lib/api/http"

export type TestmailConfigPayload = {
  namespace: string
  apiKey: string
}

export const saveTestmailConfig = async (payload: TestmailConfigPayload) => {
  const { data } = await protectedApi.post("/config/testmail", payload)
  return data as { message: string; config: unknown }
}
