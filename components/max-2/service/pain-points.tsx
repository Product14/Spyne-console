"use client"

import { mockServicePainPoints } from "@/lib/max-2-mocks"
import type { ServicePainPoint } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

const trendConfig: Record<ServicePainPoint["trend"], { icon: typeof TrendingUp; label: string; className: string }> = {
  rising: { icon: TrendingUp, label: "Rising", className: "text-spyne-error" },
  stable: { icon: Minus, label: "Stable", className: "text-spyne-text-secondary" },
  declining: { icon: TrendingDown, label: "Declining", className: "text-spyne-success" },
}

const sentimentDot: Record<ServicePainPoint["sentiment"], string> = {
  negative: "bg-spyne-error",
  neutral: "bg-spyne-text-secondary",
}

export function PainPoints() {
  const sorted = [...mockServicePainPoints].sort((a, b) => {
    const order: Record<string, number> = { rising: 0, stable: 1, declining: 2 }
    return order[a.trend] - order[b.trend]
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Pain Points</CardTitle>
        <CardDescription>
          What your customers are saying from Vini service conversations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.map((pp) => {
          const trend = trendConfig[pp.trend]
          const TrendIcon = trend.icon
          return (
            <div key={pp.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", sentimentDot[pp.sentiment])} />
                  <span className="font-bold text-sm">{pp.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className={cn("flex items-center gap-1 text-xs font-medium", trend.className)}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    {trend.label}
                  </div>
                  <span className="text-2xl font-bold tracking-tight">{pp.mentionCount}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                {pp.topQuotes.map((q, i) => (
                  <p
                    key={i}
                    className="text-xs italic text-muted-foreground bg-muted/50 rounded-md px-3 py-2"
                  >
                    &ldquo;{q}&rdquo;
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
