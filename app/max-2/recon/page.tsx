"use client"

import {
  ReconKPIs, ReconKanban, BottleneckAnalysis,
} from "@/components/max-2/recon"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function ReconPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Inspection &amp; Recon</h1>
        <p className={max2Classes.pageDescription}>
          From lot arrival to frontline readiness
        </p>
      </div>

      <ReconKPIs />
      <ReconKanban />
      <BottleneckAnalysis />
    </div>
  )
}
