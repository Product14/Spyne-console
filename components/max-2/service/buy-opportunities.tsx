"use client"

import { mockServiceBuyOpps } from "@/lib/max-2-mocks"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Car, Gauge } from "lucide-react"

export function BuyOpportunities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service-to-Buy Opportunities</CardTitle>
        <CardDescription>
          Customers in your service drive who are ready to move
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockServiceBuyOpps.map((opp) => (
          <div key={opp.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-sm">{opp.customerName}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Car className="h-3 w-3" />
                    {opp.currentVehicle}
                  </span>
                  <span>{opp.vehicleAge}yr / {opp.mileage.toLocaleString()} mi</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Est. Equity</p>
                <p className="text-lg font-bold text-spyne-success">
                  ${opp.estimatedEquity.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Gauge className="h-3 w-3" />
                RO Total:
              </span>
              <span className="font-semibold">${opp.roTotal.toLocaleString()}</span>
            </div>

            <p className="text-sm italic text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              &ldquo;{opp.buySignal}&rdquo;
            </p>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-foreground">
                <span className="font-medium">Action:</span> {opp.recommendedAction}
              </p>
              <Button size="sm" className="shrink-0 gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Start Conversation
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
