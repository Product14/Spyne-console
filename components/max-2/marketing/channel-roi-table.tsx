"use client"

import * as React from "react"
import { mockMarketingChannels } from "@/lib/max-2-mocks"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

function cpsColor(cps: number) {
  if (cps === 0) return "text-spyne-success"
  if (cps > 400) return "text-spyne-error"
  if (cps > 250) return "text-spyne-text"
  return "text-spyne-success"
}

export function ChannelROITable() {
  const totals = mockMarketingChannels.reduce(
    (acc, ch) => ({
      spend: acc.spend + ch.spend,
      leads: acc.leads + ch.leads,
      appointments: acc.appointments + ch.appointments,
      unitsSold: acc.unitsSold + ch.unitsSold,
    }),
    { spend: 0, leads: 0, appointments: 0, unitsSold: 0 },
  )
  const totalCPS = totals.unitsSold > 0 ? Math.round(totals.spend / totals.unitsSold) : 0
  const totalCPL = totals.leads > 0 ? +(totals.spend / totals.leads).toFixed(1) : 0

  const TH = ({
    children,
    right,
    className,
  }: {
    children: React.ReactNode
    right?: boolean
    className?: string
  }) => (
    <th
      className={cn(
        "bg-muted py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-spyne-text whitespace-nowrap",
        right && "text-right",
        className,
      )}
    >
      {children}
    </th>
  )

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <span className={cn(spyneComponentClasses.kpiIcon, "bg-spyne-primary-soft text-spyne-success")}>
            <MaterialSymbol name="payments" size={20} />
          </span>
          <div className="min-w-0">
            <CardTitle>Channel ROI</CardTitle>
            <CardDescription>Marketing spend vs. return by channel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-spyne-border">
                <TH>Source</TH>
                <TH right>Spend</TH>
                <TH right>Leads</TH>
                <TH right className="hidden sm:table-cell">
                  Appts
                </TH>
                <TH right>Units Sold</TH>
                <TH right>CPS</TH>
                <TH right className="hidden md:table-cell">
                  CPL
                </TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockMarketingChannels.map((ch) => (
                <tr
                  key={ch.source}
                  className={cn(
                    "transition-colors hover:bg-muted",
                    ch.spend === 0 && spyneComponentClasses.rowPositive,
                  )}
                >
                  <td className="px-4 py-3 font-medium text-spyne-text">
                    <div className="flex flex-wrap items-center gap-2">
                      {ch.source}
                      {ch.spend === 0 && (
                        <SpyneChip variant="outline" tone="success" compact>
                          $0 spend, best ROI
                        </SpyneChip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    ${ch.spend.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{ch.leads}</td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums sm:table-cell">
                    {ch.appointments}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{ch.unitsSold}</td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-mono font-semibold tabular-nums",
                      cpsColor(ch.costPerSale),
                    )}
                  >
                    ${ch.costPerSale}
                  </td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-spyne-text-secondary md:table-cell">
                    ${ch.costPerLead.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-spyne-border font-semibold">
                <td className="px-4 pt-3 text-spyne-text">Total</td>
                <td className="px-4 pt-3 text-right font-mono tabular-nums">
                  ${totals.spend.toLocaleString()}
                </td>
                <td className="px-4 pt-3 text-right font-mono tabular-nums">{totals.leads}</td>
                <td className="hidden px-4 pt-3 text-right font-mono tabular-nums sm:table-cell">
                  {totals.appointments}
                </td>
                <td className="px-4 pt-3 text-right font-mono tabular-nums">{totals.unitsSold}</td>
                <td className={cn("px-4 pt-3 text-right font-mono tabular-nums", cpsColor(totalCPS))}>
                  ${totalCPS}
                </td>
                <td className="hidden px-4 pt-3 text-right font-mono tabular-nums text-spyne-text-secondary md:table-cell">
                  ${totalCPL}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
