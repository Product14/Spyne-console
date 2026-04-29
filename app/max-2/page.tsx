"use client"

import {
  LifecycleStrip,
  CoreMetrics,
  ThreatsBlock,
  OpportunitiesBlock,
  InsightsBlock,
} from "@/components/max-2/dashboard"
import { Max2PageSection } from "@/components/max-2/max2-page-section"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function Max2DashboardPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>What needs my attention</h1>
        <p className={cn(max2Classes.pageDescription, "mt-1")}>
          Lifecycle health, core metrics, and prioritized threats and opportunities.
        </p>
      </div>

      <LifecycleStrip />

      <Max2PageSection title="Core metrics" description="Targets and trend sparklines at a glance.">
        <CoreMetrics />
      </Max2PageSection>

      <Max2PageSection title="Threats and opportunities">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ThreatsBlock />
          <OpportunitiesBlock />
        </div>
      </Max2PageSection>

      <InsightsBlock />
    </div>
  )
}
