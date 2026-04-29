"use client"

import { Suspense } from "react"
import { ConsoleV2ServiceExperience } from "@/components/max-2/service/console-v2-service-experience"

export default function ServicePage() {
  return (
    <Suspense fallback={null}>
      <ConsoleV2ServiceExperience />
    </Suspense>
  )
}
