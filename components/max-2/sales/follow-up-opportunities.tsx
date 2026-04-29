"use client"

import { mockFollowUps } from "@/lib/max-2-mocks"
import type { FollowUpOpportunity } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Phone } from "lucide-react"

const priorityBorder: Record<FollowUpOpportunity["priority"], string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
}

const priorityBadge: Record<FollowUpOpportunity["priority"], { label: string; className: string }> = {
  high: { label: "High", className: "bg-red-500/10 text-red-600 border-red-200" },
  medium: { label: "Medium", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  low: { label: "Low", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
}

export function FollowUpOpportunities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow-Up Opportunities</CardTitle>
        <CardDescription>
          Don&apos;t let these slip — you have a follow-up problem, not a lead problem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockFollowUps.map((f) => {
          const badge = priorityBadge[f.priority]
          return (
            <div
              key={f.id}
              className={cn(
                "rounded-lg border border-l-4 p-4 flex flex-col gap-2",
                priorityBorder[f.priority]
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{f.customerName}</span>
                    <Badge variant="outline" className={badge.className}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Interested in: {f.vehicleInterest}
                  </p>
                </div>
                <Button size="sm" className="shrink-0 gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  Follow Up Now
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Last contact: {f.lastContact}</span>
                <span className="text-foreground">{f.reason}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
