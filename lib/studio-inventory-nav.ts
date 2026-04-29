import { mockMerchandisingVehicles } from "@/lib/max-2-mocks"

const inventoryVehicleCount = mockMerchandisingVehicles.length

export const studioInventoryNavVehicleCount = inventoryVehicleCount

/** Inventory module secondary tabs (URL-based); shared by `StudioSecondaryNav` and vehicle display unified chrome. */
export const STUDIO_INVENTORY_NAV_ITEMS: readonly {
  href: string
  label: string
  symbol: string
  exact: boolean
  badge: number | null
}[] = [
  { href: "/max-2/studio", label: "Merchandising", symbol: "inventory", exact: true, badge: null },
  {
    href: "/max-2/studio/media-lot",
    label: "Lot Overview",
    symbol: "directions_car",
    exact: false,
    badge: null,
  },
  {
    href: "/max-2/studio/inventory",
    label: "Active Inventory",
    symbol: "inventory_2",
    exact: false,
    badge: inventoryVehicleCount,
  },
  { href: "/max-2/studio/sold-inventory", label: "Sold Inventory", symbol: "sell", exact: true, badge: null },
  { href: "/max-2/studio/add", label: "Add Media", symbol: "post_add", exact: true, badge: null },
]

export function isStudioInventoryNavTabActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
