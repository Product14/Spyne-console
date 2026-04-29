import type { MerchandisingVehicle } from "@/services/max-2/max-2.types"

/**
 * Demo inventory thumbnails: bundled JPEGs under `public/max-2/demo-vehicles/`
 * (stable front three-quarter style shots). Same-origin so they load offline and when
 * remote CDNs are blocked. Replace with CDN or DMS assets when wired to real data.
 */
const DEMO_VEHICLE_HERO_THUMBNAILS: readonly string[] = [
  "/max-2/demo-vehicles/hero-0.jpg",
  "/max-2/demo-vehicles/hero-1.jpg",
  "/max-2/demo-vehicles/hero-2.jpg",
  "/max-2/demo-vehicles/hero-3.jpg",
  "/max-2/demo-vehicles/hero-4.jpg",
  "/max-2/demo-vehicles/hero-5.jpg",
  "/max-2/demo-vehicles/hero-6.jpg",
  "/max-2/demo-vehicles/hero-7.jpg",
  "/max-2/demo-vehicles/hero-8.jpg",
  "/max-2/demo-vehicles/hero-9.jpg",
  "/max-2/demo-vehicles/hero-10.jpg",
  "/max-2/demo-vehicles/hero-11.jpg",
  "/max-2/demo-vehicles/hero-12.jpg",
  "/max-2/demo-vehicles/hero-13.jpg",
]

function hashToIndex(key: string, modulo: number): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0
  }
  return Math.abs(h) % modulo
}

/** Stable hero thumbnail URL for a VIN or other key (demo / mock data). */
export function demoVehicleThumbnailByKey(key: string): string {
  return DEMO_VEHICLE_HERO_THUMBNAILS[hashToIndex(key, DEMO_VEHICLE_HERO_THUMBNAILS.length)]!
}

/** True when the row has no listing photos (Studio “No photos” issue). */
export function isMerchandisingNoPhotosVehicle(
  v: Pick<MerchandisingVehicle, "mediaStatus">,
): boolean {
  return v.mediaStatus === "no-photos"
}

/**
 * Resolved thumbnail for UI: use API URL when present, otherwise demo hero by VIN.
 */
export function merchandisingDemoThumbnailSrc(v: { vin: string; thumbnailUrl?: string }): string {
  const t = v.thumbnailUrl?.trim()
  if (t) return t
  return demoVehicleThumbnailByKey(v.vin)
}

/** Preset grid for Add Vehicle and other pickers (front three-quarter demo shots). */
export const demoVehicleHeroThumbnailOptions: readonly {
  src: string
  alt: string
  kind: "3d" | "2d"
}[] = DEMO_VEHICLE_HERO_THUMBNAILS.map((src, i) => ({
  src,
  alt: `Demo vehicle front three-quarter ${i + 1}`,
  kind: (i % 3 === 0 ? "3d" : "2d") as "3d" | "2d",
}))
