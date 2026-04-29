"use client"

import { mockServiceActionItems } from "@/lib/max-2-mocks"
import type { ActionItemPriority, ActionItemStatus } from "@/services/max-2/max-2.types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { AlertTriangle, CheckCircle, Clock, CircleDot } from "lucide-react"

const priorityConfig: Record<ActionItemPriority, { label: string; className: string; border: string }> = {
  urgent: { label: "Urgent", className: cn("border", spyneComponentClasses.badgeError), border: "border-l-spyne-error" },
  high: { label: "High", className: cn("border", spyneComponentClasses.badgeWarning), border: "border-l-spyne-warning" },
  medium: { label: "Medium", className: cn("border", spyneComponentClasses.badgeInfo), border: "border-l-spyne-info" },
  low: { label: "Low", className: cn("border", spyneComponentClasses.badgeNeutral), border: "border-l-spyne-border" },
}

const statusIcon: Record<ActionItemStatus, typeof AlertTriangle> = {
  overdue: AlertTriangle,
  pending: CircleDot,
  "in-progress": Clock,
  completed: CheckCircle,
}

const statusClassName: Record<ActionItemStatus, string> = {
  overdue: "text-spyne-error",
  pending: "text-spyne-info",
  "in-progress": "text-spyne-warning",
  completed: "text-spyne-success",
}

const categoryLabel: Record<string, string> = {
  "follow-up": "Follow-up",
  approval: "Approval",
  parts: "Parts",
  callback: "Callback",
  warranty: "Warranty",
  inspection: "Inspection",
}

export function ServiceActionItems() {
  const overdue = mockServiceActionItems.filter(a => a.status === "overdue")
  const pending = mockServiceActionItems.filter(a => a.status === "pending" || a.status === "in-progress")

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
              {pending.length} pending &middot; {overdue.length} overdue
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockServiceActionItems
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
                  item.status === "overdue" && spyneComponentClasses.rowError
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
                  <span>Due: <span className={cn("font-medium", item.status === "overdue" ? "text-spyne-error" : "text-foreground")}>{item.dueDate}</span></span>
                  {item.roNumber && <span className="font-mono">{item.roNumber}</span>}
                </div>
              </div>
            )
          })}
      </CardContent>
    </Card>
  )
}
