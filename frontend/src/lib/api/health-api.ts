import { rawApi } from "@/lib/api/transport"

export const fetchHealth = async () => {
  const { data } = await rawApi.get("/health")
  return data as { status: string }
}
