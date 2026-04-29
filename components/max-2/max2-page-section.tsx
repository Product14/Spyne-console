"use client"

import * as React from "react"
import { max2Classes } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

/**
 * Reusable page section: Spyne section title + optional description + children (metrics, cards, tables).
 */
export function Max2PageSection({
  title,
  description,
  children,
  className,
  headerClassName,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  headerClassName?: string
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className={headerClassName}>
        <h2 className={max2Classes.sectionTitle}>{title}</h2>
        {description ? (
          <p className={cn(max2Classes.pageDescription, "mt-1")}>{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
