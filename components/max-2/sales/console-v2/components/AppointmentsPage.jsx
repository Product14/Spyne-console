"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { MaterialSymbol } from '@/components/max-2/material-symbol'
import { max2Classes, spyneSalesLayout } from '@/lib/design-system/max-2'
import { cn } from '@/lib/utils'
import { SPYNE, SPYNE_SOFT_BG } from '../spyne-palette'
import { SERVICE_CONSOLE_TAB_CONTENT } from '@/lib/max-2/service-console-tab-content'

// ── Helpers ───────────────────────────────────────────────────

function formatTime(t) {
  const h = Math.floor(t)
  const m = Math.round((t % 1) * 60).toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m} ${ampm}`
}

// ── Mock data ─────────────────────────────────────────────────

const WEEK_DATA = [
  {
    weekLabel: 'Mar 31 – Apr 6',
    days: [
      {
        key: 'mon-mar31', dayLabel: 'Mon', date: 'Mar 31', isToday: false,
        appts: [
          {
            id: 'a1', type: 'test-drive', timeStart: 10.0, timeEnd: 11.0,
            customer: 'Robert Kim', phone: '+1 (555) 112-3344',
            vehicle: '2024 Toyota Highlander XLE', budget: '$42,000',
            stock: 'TY-4821', vin: '5TDBZRFH4NS212345', daysOnLot: 22,
            salesperson: 'Mike R.', source: 'AutoTrader',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Interested in Highlander XLE. Asked about towing capacity and third-row seating. Ready to test drive.',
            agentAction: 'Vini AI confirmed appointment',
            status: 'upcoming', confirmationStatus: 'showed',
          },
          {
            id: 'a2', type: 'negotiation', timeStart: 14.0, timeEnd: 14.5,
            customer: 'Nina Patel', phone: '+1 (555) 877-2200',
            vehicle: '2023 Subaru Outback XT', budget: '$35,000',
            stock: 'SB-2291', vin: '4S4BTAMC4N3177843', daysOnLot: 35,
            salesperson: 'Tom S.', source: 'Cars.com',
            isBeBack: true, tradeIn: '2019 Nissan Rogue (mentioned)',
            viniSummary: 'Negotiating on price, trade-in pending. Was close to deal on first visit. Wants $1,200 off asking.',
            agentAction: 'Inbound inquiry via Cars.com',
            status: 'upcoming', confirmationStatus: 'no-show',
          },
        ],
      },
      {
        key: 'tue-apr1', dayLabel: 'Tue', date: 'Apr 1', isToday: false,
        appts: [
          {
            id: 'b1', type: 'close-deal', timeStart: 9.0, timeEnd: 10.0,
            customer: 'Alex Turner', phone: '+1 (555) 334-9910',
            vehicle: '2023 Honda CR-V EX-L AWD', budget: '$37,500 OTD',
            stock: 'HN-3310', vin: '2HKRW2H83PH601234', daysOnLot: 18,
            salesperson: 'Amy K.', source: 'Phone-in',
            isBeBack: true, tradeIn: '2020 Toyota Corolla',
            viniSummary: 'OTD price confirmed. Trade-in agreed at $14,500. Finance pre-approved. Ready to sign.',
            agentAction: 'OTD price confirmed by customer',
            status: 'upcoming', confirmationStatus: 'showed',
          },
          {
            id: 'b2', type: 'test-drive', timeStart: 11.0, timeEnd: 12.0,
            customer: 'Claire Wong', phone: '+1 (555) 662-7711',
            vehicle: '2024 Mazda CX-5 Turbo', budget: '$38,000',
            stock: 'MZ-1142', vin: 'JM3KFBDM4P0123456', daysOnLot: 9,
            salesperson: 'Mike R.', source: 'CarGurus',
            isBeBack: false, tradeIn: null,
            viniSummary: 'First contact via CarGurus. Interested in Turbo trim specifically. No trade-in.',
            agentAction: 'Vini AI booked test drive',
            status: 'upcoming', confirmationStatus: 'showed',
          },
          {
            id: 'b3', type: 'negotiation', timeStart: 15.0, timeEnd: 15.5,
            customer: 'Ryan Brooks', phone: '+1 (555) 990-4412',
            vehicle: '2022 Jeep Wrangler Sport', budget: '$45,000',
            stock: 'JP-5500', vin: '1C4HJXDG0NW123789', daysOnLot: 41,
            salesperson: 'Tom S.', source: 'Walk-in',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Has competing offer at $43,500. Needs price match or dealer will lose deal.',
            agentAction: 'Price comparison requested',
            status: 'upcoming', confirmationStatus: 'showed',
          },
        ],
      },
      {
        key: 'wed-apr2', dayLabel: 'Wed', date: 'Apr 2', isToday: false,
        appts: [],
      },
      {
        key: 'thu-apr3', dayLabel: 'Thu', date: 'Apr 3', isToday: true,
        appts: [
          {
            id: '1', type: 'test-drive', timeStart: 9.0, timeEnd: 10.0,
            customer: 'Sarah Delgado', phone: '+1 (555) 312-4490',
            vehicle: '2025 Toyota Camry XSE · Midnight Black', budget: '$450/mo',
            stock: 'TY-9201', vin: '4T1BZ1HK4NU051823', daysOnLot: 14,
            salesperson: 'Mike R.', source: 'AutoTrader',
            isBeBack: true, tradeIn: '2019 Honda Civic (mentioned)',
            viniSummary: 'Interested in XSE trim, asked about financing options. Budget ~$450/mo. Wants to test drive before deciding.',
            agentAction: 'Vini AI confirmed appointment',
            status: 'started', confirmationStatus: 'unconfirmed',
          },
          {
            id: '2', type: 'negotiation', timeStart: 10.5, timeEnd: 11.0,
            customer: 'Marcus Webb', phone: '+1 (555) 891-3344',
            vehicle: '2023 Honda CR-V EX-L', budget: '$36,500',
            stock: 'HN-2290', vin: '2HKRW2H89PH512341', daysOnLot: 27,
            salesperson: 'Tom S.', source: 'Cars.com',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Has competing offer from another dealer at $35,800. Needs at least $500 concession to commit.',
            agentAction: 'Inbound call — price discussion pending',
            status: 'upcoming', confirmationStatus: 'in-progress',
          },
          {
            id: '3', type: 'test-drive', timeStart: 12.5, timeEnd: 13.0,
            customer: 'Jessica Parker', phone: '+1 (555) 678-9901',
            vehicle: '2024 Ford Mustang GT · Race Red', budget: '$42,000',
            stock: 'FD-8812', vin: '1FA6P8CF4N5100321', daysOnLot: 6,
            salesperson: 'Amy K.', source: 'AutoTrader',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Enthusiastic about the GT. Asked about performance packages and 0-60 times. First visit.',
            agentAction: 'Vini AI booked test drive',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
          {
            id: '4', type: 'close-deal', timeStart: 13.5, timeEnd: 14.0,
            customer: 'Maria Torres', phone: '+1 (555) 234-5678',
            vehicle: '2023 Honda CR-V EX-L AWD', budget: '$35,900 OTD',
            stock: 'HN-3311', vin: '2HKRW2H83PH600987', daysOnLot: 18,
            salesperson: 'Tom S.', source: 'Phone-in',
            isBeBack: true, tradeIn: '2018 Toyota Camry',
            viniSummary: 'Paperwork ready. Trade-in finalized at $11,200. Finance pre-approved at 6.9% APR. 3rd visit.',
            agentAction: 'Paperwork requested by customer',
            status: 'upcoming', confirmationStatus: 'showed',
          },
          {
            id: '5', type: 'test-drive', timeStart: 14.0, timeEnd: 14.5,
            customer: 'Emma Stone', phone: '+1 (555) 678-2210',
            vehicle: '2018 Honda CR-V', budget: '$15,000 – $25,000',
            stock: 'HN-9921', vin: '2HKRW6H37JH412398', daysOnLot: 52,
            salesperson: 'Mike R.', source: 'CarGurus',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Budget-conscious. Interested in CPO. Flexible on trim and color.',
            agentAction: 'Outgoing SMS by Vini',
            status: 'upcoming', confirmationStatus: 'unconfirmed',
          },
          {
            id: '6', type: 'negotiation', timeStart: 15.0, timeEnd: 15.5,
            customer: 'Daniel Craig', phone: '+1 (555) 901-3344',
            vehicle: '2020 Toyota RAV4', budget: '$20,000 – $30,000',
            stock: 'TY-7743', vin: '2T3P1RFV1LW098432', daysOnLot: 38,
            salesperson: 'Amy K.', source: 'AutoTrader',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Looking for RAV4 under $28K. Asked about extended warranty. Will decide today.',
            agentAction: 'Email sent by Vini',
            status: 'upcoming', confirmationStatus: 'imminent',
          },
          {
            id: '7', type: 'pickup', timeStart: 16.5, timeEnd: 17.0,
            customer: 'James Carter', phone: '+1 (555) 445-7821',
            vehicle: '2022 Ford Explorer', budget: '$25,000 – $35,000',
            stock: 'FD-4411', vin: '1FMSK8DH9NGA12345', daysOnLot: 0,
            salesperson: 'Tom S.', source: 'Walk-in',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Vehicle prepped and detailed. All paperwork signed Friday. Picking up at 4:30 PM.',
            agentAction: 'Outgoing call by Marcus',
            status: 'upcoming', confirmationStatus: 'unconfirmed',
          },
        ],
      },
      {
        key: 'fri-apr4', dayLabel: 'Fri', date: 'Apr 4', isToday: false,
        appts: [
          {
            id: 't1', type: 'test-drive', timeStart: 10.0, timeEnd: 11.0,
            customer: 'Sarah Mitchell', phone: '+1 (555) 223-9900',
            vehicle: '2023 Audi Q5', budget: '$30,000 – $40,000',
            stock: 'AD-2201', vin: 'WA1ANAFY4P2045678', daysOnLot: 31,
            salesperson: 'Amy K.', source: 'Cars.com',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Comparing Q5 vs BMW X3. Leaning toward Audi. Wants to drive both before deciding.',
            agentAction: 'Incoming call from Jake',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
          {
            id: 't2', type: 'negotiation', timeStart: 13.0, timeEnd: 13.5,
            customer: 'Kevin Walsh', phone: '+1 (555) 551-0032',
            vehicle: '2021 Chevy Equinox', budget: '$20,000 – $28,000',
            stock: 'CH-8831', vin: '2GNAXKEV5M6123456', daysOnLot: 44,
            salesperson: 'Mike R.', source: 'AutoTrader',
            isBeBack: false, tradeIn: '2017 Ford Focus',
            viniSummary: 'Trade-in of Focus is the sticking point. KBB at $8,200. Needs $8,500 to commit.',
            agentAction: 'Outgoing call by Vini',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
          {
            id: 't3', type: 'close-deal', timeStart: 15.5, timeEnd: 16.0,
            customer: 'Diana Torres', phone: '+1 (555) 447-2291',
            vehicle: '2024 Toyota RAV4 XLE', budget: '$33,000 – $38,000',
            stock: 'TY-1192', vin: '2T3P1RFV4PW012345', daysOnLot: 11,
            salesperson: 'Tom S.', source: 'Phone-in',
            isBeBack: true, tradeIn: '2020 Hyundai Tucson',
            viniSummary: '3rd visit. Ready to close. Trade agreed. Finance waiting on last approval.',
            agentAction: 'Incoming call from Marcus',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      {
        key: 'sat-apr5', dayLabel: 'Sat', date: 'Apr 5', isToday: false,
        appts: [
          {
            id: 's1', type: 'test-drive', timeStart: 10.0, timeEnd: 11.0,
            customer: 'Jessica Parker', phone: '+1 (555) 678-9901',
            vehicle: '2024 Ford Mustang GT', budget: '$42,000',
            stock: 'FD-8812', vin: '1FA6P8CF4N5100321', daysOnLot: 6,
            salesperson: 'Amy K.', source: 'AutoTrader',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Follow-up from Thursday test drive. Very positive. May bring her partner.',
            agentAction: 'Vini AI confirmed',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      {
        key: 'sun-apr6', dayLabel: 'Sun', date: 'Apr 6', isToday: false,
        appts: [],
      },
    ],
  },
  {
    weekLabel: 'Apr 7 – Apr 13',
    days: [
      {
        key: 'mon-apr7', dayLabel: 'Mon', date: 'Apr 7', isToday: false,
        appts: [
          {
            id: 'w2a', type: 'test-drive', timeStart: 9.5, timeEnd: 10.5,
            customer: 'Lena Fischer', phone: '+1 (555) 321-6677',
            vehicle: '2024 BMW X3 xDrive30i', budget: '$55,000',
            stock: 'BM-3301', vin: 'WBA7U9C08NCK12345', daysOnLot: 8,
            salesperson: 'Amy K.', source: 'Cars.com',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Confirmed test drive. Interested in xDrive and cold weather package.',
            agentAction: 'Vini AI confirmed test drive',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
          {
            id: 'w2b', type: 'close-deal', timeStart: 14.0, timeEnd: 15.0,
            customer: 'Tom Bradley', phone: '+1 (555) 883-4420',
            vehicle: '2023 Ford F-150 XLT', budget: '$50,000 OTD',
            stock: 'FD-7712', vin: '1FTFW1E55NKD12345', daysOnLot: 33,
            salesperson: 'Tom S.', source: 'Walk-in',
            isBeBack: true, tradeIn: '2019 Ram 1500',
            viniSummary: 'Financing approved. Trade-in at $22,000. Ready to sign Monday.',
            agentAction: 'Financing approved — ready to sign',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      {
        key: 'tue-apr8', dayLabel: 'Tue', date: 'Apr 8', isToday: false,
        appts: [
          {
            id: 'w2c', type: 'negotiation', timeStart: 11.0, timeEnd: 11.5,
            customer: 'Amy Santos', phone: '+1 (555) 776-2201',
            vehicle: '2024 Hyundai Tucson SEL', budget: '$34,000',
            stock: 'HY-4421', vin: '5NMP3DGEXPH012345', daysOnLot: 19,
            salesperson: 'Mike R.', source: 'AutoTrader',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Lease vs finance comparison pending. Prefers lease if payment stays under $400.',
            agentAction: 'Lease vs finance comparison pending',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      {
        key: 'wed-apr9', dayLabel: 'Wed', date: 'Apr 9', isToday: false,
        appts: [
          {
            id: 'w2d', type: 'pickup', timeStart: 10.0, timeEnd: 10.5,
            customer: 'Brian Moore', phone: '+1 (555) 440-8833',
            vehicle: '2022 Honda Accord Sport', budget: '$28,000',
            stock: 'HN-5512', vin: '1HGCV1F30NA012345', daysOnLot: 0,
            salesperson: 'Amy K.', source: 'Walk-in',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Vehicle prepped and ready. Keys at service desk.',
            agentAction: 'Vehicle prepped and ready',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
          {
            id: 'w2e', type: 'test-drive', timeStart: 13.5, timeEnd: 14.5,
            customer: 'Olivia Nash', phone: '+1 (555) 119-3305',
            vehicle: '2024 Kia Telluride SX', budget: '$48,000',
            stock: 'KI-2211', vin: '5XYP5DHC0PG012345', daysOnLot: 15,
            salesperson: 'Tom S.', source: 'CarGurus',
            isBeBack: false, tradeIn: null,
            viniSummary: 'Incoming lead via CarGurus. Interested in SX with black exterior.',
            agentAction: 'Incoming CarGurus lead',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      { key: 'thu-apr10', dayLabel: 'Thu', date: 'Apr 10', isToday: false, appts: [] },
      {
        key: 'fri-apr11', dayLabel: 'Fri', date: 'Apr 11', isToday: false,
        appts: [
          {
            id: 'w2f', type: 'close-deal', timeStart: 15.0, timeEnd: 16.0,
            customer: 'Carlos Rivera', phone: '+1 (555) 557-9920',
            vehicle: '2023 Toyota Tacoma TRD', budget: '$46,000 OTD',
            stock: 'TY-3392', vin: '3TMCZ5AN4PM012345', daysOnLot: 21,
            salesperson: 'Mike R.', source: 'Phone-in',
            isBeBack: true, tradeIn: '2018 Ford Ranger',
            viniSummary: 'All docs prepared. Finance waiting. Trade-in at $18,000.',
            agentAction: 'All docs prepared — finance waiting',
            status: 'upcoming', confirmationStatus: 'confirmed',
          },
        ],
      },
      { key: 'sat-apr12', dayLabel: 'Sat', date: 'Apr 12', isToday: false, appts: [] },
      { key: 'sun-apr13', dayLabel: 'Sun', date: 'Apr 13', isToday: false, appts: [] },
    ],
  },
]

// ── Type config ───────────────────────────────────────────────

const TYPE_CONFIG = {
  'test-drive':  { label: 'Test Drive',  color: SPYNE.primary,     bg: SPYNE_SOFT_BG.primary  },
  'close-deal':  { label: 'Close Deal',  color: SPYNE.success,     bg: SPYNE_SOFT_BG.success  },
  'negotiation': { label: 'Negotiation', color: SPYNE.warningInk,  bg: SPYNE_SOFT_BG.warning  },
  'pickup':      { label: 'Pickup',      color: SPYNE.info,        bg: SPYNE_SOFT_BG.info     },
  'appointment': { label: 'Appointment', color: SPYNE.pink,        bg: SPYNE_SOFT_BG.pink     },
}

const SERVICE_TYPE_CONFIG = {
  ...TYPE_CONFIG,
  mpi:          { label: 'MPI / Inspection',  color: SPYNE.primary,    bg: SPYNE_SOFT_BG.primary },
  'oil-change': { label: 'Express Service',   color: SPYNE.success,    bg: SPYNE_SOFT_BG.success },
  diagnostic:   { label: 'Diagnostic',        color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  repair:       { label: 'Repair RO',         color: SPYNE.info,       bg: SPYNE_SOFT_BG.info    },
  recall:       { label: 'Recall',            color: SPYNE.pink,       bg: SPYNE_SOFT_BG.pink    },
}

function buildServiceDriveWeekData(base) {
  const data = JSON.parse(JSON.stringify(base))
  const thu = data[0]?.days?.find((d) => d.key === 'thu-apr3')
  if (thu) {
    thu.appts = [
      { id: 'sv1', type: 'mpi',        timeStart: 8,    timeEnd: 8.75, customer: 'Lisa Chang',      phone: '+1 (555) 555-0912', bookedService: 'MPI and express oil change',    vehicle: '2017 Honda HR-V EX',      budget: 'MPI + oil ~$189',     agentAction: 'Express lane · advisor Tony R.',        status: 'started'  },
      { id: 'sv2', type: 'oil-change', timeStart: 9,    timeEnd: 9.5,  customer: 'Carlos Mendez',   phone: '+1 (555) 555-0391', bookedService: 'Express oil change',           vehicle: '2019 Ford Escape SE',     budget: '$89.95 coupon',       agentAction: 'Brake noise noted on check-in',         status: 'upcoming' },
      { id: 'sv3', type: 'recall',     timeStart: 10,   timeEnd: 11.5, customer: 'Elena Ruiz',      phone: '+1 (555) 220-1144', bookedService: 'Recall repair (no charge)',    vehicle: '2019 Toyota RAV4',        budget: 'Recall · no charge',  agentAction: 'Loaner reserved · bay 2',               status: 'upcoming' },
      { id: 'sv4', type: 'diagnostic', timeStart: 11.5, timeEnd: 12.5, customer: 'James Whitfield', phone: '+1 (555) 670-5512', bookedService: 'Driveability diagnostic',      vehicle: '2017 Tundra SR5',         budget: 'Diag auth $165',      agentAction: 'Declined brake revisit · priority',     status: 'upcoming' },
      { id: 'sv5', type: 'repair',     timeStart: 13,   timeEnd: 15,   customer: 'Rachel Green',    phone: '+1 (555) 555-0104', bookedService: '40k service and rear brakes',  vehicle: '2019 BMW X3',             budget: 'RO open · $1.2K auth', agentAction: '40k + rear brakes · loaner out',        status: 'upcoming' },
      { id: 'sv6', type: 'pickup',     timeStart: 16,   timeEnd: 16.5, customer: 'Maria Gonzalez',  phone: '+1 (555) 555-0218', bookedService: 'Pickup and RO closeout',       vehicle: '2021 Highlander XLE',     budget: 'RO closing today',    agentAction: 'Ready for pickup · cashier',            status: 'upcoming' },
    ]
  }
  return data
}

const SERVICE_WEEK_DATA = buildServiceDriveWeekData(WEEK_DATA)

// ── Status config ─────────────────────────────────────────────

const STATUS_CONFIG = {
  confirmed:     { label: 'Scheduled',   color: SPYNE.info,       bg: SPYNE_SOFT_BG.info    },
  unconfirmed:   { label: 'Unconfirmed', color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  'in-progress': { label: 'In Progress', color: SPYNE.warningInk, bg: SPYNE_SOFT_BG.warning },
  imminent:      { label: 'Imminent',    color: '#EA580C',        bg: '#FFF7ED'             },
  showed:        { label: 'Arrived',     color: SPYNE.success,    bg: SPYNE_SOFT_BG.success },
  'no-show':     { label: 'No-Show',     color: '#EF4444',        bg: '#FEF2F2'             },
}

// ── Week strip ────────────────────────────────────────────────

function WeekStrip({ days, selectedDayKey, onSelectDay }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
      {days.map((day) => {
        const count      = day.appts.length
        const isSelected = day.key === selectedDayKey

        return (
          <button
            key={day.key}
            onClick={() => onSelectDay(day.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              padding: '12px 4px',
              width: '100%', maxWidth: 140,
              borderRadius: 'var(--spyne-radius-xl)',
              border: 'none',
              background: isSelected ? 'var(--spyne-brand-subtle)' : 'transparent',
              cursor: 'pointer',
              transition: 'background 120ms',
            }}
          >
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
              color: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
              lineHeight: 1.4,
            }}>
              {day.dayLabel}
            </span>
            <span style={{
              fontSize: 20, fontWeight: 700, lineHeight: 1.15,
              color: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)',
            }}>
              {day.date.split(' ')[1]}
            </span>
            <span style={{
              fontSize: 10, lineHeight: 1.4,
              color: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)',
            }}>
              {day.date.split(' ')[0]}
            </span>
            {/* Count badge */}
            {count > 0 ? (
              <span style={{
                marginTop: 4,
                minWidth: 20, height: 20, borderRadius: 'var(--spyne-radius-pill)',
                padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: isSelected ? 'var(--spyne-brand)' : 'var(--spyne-border)',
                color: isSelected ? '#fff' : 'var(--spyne-text-secondary)',
              }}>
                {count}
              </span>
            ) : (
              <span style={{ marginTop: 4, fontSize: 11, color: 'var(--spyne-text-muted)', lineHeight: '20px' }}>—</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Show rate banner ──────────────────────────────────────────

function ShowRateBanner({ allDays, selectedDay }) {
  const allAppts = allDays.flatMap((d) => d.appts)
  const showed   = allAppts.filter((a) => a.confirmationStatus === 'showed').length
  const noShow   = allAppts.filter((a) => a.confirmationStatus === 'no-show').length
  const resolved = showed + noShow
  const rate     = resolved > 0 ? Math.round((showed / resolved) * 100) : null
  const unconfirmedCount = selectedDay.appts.filter((a) => a.confirmationStatus === 'unconfirmed').length

  if (rate === null && unconfirmedCount === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      padding: '10px 16px',
      background: 'var(--spyne-surface)',
      borderRadius: 'var(--spyne-radius)',
      border: '1px solid var(--spyne-border)',
    }}>
      {rate !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: SPYNE.success, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--spyne-text-primary)' }}>{showed} of {resolved}</span> showed this week
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: SPYNE.success, background: SPYNE_SOFT_BG.success,
            borderRadius: 'var(--spyne-radius-pill)', padding: '1px 7px',
          }}>
            {rate}%
          </span>
        </div>
      )}
      {unconfirmedCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MaterialSymbol name="warning" size={13} style={{ color: SPYNE.warningInk }} />
          <span style={{ fontSize: 13, color: SPYNE.warningInk, fontWeight: 600 }}>
            {unconfirmedCount} unconfirmed {selectedDay.isToday ? 'today' : `on ${selectedDay.dayLabel}`}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Show rate banner (inline, no card border) ─────────────────

function ShowRateBannerInline({ allDays, selectedDay }) {
  const allAppts = allDays.flatMap((d) => d.appts)
  const showed   = allAppts.filter((a) => a.confirmationStatus === 'showed').length
  const noShow   = allAppts.filter((a) => a.confirmationStatus === 'no-show').length
  const resolved = showed + noShow
  const rate     = resolved > 0 ? Math.round((showed / resolved) * 100) : null
  const unconfirmedCount = selectedDay.appts.filter((a) => a.confirmationStatus === 'unconfirmed').length

  if (rate === null && unconfirmedCount === 0) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      padding: '8px 16px',
    }}>
      {rate !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: SPYNE.success, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>
            <span style={{ fontWeight: 700, color: 'var(--spyne-text-primary)' }}>{showed} of {resolved}</span> showed this week
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: SPYNE.success, background: SPYNE_SOFT_BG.success,
            borderRadius: 'var(--spyne-radius-pill)', padding: '1px 7px',
          }}>
            {rate}%
          </span>
        </div>
      )}
      {unconfirmedCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MaterialSymbol name="warning" size={13} style={{ color: SPYNE.warningInk }} />
          <span style={{ fontSize: 13, color: SPYNE.warningInk, fontWeight: 600 }}>
            {unconfirmedCount} unconfirmed {selectedDay.isToday ? 'today' : `on ${selectedDay.dayLabel}`}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Day list ──────────────────────────────────────────────────

// Phone moved under customer name — no dedicated phone column
const LIST_COLS         = '68px 160px minmax(160px,1fr) 100px 52px 108px minmax(160px,1fr) 80px'
const LIST_COLS_SERVICE = '68px 160px minmax(160px,1fr) 150px 108px minmax(160px,1fr) 80px'

const TH = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: 'var(--spyne-text-muted)',
}

function formatPhone(raw) {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '').replace(/^1/, '')
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`
  return raw
}

