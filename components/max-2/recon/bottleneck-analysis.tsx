"use client"

import { getReconStageStats } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SpyneChip } from "@/components/max-2/spyne-chip"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { spyneConsoleTokens, spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"

export function BottleneckAnalysis() {
  const stats = getReconStageStats()
  const maxBreaches = Math.max(...stats.map((s) => s.breachCount))
  const worstStage = stats.find((s) => s.breachCount === maxBreaches && maxBreaches > 0)

  const chartData = stats.map((s) => ({
    stage: s.label,
    avgDays: Number(s.avgDays.toFixed(2)),
    isWorst: s.stage === worstStage?.stage,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bottleneck Analysis</CardTitle>
        <p className="text-sm text-spyne-text-secondary">
          Where delays are happening in the recon pipeline
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 80, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} unit="d" />
              <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(value: number) => [`${value}d`, "Avg Days"]} />
              <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.isWorst ? spyneConsoleTokens.error : spyneConsoleTokens.primary}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Avg Days</TableHead>
              <TableHead className="text-right">Breaches</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((s) => (
              <TableRow
                key={s.stage}
                className={cn(s.stage === worstStage?.stage && spyneComponentClasses.rowError)}
              >
                <TableCell className="font-medium">{s.label}</TableCell>
                <TableCell className="text-right tabular-nums">{s.count}</TableCell>
                <TableCell className="text-right tabular-nums">{s.avgDays.toFixed(1)}d</TableCell>
                <TableCell className="text-right">
                  {s.breachCount > 0 ? (
                    <SpyneChip variant="solid" tone="error" compact>
                      {s.breachCount}
                    </SpyneChip>
                  ) : (
                    <span className="text-sm text-muted-foreground">0</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
