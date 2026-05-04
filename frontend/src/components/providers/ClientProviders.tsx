"use client"

import React from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import SessionBootstrapper from "@/components/providers/SessionBootstrapper"
import { queryClient } from "@/lib/query-client"

type Props = {
  children: React.ReactNode
}

export default function ClientProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <SessionBootstrapper />
        {children}
        <Toaster />
      </div>
    </QueryClientProvider>
  )
}
