"use client"

import { mockServiceBays } from "@/lib/max-2-mocks"
import type { BayStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Wrench, CheckCircle, XCircle } from "lucide-react"

const bayStatusConfig: Record<BayStatus, { color: string; bg: string; border: string; icon: typeof Wrench }> = {
  occupied: { color: "text-spyne-info", bg: "bg-spyne-primary-soft", border: "border-spyne-border", icon: Wrench },
  available: { color: "text-spyne-success", bg: "spyne-row-positive", border: "border-spyne-border", icon: CheckCircle },
  "out-of-service": { color: "text-spyne-error", bg: "spyne-row-error", border: "border-spyne-border", icon: XCircle },
}

const bayTypeLabel: Record<string, string> = {
  general: "General",
  express: "Express",
  alignment: "Alignment",
  body: "Body",
  detail: "Detail",
}

export function ServiceBayStatus() {
  const occupied = mockServiceBays.filter(b => b.status === "occupied").length
  const available = mockServiceBays.filter(b => b.status === "available").length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Bays</CardTitle>
            <CardDescription>
              {occupied} occupied &middot; {available} available &middot; {mockServiceBays.length} total
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mockServiceBays.map((bay) => {
            const config = bayStatusConfig[bay.status]
            const Icon = config.icon
            return (
              <div
                key={bay.id}
                className={cn(
                  "rounded-lg border-2 p-3 space-y-2",
                  config.border, config.bg
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("font-bold text-sm", config.color)}>{bay.bayNumber}</span>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <p className="text-xs text-muted-foreground">{bayTypeLabel[bay.type]}</p>
                {bay.status === "occupied" && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium truncate">{bay.currentVehicle}</p>
                    <p className="text-xs text-muted-foreground">Tech: {bay.technician}</p>
                    <p className="text-xs text-muted-foreground">
                      RO: <span className="font-mono">{bay.currentRO}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ETC: {bay.estimatedCompletion}
                    </p>
                  </div>
                )}
                {bay.status === "available" && (
                  <p className="text-xs font-medium text-spyne-success">Ready</p>
                )}
                {bay.status === "out-of-service" && (
                  <p className="text-xs font-medium text-spyne-error">Unavailable</p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
