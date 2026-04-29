"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts"
import { mockMarketingChannels } from "@/lib/max-2-mocks"

// ─── Types ───

interface FunnelStage {
  name: string
  count: number
}

interface ConversionRate {
  rate: number
}

// ─── Sub-components ───

const AreaGraph: React.FC<{
  data: { value: number; name: string }[]
  maxValue: number
  fill?: string
  animationDelay?: number
}> = ({ data, maxValue, fill = "#4600F2", animationDelay = 0 }) => (
  <ResponsiveContainer height={82} width="100%">
    <AreaChart
      data={data}
      margin={{ bottom: 0, left: 0, right: 0, top: 5 }}
      syncMethod="index"
    >
      <YAxis domain={[0, maxValue]} hide />
      <Area
        dataKey="value"
        fill={fill}
        stroke="transparent"
        type="monotone"
        isAnimationActive={true}
        animationDuration={500}
        animationBegin={animationDelay}
        animationEasing="linear"
      />
    </AreaChart>
  </ResponsiveContainer>
)

const ConversionChip: React.FC<{
  value: string
  index: number
  color?: string
}> = ({ value, index, color = "#A78BFA" }) => (
  <div
    className="absolute top-[50%] flex translate-y-[50%] items-center justify-center rounded-2xl bg-white px-2 py-1.5 text-xs font-semibold"
    style={{
      left: `${25 + index * 25}%`,
      transform: "translateX(-50%)",
      boxShadow: `0px 0px 82.11px 0px ${color}`,
    }}
  >
    {value}
  </div>
)

const FunnelShimmer: React.FC<{ cardCount?: number }> = ({
  cardCount = 4,
}) => (
  <div className="relative flex h-full w-full justify-between gap-x-4">
    {Array.from({ length: cardCount }).map((_, i) => (
      <div
        key={`shimmer-card-${i}`}
        className="flex h-full w-full animate-pulse flex-col justify-between overflow-hidden rounded-lg bg-gray-100"
      >
        <div className="flex flex-col p-5 pb-8">
          <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
          <div className="h-6 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-16 w-full bg-gray-200" />
      </div>
    ))}
    {Array.from({ length: cardCount - 1 }).map((_, i) => (
      <div
        key={`shimmer-chip-${i}`}
        className="absolute top-[50%] flex translate-y-[50%] animate-pulse items-center justify-center rounded-2xl bg-white p-2"
        style={{
          left: `${25 + i * 25}%`,
          transform: "translateX(-50%)",
          boxShadow: "0px 0px 82.11px 0px #A78BFA",
        }}
      >
        <div className="h-3 w-8 rounded bg-gray-200" />
      </div>
    ))}
  </div>
)

// ─── Build funnel data from marketing channels ───

function buildCampaignFunnel(): {
  stages: FunnelStage[]
  conversionRates: ConversionRate[]
} {
  const totals = mockMarketingChannels.reduce(
    (acc, ch) => ({
      spend: acc.spend + ch.spend,
      leads: acc.leads + ch.leads,
      appointments: acc.appointments + ch.appointments,
      unitsSold: acc.unitsSold + ch.unitsSold,
    }),
    { spend: 0, leads: 0, appointments: 0, unitsSold: 0 },
  )

  const stages: FunnelStage[] = [
    { name: "Impressions", count: Math.round(totals.spend * 12) },
    { name: "Leads", count: totals.leads },
    { name: "Appointments", count: totals.appointments },
    { name: "Units Sold", count: totals.unitsSold },
  ]

  const conversionRates: ConversionRate[] = stages.slice(0, -1).map((s, i) => ({
    rate: Math.round((stages[i + 1].count / s.count) * 1000) / 10,
  }))

  return { stages, conversionRates }
}

// ─── Main Component ───

export function CampaignFunnel({ isLoading = false }: { isLoading?: boolean }) {
  const { stages, conversionRates } = buildCampaignFunnel()
  const maxValue = Math.max(...stages.map((s) => s.count), 1)
  const rates = conversionRates.map((cr) => `${cr.rate}%`)

  const getAreaData = (item: FunnelStage, index: number) => {
    const next = index < stages.length - 1 ? stages[index + 1].count : item.count
    return [
      { value: item.count, name: "" },
      { value: next, name: "" },
    ]
  }

  return (
    <Card className="shadow-none gap-0">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              spyneComponentClasses.kpiIcon,
              "bg-spyne-primary-soft text-spyne-primary",
            )}
          >
            <MaterialSymbol name="filter_alt" size={20} />
          </span>
          <div className="min-w-0">
            <CardTitle>Campaign Funnel</CardTitle>
            <CardDescription>
              Impressions to closed deals — track your marketing pipeline
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <FunnelShimmer cardCount={stages.length} />
        ) : (
          <div className="relative flex w-full justify-between gap-x-4">
            {stages.map((item, index) => (
              <div
                className="flex w-full flex-col justify-between overflow-hidden rounded-lg"
                key={item.name}
                style={{ backgroundColor: "#4600F20F" }}
              >
                <div className="flex flex-col p-5">
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                  <span className="text-xl font-semibold text-gray-700">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                <AreaGraph
                  data={getAreaData(item, index)}
                  maxValue={maxValue}
                  animationDelay={index * 500}
                  fill="#4600F2"
                />
              </div>
            ))}
            {rates.map((rate, index) => (
              <ConversionChip
                key={`conversion-${index}`}
                value={rate}
                index={index}
                color="#A78BFA"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
