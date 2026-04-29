"use client"

import { mockSalesActionItems } from "@/lib/max-2-mocks"
import type { ActionItemPriority, ActionItemStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Clock, CircleDot } from "lucide-react"

const priorityConfig: Record<ActionItemPriority, { label: string; className: string; border: string }> = {
  urgent: { label: "Urgent", className: "bg-red-500/10 text-red-600 border-red-200", border: "border-l-red-500" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-600 border-amber-200", border: "border-l-amber-500" },
  medium: { label: "Medium", className: "bg-blue-500/10 text-blue-600 border-blue-200", border: "border-l-blue-500" },
  low: { label: "Low", className: "bg-gray-500/10 text-gray-600 border-gray-200", border: "border-l-gray-300" },
}

const statusIcon: Record<ActionItemStatus, typeof AlertTriangle> = {
  overdue: AlertTriangle,
  pending: CircleDot,
  "in-progress": Clock,
  completed: CheckCircle,
}

const statusClassName: Record<ActionItemStatus, string> = {
  overdue: "text-red-500",
  pending: "text-blue-500",
  "in-progress": "text-amber-500",
  completed: "text-emerald-500",
}

const categoryLabel: Record<string, string> = {
  "follow-up": "Follow-up",
  desking: "Desking",
  "trade-appraisal": "Trade Appraisal",
  "credit-app": "Credit App",
  "delivery-prep": "Delivery Prep",
  callback: "Callback",
}

export function SalesActionItems() {
  const overdue = mockSalesActionItems.filter(a => a.status === "overdue")
  const active = mockSalesActionItems.filter(a => a.status !== "completed")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Action Items
              {overdue.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overdue.length} overdue
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {active.length} active items to work
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockSalesActionItems
          .filter(a => a.status !== "completed")
          .sort((a, b) => {
            const order: Record<string, number> = { overdue: 0, pending: 1, "in-progress": 2 }
            const pOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
            return (order[a.status] ?? 9) - (order[b.status] ?? 9) || (pOrder[a.priority] ?? 9) - (pOrder[b.priority] ?? 9)
          })
          .map((item) => {
            const priority = priorityConfig[item.priority]
            const StatusIcon = statusIcon[item.status]
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-lg border border-l-4 p-4 space-y-2",
                  priority.border,
                  item.status === "overdue" && "bg-red-50/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4 shrink-0", statusClassName[item.status])} />
                      <span className="font-semibold text-sm">{item.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant="outline" className={cn("text-xs", priority.className)}>
                      {priority.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {categoryLabel[item.category] ?? item.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Assigned: <span className="font-medium text-foreground">{item.assignedTo}</span></span>
                  <span>Due: <span className={cn("font-medium", item.status === "overdue" ? "text-red-600" : "text-foreground")}>{item.dueDate}</span></span>
                  {item.customerName && <span>Customer: <span className="font-medium text-foreground">{item.customerName}</span></span>}
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
