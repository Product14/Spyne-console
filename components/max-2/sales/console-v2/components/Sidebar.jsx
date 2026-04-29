"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

const navItems = [
  { icon: 'dashboard',      label: 'Dashboard',         active: false },
  // { icon: 'search',        label: 'Sourcing',           active: false },
  // { icon: 'timer',         label: 'Inspection & Recon', active: false },
  { icon: 'photo_camera',   label: 'Merchandising',      active: false },
  { icon: 'campaign',       label: 'Marketing',          active: false },
  { icon: 'shopping_cart',  label: 'Sales',              active: true  },
  { icon: 'build',          label: 'Service',            active: false },
  { icon: 'directions_car', label: 'Lot View',           active: false },
  { icon: 'group',          label: 'Customers',          active: false },
]

const helpNavItem = { icon: 'help', label: 'Help', active: false }

/** Compact black rail tooltips — tight radius, high contrast, subtle lift */
const SIDEBAR_TT_BG = '#141414'
const SIDEBAR_TT_FG = '#FFFFFF'

function SidebarTooltipPanel({ children }) {
  return (
    <TooltipPrimitive.Content
      side="right"
      align="center"
      sideOffset={6}
      collisionPadding={12}
      className="z-[200] select-none max-w-[min(260px,calc(100vw-40px))] text-left text-balance antialiased data-[state=delayed-open]:animate-none data-[state=instant-open]:animate-none"
      style={{
        background: SIDEBAR_TT_BG,
        color: SIDEBAR_TT_FG,
        borderRadius: 4,
        padding: '7px 12px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.35,
        letterSpacing: '0.02em',
        boxShadow:
          '0 4px 14px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'none',
        animation: 'none',
        animationDuration: '0ms',
      }}
    >
      {children}
    </TooltipPrimitive.Content>
  )
}

function SidebarNavItem({ item, collapsed }) {
  const button = (
    <button
      type="button"
      className="w-full flex items-center rounded-lg transition-colors cursor-pointer"
      style={{
        gap: 12,
        padding: collapsed ? '10px 8px' : '8px 12px',
        justifyContent: collapsed ? 'center' : undefined,
        background: item.active ? 'var(--spyne-brand-subtle)' : 'transparent',
        color: item.active ? 'var(--spyne-brand)' : 'var(--spyne-text-secondary)',
        fontWeight: item.active ? 600 : 400,
        fontSize: 14,
        border: 'none',
      }}
      aria-label={item.label}
    >
      <MaterialSymbol name={item.icon} size={16} className="shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </button>
  )

  if (!collapsed) return button

  return (
    <TooltipPrimitive.Root delayDuration={0}>
      <TooltipPrimitive.Trigger asChild>{button}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <SidebarTooltipPanel>{item.label}</SidebarTooltipPanel>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col z-40 transition-[width] duration-200"
      style={{
        width: collapsed ? 60 : 220,
        background: 'var(--spyne-surface)',
        borderRight: '1px solid var(--spyne-border)',
      }}
    >
      {/* Header row: Spyne logo + "Vini AI" label + collapse toggle */}
      <div
        className="flex items-center h-14 shrink-0 px-3"
        style={{
          borderBottom: '1px solid var(--spyne-border)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/spyne-logo.png"
            alt="Spyne"
            style={{ height: 26, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
          />
          {!collapsed && (
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--spyne-text-primary)' }}>
              Vini AI
            </span>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center rounded-md transition-colors cursor-pointer shrink-0"
            style={{ width: 28, height: 28, background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
            aria-label="Collapse sidebar"
          >
            <MaterialSymbol name="left_panel_close" size={16} />
          </button>
        )}
      </div>

      {/* Nav + collapsed tooltips share one provider for instant hover (no stacked delays) */}
      <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={0}>
        <div className="flex flex-1 min-h-0 flex-col">
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
            {navItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} collapsed={collapsed} />
            ))}
          </nav>

          <div
            className="shrink-0 px-3 pb-3 pt-2"
            style={{ borderTop: '1px solid var(--spyne-border)' }}
          >
            <SidebarNavItem item={helpNavItem} collapsed={collapsed} />
          </div>

          {collapsed && (
            <div className="p-2 shrink-0" style={{ borderTop: '1px solid var(--spyne-border)' }}>
              <TooltipPrimitive.Root delayDuration={0}>
                <TooltipPrimitive.Trigger asChild>
                  <button
                    type="button"
                    onClick={onToggle}
                    className="w-full flex items-center justify-center rounded-md transition-colors cursor-pointer"
                    style={{ height: 32, background: 'transparent', border: 'none', color: 'var(--spyne-text-muted)' }}
                    aria-label="Expand sidebar"
                  >
                    <MaterialSymbol name="left_panel_open" size={16} />
                  </button>
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <SidebarTooltipPanel>Expand sidebar</SidebarTooltipPanel>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            </div>
          )}
        </div>
      </TooltipPrimitive.Provider>
    </aside>
  )
}
