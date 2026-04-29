"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  spyneDsChipClassName,
  spyneDsChipCompactClass,
  spyneDsChipFilterRowClass,
  spyneDsChipIconClass,
  type SpyneChipTone,
  type SpyneChipVariant,
} from "@/lib/design-system/max-2"

export interface SpyneChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  variant?: SpyneChipVariant
  tone?: SpyneChipTone
  /** Smaller padding + type (dense tables, filter bars) */
  compact?: boolean
  /** Renders before the label (status dot, icon, etc.) */
  leading?: React.ReactNode
  /** Renders after the label (e.g. dismiss control) */
  trailing?: React.ReactNode
  /** Default `span`. Use `button` for toggles / dismissible chips. */
  as?: "span" | "button"
  className?: string
  children?: React.ReactNode
  /** Only when `as="button"` */
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"]
  /** Only when `as="button"` */
  disabled?: boolean
}

/**
 * Spyne design-system chip: pill shape, outline / soft / solid × semantic + extended tones.
 * Valid inside `Max2SpyneScope` (`.max2-spyne`). See `design-system/max-2.md`.
 */
export const SpyneChip = React.forwardRef<HTMLSpanElement | HTMLButtonElement, SpyneChipProps>(
  function SpyneChip(
    {
      variant = "outline",
      tone = "neutral",
      compact = false,
      leading,
      trailing,
      as = "span",
      className,
      children,
      type = "button",
      disabled,
      ...rest
    },
    ref
  ) {
    const rootClass = cn(
      spyneDsChipClassName({ variant, tone }),
      compact && spyneDsChipCompactClass,
      className
    )

    const content = (
      <>
        {leading != null ? (
          <span className={spyneDsChipIconClass}>{leading}</span>
        ) : null}
        {children != null && children !== "" ? (
          <span className="min-w-0 truncate font-medium">{children}</span>
        ) : null}
        {trailing != null ? <span className={spyneDsChipIconClass}>{trailing}</span> : null}
      </>
    )

    if (as === "button") {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type={type}
          disabled={disabled}
          className={rootClass}
          {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      )
    }

    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={rootClass} {...rest}>
        {content}
      </span>
    )
  }
)

/** Removable filter tag: label + separate dismiss control (only the X removes). */
export function SpyneRemovableFilterChip({
  label,
  onRemove,
  variant = "outline",
  tone = "primary",
  compact = true,
  className,
}: {
  label: string
  onRemove: () => void
  variant?: SpyneChipVariant
  tone?: SpyneChipTone
  compact?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        spyneDsChipClassName({ variant, tone }),
        spyneDsChipFilterRowClass,
        compact && spyneDsChipCompactClass,
        "inline-flex max-w-full items-center gap-0.5 pr-0.5",
        !compact && "!py-1 !px-2.5 gap-0.5 pr-0.5 leading-tight",
        className
      )}
    >
      <span
        className={cn(
          "min-w-0 truncate pl-1 font-medium",
          !compact && "text-xs leading-tight",
        )}
      >
        {label}
      </span>
      <button
        type="button"
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-current hover:bg-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </span>
  )
}