const ICON_BTN = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 26, height: 26, borderRadius: 6, border: 'none',
  background: 'none', cursor: 'pointer',
}

function ActionBtn({ title: tip, color, hoverBg, icon, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...ICON_BTN, color, background: hovered ? hoverBg : 'none' }}
      >
        <MaterialSymbol name={icon} size={15} />
      </button>
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--spyne-text-primary)', color: '#fff',
          fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          padding: '4px 8px', borderRadius: 5,
          pointerEvents: 'none', zIndex: 100,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>
          {tip}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent', borderRight: '4px solid transparent',
            borderTop: '4px solid var(--spyne-text-primary)',
          }} />
        </div>
      )}
    </div>
  )
}

function DayList({ appts, typeConfig = TYPE_CONFIG, onSelectAppt, allDays = [], selectedDay = null, isService = false }) {
  const cols = isService ? LIST_COLS_SERVICE : LIST_COLS
  const [filterType,   setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [search,       setSearch]       = useState('')

  const sorted = [...appts].sort((a, b) => a.timeStart - b.timeStart)

  const filtered = sorted.filter((a) => {
    if (filterType   !== 'all' && a.type !== filterType)                       return false
    if (filterStatus !== 'all' && a.confirmationStatus !== filterStatus)       return false
    if (search) {
      const q = search.toLowerCase()
      if (!a.customer.toLowerCase().includes(q) && !a.vehicle.toLowerCase().includes(q)) return false
    }
    return true
  })

  const typeOptions   = Object.entries(typeConfig).filter(([k]) => !['mpi','oil-change','diagnostic','repair','recall'].includes(k))
  const statusOptions = Object.entries(STATUS_CONFIG)

  if (sorted.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--spyne-text-muted)' }}>
        <MaterialSymbol name="event_available" size={28} style={{ marginBottom: 8, opacity: 0.35 }} />
        <p style={{ fontSize: 14 }}>No appointments scheduled</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '10px 16px', borderBottom: '1px solid var(--spyne-border)', borderTop: '1px solid var(--spyne-border)',
      }}>
        {/* Search */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          height: 28, padding: '0 10px 0 8px',
          border: '1px solid var(--spyne-border)', borderRadius: 6,
          background: 'var(--spyne-surface)',
        }}>
          <MaterialSymbol name="search" size={13} className="text-spyne-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search appointments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 12, color: 'var(--spyne-text-primary)', width: 180,
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* Filters */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{
            height: 28, padding: '0 28px 0 10px', border: '1px solid var(--spyne-border)', borderRadius: 6,
            fontSize: 12, color: 'var(--spyne-text-secondary)', background: 'var(--spyne-surface)', cursor: 'pointer',
          }}
        >
          <option value="all">All Types</option>
          {typeOptions.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            height: 28, padding: '0 28px 0 10px', border: '1px solid var(--spyne-border)', borderRadius: 6,
            fontSize: 12, color: 'var(--spyne-text-secondary)', background: 'var(--spyne-surface)', cursor: 'pointer',
          }}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--spyne-border)', flexShrink: 0 }} />

        {/* Show rate + unconfirmed stats — right */}
        {(() => {
          const allAppts = allDays.flatMap(d => d.appts)
          const showed   = allAppts.filter(a => a.confirmationStatus === 'showed').length
          const noShow   = allAppts.filter(a => a.confirmationStatus === 'no-show').length
          const resolved = showed + noShow
          const rate     = resolved > 0 ? Math.round((showed / resolved) * 100) : null
          const unconfirmedCount = selectedDay ? selectedDay.appts.filter(a => a.confirmationStatus === 'unconfirmed').length : 0
          if (rate === null && unconfirmedCount === 0) return null
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {rate !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: SPYNE.success, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--spyne-text-secondary)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--spyne-text-primary)' }}>{showed} of {resolved}</span> showed this week
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: SPYNE.success, background: SPYNE_SOFT_BG.success,
                    borderRadius: 'var(--spyne-radius-pill)', padding: '1px 7px',
                  }}>{rate}%</span>
                </div>
              )}
              {unconfirmedCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MaterialSymbol name="warning" size={12} style={{ color: SPYNE.warningInk }} />
                  <span style={{ fontSize: 12, color: SPYNE.warningInk, fontWeight: 600 }}>
                    {unconfirmedCount} unconfirmed {selectedDay?.isToday ? 'today' : selectedDay ? `on ${selectedDay.dayLabel}` : ''}
                  </span>
                </div>
              )}
            </div>
          )
        })()}

      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: cols, gap: '0 20px',
        padding: '8px 16px', borderBottom: '1px solid var(--spyne-border)',
        background: '#f3f4f6',
      }}>
        <span style={TH}>Time</span>
        <span style={TH}>Customer</span>
        <span style={TH}>Vehicle</span>
        <span style={TH}>Type</span>
        {!isService && <span style={TH}>Rep</span>}
        <span style={TH}>Status</span>
        <span style={{ ...TH, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MaterialSymbol name={isService ? 'event_note' : 'auto_awesome'} size={10} style={{ color: 'var(--spyne-brand)' }} />
          {isService ? 'Advisor Note' : 'Vini Summary'}
        </span>
        <span style={{ ...TH, textAlign: 'right' }}>Actions</span>
      </div>

      {/* Rows */}
      {filtered.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--spyne-text-muted)', fontSize: 13 }}>
          No appointments match the current filters
        </div>
      ) : filtered.map((appt, i) => {
        const cfg           = typeConfig[appt.type] || TYPE_CONFIG['test-drive']
        const sCfg          = STATUS_CONFIG[appt.confirmationStatus] || STATUS_CONFIG.confirmed
        const isUnconfirmed = appt.confirmationStatus === 'unconfirmed'
        const canVisit      = isUnconfirmed || appt.confirmationStatus === 'confirmed' || appt.confirmationStatus === 'in-progress' || appt.confirmationStatus === 'imminent'
        const canReschedule = appt.confirmationStatus !== 'showed'

        return (
          <div
            key={appt.id}
            onClick={() => onSelectAppt(appt)}
            style={{
              display: 'grid', gridTemplateColumns: cols, gap: '0 20px',
              alignItems: 'center',
              padding: '10px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--spyne-border)' : 'none',
              cursor: 'pointer', transition: 'background 100ms',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--spyne-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '16px 0' }}>
              {isUnconfirmed && <MaterialSymbol name="warning" size={11} style={{ color: SPYNE.warningInk, flexShrink: 0 }} />}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--spyne-text-secondary)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                {formatTime(appt.timeStart)}
              </span>
            </div>

            {/* Customer + phone stacked */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--spyne-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appt.customer}
              </div>
              {appt.phone && (
                <a
                  href={`tel:${appt.phone}`}
                  onClick={e => e.stopPropagation()}
                  style={{ fontSize: 11, color: 'var(--spyne-brand)', fontVariantNumeric: 'tabular-nums', textDecoration: 'none', marginTop: 2, display: 'block' }}
                >
                  {formatPhone(appt.phone)}
                </a>
              )}
            </div>

            {/* Vehicle — name + stock/VIN */}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
                {appt.vehicle}
              </div>
              {(appt.stock || appt.vin) && (
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 3,
                    color: 'var(--spyne-text-secondary)',
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {appt.stock && <span>{appt.stock}</span>}
                  {appt.stock && appt.vin && <span style={{ margin: '0 5px', color: 'var(--spyne-text-secondary)', opacity: 0.6 }}>·</span>}
                  {appt.vin && <span>···{appt.vin.slice(-8)}</span>}
                </div>
              )}
            </div>

            {/* Type badge — outlined */}
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: cfg.color, background: 'transparent',
              border: `1px solid ${cfg.color}`,
              borderRadius: 'var(--spyne-radius-pill)', padding: '2px 7px',
              whiteSpace: 'nowrap', display: 'inline-block', justifySelf: 'start',
            }}>
              {cfg.label}
            </span>

            {/* Rep */}
            {!isService && (
              <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {appt.salesperson}
              </span>
            )}

            {/* Status — filled */}
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: sCfg.color, background: sCfg.bg,
              borderRadius: 'var(--spyne-radius-pill)', padding: '2px 8px',
              whiteSpace: 'nowrap', display: 'inline-block',
            }}>
              {sCfg.label}
            </span>

            {/* Vini Summary / Advisor Note — 2-line clamp */}
            {(isService ? appt.agentAction : appt.viniSummary) ? (
              <div style={{
                fontSize: 12, color: 'var(--spyne-text-secondary)', lineHeight: 1.55,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {isService ? appt.agentAction : appt.viniSummary}
              </div>
            ) : <span />}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
              {isUnconfirmed && (
                <ActionBtn
                  title="Mark as Confirmed"
                  icon="check_circle"
                  color={SPYNE.success}
                  hoverBg={SPYNE_SOFT_BG.success}
                />
              )}
              {canVisit && (
                <ActionBtn
                  title="Mark as Visited"
                  icon="how_to_reg"
                  color="var(--spyne-text-muted)"
                  hoverBg="var(--spyne-border)"
                />
              )}
              {canReschedule && (
                <ActionBtn
                  title="Reschedule appointment"
                  icon="event_repeat"
                  color="var(--spyne-text-muted)"
                  hoverBg="var(--spyne-border)"
                />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── No-shows section ──────────────────────────────────────────

function NoShowsSection({ allDays }) {
  const noShows = allDays.flatMap((day) =>
    day.appts
      .filter((a) => a.confirmationStatus === 'no-show')
      .map((a) => ({ ...a, dayLabel: day.dayLabel, date: day.date }))
  )
  if (noShows.length === 0) return null

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
        color: '#EF4444',
      }}>
        <MaterialSymbol name="person_off" size={12} />
        No-Shows · All Week
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {noShows.map((appt) => (
          <div key={appt.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            background: '#FEF2F2',
            borderRadius: 'var(--spyne-radius)',
            border: '1px solid #FECACA',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>
                {appt.customer}
              </span>
              <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)', marginLeft: 10 }}>
                {appt.dayLabel} {appt.date} · {formatTime(appt.timeStart)} · {appt.salesperson}
              </span>
              <div style={{ fontSize: 12, color: 'var(--spyne-text-secondary)', marginTop: 2 }}>
                {appt.vehicle}
              </div>
            </div>
            <button className="spyne-btn-ghost" style={{ fontSize: 11, padding: '3px 10px', gap: 4, flexShrink: 0 }}>
              Reschedule
              <MaterialSymbol name="arrow_forward" size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Detail panel ──────────────────────────────────────────────

const PANEL_LABEL = {
  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.07em', color: 'var(--spyne-text-muted)', marginBottom: 8,
}

function AppointmentDetailPanel({ appt, onClose, typeConfig = TYPE_CONFIG, isService = false }) {
  if (!appt) return null
  const cfg  = typeConfig[appt.type] || TYPE_CONFIG['test-drive']
  const sCfg = STATUS_CONFIG[appt.confirmationStatus] || STATUS_CONFIG.confirmed

  const panel = (
    <div className="console-v2-sales-root max2-spyne">
      <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 59 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '100%',
        background: 'var(--spyne-surface)', borderLeft: '1px solid var(--spyne-border)',
        zIndex: 60, display: 'flex', flexDirection: 'column', overflowY: 'auto', boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--spyne-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: cfg.color, background: cfg.bg, borderRadius: 'var(--spyne-radius-pill)', padding: '2px 8px',
                }}>
                  {cfg.label}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: sCfg.color, background: sCfg.bg, borderRadius: 'var(--spyne-radius-pill)', padding: '2px 8px',
                }}>
                  {sCfg.label}
                </span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--spyne-text-primary)', margin: 0 }}>
                {appt.customer}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--spyne-text-muted)', marginTop: 4 }}>
                {formatTime(appt.timeStart)}{appt.salesperson ? ` · ${appt.salesperson}` : ''}{appt.source ? ` · ${appt.source}` : ''}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--spyne-text-muted)', padding: 4, flexShrink: 0 }}>
              <MaterialSymbol name="close" size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Vehicle (sales) */}
          {!isService && appt.vehicle && (
            <div>
              <p style={PANEL_LABEL}>Vehicle of Interest</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--spyne-text-primary)', marginBottom: 3 }}>{appt.vehicle}</p>
              {appt.budget && <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', marginBottom: 8 }}>{appt.budget}</p>}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {appt.stock && (
                  <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>
                    Stock{' '}
                    <span
                      style={{
                        fontWeight: 500,
                        color: 'var(--spyne-text-secondary)',
                        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      #{appt.stock}
                    </span>
                  </span>
                )}
                {appt.vin && (
                  <span style={{ fontSize: 12, color: 'var(--spyne-text-muted)' }}>
                    VIN{' '}
                    <span
                      style={{
                        fontWeight: 500,
                        color: 'var(--spyne-text-secondary)',
                        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: 11,
                      }}
                    >
                      {appt.vin}
                    </span>
                  </span>
                )}
              </div>
              {appt.daysOnLot > 0 && (
                <p style={{
                  fontSize: 12, marginTop: 6,
                  color: appt.daysOnLot > 45 ? '#EF4444' : appt.daysOnLot > 30 ? SPYNE.warningInk : 'var(--spyne-text-muted)',
                }}>
                  {appt.daysOnLot} days on lot
                </p>
              )}
            </div>
          )}

          {/* Booked service */}
          {isService && appt.bookedService && (
            <div>
              <p style={PANEL_LABEL}>{SERVICE_CONSOLE_TAB_CONTENT.appointments.detailBookedServiceLabel}</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--spyne-text-primary)' }}>{appt.bookedService}</p>
              {appt.vehicle && <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', marginTop: 4 }}>{appt.vehicle}</p>}
              {appt.budget  && <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>{appt.budget}</p>}
            </div>
          )}

          <div style={{ height: 1, background: 'var(--spyne-border)' }} />

          {/* Customer */}
          <div>
            <p style={PANEL_LABEL}>Customer</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {appt.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MaterialSymbol name="phone" size={13} style={{ color: 'var(--spyne-text-muted)', flexShrink: 0 }} />
                  <a href={`tel:${appt.phone}`} style={{ fontSize: 13, color: 'var(--spyne-brand)', fontWeight: 600 }}>{appt.phone}</a>
                </div>
              )}
              {appt.source && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MaterialSymbol name="ads_click" size={13} style={{ color: 'var(--spyne-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>Source: {appt.source}</span>
                </div>
              )}
              {appt.isBeBack && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MaterialSymbol name="replay" size={13} style={{ color: SPYNE.warningInk, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: SPYNE.warningInk }}>Be-back</span>
                </div>
              )}
              {appt.tradeIn && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MaterialSymbol name="swap_horiz" size={13} style={{ color: 'var(--spyne-text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--spyne-text-secondary)' }}>Trade-in: {appt.tradeIn}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--spyne-border)' }} />

          {/* Vini summary (sales) */}
          {!isService && appt.viniSummary && (
            <div>
              <p style={{ ...PANEL_LABEL, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MaterialSymbol name="auto_awesome" size={11} style={{ color: 'var(--spyne-brand)' }} />
                Vini Summary
              </p>
              <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', lineHeight: 1.6 }}>{appt.viniSummary}</p>
            </div>
          )}

          {/* Agent note (service) */}
          {isService && appt.agentAction && (
            <div>
              <p style={PANEL_LABEL}>{SERVICE_CONSOLE_TAB_CONTENT.appointments.detailAgentNoteLabel}</p>
              <p style={{ fontSize: 13, color: 'var(--spyne-text-secondary)', lineHeight: 1.5 }}>{appt.agentAction}</p>
            </div>
          )}

          <div style={{ height: 1, background: 'var(--spyne-border)' }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`tel:${appt.phone}`} className="spyne-btn-primary" style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <MaterialSymbol name="phone" size={13} /> Call
              </a>
              <button className="spyne-btn-ghost" style={{ flex: 1, justifyContent: 'center', gap: 6, fontSize: 13 }}>
                <MaterialSymbol name="chat" size={13} /> Message
              </button>
            </div>
            {appt.confirmationStatus === 'unconfirmed' && (
              <button className="spyne-btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12, color: SPYNE.success }}>
                <MaterialSymbol name="check_circle" size={13} /> Mark Confirmed
              </button>
            )}
            <button className="spyne-btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12 }}>
              <MaterialSymbol name="event_repeat" size={13} /> Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(panel, document.body)
}

// ── Service: keep original calendar grid ──────────────────────

const HOUR_START = 8
const HOUR_END   = 19
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const ROW_HEIGHT = 64

function layoutAppts(list) {
  const sorted = [...list].sort((a, b) => a.timeStart - b.timeStart)
  const columns = []
  sorted.forEach((appt) => {
    let placed = false
    for (const col of columns) {
      if (appt.timeStart >= col[col.length - 1].timeEnd) { col.push(appt); placed = true; break }
    }
    if (!placed) columns.push([appt])
  })
  const totalCols = columns.length
  return columns.flatMap((col, colIdx) => col.map((appt) => ({ appt, colIdx, totalCols })))
}

function WeekGrid({ days, onSelectAppt, typeConfig = TYPE_CONFIG }) {
  const GUTTER = 52
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--spyne-border)', paddingBottom: 10 }}>
        <div style={{ width: GUTTER, flexShrink: 0 }} />
        {days.map((day) => (
          <div key={day.key} style={{
            flex: 1, textAlign: 'center', paddingBottom: 8,
            borderLeft: '1px solid var(--spyne-border)',
            background: day.isToday ? 'var(--spyne-brand-subtle)' : 'transparent',
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-text-muted)', marginBottom: 3, paddingTop: 10 }}>{day.dayLabel}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-text-primary)', lineHeight: 1 }}>{day.date.split(' ')[1]}</p>
            <p style={{ fontSize: 10, color: 'var(--spyne-text-muted)', marginTop: 2 }}>{day.date.split(' ')[0]}</p>
            {day.appts.length > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 5, minWidth: 18, height: 18, borderRadius: 'var(--spyne-radius-pill)', padding: '0 5px', fontSize: 10, fontWeight: 700, background: day.isToday ? 'var(--spyne-brand)' : 'var(--spyne-border)', color: day.isToday ? '#fff' : 'var(--spyne-text-secondary)' }}>
                {day.appts.length}
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', position: 'relative' }}>
        <div style={{ width: GUTTER, flexShrink: 0, position: 'relative' }}>
          {HOURS.map((h) => (
            <div key={h} style={{ height: ROW_HEIGHT, position: 'relative' }}>
              <span style={{ position: 'absolute', top: -8, right: 8, fontSize: 10, fontWeight: 500, color: 'var(--spyne-text-muted)', whiteSpace: 'nowrap' }}>
                {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
              </span>
            </div>
          ))}
        </div>
        {days.map((day) => {
          const laid = layoutAppts(day.appts)
          return (
            <div key={day.key} style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--spyne-border)', background: day.isToday ? 'var(--spyne-brand-subtle)' : 'transparent' }}>
              {HOURS.map((h) => (
                <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: (h - HOUR_START) * ROW_HEIGHT, height: ROW_HEIGHT, borderTop: `1px solid ${day.isToday ? 'var(--spyne-brand-muted)' : 'var(--spyne-border)'}`, opacity: day.isToday ? 0.5 : 1 }} />
              ))}
              <div style={{ height: HOURS.length * ROW_HEIGHT }} />
              {laid.map(({ appt, colIdx, totalCols }) => {
                const cfg    = typeConfig[appt.type] || TYPE_CONFIG.appointment
                const top    = (appt.timeStart - HOUR_START) * ROW_HEIGHT + 2
                const height = Math.max((appt.timeEnd - appt.timeStart) * ROW_HEIGHT - 4, 22)
                const width  = totalCols > 1 ? `calc(${100 / totalCols}% - 3px)` : 'calc(100% - 6px)'
                const left   = totalCols > 1 ? `calc(${(colIdx / totalCols) * 100}% + 3px)` : '3px'
                return (
                  <div key={appt.id} onClick={() => onSelectAppt(appt)} style={{ position: 'absolute', top, left, width, height, background: cfg.bg, border: `1.5px solid ${cfg.color}44`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 5, padding: '3px 6px', cursor: 'pointer', overflow: 'hidden', boxShadow: appt.status === 'started' ? `0 0 0 2px ${cfg.color}` : 'none' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: cfg.color, lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.customer.split(' ')[0]}</p>
                    {height > 32 && <p style={{ fontSize: 9, color: cfg.color, opacity: 0.8, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cfg.label}</p>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────

const SERVICE_LEGEND_KEYS = ['mpi', 'oil-change', 'recall', 'diagnostic', 'repair', 'pickup']

export default function AppointmentsPage({ department = 'sales' }) {
  const isService  = department === 'service'
  const weekSource = isService ? SERVICE_WEEK_DATA : WEEK_DATA
  const typeConfig = isService ? SERVICE_TYPE_CONFIG : TYPE_CONFIG

  const [weekIdx,        setWeekIdx]        = useState(0)
  const [selectedAppt,   setSelectedAppt]   = useState(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const w = weekSource[0]
    return w.days.find((d) => d.isToday)?.key ?? w.days[0].key
  })

  const week = weekSource[weekIdx]
  const totalAppts = week.days.reduce((s, d) => s + d.appts.length, 0)

  // Fallback: if selected day doesn't exist in current week, use today or first
  const effectiveDayKey = week.days.find((d) => d.key === selectedDayKey)
    ? selectedDayKey
    : (week.days.find((d) => d.isToday)?.key ?? week.days[0].key)
  const selectedDay = week.days.find((d) => d.key === effectiveDayKey) ?? week.days[0]

  const dayHeading = selectedDay.isToday
    ? `Today — ${selectedDay.dayLabel} ${selectedDay.date}`
    : `${selectedDay.dayLabel} ${selectedDay.date}`

  function handleSelectDay(key) {
    setSelectedDayKey(key)
    setSelectedAppt(null)
  }

  function handleWeekChange(delta) {
    const next = Math.min(Math.max(weekIdx + delta, 0), weekSource.length - 1)
    setWeekIdx(next)
    const newWeek = weekSource[next]
    setSelectedDayKey(newWeek.days.find((d) => d.isToday)?.key ?? newWeek.days[0].key)
    setSelectedAppt(null)
  }

  const MONTH_ABBRS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const currentMonthAbbr = (week.days[3]?.date ?? week.days[0].date).split(' ')[0]
  const currentYear = 2026

  function handleMonthSelect(monthAbbr) {
    const idx = weekSource.findIndex(w => w.days.some(d => d.date.startsWith(monthAbbr)))
    if (idx !== -1) {
      setWeekIdx(idx)
      const newWeek = weekSource[idx]
      setSelectedDayKey(newWeek.days.find((d) => d.isToday)?.key ?? newWeek.days[0].key)
      setSelectedAppt(null)
    }
    setShowMonthPicker(false)
  }

  const availableMonths = new Set(weekSource.flatMap(w => w.days.map(d => d.date.split(' ')[0])))

  return (
    <div className={cn('spyne-animate-fade-in', spyneSalesLayout.pageStack)}>
      {/* Sticky header */}
      <div className={cn('sticky z-[30] -mx-max2-page bg-spyne-page px-max2-page pt-4 pb-3', 'top-[6rem] lg:top-10')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className={max2Classes.pageTitle}>Appointments</h1>
            <p className={`${max2Classes.pageDescription} mt-0.5`}>
              {week.weekLabel} · {totalAppts} appointment{totalAppts !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Service legend */}
            {isService && (
              <div className="flex flex-wrap items-center gap-3">
                {SERVICE_LEGEND_KEYS.map((key) => {
                  const cfg = typeConfig[key]
                  return (
                    <div key={key} className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-sm" style={{ background: cfg.color }} />
                      <span className="text-[11px] font-medium text-spyne-text-secondary">{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2" style={{ marginTop: -16 }}>
        {/* Month + week navigation bar */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowMonthPicker(v => !v)}
            className="flex h-8 cursor-pointer items-center gap-1 rounded-md border border-spyne-border bg-spyne-surface px-3 text-xs font-semibold text-spyne-text-secondary"
          >
            {currentMonthAbbr} {currentYear}
            <MaterialSymbol name={showMonthPicker ? 'expand_less' : 'expand_more'} size={14} />
          </button>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => handleWeekChange(-1)} disabled={weekIdx === 0}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-spyne-border bg-spyne-surface text-spyne-text-secondary disabled:cursor-not-allowed disabled:opacity-40">
              <MaterialSymbol name="chevron_left" size={15} />
            </button>
            <button type="button" onClick={() => handleWeekChange(-weekIdx)}
              className={cn('h-8 cursor-pointer rounded-md border border-spyne-border px-3 font-semibold text-xs', weekIdx === 0 ? 'bg-spyne-primary-soft text-spyne-primary' : 'bg-spyne-surface text-spyne-text-secondary')}>
              This Week
            </button>
            <button type="button" onClick={() => handleWeekChange(1)} disabled={weekIdx === weekSource.length - 1}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-spyne-border bg-spyne-surface text-spyne-text-secondary disabled:cursor-not-allowed disabled:opacity-40">
              <MaterialSymbol name="chevron_right" size={15} />
            </button>
          </div>
        </div>

        {/* Week strip + Day list in one card */}
        <div className="spyne-card">
          <div className="p-4">
            <WeekStrip days={week.days} selectedDayKey={effectiveDayKey} onSelectDay={handleSelectDay} />
          </div>
          <DayList appts={selectedDay.appts} typeConfig={typeConfig} onSelectAppt={setSelectedAppt} allDays={week.days} selectedDay={selectedDay} isService={isService} />
        </div>

        {/* No-shows */}
        <NoShowsSection allDays={week.days} />
      </div>

      {selectedAppt && (
        <AppointmentDetailPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          typeConfig={typeConfig}
          isService={isService}
        />
      )}
    </div>
  )
}
