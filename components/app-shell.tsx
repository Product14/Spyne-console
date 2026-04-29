"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Zap, ChevronDown, User } from "lucide-react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

const retailIndigo = "#302667"
const retailMuted = "#9E9E9E"

const navigation = [
  {
    name: "Max 2.0",
    href: "/max-2",
    icon: Zap,
    description: "Flywheel-driven dealer console",
  },
]

type RooftopOption = { id: string; name: string }

type WebsiteOption = { id: string; label: string; href: string }

/** Current enterprise (one at a time); swap via auth/context when wired. */
const ENTERPRISE_NAME = "Mega Dealer"

/** Dealer-facing sites; replace with API when wired. */
const WEBSITE_OPTIONS: WebsiteOption[] = [
  { id: "main", label: "Main website", href: "https://example.com" },
  { id: "inventory", label: "Inventory site", href: "https://example.com/inventory" },
  { id: "service", label: "Service booking", href: "https://example.com/service" },
]

/** Rooftops for the active enterprise; replace with API when wired. */
const ROOFTOP_OPTIONS: RooftopOption[] = [
  { id: "ford-sec-48", name: "Ford Sec 48" },
  { id: "chevy-ave-12", name: "Chevy Ave 12" },
  { id: "lincoln-row", name: "Lincoln Row 3" },
]

interface AppShellProps {
  children: React.ReactNode
  statsChips?: React.ReactNode
}

export function AppShell({ children, statsChips }: AppShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [rooftopId, setRooftopId] = React.useState(ROOFTOP_OPTIONS[0]!.id)
  const [rooftopMenuOpen, setRooftopMenuOpen] = React.useState(false)
  const [websiteMenuOpen, setWebsiteMenuOpen] = React.useState(false)
  const isMax2 = pathname.startsWith("/max-2")

  const selectedRooftop = React.useMemo(
    () => ROOFTOP_OPTIONS.find((r) => r.id === rooftopId) ?? ROOFTOP_OPTIONS[0]!,
    [rooftopId]
  )

  const BrandBlock = ({ className }: { className?: string }) => (
    <Link
      href="/max-2"
      aria-label="Retail Suite by spyne"
      className={cn("flex items-center gap-1.5 min-w-0", className)}
      onClick={() => setMobileMenuOpen(false)}
    >
      <Image
        src="/branding/retail-suite-logomark.svg"
        alt=""
        width={48}
        height={48}
        aria-hidden
        className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
        priority
      />
      <Image
        src="/branding/retail-suite-wordmark.svg"
        alt=""
        width={111}
        height={36}
        className="h-7 w-auto shrink-0 object-contain object-left sm:h-8"
        priority
        aria-hidden
      />
    </Link>
  )

  const MobileNavigation = () => (
    <div className="flex flex-col h-full bg-white sticky top-0">
      <div className="flex items-center justify-between p-6 border-b border-neutral-200">
        <BrandBlock />
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  "hover:bg-neutral-100",
                  isActive
                    ? "bg-[#F5F6FA] border border-neutral-200"
                    : "text-foreground"
                )}
                style={isActive ? { color: retailIndigo } : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs" style={{ color: retailMuted }}>
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <MobileNavigation />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex-shrink-0 border-b border-neutral-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06),0_1px_4px_rgba(15,23,42,0.04)]">
          <div
            className={cn(
              "flex h-12 w-full items-center justify-between gap-3 sm:h-14 sm:gap-4",
              isMax2 ? "pl-3 pr-5 sm:pr-8" : "px-5 sm:px-8"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-neutral-600 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <BrandBlock className="min-w-0" />
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              {statsChips}
              <DropdownMenu onOpenChange={setWebsiteMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Website and external links"
                    className={cn(
                      "hidden max-w-[11rem] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors sm:flex",
                      "border-[#302667]/14 bg-[#EDEAF6]/55",
                      "hover:border-[#302667]/22 hover:bg-[#EDEAF6]/90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#302667]/20 focus-visible:ring-offset-1",
                      "data-[state=open]:border-[#302667]/25 data-[state=open]:bg-[#E4DEF2]"
                    )}
                  >
                    <span
                      className="inline-flex h-5 w-5 shrink-0 translate-y-0.5 items-center justify-center"
                      style={{ color: retailIndigo }}
                      aria-hidden
                    >
                      <MaterialSymbol name="public" size={20} className="leading-none" />
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-sm font-semibold leading-none"
                      style={{ color: retailIndigo }}
                    >
                      Website
                    </span>
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#302667]/14"
                      aria-hidden
                    >
                      <ChevronDown
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-200",
                          websiteMenuOpen && "rotate-180"
                        )}
                        style={{ color: retailIndigo }}
                      />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[min(calc(100vw-2rem),16rem)] rounded-lg border-neutral-200/90 p-1.5 shadow-none"
                >
                  {WEBSITE_OPTIONS.map((w) => (
                    <DropdownMenuItem
                      key={w.id}
                      className="cursor-pointer rounded-md py-2 text-sm focus:bg-[#EDEAF6]/80"
                      onSelect={() => {
                        window.open(w.href, "_blank", "noopener,noreferrer")
                      }}
                    >
                      <span className="font-medium" style={{ color: retailIndigo }}>
                        {w.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div
                className="hidden h-7 w-px shrink-0 bg-neutral-200 sm:block"
                aria-hidden
              />

              <DropdownMenu onOpenChange={setRooftopMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Select rooftop location"
                    className={cn(
                      "flex max-w-[min(100%,11rem)] items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors",
                      "border-[#302667]/14 bg-[#EDEAF6]/55",
                      "hover:border-[#302667]/22 hover:bg-[#EDEAF6]/90",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#302667]/20 focus-visible:ring-offset-1",
                      "data-[state=open]:border-[#302667]/25 data-[state=open]:bg-[#E4DEF2]",
                      "sm:max-w-[15rem] sm:px-3"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className="truncate text-[10px] font-medium leading-tight tracking-wide text-neutral-500 sm:text-[11px]"
                        title={ENTERPRISE_NAME}
                      >
                        {ENTERPRISE_NAME}
                      </div>
                      <div
                        className="truncate text-xs font-semibold leading-tight tracking-tight sm:text-sm"
                        style={{ color: retailIndigo }}
                        title={selectedRooftop.name}
                      >
                        {selectedRooftop.name}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-3.5 shrink-0 text-neutral-500 transition-transform duration-200 sm:size-4",
                        rooftopMenuOpen && "rotate-180"
                      )}
                      aria-hidden
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[min(calc(100vw-2rem),18rem)] rounded-lg border-neutral-200/90 p-1.5 shadow-none"
                >
                  <DropdownMenuRadioGroup value={rooftopId} onValueChange={setRooftopId}>
                    {ROOFTOP_OPTIONS.map((r) => (
                      <DropdownMenuRadioItem
                        key={r.id}
                        value={r.id}
                        className="cursor-pointer rounded-md py-2 pl-8 pr-2 text-sm focus:bg-[#EDEAF6]/80"
                      >
                        <span className="font-medium" style={{ color: retailIndigo }}>
                          {r.name}
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Avatar className="h-8 w-8 shrink-0 border border-[#302667]/20 bg-[#302667]">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop"
                  alt="Account"
                />
                <AvatarFallback className="flex items-center justify-center bg-[#302667] text-white">
                  <User className="size-4" strokeWidth={2} aria-hidden />
                  <span className="sr-only">Account</span>
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
          data-slot="scroll-root"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
