"use client"

import React from "react"
import { Toaster } from "@/components/ui/sonner"

type Props = {
  children: React.ReactNode
}

export default function ClientProviders({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <Toaster />
    </div>
  )
}
