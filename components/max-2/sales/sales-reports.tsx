"use client"

import { mockSalespersonPerformance, mockDailyLog, mockSalesSummary } from "@/lib/max-2-mocks"
import type { DailyLogEntry } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { max2Layout } from "@/lib/design-system/max-2"

const activityConfig: Record<DailyLogEntry["activity"], { label: string; className: string }> = {
  up: { label: "Walk-in", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  "phone-up": { label: "Phone Up", className: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
  "internet-lead": { label: "Internet Lead", className: "bg-violet-500/10 text-violet-600 border-violet-200" },
  "be-back": { label: "Be-Back", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  appointment: { label: "Appointment", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  "test-drive": { label: "Test Drive", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  "write-up": { label: "Write-up", className: "bg-orange-500/10 text-orange-600 border-orange-200" },
  sold: { label: "Sold", className: "bg-green-500/10 text-green-700 border-green-200" },
  lost: { label: "Lost", className: "bg-red-500/10 text-red-600 border-red-200" },
}

export function SalesReports() {
  return (
    <div className={max2Layout.pageStack}>
      <Card>
        <CardHeader>
          <CardTitle>Salesperson Performance — MTD</CardTitle>
          <CardDescription>Units, gross, and activity metrics by salesperson</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salesperson</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Total Gross</TableHead>
                <TableHead className="text-right">Avg Front</TableHead>
                <TableHead className="text-right">Avg Back</TableHead>
                <TableHead className="text-right">Close %</TableHead>
                <TableHead className="text-right">Appts</TableHead>
                <TableHead className="text-right">Shows</TableHead>
                <TableHead className="text-right">Test Drives</TableHead>
                <TableHead className="text-right">Active Leads</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSalespersonPerformance.map((sp) => (
                <TableRow key={sp.id}>
                  <TableCell className="font-medium">{sp.name}</TableCell>
                  <TableCell className="text-right font-semibold">{sp.unitsSold}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    ${sp.totalGross.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">${sp.avgFrontGross.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${sp.avgBackGross.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-bold",
                      sp.closeRate >= 75 ? "text-emerald-600" :
                      sp.closeRate >= 65 ? "text-amber-600" : "text-red-600"
                    )}>
                      {sp.closeRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{sp.appointments}</TableCell>
                  <TableCell className="text-right">{sp.shows}</TableCell>
                  <TableCell className="text-right">{sp.testDrives}</TableCell>
                  <TableCell className="text-right">{sp.activeLeads}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{sp.avgResponseTime}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell>Team Total</TableCell>
                <TableCell className="text-right">{mockSalesSummary.unitsSoldMTD}</TableCell>
                <TableCell className="text-right text-emerald-600">
                  ${mockSalesSummary.totalGrossMTD.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">${mockSalesSummary.avgFrontGross.toLocaleString()}</TableCell>
                <TableCell className="text-right">${mockSalesSummary.avgBackGross.toLocaleString()}</TableCell>
                <TableCell className="text-right">{mockSalesSummary.closeRate}%</TableCell>
                <TableCell colSpan={5} />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Sales Log</CardTitle>
          <CardDescription>Real-time activity feed for the day</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Salesperson</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle Interest</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDailyLog.map((entry) => {
                const activity = activityConfig[entry.activity]
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {entry.time}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.salesperson}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", activity.className)}>
                        {activity.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.customerName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {entry.vehicleInterest}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{entry.result}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[180px] truncate">
                      {entry.notes}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
