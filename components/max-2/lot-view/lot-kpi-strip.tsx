"use client"

import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import {
  computeLotOverviewKpis,
  getLotOverviewActiveVehicles,
  lotHoldingResolutionLines,
} from "@/lib/lot-overview-metrics"
import { useHoldingCostRateOptional } from "@/components/max-2/holding-cost-rate-context"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { SpyneDarkTooltipPanel } from "@/components/max-2/spyne-ui"
import {
  SpyneRoiKpiDispositionPanel,
  SpyneRoiKpiMetricCell,
  SpyneRoiKpiStrip,
} from "@/components/max-2/spyne-roi-kpi-strip"

const fmt$ = (n: number) => `$${n.toLocaleString()}`

type Status = "good" | "watch" | "bad"

export function LotKPIStrip({ showHoldingCost = true }: { showHoldingCost?: boolean }) {
  const { vehicles: lotVehicles } = useHoldingCostRateOptional()
  const activeVehicles = getLotOverviewActiveVehicles(lotVehicles)
  const {
    total,
    frontlineCount,
    wholesaleCount,
    newCount,
    preOwnedCount,
    mtdCost,
    dailyCost,
    totalGrossMargin,
    avgDays,
    aged45,
  } = computeLotOverviewKpis(lotVehicles)

  const frontlinePct = total > 0 ? frontlineCount / total : 0
  const daysStatus: Status = avgDays < 20 ? "good" : avgDays < 30 ? "watch" : "bad"
  const readyStatus: Status = frontlinePct >= 0.55 ? "good" : frontlinePct >= 0.4 ? "watch" : "bad"

  const cols = showHoldingCost ? "lg:grid-cols-5" : "lg:grid-cols-4"

  return (
    <SpyneRoiKpiStrip gridClassName={`grid grid-cols-1 sm:grid-cols-2 ${cols} divide-y lg:divide-y-0 lg:divide-x`}>
      <SpyneRoiKpiMetricCell
        label="Total Units"
        value={String(total)}
        status="good"
        sub={`${newCount} new · ${preOwnedCount} pre-owned`}
      />

      <SpyneRoiKpiMetricCell
        label="Frontline Ready"
        value={String(frontlineCount)}
        status={readyStatus}
        sub={`${(frontlinePct * 100).toFixed(0)}% of lot available`}
      />

      <SpyneRoiKpiDispositionPanel vehicles={activeVehicles} />

      <SpyneRoiKpiMetricCell
        label="Avg Days in Stock"
        value={`${avgDays.toFixed(1)}d`}
        status={daysStatus}
        sub={aged45 > 0 ? `${aged45} cars past 45-day mark` : "All within healthy range"}
      />

      {showHoldingCost && (
        <TooltipPrimitive.Provider delayDuration={250}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <div className="min-w-0 w-full cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary/25">
                <SpyneRoiKpiMetricCell
                  label="Holding cost"
                  value={fmt$(mtdCost)}
                  status="watch"
                  sub={`${fmt$(dailyCost)}/day`}
                  valueClassName="text-spyne-error"
                />
              </div>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                align="center"
                sideOffset={8}
                className={spyneComponentClasses.darkTooltipRadixContent}
              >
                <SpyneDarkTooltipPanel
                  title="Suggested actions"
                  lines={lotHoldingResolutionLines(activeVehicles)}
                />
                <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      )}
    </SpyneRoiKpiStrip>
  )
}
