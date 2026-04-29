import React from "react";

interface SidePanelEmptyStateProps {
  // Icon configuration
  iconSvg: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  iconSize?: string;
  svgSize?: string;
  svgStrokeWidth?: number;

  // Content
  title: string;
  description: string;

  // Optional badge
  showBadge?: boolean;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  badgeTextColor?: string;
  badgeAssignedTo?: string;
}

export default function SidePanelEmptyState({
  iconSvg,
  iconBgColor = "bg-muted/50",
  iconTextColor = "text-muted-foreground/60",
  iconSize = "w-16 h-16",
  svgSize = "w-8 h-8",
  title,
  description,
  showBadge = false,
  badgeBgColor = "bg-green-50",
  badgeBorderColor = "border-green-200",
  badgeTextColor = "text-green-800",
  badgeAssignedTo,
}: SidePanelEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div
        className={`${iconSize} ${iconBgColor} rounded-full flex items-center justify-center mb-4`}
      >
        <svg
          className={`${svgSize} ${iconTextColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {iconSvg}
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
      {showBadge && badgeAssignedTo && (
        <div
          className={`mt-4 p-3 ${badgeBgColor} border ${badgeBorderColor} rounded-lg`}
        >
          <div className={`text-sm ${badgeTextColor}`}>
            ✓ QC Review completed by:{" "}
            <span className="font-medium">{badgeAssignedTo}</span>
          </div>
        </div>
      )}
    </div>
  );
}
