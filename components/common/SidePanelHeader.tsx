import React from 'react'

interface SidePanelHeaderProps {
  // Icon configuration
  iconBgColor: string // e.g., "bg-green-100", "bg-red-100"
  iconTextColor: string // e.g., "text-green-600", "text-red-600"
  iconSize?: string // e.g., "w-10 h-10" or "w-8 h-8"
  svgIconSize?: string // e.g., "w-5 h-5" or "w-4 h-4"
  iconSvg: React.ReactNode
  svgFill?: string // e.g., "none", "currentColor"
  svgStroke?: string // e.g., "currentColor", "none"
  svgViewBox?: string // e.g., "0 0 24 24" or "0 0 20 20"
  
  // Content
  title: string
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  titleClassName?: string
  description: string
  descriptionClassName?: string
  
  // Layout
  contentGap?: string // e.g., "gap-4" or "gap-3"
  paddingY?: string // e.g., "py-4 lg:py-6" or "py-4 lg:py-5"
  
  // Close button
  onClose: () => void
  closeButtonVariant?: 'simple' | 'bordered' // simple = no border, bordered = with border
  
  // Optional additional actions (e.g., buttons before close button)
  additionalActions?: React.ReactNode
}

export default function SidePanelHeader({
  iconBgColor,
  iconTextColor,
  iconSize = "w-10 h-10",
  svgIconSize = "w-5 h-5",
  iconSvg,
  svgFill = "none",
  svgStroke = "currentColor",
  svgViewBox = "0 0 24 24",
  title,
  titleTag: TitleTag = 'h3',
  titleClassName = "text-xl font-semibold text-foreground",
  description,
  descriptionClassName = "text-sm text-muted-foreground mt-1",
  contentGap = "gap-4",
  paddingY = "py-4 lg:py-6",
  onClose,
  closeButtonVariant = 'simple',
  additionalActions
}: SidePanelHeaderProps) {
  return (
    <div className={`px-4 lg:px-6 ${paddingY} border-b border-border bg-muted/20 flex-shrink-0`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${contentGap}`}>
          <div className={`${iconSize} ${iconBgColor} rounded-lg flex items-center justify-center`}>
            <svg className={`${svgIconSize} ${iconTextColor}`} fill={svgFill} stroke={svgStroke} viewBox={svgViewBox}>
              {iconSvg}
            </svg>
          </div>
          <div>
            <TitleTag className={titleClassName}>{title}</TitleTag>
            <p className={descriptionClassName}>{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {additionalActions}
          <button
            onClick={onClose}
            className={
              closeButtonVariant === 'bordered'
                ? "w-8 h-8 rounded-lg border border-input hover:bg-muted hover:border-border flex items-center justify-center transition-all"
                : "p-2 hover:bg-muted rounded-lg transition-colors"
            }
          >
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
