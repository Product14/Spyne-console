"use client"

import { useState } from "react"
import { MaterialSymbol } from "@/components/max-2/material-symbol"

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        className="inline-flex cursor-pointer border-0 bg-transparent p-0 text-spyne-text-secondary outline-none ring-spyne-primary focus-visible:ring-2"
        aria-label="More information"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <MaterialSymbol name="info" size={16} className="text-current" />
      </button>
      {show && (
        <div
          style={{
            position: 'absolute',
            bottom: '140%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--spyne-text-primary)',
            color: '#fff',
            borderRadius: 'var(--spyne-radius-md)',
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 500,
            width: 240,
            lineHeight: 1.6,
            boxShadow: 'var(--spyne-shadow-lg)',
            zIndex: 50,
            whiteSpace: 'normal',
            pointerEvents: 'none',
          }}
        >
          {text}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid var(--spyne-text-primary)',
          }} />
        </div>
      )}
    </div>
  )
}
