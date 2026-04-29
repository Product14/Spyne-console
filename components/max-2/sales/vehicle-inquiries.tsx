"use client"

import { mockVehicleInquiries } from "@/lib/max-2-mocks"
import type { VehicleInquiry } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import Link from "next/link"
import { ExternalLink } from "lucide-react"

const statusBadge: Record<VehicleInquiry["status"], { label: string; className: string }> = {
  hot: { label: "Hot", className: cn("border", spyneComponentClasses.badgeError) },
  warm: { label: "Warm", className: cn("border", spyneComponentClasses.badgeWarning) },
  cold: { label: "Cold", className: cn("border", spyneComponentClasses.badgeInfo) },
}

export function VehicleInquiries() {
  const sorted = [...mockVehicleInquiries].sort((a, b) => b.inquiryCount - a.inquiryCount)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Inquiries — What customers are asking for</CardTitle>
        <CardDescription>Sorted by demand. Amber rows = not in stock.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className={spyneComponentClasses.studioInventoryTable}>
            <thead>
              <tr className={spyneComponentClasses.studioInventoryTableHeaderRow}>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Vehicle</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>In Stock?</th>
                <th className={cn(spyneComponentClasses.studioInventoryTableHeadCell, spyneComponentClasses.studioInventoryTableHeadCellRight)}>Inquiries</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Last Inquiry</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Source</th>
                <th className={spyneComponentClasses.studioInventoryTableHeadCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => {
                const badge = statusBadge[v.status]
                return (
                  <tr
                    key={v.id}
                    className={cn(spyneComponentClasses.studioInventoryTableRow, !v.inStock && spyneComponentClasses.rowWarn)}
                  >
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "font-semibold")}>{v.vehicleDescription}</td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      {v.inStock ? (
                        <span className="text-spyne-success !text-xs font-medium">Yes</span>
                      ) : (
                        <Link
                          href="/max-2/sourcing"
                          className="inline-flex items-center gap-1 text-xs font-medium text-spyne-warning-ink hover:underline"
                        >
                          No — Source
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "text-right font-semibold")}>{v.inquiryCount}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs text-muted-foreground")}>{v.lastInquiry}</td>
                    <td className={cn(spyneComponentClasses.studioInventoryTableCell, "!text-xs")}>{v.source}</td>
                    <td className={spyneComponentClasses.studioInventoryTableCell}>
                      <Badge variant="outline" className={badge.className}>
                        {badge.label}
                      </Badge>
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
