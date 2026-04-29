"use client"

import {
  CustomerSummaryCards,
  CustomerTable,
  RecentActivity,
} from "@/components/max-2/customers"
import { Max2PageSection } from "@/components/max-2/max2-page-section"
import { max2Classes, max2Layout } from "@/lib/design-system/max-2"
import { cn } from "@/lib/utils"

export default function CustomersPage() {
  return (
    <div className={cn(max2Layout.pageStack)}>
      <div>
        <h1 className={max2Classes.pageTitle}>Customers</h1>
        <p className={max2Classes.pageDescription}>
          Every lead, conversation, and opportunity in one place.
        </p>
      </div>

      <Max2PageSection title="Your Customers" description="Pipeline counts and response health.">
        <CustomerSummaryCards />
      </Max2PageSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <CustomerTable />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
