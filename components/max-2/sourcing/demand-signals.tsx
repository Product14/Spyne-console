"use client"

import * as React from "react"
import { mockDemandSignals } from "@/lib/max-2-mocks"
import type { DemandSignal } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SpyneChipTone } from "@/lib/design-system/max-2"
import { SpyneChip } from "@/components/max-2/spyne-chip"
import { SpyneLineTab, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

const urgencyTone: Record<DemandSignal["urgency"], SpyneChipTone> = {
  high: "error",
  medium: "warning",
  low: "success",
}

const sourceChip: Record<string, { variant: "outline" | "soft"; tone: SpyneChipTone }> = {
  "Sales Calls": { variant: "outline", tone: "info" },
  "Website Inquiry": { variant: "soft", tone: "primary" },
  "Market Intel": { variant: "outline", tone: "info" },
}

type DemandTabId = "all" | "not-in-stock" | "high-urgency"

const DEMAND_TABS: { id: DemandTabId; label: string }[] = [
  { id: "all", label: "All requests" },
  { id: "not-in-stock", label: "Not in stock" },
  { id: "high-urgency", label: "High urgency" },
]

function filterDemandRows(rows: DemandSignal[], tab: DemandTabId): DemandSignal[] {
  if (tab === "not-in-stock") return rows.filter((s) => !s.inStock)
  if (tab === "high-urgency") return rows.filter((s) => s.urgency === "high")
  return rows
}

export function DemandSignals() {
  const [demandTab, setDemandTab] = React.useState<DemandTabId>("all")
  const sorted = [...mockDemandSignals].sort((a, b) => b.requestCount - a.requestCount)
  const visible = filterDemandRows(sorted, demandTab)

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Customer Demand Signals</CardTitle>
        <p className="text-sm text-spyne-text-secondary">
          What customers are asking for from calls, inquiries, and market data
        </p>
      </CardHeader>
      <CardContent className="pt-2">
        <SpyneLineTabStrip tight className="min-w-0 overflow-x-auto">
          {DEMAND_TABS.map((t) => (
            <SpyneLineTab
              key={t.id}
              active={demandTab === t.id}
              onClick={() => setDemandTab(t.id)}
              className="shrink-0 whitespace-nowrap"
            >
              {t.label}
            </SpyneLineTab>
          ))}
        </SpyneLineTabStrip>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Avg Budget</TableHead>
              <TableHead>Urgency</TableHead>
              <TableHead>In Stock?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((s) => (
              <TableRow
                key={s.id}
                className={cn(!s.inStock && spyneComponentClasses.rowWarn)}
              >
                <TableCell className="font-medium">{s.vehicleDescription}</TableCell>
                <TableCell>
                  {(() => {
                    const cfg = sourceChip[s.sourceLabel] ?? { variant: "outline" as const, tone: "info" as const }
                    return (
                      <SpyneChip variant={cfg.variant} tone={cfg.tone}>
                        {s.sourceLabel}
                      </SpyneChip>
                    )
                  })()}
                </TableCell>
                <TableCell className="text-right tabular-nums">{s.requestCount}</TableCell>
                <TableCell className="text-right tabular-nums">
                  ${s.avgBudget.toLocaleString()}
                </TableCell>
                <TableCell>
                  <SpyneChip variant="outline" tone={urgencyTone[s.urgency]} className="capitalize">
                    {s.urgency}
                  </SpyneChip>
                </TableCell>
                <TableCell>
                  {s.inStock ? (
                    <span className="text-spyne-success font-medium text-sm">Yes</span>
                  ) : (
                    <span className="font-semibold text-sm text-spyne-text">Not in stock</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
