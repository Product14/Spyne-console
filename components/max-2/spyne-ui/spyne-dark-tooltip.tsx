"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

export interface SpyneDarkTooltipPanelProps {
  /** e.g. "Suggested actions", "Sync Status" */
  title: string
  /** Bullet lines (primary body). */
  lines: string[]
  className?: string
}

/**
 * Dark-themed tooltip body matching the Studio inventory **Published** column tooltip shell.
 * Use inside Radix `TooltipPrimitive.Content` with `spyneComponentClasses.darkTooltipRadixContent` on the content node
 * and `spyneComponentClasses.darkTooltipArrow` on `TooltipPrimitive.Arrow`.
 */
export function SpyneDarkTooltipPanel({ title, lines, className }: SpyneDarkTooltipPanelProps) {
  return (
    <div className={cn(spyneComponentClasses.darkTooltipPanel, className)}>
      <p className={spyneComponentClasses.darkTooltipTitle}>{title}</p>
      <ul className={spyneComponentClasses.darkTooltipList}>
        {lines.map((line) => (
          <li key={line} className={spyneComponentClasses.darkTooltipItem}>
            <span className={spyneComponentClasses.darkTooltipBullet} aria-hidden>
              •
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
