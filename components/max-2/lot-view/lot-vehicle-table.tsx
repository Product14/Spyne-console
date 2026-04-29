"use client"

import * as React from "react"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import type { LotStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SpyneLotStatusChip } from "@/components/max-2/spyne-ui"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { issueLabelForLotVehicle } from "@/lib/inventory-issue-label"
import { lotVehicleToMerchandising } from "@/lib/lot-vehicle-to-merchandising"
import { MerchandisingInventoryActionCta } from "@/components/max-2/studio/merchandising-inventory-action-cta"
import { Search } from "lucide-react"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

export function LotVehicleTable() {
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [pricingFilter, setPricingFilter] = React.useState<string>("all")

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase()
    return [...lotVehicles]
      .filter((v) => {
        if (q && ![v.make, v.model, v.stockNumber].some((f) => f.toLowerCase().includes(q)))
          return false
        if (statusFilter !== "all" && v.lotStatus !== statusFilter) return false
        if (pricingFilter !== "all" && v.pricingPosition !== pricingFilter) return false
        return true
      })
      .sort((a, b) => b.daysInStock - a.daysInStock)
  }, [lotVehicles, search, statusFilter, pricingFilter])

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <CardTitle>Lot Inventory</CardTitle>
        <CardDescription>
          Full vehicle list - filter by status, pricing, or keyword
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-1">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search make, model, stock #…"
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Lot Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="frontline">Frontline</SelectItem>
              <SelectItem value="wholesale-candidate">Wholesale</SelectItem>
              <SelectItem value="in-recon">In Recon</SelectItem>
              <SelectItem value="arriving">Arriving</SelectItem>
              <SelectItem value="sold-pending">Sold Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pricingFilter} onValueChange={setPricingFilter}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="below-market">Below Market</SelectItem>
              <SelectItem value="at-market">At Market</SelectItem>
              <SelectItem value="above-market">Above Market</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className={spyneComponentClasses.studioInventoryTable}>
            <thead>
              <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Stock #</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Vehicle</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Color</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>List Price</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Days</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Issue</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Status</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Holding Cost</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Gross Margin</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => {
                const isAged = v.daysInStock >= 45
                const issue = issueLabelForLotVehicle(v)
                const issueAccent = issue.tone === "warning" || issue.tone === "danger"

                return (
                  <tr
                    key={v.vin}
                    className={spyneComponentClasses.studioInventoryTableRow}
                  >
                    <td
                      className={cn(
                        spyneComponentClasses.studioInventoryTableCell,
                        "!text-xs text-muted-foreground tabular-nums",
                        (isAged || issueAccent) && spyneComponentClasses.overviewIssueRowAccent,
                      )}
                    >
                      <p>{v.stockNumber}</p>
                      <p className={cn("text-[10px] mt-0.5 font-medium", v.lotStatus === "wholesale-candidate" ? "text-spyne-info" : "text-spyne-warning-ink")}>
                        {v.lotStatus === "wholesale-candidate" ? "Wholesale" : "Retail"}
                      </p>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <span className="font-semibold">{v.year} {v.make} {v.model} {v.trim}</span>
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-muted-foreground")}>{v.color}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums")}>{fmt$(v.listPrice)}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums font-semibold", isAged && "text-spyne-error")}>
                      {v.daysInStock}
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          issue.tone === "danger" && "text-spyne-error",
                          issue.tone === "warning" && "text-spyne-warning-ink",
                          issue.tone === "neutral" && "text-muted-foreground",
                        )}
                      >
                        {issue.label}
                      </span>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <SpyneLotStatusChip status={v.lotStatus} compact />
                    </td>
                    <td className={cn(
                      spyneComponentClasses.studioInventoryTableCell,
                      "text-right tabular-nums font-semibold",
                      v.totalHoldingCost >= 2000 ? "text-spyne-error" : v.totalHoldingCost >= 1000 ? "text-spyne-text" : "text-muted-foreground",
                    )}>
                      {fmt$(v.totalHoldingCost)}
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right tabular-nums font-semibold text-spyne-success")}>
                      {fmt$(v.estimatedFrontGross)}
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <MerchandisingInventoryActionCta
                        v={lotVehicleToMerchandising(v)}
                        size="md"
                        ui="shadcn-outline"
                      />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No vehicles match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
