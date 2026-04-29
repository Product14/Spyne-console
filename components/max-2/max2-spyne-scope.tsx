"use client"

import * as React from "react"
import { max2Classes } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

/**
 * Wraps Max 2 pages that must follow Spyne Console tokens (see `design-system/max-2.md`).
 */
export function Max2SpyneScope({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn(max2Classes.spyneScope, className)}>{children}</div>
}
