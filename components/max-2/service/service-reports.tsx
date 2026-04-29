"use client"

import { mockServiceRevenue, mockTechPerformance, mockServiceSummary } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { max2Layout } from "@/lib/design-system/max-2"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

export function ServiceReports() {
  return (
    <div className={max2Layout.pageStack}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue This Week</CardTitle>
            <CardDescription>Labor vs parts revenue by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockServiceRevenue} barCategoryGap="20%">
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Bar dataKey="labor" name="Labor" fill="hsl(215, 70%, 55%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="parts" name="Parts" fill="hsl(150, 60%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gross Margins</CardTitle>
            <CardDescription>Parts and labor profitability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">Labor Gross Margin</span>
                  <span className="font-bold">{mockServiceSummary.laborGrossMargin}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-spyne-info rounded-full transition-all"
                    style={{ width: `${mockServiceSummary.laborGrossMargin}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">Parts Gross Margin</span>
                  <span className="font-bold">{mockServiceSummary.partsGrossMargin}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-spyne-success rounded-full transition-all"
                    style={{ width: `${mockServiceSummary.partsGrossMargin}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold tracking-tight text-spyne-success">
                  {mockServiceSummary.csiScore}
                </p>
                <p className="text-xs text-muted-foreground">CSI Score (target: {mockServiceSummary.csiTarget})</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold tracking-tight">
                  {mockServiceSummary.completedToday}
                </p>
                <p className="text-xs text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technician Performance</CardTitle>
          <CardDescription>Hours, efficiency, and productivity by technician</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead className="text-right">Hours Available</TableHead>
                <TableHead className="text-right">Hours Billed</TableHead>
                <TableHead className="text-right">Efficiency</TableHead>
                <TableHead className="text-right">ROs Completed</TableHead>
                <TableHead className="text-right">Avg RO Value</TableHead>
                <TableHead className="text-right">Comebacks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTechPerformance.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="font-medium">{tech.name}</TableCell>
                  <TableCell className="text-right">{tech.hoursAvailable.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-semibold">{tech.hoursBilled.toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-bold",
                      tech.efficiency >= 95 ? "text-spyne-success" :
                      tech.efficiency >= 85 ? "text-spyne-text" : "text-spyne-error"
                    )}>
                      {tech.efficiency}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{tech.rosCompleted}</TableCell>
                  <TableCell className="text-right">${tech.avgROValue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(tech.comebacks > 0 && "text-spyne-error font-semibold")}>
                      {tech.comebacks}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
