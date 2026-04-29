"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SpyneLineTabBadge, SpyneLineTabStrip } from "@/components/max-2/spyne-line-tabs"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { spyneComponentClasses, spyneLineTabLeadingIconSize } from "@/lib/design-system/max-2"
import { isStudioInventoryNavTabActive, STUDIO_INVENTORY_NAV_ITEMS } from "@/lib/studio-inventory-nav"
import { cn } from "@/lib/utils"

/** Shared underline tab row for Studio inventory (secondary nav strip). */
export function StudioInventoryLineTabs({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <SpyneLineTabStrip
      embedded
      className={cn("min-h-0 w-full min-w-0 !mb-0", className)}
      style={{ marginBottom: 0 }}
    >
      {STUDIO_INVENTORY_NAV_ITEMS.map((item) => {
        const active = isStudioInventoryNavTabActive(pathname, item.href, item.exact)
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            className={cn(
              spyneComponentClasses.lineTab,
              active && spyneComponentClasses.lineTabActive,
              "no-underline",
            )}
          >
            <MaterialSymbol name={item.symbol} size={spyneLineTabLeadingIconSize} className="text-current" />
            {item.label}
            {item.badge != null ? <SpyneLineTabBadge>{item.badge}</SpyneLineTabBadge> : null}
          </Link>
        )
      })}
    </SpyneLineTabStrip>
  )
}
