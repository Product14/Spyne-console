"use client"

import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  CheckCircle2, Clock, AlertTriangle, CircleDollarSign,
} from "lucide-react"

interface AgeBand {
  key: string
  label: string
  range: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  description: string
  filter: (v: MerchandisingVehicle) => boolean
}

const ageBands: AgeBand[] = [
  {
    key: "0-4",
    label: "On Track",
    range: "0–4 days",
    icon: CheckCircle2,
    color: "text-spyne-success",
    bgColor: spyneComponentClasses.rowPositive,
    borderColor: "border-spyne-border",
    textColor: "text-spyne-success",
    description: "Vehicles listed within the 4-day target window.",
    filter: (v) => v.daysInStock >= 0 && v.daysInStock <= 4,
  },
  {
    key: "5-30",
    label: "Active",
    range: "5–30 days",
    icon: Clock,
    color: "text-spyne-primary",
    bgColor: "bg-spyne-primary-soft",
    borderColor: "border-spyne-border",
    textColor: "text-spyne-primary",
    description: "Normal aging — actively marketed.",
    filter: (v) => v.daysInStock >= 5 && v.daysInStock <= 30,
  },
  {
    key: "31-45",
    label: "Needs Attention",
    range: "31–45 days",
    icon: AlertTriangle,
    color: "text-spyne-text",
    bgColor: spyneComponentClasses.rowWarn,
    borderColor: "border-spyne-border",
    textColor: "text-spyne-text",
    description: "Re-check pricing and merchandising quality. Consider a re-photoshoot.",
    filter: (v) => v.daysInStock >= 31 && v.daysInStock <= 45,
  },
  {
    key: "45+",
    label: "Needs Discount",
    range: "45+ days",
    icon: CircleDollarSign,
    color: "text-spyne-error",
    bgColor: spyneComponentClasses.rowError,
    borderColor: "border-spyne-border",
    textColor: "text-spyne-error",
    description: "Add discount to accelerate the sale. Review for wholesale candidacy.",
    filter: (v) => v.daysInStock > 45,
  },
]

interface AgingBreakdownProps {
  vehicles?: MerchandisingVehicle[]
}

export function AgingBreakdown({ vehicles }: AgingBreakdownProps) {
  const data = vehicles ?? mockMerchandisingVehicles

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Age Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ageBands.map((band) => {
            const Icon = band.icon
            const count = data.filter(band.filter).length
            return (
              <div
                key={band.key}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  band.borderColor,
                  band.bgColor,
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("h-4 w-4", band.color)} />
                  <span className={cn("text-xs font-semibold", band.textColor)}>{band.label}</span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className={cn("text-2xl font-bold", band.color)}>{count}</span>
                  <span className="text-xs text-muted-foreground">vehicles</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {band.range}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {band.description}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
