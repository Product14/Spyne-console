"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type {
  FtueController,
  FtueImsProvider,
  FtueInventoryBreakdown,
  FtueProcessingState,
  FtueState,
} from "@/services/max-2/ftue.types"

const SCAN_DURATION_MS = 10000
const TICK_INTERVAL_MS = 380
const PROCESS_BATCH_SIZE = 4

const DEFAULT_BREAKDOWN: FtueInventoryBreakdown = {
  totalVehicles: 248,
  noPhotos: 47,
  stockPhotos: 33,
  rawPhotos: 168,
}

function buildInitialState(ims: FtueImsProvider): FtueState {
  return {
    phase: "syncing",
    ims,
    sync: {
      // Sync is a static snapshot of an already-completed fetch. The opening visual
      // is a one-shot reveal animation, not a live progress bar.
      fetched: DEFAULT_BREAKDOWN.totalVehicles,
      total: DEFAULT_BREAKDOWN.totalVehicles,
      pct: 100,
      complete: true,
      syncedAt: new Date().toISOString(),
    },
    score: 0,
    breakdown: { totalVehicles: 0, noPhotos: 0, stockPhotos: 0, rawPhotos: 0 },
    processing: { processed: 0, total: 0, inReview: 0, issued: 0 },
    smartMatchApplied: false,
    isFirstRun: true,
  }
}

/** Score methodology — TODO open question #1. */
function computeScorePlaceholder(b: FtueInventoryBreakdown, processed: number): number {
  if (b.totalVehicles === 0) return 0
  const realCoverage = (processed + b.rawPhotos * 0.25) / b.totalVehicles
  const stockPenalty = b.stockPhotos / b.totalVehicles
  const noPhotoPenalty = b.noPhotos / b.totalVehicles
  const raw = 100 * (0.55 * realCoverage + 0.45 * (1 - 0.6 * stockPenalty - noPhotoPenalty))
  return Math.max(0, Math.min(100, Math.round(raw)))
}

interface UseFtueOptions {
  ims?: FtueImsProvider
  /** When false, the flow does not auto-start. */
  autoStart?: boolean
}

/**
 * FTUE state machine: syncing (IMS fetch animation) → scanning → insights → live processing.
 * Mocked so the flow runs end-to-end without a backend.
 */
export function useFtueInventoryFetch(opts: UseFtueOptions = {}): FtueController {
  const { ims = "vauto", autoStart = true } = opts

  const [state, setState] = useState<FtueState>(() => buildInitialState(ims))
  const [isModalOpen, setIsModalOpen] = useState(autoStart)

  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const processTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = useCallback(() => {
    if (scanTimer.current) {
      clearTimeout(scanTimer.current)
      scanTimer.current = null
    }
    if (processTimer.current) {
      clearInterval(processTimer.current)
      processTimer.current = null
    }
  }, [])

  const startAnalysis = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "syncing") return prev
      return { ...prev, phase: "scanning" }
    })
  }, [])

  /** Scanning → insights once the (mock) audit completes. */
  useEffect(() => {
    if (state.phase !== "scanning") return
    scanTimer.current = setTimeout(() => {
      setState((prev) => {
        if (prev.phase !== "scanning") return prev
        const breakdown = DEFAULT_BREAKDOWN
        return {
          ...prev,
          phase: "insights",
          breakdown,
          processing: {
            processed: 0,
            total: breakdown.rawPhotos,
            inReview: 0,
            issued: 0,
          },
          score: computeScorePlaceholder(breakdown, 0),
        }
      })
    }, SCAN_DURATION_MS)
    return () => {
      if (scanTimer.current) {
        clearTimeout(scanTimer.current)
        scanTimer.current = null
      }
    }
  }, [state.phase])

  /** Live raw-photo processing once we're in insights. */
  useEffect(() => {
    if (state.phase !== "insights") return
    if (state.processing.total === 0) return
    if (state.processing.processed >= state.processing.total) return

    processTimer.current = setInterval(() => {
      setState((prev) => {
        const remaining = prev.processing.total - prev.processing.processed
        if (remaining <= 0) {
          if (processTimer.current) {
            clearInterval(processTimer.current)
            processTimer.current = null
          }
          return prev
        }
        const step = Math.min(PROCESS_BATCH_SIZE, remaining)
        const reviewBump = Math.round(step * 0.35)
        const issuedBump = step - reviewBump
        const nextProcessing: FtueProcessingState = {
          processed: prev.processing.processed + step,
          total: prev.processing.total,
          inReview: prev.processing.inReview + reviewBump,
          issued: prev.processing.issued + issuedBump,
        }
        // Score is frozen at the analysis snapshot — see open question #1.
        // Live raw-photo processing updates only the processing counters.
        return {
          ...prev,
          processing: nextProcessing,
        }
      })
    }, TICK_INTERVAL_MS)

    return () => {
      if (processTimer.current) {
        clearInterval(processTimer.current)
        processTimer.current = null
      }
    }
  }, [state.phase, state.processing.total, state.processing.processed])

  useEffect(() => clearTimers, [clearTimers])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setState((prev) => (prev.isFirstRun ? { ...prev, isFirstRun: false } : prev))
  }, [])

  const applySmartMatch = useCallback(() => {
    setState((prev) => {
      if (prev.smartMatchApplied) return prev
      const movedToProcessing = prev.breakdown.noPhotos
      const breakdown: FtueInventoryBreakdown = {
        ...prev.breakdown,
        noPhotos: 0,
        rawPhotos: prev.breakdown.rawPhotos + movedToProcessing,
      }
      const nextProcessing: FtueProcessingState = {
        ...prev.processing,
        total: prev.processing.total + movedToProcessing,
      }
      // Score stays frozen at the post-analysis snapshot. Smart Match progress
      // is reflected in the breakdown counts and live processing metrics, not the score.
      return {
        ...prev,
        smartMatchApplied: true,
        breakdown,
        processing: nextProcessing,
      }
    })
  }, [])

  const resetFtue = useCallback(() => {
    clearTimers()
    setState(buildInitialState(ims))
    setIsModalOpen(true)
  }, [clearTimers, ims])

  const processingComplete =
    state.phase === "insights" &&
    state.processing.total > 0 &&
    state.processing.processed >= state.processing.total

  return {
    state,
    isModalOpen,
    openModal,
    closeModal,
    applySmartMatch,
    startAnalysis,
    resetFtue,
    processingComplete,
  }
}
