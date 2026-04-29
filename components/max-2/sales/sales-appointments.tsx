"use client"

import { mockSalesAppointments } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Clock, User, Phone, CalendarCheck } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  arrived: { label: "Arrived", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  completed: { label: "Completed", className: "bg-green-500/10 text-green-700 border-green-200" },
  "no-show": { label: "No-Show", className: "bg-red-500/10 text-red-600 border-red-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-500/10 text-gray-600 border-gray-200" },
}

const typeConfig: Record<string, { label: string; className: string }> = {
  appointment: { label: "Appointment", className: "bg-blue-500/10 text-blue-600 border-blue-200" },
  "test-drive": { label: "Test Drive", className: "bg-violet-500/10 text-violet-600 border-violet-200" },
  delivery: { label: "Delivery", className: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  "fi-signing": { label: "F&I Signing", className: "bg-amber-500/10 text-amber-600 border-amber-200" },
  "be-back": { label: "Be-Back", className: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
}

export function SalesAppointments() {
  const upcoming = mockSalesAppointments.filter(a => a.status === "confirmed" || a.status === "arrived")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Today&apos;s Appointments
        </CardTitle>
        <CardDescription>
          {upcoming.length} upcoming &middot; {mockSalesAppointments.length} total scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockSalesAppointments.map((appt) => {
          const status = statusConfig[appt.status]
          const type = typeConfig[appt.type]
          return (
            <div
              key={appt.id}
              className={cn(
                "rounded-lg border p-4 space-y-2",
                appt.status === "no-show" && "border-red-200 bg-red-50/30",
                appt.status === "completed" && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-bold text-sm">{appt.scheduledTime}</span>
                    <Badge variant="outline" className={cn("text-xs", type.className)}>
                      {type.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{appt.customerName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appt.phone}
                    </span>
                  </div>
                  <p className="text-sm">{appt.vehicleInterest}</p>
                  {appt.notes && (
                    <p className="text-xs text-muted-foreground italic">{appt.notes}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={cn("text-xs", status.className)}>
                    {status.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{appt.salesperson}</span>
                  <span className="text-xs text-muted-foreground">{appt.source}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
