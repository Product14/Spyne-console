"use client"

import { mockServiceLaneOpps } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

export function ServiceLaneOpps() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service-Lane Acquisitions</CardTitle>
        <p className="text-sm text-spyne-text-secondary">
          Customers in your service drive with vehicles you can acquire
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {mockServiceLaneOpps.map((opp) => (
            <div
              key={opp.id}
              className="rounded-lg border border-spyne-border bg-spyne-surface p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <MaterialSymbol name="person" size={20} className="text-spyne-text-secondary" />
                    <span className="font-semibold text-sm text-spyne-text">{opp.customerName}</span>
                  </div>
                  <p className="text-sm text-spyne-text-secondary">{opp.currentVehicle}</p>
                  <div className="flex items-center gap-1 text-xs text-spyne-text-secondary">
                    <MaterialSymbol name="build" size={16} />
                    RO: ${opp.roAmount.toLocaleString()}
                  </div>
                  <p className="text-sm italic text-spyne-text-secondary mt-2">
                    &ldquo;{opp.buySignal}&rdquo;
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs text-spyne-text-secondary">Est. Equity</span>
                  <span className="flex items-center gap-1 text-xl font-semibold text-spyne-success tabular-nums">
                    <MaterialSymbol name="payments" size={20} />
                    {opp.estimatedEquity.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
