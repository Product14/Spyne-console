"use client"

import { useState } from "react"
import Link from "next/link"
import { mockThreats } from "@/lib/max-2-mocks"
import type { Threat } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react"

const sorted = [...mockThreats].sort((a, b) => {
  if (a.severity === "critical" && b.severity !== "critical") return -1
  if (a.severity !== "critical" && b.severity === "critical") return 1
  return 0
})

function ThreatCard({ threat }: { threat: Threat }) {
  const [open, setOpen] = useState(false)
  const isCritical = threat.severity === "critical"

  return (
    <div className={cn(spyneComponentClasses.insightRow, "p-0 overflow-hidden")}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-[14px]"
      >
        <div className={spyneComponentClasses.insightRowBody}>
          <div
            className={cn(
              spyneComponentClasses.insightRowIconWell,
              isCritical
                ? spyneComponentClasses.insightRowIconWellCritical
                : spyneComponentClasses.insightRowIconWellWarning
            )}
          >
            <MaterialSymbol
              name="shield"
              size={16}
              className={cn(
                isCritical ? "text-spyne-error" : "text-spyne-warning-ink"
              )}
            />
          </div>
          <div className={spyneComponentClasses.insightRowMain}>
            <div className={spyneComponentClasses.insightRowTitleRow}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <p className={cn(spyneComponentClasses.insightRowTitle, "truncate")}>
                  {threat.label}
                </p>
                {isCritical && (
                  <SpyneChip variant="outline" tone="error" compact className="shrink-0">
                    Critical
                  </SpyneChip>
                )}
              </div>
              <SpyneChip
                variant="outline"
                tone="error"
                compact
                className="shrink-0 tabular-nums"
              >
                {threat.count}
              </SpyneChip>
            </div>
            <p className={spyneComponentClasses.insightRowMeta}>{threat.description}</p>
          </div>
          {open ? (
            <ChevronDown className={spyneComponentClasses.insightRowChevron} />
          ) : (
            <ChevronRight className={spyneComponentClasses.insightRowChevron} />
          )}
        </div>
      </button>

      {open && threat.vehicles && threat.vehicles.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-spyne-border">
          <div className="pt-2">
            {threat.vehicles.map((v) => (
              <div
                key={v.vin}
                className="flex items-center gap-2 py-1.5 text-xs"
              >
                <span className="font-mono text-muted-foreground w-16 truncate shrink-0">
                  {v.vin.slice(-6)}
                </span>
                <span className="font-medium">
                  {v.year} {v.make} {v.model}
                </span>
                <span className="text-muted-foreground ml-auto truncate">
                  {v.detail}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={threat.href}
            className="inline-flex items-center gap-1 text-xs font-medium text-spyne-primary hover:opacity-80 transition-opacity"
          >
            View all & take action
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  )
}

export function ThreatsBlock() {
  return (
    <Card className="gap-4 pt-px pb-5 shadow-none">
      <CardHeader className="px-5 pb-0">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg border border-spyne-border",
              spyneComponentClasses.rowError
            )}
          >
            <MaterialSymbol name="shield" size={16} className="text-spyne-error" />
          </div>
          <div>
            <CardTitle>Threats</CardTitle>
            <CardDescription className="text-xs">
              Immediate downside: loss prevention
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((t) => (
          <ThreatCard key={t.id} threat={t} />
        ))}
      </CardContent>
    </Card>
  )
}
