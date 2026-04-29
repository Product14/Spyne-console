"use client"

import { useState } from "react"
import Link from "next/link"
import { mockOpportunities } from "@/lib/max-2-mocks"
import type { Opportunity } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { ArrowRight, ChevronRight, ChevronDown } from "lucide-react"

const sorted = [...mockOpportunities].sort((a, b) => {
  if (a.impact === "high" && b.impact !== "high") return -1
  if (a.impact !== "high" && b.impact === "high") return 1
  return 0
})

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const [open, setOpen] = useState(false)
  const isHigh = opp.impact === "high"

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
              spyneComponentClasses.insightRowIconWellSuccess
            )}
          >
            <MaterialSymbol name="trending_up" size={16} className="text-spyne-success" />
          </div>
          <div className={spyneComponentClasses.insightRowMain}>
            <div className={spyneComponentClasses.insightRowTitleRow}>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <p className={cn(spyneComponentClasses.insightRowTitle, "truncate")}>
                  {opp.label}
                </p>
                {isHigh && (
                  <SpyneChip variant="outline" tone="success" compact className="shrink-0">
                    High Impact
                  </SpyneChip>
                )}
              </div>
              <SpyneChip
                variant="outline"
                tone="success"
                compact
                className="shrink-0 tabular-nums"
              >
                {opp.count}
              </SpyneChip>
            </div>
            <p className={spyneComponentClasses.insightRowMeta}>{opp.description}</p>
          </div>
          {open ? (
            <ChevronDown className={spyneComponentClasses.insightRowChevron} />
          ) : (
            <ChevronRight className={spyneComponentClasses.insightRowChevron} />
          )}
        </div>
      </button>

      {open && opp.items && opp.items.length > 0 && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-spyne-border">
          <div className="pt-2">
            {opp.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2 py-1.5 text-xs"
              >
                <span className="font-medium shrink-0">{item.title}</span>
                <span className="text-muted-foreground ml-auto text-right">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={opp.href}
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

export function OpportunitiesBlock() {
  return (
    <Card className="py-5 gap-4">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center justify-center h-7 w-7 rounded-lg border border-spyne-border",
              spyneComponentClasses.rowPositive
            )}
          >
            <MaterialSymbol name="trending_up" size={16} className="text-spyne-success" />
          </div>
          <div>
            <CardTitle>Opportunities</CardTitle>
            <CardDescription className="text-xs">
              Upside: growth and acceleration
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.map((o) => (
          <OpportunityCard key={o.id} opp={o} />
        ))}
      </CardContent>
    </Card>
  )
}
