"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { spyneComponentClasses } from "@/lib/design-system/max-2"

type CopyOnClickIdentifierProps = {
  value: string
  /** Shown on hover before copy (default: Click to copy). */
  tooltip?: string
  className?: string
}

/**
 * Inline identifier (VIN, stock #, etc.): hover shows copy hint; click copies value. Stops row click propagation.
 * Tooltip uses the solid Spyne dark panel (not the transparent Radix wrapper alone). After copy, shows confirmation briefly.
 */
export function CopyOnClickIdentifier({
  value,
  tooltip = "Click to copy",
  className,
}: CopyOnClickIdentifierProps) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const onOpenChange = React.useCallback((next: boolean) => {
    setOpen(next)
    if (!next) {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setCopied(false)
    }
  }, [])

  const onClick = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(value)
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current)
          closeTimerRef.current = null
        }
        setCopied(true)
        setOpen(true)
        closeTimerRef.current = setTimeout(() => {
          closeTimerRef.current = null
          setCopied(false)
          setOpen(false)
        }, 2000)
      } catch {
        /* ignore */
      }
    },
    [value],
  )

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <TooltipPrimitive.Trigger asChild>
          <button
            type="button"
            onClick={onClick}
            aria-label={copied ? "Copied to clipboard" : `Copy ${value}`}
            className={cn(
              "inline max-w-full cursor-pointer truncate border-0 bg-transparent p-0 text-left tabular-nums underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-spyne-primary/40",
              spyneComponentClasses.studioInventoryVinStockIdentifier,
              className,
            )}
          >
            {value}
          </button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={6}
            className={spyneComponentClasses.darkTooltipRadixContent}
          >
            {/* Radix content is transparent; real surface is darkTooltipPanel — see `app/globals.css` */}
            <div
              className={cn(
                spyneComponentClasses.darkTooltipPanel,
                "!m-0 !max-w-[min(100vw-2rem,280px)] !p-2.5 !text-xs !leading-snug",
              )}
            >
              <p className="m-0 font-normal text-[var(--spyne-on-dark-text)]">
                {copied ? "Copied to clipboard" : tooltip}
              </p>
            </div>
            <TooltipPrimitive.Arrow className={spyneComponentClasses.darkTooltipArrow} width={14} height={7} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
