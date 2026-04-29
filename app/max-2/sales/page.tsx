"use client"

import { Suspense } from "react"
import { ConsoleV2SalesExperience } from "@/components/max-2/sales/console-v2-sales-experience"

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <ConsoleV2SalesExperience />
    </Suspense>
  )
}
