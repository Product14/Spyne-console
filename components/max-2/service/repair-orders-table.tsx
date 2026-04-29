"use client"

import { mockRepairOrders } from "@/lib/max-2-mocks"
import type { ROStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { AlertCircle, Clock } from "lucide-react"

const statusConfig: Record<ROStatus, { label: string; className: string }> = {
  open: { label: "Open", className: cn("border", spyneComponentClasses.badgeInfo) },
  "in-progress": { label: "In Progress", className: cn("border", spyneComponentClasses.badgeSuccess) },
  "waiting-parts": { label: "Waiting Parts", className: cn("border", spyneComponentClasses.badgeWarning) },
  "waiting-approval": { label: "Waiting Approval", className: cn("border", spyneComponentClasses.badgeError) },
  completed: { label: "Completed", className: cn("border", spyneComponentClasses.badgeSuccess) },
  invoiced: { label: "Invoiced", className: cn("border", spyneComponentClasses.badgeNeutral) },
}

export function RepairOrdersTable() {
  const activeROs = mockRepairOrders.filter(
    (ro) => ro.status !== "invoiced"
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Repair Orders</CardTitle>
            <CardDescription>
              {activeROs.length} active ROs &middot; {mockRepairOrders.filter(r => r.isWaiter && r.status !== "completed" && r.status !== "invoiced").length} waiters
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Today&apos;s labor: <span className="font-semibold text-foreground">${mockRepairOrders.reduce((s, r) => s + r.laborTotal, 0).toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Parts: <span className="font-semibold text-foreground">${mockRepairOrders.reduce((s, r) => s + r.partsTotal, 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className={spyneComponentClasses.studioInventoryTable}>
            <thead>
              <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>RO #</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Customer</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Vehicle</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Advisor</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Tech</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Bay</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Status</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Promised</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Estimate</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Complaints</th>
              </tr>
            </thead>
            <tbody>
              {mockRepairOrders.map((ro) => {
                const status = statusConfig[ro.status]
                return (
                  <tr key={ro.id} className={cn(spyneComponentClasses.studioInventoryTableRow, ro.hasConcern && spyneComponentClasses.rowError)}>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs")}>
                      <div className="flex items-center gap-1.5 font-mono font-semibold">
                        {ro.roNumber}
                        {ro.isWaiter && (
                          <Clock className="h-3 w-3 text-spyne-warning" />
                        )}
                      </div>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <span className="font-semibold">{ro.customerName}</span>
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs text-muted-foreground max-w-[180px] truncate")}>
                      {ro.vehicle}
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs")}>{ro.advisor}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs")}>{ro.technician}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs")}>{ro.bay ?? "—"}</td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <Badge variant="outline" className={cn("text-xs", status.className)}>
                        {ro.hasConcern && <AlertCircle className="h-3 w-3 mr-1" />}
                        {status.label}
                      </Badge>
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs text-muted-foreground")}>{ro.promisedTime}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right font-semibold")}>
                      ${ro.totalEstimate.toLocaleString()}
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs text-muted-foreground max-w-[200px]")}>
                      {ro.complaints.join(", ")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
