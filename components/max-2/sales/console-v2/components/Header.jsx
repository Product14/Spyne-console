"use client"

import { MaterialSymbol } from '@/components/max-2/material-symbol'

export default function Header({ dealer, onMenuToggle, navLeftPx = 220, embedded = false }) {
  if (embedded) {
    return (
      <header
        className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b px-5 transition-all duration-200"
        style={{
          background: 'var(--spyne-surface)',
          borderColor: 'var(--spyne-border)',
          boxShadow: 'var(--spyne-shadow-sm)',
        }}
      >
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="lg:hidden cursor-pointer rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--spyne-text-muted)', background: 'none', border: 'none' }}
            aria-label="Open main menu"
            type="button"
          >
            <MaterialSymbol name="menu" size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="hidden cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm transition-colors sm:flex"
            style={{
              borderRadius: 'var(--spyne-radius-md)',
              border: '1px solid var(--spyne-border)',
              color: 'var(--spyne-text-secondary)',
              background: 'transparent',
            }}
          >
            <MaterialSymbol name="language" size={14} style={{ color: 'var(--spyne-text-muted)' }} />
            <span className="spyne-label" style={{ color: 'inherit' }}>Website</span>
            <MaterialSymbol name="expand_more" size={13} style={{ color: 'var(--spyne-text-muted)' }} />
          </button>

          <button
            type="button"
            className="flex max-w-[220px] cursor-pointer items-center gap-2 px-3 py-1.5 transition-colors"
            style={{
              borderRadius: 'var(--spyne-radius-md)',
              border: '1px solid var(--spyne-border)',
              background: 'transparent',
            }}
          >
            <div className="hidden text-right md:block">
              <div className="spyne-label truncate leading-tight" style={{ color: 'var(--spyne-text-primary)', fontWeight: 600, fontSize: 12 }}>
                {dealer.name}
              </div>
              <div className="spyne-caption leading-tight" style={{ color: 'var(--spyne-text-muted)' }}>
                {dealer.location}
              </div>
            </div>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold"
              style={{ borderRadius: '50%', background: 'var(--spyne-brand)', color: 'var(--spyne-brand-on)' }}
            >
              {dealer.userName.charAt(0)}
            </div>
            <MaterialSymbol name="expand_more" size={13} style={{ color: 'var(--spyne-text-muted)' }} className="shrink-0" />
          </button>
        </div>
      </header>
    )
  }

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-5 z-30 transition-all duration-200"
      style={{
        left: navLeftPx,
        background: 'var(--spyne-surface)',
        borderBottom: '1px solid var(--spyne-border)',
        boxShadow: 'var(--spyne-shadow-sm)',
      }}
    >
      {/* Left: mobile menu toggle */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md transition-colors cursor-pointer"
          style={{ color: 'var(--spyne-text-muted)', background: 'none', border: 'none' }}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Right: website indicator + dealer selector */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors cursor-pointer"
          style={{
            borderRadius: 'var(--spyne-radius-md)',
            border: '1px solid var(--spyne-border)',
            color: 'var(--spyne-text-secondary)',
            background: 'transparent',
          }}
        >
          <Globe size={14} style={{ color: 'var(--spyne-text-muted)' }} />
          <span className="spyne-label" style={{ color: 'inherit' }}>Website</span>
          <ChevronDown size={13} style={{ color: 'var(--spyne-text-muted)' }} />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 transition-colors cursor-pointer max-w-[220px]"
          style={{
            borderRadius: 'var(--spyne-radius-md)',
            border: '1px solid var(--spyne-border)',
            background: 'transparent',
          }}
        >
          <div className="text-right hidden md:block">
            <div className="spyne-label truncate leading-tight" style={{ color: 'var(--spyne-text-primary)', fontWeight: 600, fontSize: 12 }}>
              {dealer.name}
            </div>
            <div className="spyne-caption leading-tight" style={{ color: 'var(--spyne-text-muted)' }}>
              {dealer.location}
            </div>
          </div>
          <div
            className="w-7 h-7 text-xs font-bold flex items-center justify-center shrink-0"
            style={{ borderRadius: '50%', background: 'var(--spyne-brand)', color: 'var(--spyne-brand-on)' }}
          >
            {dealer.userName.charAt(0)}
          </div>
          <ChevronDown size={13} style={{ color: 'var(--spyne-text-muted)' }} className="shrink-0" />
        </button>
      </div>
    </header>
  )
}
