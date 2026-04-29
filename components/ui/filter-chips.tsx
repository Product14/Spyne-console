import { X } from "lucide-react"
import { Badge } from "./badge"
import { Button } from "./button"

interface FilterChip {
  key: string
  label: string
  value: string
}

interface FilterChipsProps {
  filters: FilterChip[]
  onRemoveFilter: (key: string) => void
  className?: string
}

export function FilterChips({ filters, onRemoveFilter, className }: FilterChipsProps) {
  if (filters.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1 text-sm"
        >
          <span className="font-medium">{filter.label}:</span>
          <span>{filter.value}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 ml-1 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.key)}
          >
            <X className="w-3 h-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}
