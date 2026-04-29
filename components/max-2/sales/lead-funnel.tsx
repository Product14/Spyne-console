"use client"

import { mockLeadFunnel } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const COLORS = [
  "hsl(215, 70%, 85%)",
  "hsl(215, 70%, 73%)",
  "hsl(215, 70%, 61%)",
  "hsl(215, 70%, 49%)",
  "hsl(215, 70%, 37%)",
  "hsl(215, 70%, 25%)",
]

export function LeadFunnel() {
  const data = mockLeadFunnel.map((s, i) => ({
    ...s,
    nextRate:
      i < mockLeadFunnel.length - 1
        ? ((mockLeadFunnel[i + 1].count / s.count) * 100).toFixed(1) + "%"
        : "—",
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Funnel</CardTitle>
        <CardDescription>Website visits to closed deals — where are you losing people?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="stage"
                width={130}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => value.toLocaleString()}
                labelStyle={{ fontWeight: 600 }}
                contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {data.map((s, i) => (
            <div
              key={s.stage}
              className={cn(
                "rounded-lg border p-3 text-center",
                i === data.length - 1 && "ring-2 ring-primary/30"
              )}
            >
              <p className="text-xs text-muted-foreground truncate">{s.stage}</p>
              <p className="text-xl font-bold tracking-tight">{s.count.toLocaleString()}</p>
              {i < data.length - 1 && (
                <p className="text-xs text-muted-foreground mt-1">→ {s.nextRate}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
