import { ReactNode } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  heading: string
  subheading?: string
  ctaLabel?: string
  onCtaClick?: () => void
  className?: string
}

export function EmptyState({
  icon,
  heading,
  subheading,
  ctaLabel,
  onCtaClick,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {icon && (
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {heading}
      </h3>
      
      {subheading && (
        <p className="text-sm text-muted-foreground mb-6 max-w-md">
          {subheading}
        </p>
      )}
      
      {ctaLabel && onCtaClick && (
        <Button onClick={onCtaClick} variant="outline">
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
