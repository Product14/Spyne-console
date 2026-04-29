"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { SpyneLineTab, SpyneLineTabBadge, SpyneLineTabStrip } from '@/components/max-2/spyne-line-tabs'
import { max2Classes, spyneLineTabLeadingIconSize } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'overview',      label: 'Overview',     symbol: 'dashboard',       badge: null },
  { id: 'campaigns',     label: 'Campaigns',    symbol: 'campaign',        badge: 4   },
  { id: 'action-items',  label: 'Action Items', symbol: 'checklist',       badge: 6   },
  { id: 'appointments',  label: 'Appointments', symbol: 'event_available', badge: 3   },
  { id: 'customers',     label: 'Leads',        symbol: 'group',           badge: null },
]

const SERVICE_NAV_ITEMS = NAV_ITEMS.map((item) =>
  item.id === 'customers' ? { ...item, label: 'Customers' } : item
)

export default function SecondaryNav({ activePage, onPageChange, navLeftPx = 220, embedded = false, department = 'sales' }) {
  const navItems = department === 'service' ? SERVICE_NAV_ITEMS : NAV_ITEMS
  if (embedded) {
    return (
      <div className={cn(max2Classes.moduleSecondaryNavShell)}>
        <div className="min-w-0 w-full px-max2-page">
          <SpyneLineTabStrip embedded className="min-h-0 w-full min-w-0">
            {navItems.map((item) => {
              const active = activePage === item.id
              return (
                <SpyneLineTab
                  key={item.id}
                  active={active}
                  onClick={() => onPageChange(item.id)}
                  aria-current={active ? 'page' : undefined}
                >
                  <MaterialSymbol name={item.symbol} size={spyneLineTabLeadingIconSize} className="text-current" />
                  {item.label}
                  {item.badge != null ? <SpyneLineTabBadge>{item.badge}</SpyneLineTabBadge> : null}
                </SpyneLineTab>
              )
            })}
          </SpyneLineTabStrip>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed right-0 z-20 flex min-h-11 items-end bg-spyne-surface transition-all duration-200"
      style={{
        top: 56,
        left: navLeftPx,
      }}
    >
      <div className="min-w-0 flex-1 px-max2-page">
        <SpyneLineTabStrip embedded className="min-h-11 w-full">
          {navItems.map((item) => {
            const active = activePage === item.id
            return (
              <SpyneLineTab
                key={item.id}
                active={active}
                onClick={() => onPageChange(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                <MaterialSymbol name={item.symbol} size={spyneLineTabLeadingIconSize} className="text-current" />
                {item.label}
                {item.badge != null ? <SpyneLineTabBadge>{item.badge}</SpyneLineTabBadge> : null}
              </SpyneLineTab>
            )
          })}
        </SpyneLineTabStrip>
      </div>
    </div>
  )
}
