"use client"

import { mockReconVehicles, getReconStageStats } from "@/lib/max-2-mocks"
import type { ReconStage } from "@/services/max-2/max-2.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneChip } from "@/components/max-2/spyne-chip"

const STAGE_ORDER: ReconStage[] = ["inspection", "mechanical", "body", "detail", "photo", "online"]

export function ReconKanban() {
  const stageStats = getReconStageStats()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recon Pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag-style view of every vehicle in reconditioning
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STAGE_ORDER.map((stage) => {
            const stats = stageStats.find((s) => s.stage === stage)!
            const vehicles = mockReconVehicles.filter((v) => v.currentStage === stage)

            return (
              <div key={stage} className="flex flex-col gap-2">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <p className="text-sm font-semibold text-spyne-text">{stats.label}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-spyne-text-secondary">
                    <span>{stats.count} units</span>
                    <span>·</span>
                    <span>{stats.avgDays.toFixed(1)}d avg</span>
                  </div>
                  {stats.breachCount > 0 && (
                    <SpyneChip
                      variant="solid"
                      tone="error"
                      className="mt-2"
                      leading={<MaterialSymbol name="warning" size={14} />}
                    >
                      {stats.breachCount} breach
                    </SpyneChip>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-h-[120px]">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.vin}
                      className={cn(
                        "rounded-lg border border-spyne-border bg-spyne-surface p-3 text-xs shadow-sm",
                        vehicle.slaBreach && cn("border-spyne-error", spyneComponentClasses.rowError)
                      )}
                    >
                      <p className="font-medium truncate">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="flex items-center gap-1 text-spyne-text-secondary">
                          <MaterialSymbol name="schedule" size={16} />
                          {vehicle.daysInRecon.toFixed(1)}d
                        </span>
                        <SpyneChip
                          variant={vehicle.slaBreach ? "solid" : "outline"}
                          tone={vehicle.slaBreach ? "error" : "success"}
                          compact
                        >
                          {vehicle.slaBreach ? "BREACH" : "On Track"}
                        </SpyneChip>
                      </div>
                      <p className="text-spyne-text-secondary mt-2 truncate">
                        {vehicle.assignedTo}
                      </p>
                    </div>
                  ))}
                  {vehicles.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-spyne-text-secondary border border-dashed border-spyne-border rounded-lg">
                      No vehicles
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
