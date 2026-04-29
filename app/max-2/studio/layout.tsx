import type { ReactNode } from "react"
import { StudioShell } from "@/components/max-2/studio/studio-shell"

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <StudioShell>{children}</StudioShell>
}
