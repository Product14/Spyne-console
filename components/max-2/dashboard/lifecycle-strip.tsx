"use client"

import Link from "next/link"
import { mockLifecycle } from "@/lib/max-2-mocks"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

const healthDot: Record<string, string> = {
  green: "bg-spyne-success shadow-[0_0_6px] shadow-spyne-success/40",
  yellow: "bg-spyne-warning shadow-[0_0_6px] shadow-spyne-warning/40",
  red: "bg-spyne-error shadow-[0_0_6px] shadow-spyne-error/40",
}

export function LifecycleStrip() {
  return (
    <div className="flex flex-wrap items-stretch gap-0">
      {mockLifecycle.map((node, i) => (
        <div key={node.stage} className="flex items-stretch">
          <Link
            href={node.href}
            className={cn(
              "group relative flex flex-col gap-2 rounded-xl border border-spyne-border bg-card p-4 transition-all",
              "hover:shadow-md hover:border-spyne-primary/30 hover:-translate-y-0.5",
              "w-[170px] min-h-[130px]",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  healthDot[node.health],
                )}
              />
              <span className="text-sm font-semibold leading-tight">
                {node.label}
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-snug flex-1">
              {node.summary}
            </p>

            <div className="flex items-center gap-1.5 mt-auto">
              {node.threats > 0 && (
                <Badge
                  variant="destructive"
                  className="text-[10px] px-1.5 py-0 h-4 font-bold bg-spyne-error"
                >
                  {node.threats} threat{node.threats !== 1 && "s"}
                </Badge>
              )}
              {node.opportunities > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 h-4 font-bold bg-spyne-info hover:bg-spyne-info/90 text-white border-0">
                  {node.opportunities} opp{node.opportunities !== 1 && "s"}
                </Badge>
              )}
            </div>
          </Link>

          {i < mockLifecycle.length - 1 && (
            <div className="flex items-center px-1 text-muted-foreground/40">
              <ChevronRight className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
