"use client"

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MediaStatus } from "@/services/max-2/max-2.types"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { Camera, Copy, ImageOff, Image } from "lucide-react"

const statusConfig: Record<MediaStatus, { label: string; icon: typeof Camera; alert?: boolean }> = {
  "real-photos": { label: "Real Photos", icon: Camera },
  "clone-photos": { label: "Clone Photos", icon: Copy },
  "stock-photos": { label: "Stock Photos Only", icon: Image, alert: true },
  "no-photos": { label: "No Photos", icon: ImageOff, alert: true },
}

export function MediaOverview() {
  const total = mockMerchandisingVehicles.length
  const counts = mockMerchandisingVehicles.reduce(
    (acc, v) => {
      acc[v.mediaStatus] = (acc[v.mediaStatus] || 0) + 1
      return acc
    },
    {} as Record<MediaStatus, number>,
  )

  const avgListingScore = Math.round(
    mockMerchandisingVehicles.reduce((s, v) => s + v.listingScore, 0) / total,
  )

  const statuses: MediaStatus[] = ["real-photos", "clone-photos", "stock-photos", "no-photos"]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statuses.map((status) => {
          const config = statusConfig[status]
          const Icon = config.icon
          const count = counts[status] || 0
          const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0"

          return (
            <Card
              key={status}
              className={cn(
                "relative overflow-hidden",
                config.alert && count > 0 && cn("border-spyne-border", spyneComponentClasses.rowError),
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      config.alert && count > 0 ? "text-spyne-error" : "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      config.alert && count > 0 && "text-spyne-error",
                    )}
                  >
                    {count}
                  </span>
                  <span className="text-sm text-muted-foreground">{pct}%</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Listing Score</p>
            <p className="text-xl font-bold">{avgListingScore}/100</p>
          </div>
          <div className="ml-auto h-2 w-32 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                avgListingScore >= 75
                  ? "bg-spyne-success"
                  : avgListingScore >= 50
                    ? "bg-spyne-warning"
                    : "bg-spyne-error",
              )}
              style={{ width: `${avgListingScore}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
