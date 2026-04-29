"use client"

import type { MerchandisingVehicle, StudioMediaAssetStage } from "@/services/max-2/max-2.types"
import type { SpyneChipTone } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"
import { resolveStudioMediaPipeline } from "@/lib/studio-media-pipeline"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { SpyneChip } from "@/components/max-2/spyne-ui"

const MEDIA_ICONS = {
  images: "image",
  spin360: "360",
  video: "videocam",
} as const

function stageToneAndLabel(stage: StudioMediaAssetStage): { label: string; tone: SpyneChipTone } {
  if (stage === "draft") return { label: "Draft", tone: "neutral" }
  if (stage === "review") return { label: "Review", tone: "warning" }
  if (stage === "processing") return { label: "Processing", tone: "info" }
  return { label: "Processed", tone: "success" }
}

function MediaTypeStatusChip({
  mediaKey,
  stage,
}: {
  mediaKey: keyof typeof MEDIA_ICONS
  stage: StudioMediaAssetStage
}) {
  const { label, tone } = stageToneAndLabel(stage)

  return (
    <SpyneChip
      variant="outline"
      tone={tone}
      compact
      className="w-max max-w-full min-w-0"
      leading={<MaterialSymbol name={MEDIA_ICONS[mediaKey]} size={14} className="text-current" />}
    >
      {label}
    </SpyneChip>
  )
}

const ROW_KEYS = ["images", "spin360", "video"] as const

export function MerchandisingMediaPipelineCell({
  vehicle,
  className,
}: {
  vehicle: MerchandisingVehicle
  className?: string
}) {
  const p = resolveStudioMediaPipeline(vehicle)

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {ROW_KEYS.map((key) => (
        <MediaTypeStatusChip key={key} mediaKey={key} stage={p[key]} />
      ))}
    </div>
  )
}
