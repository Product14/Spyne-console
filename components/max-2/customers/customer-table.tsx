"use client"

import * as React from "react"
import { mockCustomers } from "@/lib/max-2-mocks"
import type { CustomerStatus, CustomerSource } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Search, ExternalLink } from "lucide-react"

const statusBadge: Record<CustomerStatus, { label: string; className: string }> = {
  "active-lead": { label: "Active Lead", className: cn("border", spyneComponentClasses.badgeInfo) },
  sold: { label: "Sold", className: cn("border", spyneComponentClasses.badgeSuccess) },
  "service-only": { label: "Service Only", className: cn("border", spyneComponentClasses.badgeNeutral, "text-spyne-primary bg-spyne-primary-soft") },
  lost: { label: "Lost", className: cn("border", spyneComponentClasses.badgeNeutral) },
  "be-back": { label: "Be-Back", className: cn("border", spyneComponentClasses.badgeWarning) },
}

const sourceBadge: Record<CustomerSource, { label: string; className: string }> = {
  website: { label: "Website", className: cn("border", spyneComponentClasses.badgeInfo) },
  "walk-in": { label: "Walk-in", className: cn("border", spyneComponentClasses.badgeSuccess) },
  phone: { label: "Phone", className: cn("border", spyneComponentClasses.badgeWarning) },
  referral: { label: "Referral", className: cn("border", spyneComponentClasses.badgeNeutral, "text-spyne-primary bg-spyne-primary-soft") },
  "service-lane": { label: "Service Lane", className: cn("border", spyneComponentClasses.badgeInfo) },
  "third-party": { label: "Third Party", className: cn("border", spyneComponentClasses.badgeNeutral) },
}

function JourneyDot({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold",
          done
            ? "bg-spyne-success border-spyne-success text-white"
            : "border-spyne-border bg-transparent text-transparent",
        )}
      >
        {done ? "✓" : ""}
      </span>
      <span className="text-[9px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}

export function CustomerTable() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [sourceFilter, setSourceFilter] = React.useState<string>("all")

  const filtered = mockCustomers.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false
    if (sourceFilter !== "all" && c.source !== sourceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !c.name.toLowerCase().includes(q) &&
        !c.email.toLowerCase().includes(q) &&
        !c.phone.includes(q)
      )
        return false
    }
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Board</CardTitle>
        <CardDescription>
          Every customer in your pipeline: filter, sort, and act.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active-lead">Active Lead</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="service-only">Service Only</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="be-back">Be-Back</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="walk-in">Walk-in</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="service-lane">Service Lane</SelectItem>
              <SelectItem value="third-party">Third Party</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <table className={spyneComponentClasses.studioInventoryTable}>
            <thead>
              <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, "min-w-[140px]")}>Name</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Status</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Source</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Salesperson</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, "min-w-[140px]")}>Vehicle Interest</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Last Contact</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellCenter)}>Touches</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellCenter)}>Journey</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, "min-w-[180px]")}>Notes</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, "w-10 !px-1")} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sb = statusBadge[c.status]
                const srcb = sourceBadge[c.source]
                const isBeBack = c.status === "be-back"
                const isNewLead = c.status === "active-lead" && c.totalTouchpoints === 1

                return (
                  <tr
                    key={c.id}
                    className={cn(
                      spyneComponentClasses.studioInventoryTableRow,
                      isBeBack && spyneComponentClasses.rowWarn,
                      isNewLead && "bg-spyne-primary-soft",
                    )}
                  >
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <div className="font-semibold">{c.name}</div>
                      <div className={spyneComponentClasses.studioInventoryTableCellMeta}>{c.phone}</div>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <Badge variant="outline" className={cn("text-[11px]", sb.className)}>
                        {sb.label}
                      </Badge>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <Badge variant="outline" className={cn("text-[11px]", srcb.className)}>
                        {srcb.label}
                      </Badge>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>{c.assignedSalesperson}</td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <div className="flex flex-col gap-0.5">
                        {c.vehicleInterests.length > 0
                          ? c.vehicleInterests.map((v) => (
                              <span key={v} className="text-xs">
                                {v}
                              </span>
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs text-muted-foreground")}>
                      {c.lastContactDate}
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-center font-medium")}>
                      {c.totalTouchpoints}
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <div className="flex items-center justify-center gap-1.5">
                        <JourneyDot done={c.appointmentSet} label="Apt" />
                        <JourneyDot done={c.testDriveCompleted} label="TD" />
                        <JourneyDot done={c.creditAppSubmitted} label="CA" />
                      </div>
                    </td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                        {c.notes}
                      </p>
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!px-1")}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                    No customers match your filters.
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
