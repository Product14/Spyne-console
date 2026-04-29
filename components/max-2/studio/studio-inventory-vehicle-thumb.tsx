"use client"

import * as React from "react"
import Image from "next/image"
import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"
import { cn } from "@/lib/utils"
import {
  demoVehicleThumbnailByKey,
  isMerchandisingNoPhotosVehicle,
  merchandisingDemoThumbnailSrc,
} from "@/lib/demo-vehicle-hero-images"

/** Bundled asset: car under grey cloth (no listing photos). Bump `v` when replacing the file so browsers pick up changes. */
export const NO_PHOTOS_VEHICLE_PLACEHOLDER_SRC =
  "/max-2/no-photos-vehicle-placeholder.png?v=5" as const

/**
 * Listings with no photos: covered-car artwork (same-origin PNG).
 * Uses a plain `img` with absolute inset + `object-cover` so the image always fills the cell (Next/Image `fill` was leaving letterboxing in some layouts).
 */
export function NoPhotosInventoryThumbPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none relative h-full min-h-0 w-full min-w-0 overflow-hidden bg-muted",
        className,
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset; needs reliable object-fit fill */}
      <img
        src={NO_PHOTOS_VEHICLE_PLACEHOLDER_SRC}
        alt=""
        className="absolute inset-0 block h-full w-full object-cover object-bottom"
        draggable={false}
      />
    </div>
  )
}

/**
 * Renders a vehicle thumbnail with stable layout inside Studio inventory tables.
 * Uses explicit width/height (not aspect-ratio + h-full img) so flex/table cells do not collapse to gray boxes.
 * Rows with {@link MerchandisingVehicle.mediaStatus} `"no-photos"` show a covered-car placeholder instead of a hero image.
 */
export function StudioInventoryVehicleThumb({
  v,
  widthClassName = "w-28",
  heightClassName = "h-14",
  roundedClassName = "rounded-[6px]",
  surfaceClassName = "bg-gray-100",
  sizes = "112px",
  showPhotoCount = false,
  onResolvedSrc,
}: {
  v: MerchandisingVehicle
  widthClassName?: string
  heightClassName?: string
  roundedClassName?: string
  surfaceClassName?: string
  sizes?: string
  showPhotoCount?: boolean
  /** Fires when the displayed image URL changes (e.g. after load error fallback). */
  onResolvedSrc?: (src: string) => void
}) {
  if (isMerchandisingNoPhotosVehicle(v)) {
    return (
      <div
        className={cn(
          "relative min-h-0 shrink-0 overflow-hidden bg-muted",
          roundedClassName,
          widthClassName,
          heightClassName,
        )}
      >
        <NoPhotosInventoryThumbPlaceholder />
      </div>
    )
  }

  const primarySrc = merchandisingDemoThumbnailSrc(v)
  const fallbackSrc = demoVehicleThumbnailByKey(v.vin)
  const [imgSrc, setImgSrc] = React.useState(primarySrc)
  React.useEffect(() => {
    setImgSrc(primarySrc)
  }, [primarySrc])

  React.useEffect(() => {
    onResolvedSrc?.(imgSrc)
  }, [imgSrc, onResolvedSrc])

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        surfaceClassName,
        roundedClassName,
        widthClassName,
        heightClassName,
      )}
    >
      <Image
        src={imgSrc}
        alt=""
        fill
        sizes={sizes}
        className="object-cover object-center"
        unoptimized
        onError={() => {
          setImgSrc((cur) => {
            if (cur === "/max-2/vehicle-thumbnail-empty.png") return cur
            return cur !== fallbackSrc ? fallbackSrc : "/max-2/vehicle-thumbnail-empty.png"
          })
        }}
      />
      {showPhotoCount && v.photoCount > 0 ? (
        <span className="absolute bottom-0.5 right-0.5 z-[1] rounded bg-white/90 px-1 text-[10px] font-semibold tabular-nums text-gray-700 shadow-sm">
          {v.photoCount}
        </span>
      ) : null}
    </div>
  )
}
