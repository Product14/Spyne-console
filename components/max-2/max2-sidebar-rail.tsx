"use client"

import * as React from "react"
import Link from "next/link"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import { max2Classes, spyneComponentClasses } from "@/lib/design-system/max-2"

const railAside =
  "hidden lg:flex h-full min-h-0 flex-col shrink-0 border-r border-spyne-border bg-spyne-surface transition-[width] duration-200 ease-out"

export function Max2SidebarRailDivider({ className }: { className?: string }) {
  return <hr className={cn(spyneComponentClasses.sidebarRailDivider, className)} aria-hidden />
}

export type Max2SidebarRailChildLinkProps = {
  href: string
  label: string
  active: boolean
  onNavigate?: () => void
  className?: string
}

/** Sub-item under a parent with `children` (e.g. Inventory, Lot View) — tokens in `spyne-sidebar-rail__child-*`. */
export function Max2SidebarRailChildLink({
  href,
  label,
  active,
  onNavigate,
  className,
}: Max2SidebarRailChildLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        spyneComponentClasses.sidebarRailChildLink,
        active && spyneComponentClasses.sidebarRailChildLinkActive,
        className
      )}
    >
      {label}
    </Link>
  )
}

export type Max2SidebarRailNavLinkProps = {
  href: string
  label: string
  icon: string
  collapsed: boolean
  active: boolean
  onNavigate?: () => void
  title?: string
  className?: string
}

/**
 * Primary nav cell: **collapsed** = icon (24px) stacked above a short centered label;
 * **expanded** = horizontal row (20px icon + label), 14px medium.
 */
export function Max2SidebarRailNavLink({
  href,
  label,
  icon,
  collapsed,
  active,
  onNavigate,
  className,
}: Max2SidebarRailNavLinkProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        spyneComponentClasses.sidebarRailLink,
        collapsed
          ? spyneComponentClasses.sidebarRailLinkCollapsed
          : spyneComponentClasses.sidebarRailLinkExpanded,
        active ? max2Classes.navActive : "text-spyne-text",
        !active && "hover:bg-spyne-primary-soft/50",
        className
      )}
    >
      <MaterialSymbol name={icon} size={collapsed ? 24 : 20} />
      <span className={cn(collapsed ? spyneComponentClasses.sidebarRailLabelCollapsed : "truncate font-medium")}>
        {label}
      </span>
    </Link>
  )

  if (!collapsed) return link

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{link}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="right"
            sideOffset={10}
            className={cn(
              "z-[200] rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-lg",
              "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
            style={{ background: "#121212" }}
          >
            {label}
            <TooltipPrimitive.Arrow style={{ fill: "#121212" }} width={10} height={5} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export type Max2SidebarRailProps = {
  collapsed: boolean
  onToggleCollapsed: () => void
  headerTitle: string
  toggleCollapseLabel?: string
  toggleExpandLabel?: string
  children: React.ReactNode
  /** Pinned below scrollable nav (e.g. Help). Omit when unused. */
  footer?: React.ReactNode
  className?: string
}

/**
 * Max 2 shell sidebar: narrow **collapsed rail** (icon + label stack, grouped dividers) or **expanded** width.
 * Tokens and layout classes: `spyne-sidebar-rail*` in `app/globals.css`, `spyneComponentClasses.sidebarRail*` in `lib/design-system/max-2.ts`.
 */
export function Max2SidebarRail({
  collapsed,
  onToggleCollapsed,
  headerTitle,
  toggleCollapseLabel = "Collapse sidebar",
  toggleExpandLabel = "Expand sidebar",
  children,
  footer,
  className,
}: Max2SidebarRailProps) {
  return (
    <aside className={cn(railAside, collapsed ? "w-[76px]" : "w-[220px]", className)}>
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-spyne-border",
          collapsed ? "justify-center px-0" : "justify-between px-3"
        )}
      >
        {!collapsed && (
          <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wider text-spyne-text-secondary">
            {headerTitle}
          </span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg text-spyne-text hover:bg-spyne-primary-soft/50"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? toggleExpandLabel : toggleCollapseLabel}
        >
          <MaterialSymbol
            name={collapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
            size={20}
          />
        </Button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <nav
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden",
            collapsed ? "px-1.5 py-2" : "px-2 py-2"
          )}
        >
          {children}
        </nav>
        {footer ? (
          <div
            className={cn(
              "mt-auto border-t border-spyne-border",
              collapsed ? "px-1.5 pb-3 pt-1" : "px-2 pb-3 pt-1"
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </aside>
  )
}
