"use client"

import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import {
  Car, Wrench, Truck, CalendarClock, Percent, DollarSign,
  AlertTriangle, EyeOff, ImageOff,
} from "lucide-react"

interface StatItem {
  label: string
  value: string
  icon: React.ReactNode
  color?: "red" | "amber"
  condition?: boolean
}

const fmt$ = (n: number) => `$${n.toLocaleString()}`

export function LotSummary() {
  const { lotSummary: s } = useHoldingCostRateOptional()

  const stats: StatItem[] = [
    { label: "Total Units", value: String(s.totalUnits), icon: <Car className="h-4 w-4" /> },
    { label: "Frontline Ready", value: String(s.frontlineReady), icon: <Car className="h-4 w-4" /> },
    { label: "In Recon", value: String(s.inRecon), icon: <Wrench className="h-4 w-4" /> },
    { label: "Arriving", value: String(s.arriving), icon: <Truck className="h-4 w-4" /> },
    { label: "Avg Days in Stock", value: `${s.avgDaysInStock.toFixed(1)}d`, icon: <CalendarClock className="h-4 w-4" /> },
    { label: "Avg C2M%", value: `${s.avgCostToMarket.toFixed(1)}%`, icon: <Percent className="h-4 w-4" /> },
    { label: "Daily Holding Cost", value: fmt$(s.totalHoldingCostToday), icon: <DollarSign className="h-4 w-4" /> },
    { label: "Aged 45+", value: String(s.aged45Plus), icon: <AlertTriangle className="h-4 w-4" />, color: "red", condition: s.aged45Plus > 0 },
    { label: "No Leads 5+ Days", value: String(s.noLeads5Days), icon: <EyeOff className="h-4 w-4" />, color: "amber", condition: s.noLeads5Days > 0 },
    { label: "No Photos", value: String(s.noPhotos), icon: <ImageOff className="h-4 w-4" />, color: "amber", condition: s.noPhotos > 0 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lot Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((item) => {
            const isAlert = item.condition
            const bgClass = isAlert
              ? item.color === "red"
                ? "spyne-row-error border-spyne-border"
                : "spyne-row-warn border-spyne-border"
              : "bg-muted/40 border-transparent"
            const iconBg = isAlert
              ? item.color === "red"
                ? cn("border", spyneComponentClasses.badgeError)
                : cn("border", spyneComponentClasses.badgeWarning)
              : "bg-muted text-muted-foreground"
            const valueColor = isAlert
              ? item.color === "red"
                ? "text-spyne-error"
                : "text-spyne-text"
              : ""

            return (
              <div
                key={item.label}
                className={cn("rounded-lg border p-3 flex flex-col gap-1.5", bgClass)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("rounded-md p-1.5", iconBg)}>{item.icon}</div>
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                </div>
                <span className={cn("text-xl font-bold tracking-tight", valueColor)}>
                  {item.value}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
