"use client"

import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import InfoTooltip from "@/components/max-2/sales/console-v2/components/InfoTooltip"

export type ServiceTopIntentRow = {
  intent: string
  calls: number
  resolved: number
  appts: number
  ratePct: number
  tone: "success" | "primary" | "warning"
}

const rateToneClass: Record<ServiceTopIntentRow["tone"], string> = {
  success: "text-spyne-success font-semibold",
  primary: "text-spyne-primary font-semibold",
  warning: "text-[var(--spyne-warning-ink)] font-semibold",
}

export function ServiceTopIntentsTable({
  rows,
  className,
}: {
  rows: ServiceTopIntentRow[]
  className?: string
}) {
  return (
    <div className={cn("spyne-card flex h-full min-h-0 flex-col p-4", className)}>
      <div className="mb-4 flex items-center gap-1.5">
        <h3 className={cn(spyneComponentClasses.cardTitle, "m-0")}>Top Intents by Resolution Rate</h3>
        <InfoTooltip text="Inbound call intents ranked by how often Mark resolves the request on the first touch, with appointment volume for each intent." />
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
              <th className={spyneComponentClasses.studioInventoryTableHeadCell}>
                Intent
              </th>
              <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellCenter)}>
                Calls
              </th>
              <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellCenter)}>
                Resolved
              </th>
              <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellCenter)}>
                Appts
              </th>
              <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>
                Resolution rate
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.intent}
                className={spyneComponentClasses.studioInventoryTableRow}
              >
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "font-medium")}>{row.intent}</td>
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center tabular-nums")}>
                  {row.calls}
                </td>
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center tabular-nums")}>
                  {row.resolved}
                </td>
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center tabular-nums")}>
                  {row.appts}
                </td>
                <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums", rateToneClass[row.tone])}>
                  {row.ratePct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
