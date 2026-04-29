"use client"

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { spyneConsoleTokens } from "@/lib/design-system/max-2"

const BUCKETS = [
  { range: "0–25", min: 0, max: 25, color: spyneConsoleTokens.error },
  { range: "26–50", min: 26, max: 50, color: spyneConsoleTokens.warningInk },
  { range: "51–75", min: 51, max: 75, color: spyneConsoleTokens.warning },
  { range: "76–100", min: 76, max: 100, color: spyneConsoleTokens.success },
]

export function ListingScoreChart() {
  const data = BUCKETS.map((b) => ({
    range: b.range,
    count: mockMerchandisingVehicles.filter(
      (v) => v.listingScore >= b.min && v.listingScore <= b.max,
    ).length,
    color: b.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`${value} vehicles`, "Count"]}
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
