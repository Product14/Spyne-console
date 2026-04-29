"use client"

import { useState } from "react"
import { mockInsightPresets } from "@/lib/max-2-mocks"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"
import { Send } from "lucide-react"

const categoryStyle: Record<string, string> = {
  service: cn("border", spyneComponentClasses.badgeWarning),
  sales: cn("border", spyneComponentClasses.badgeInfo),
  inventory: cn("border", spyneComponentClasses.badgeNeutral, "text-spyne-primary bg-spyne-primary-soft"),
  market: cn("border", spyneComponentClasses.badgeSuccess),
}

export function InsightsBlock() {
  const [query, setQuery] = useState("")

  return (
    <div className="max2-insights-card-shell">
      <Card
        className={cn(
          "max2-insights-card-inner relative isolate overflow-hidden border-0 py-5 shadow-none gap-4",
        )}
      >
        <div className="max2-insights-card-glow" aria-hidden />

        <CardHeader className="relative z-10 pb-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-spyne-border">
              {/* Insights AI mark — decorative; title provides the accessible name */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/max-2/insights-icon.png"
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
                aria-hidden
              />
            </div>
            <div>
              <CardTitle>Insights</CardTitle>
              <CardDescription className="text-xs">
                Ask your dealership
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mockInsightPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setQuery(preset.question)}
                className={cn(
                  "flex flex-col gap-2 rounded-[8px] border border-spyne-border bg-spyne-surface/80 p-3 text-left backdrop-blur-sm transition-all",
                  "hover:-translate-y-0.5 hover:border-spyne-primary/40 hover:shadow-sm",
                )}
              >
                <Badge
                  variant="outline"
                  className={cn("w-fit text-[10px]", categoryStyle[preset.category])}
                >
                  {preset.category}
                </Badge>
                <span className="text-xs leading-snug text-foreground/90">
                  {preset.question}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your dealership..."
                className="border-spyne-border bg-card/80 pr-4 backdrop-blur-sm"
              />
            </div>
            <Button
              size="icon"
              className="h-10 w-10 shrink-0 rounded-lg bg-spyne-primary text-white shadow-md hover:bg-[var(--spyne-primary-hover)]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
