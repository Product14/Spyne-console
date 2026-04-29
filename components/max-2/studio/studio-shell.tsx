"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import StudioSecondaryNav from "@/components/max-2/studio/console-v2/components/StudioSecondaryNav"
import { max2Classes } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

function isStudioVehicleDisplayPathname(pathname: string): boolean {
  const n = pathname.replace(/\/$/, "") || "/"
  return /\/max-2\/studio\/inventory\/vehicle\/[^/]+$/.test(n)
}

/**
 * Studio shell: secondary nav + padded module body. On the vehicle display route the line tabs
 * and vehicle title are merged in {@link VehicleDisplayPage}, so the standalone nav is omitted
 * and the module body has no horizontal or top inset.
 */
export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isVehicleDisplay = isStudioVehicleDisplayPathname(pathname)

  return (
    <div className="min-w-0">
      {!isVehicleDisplay ? <StudioSecondaryNav /> : null}
      <div
        className={cn(
          "min-w-0",
          isVehicleDisplay ? "mt-0 px-0 pb-6 pt-0" : max2Classes.moduleSecondaryNavPageBodyStudio,
        )}
      >
        {children}
      </div>
    </div>
  )
}
