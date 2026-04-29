/**
 * ISO 3779 VINs are 17 characters (letters and digits; I, O, Q excluded in positions that use letters).
 * Normalize for display: trim and uppercase.
 */
export function formatVinForDisplay(vin: string): string {
  return vin.trim().toUpperCase()
}
