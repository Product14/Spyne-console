// Max 2.0 Types — Dealer flywheel architecture

// ─── Lifecycle ───

export type LifecycleStage = "sourcing" | "recon" | "studio" | "marketing" | "sales" | "service"

export interface LifecycleNode {
  stage: LifecycleStage
  label: string
  href: string
  health: "green" | "yellow" | "red"
  openTasks: number
  threats: number
  opportunities: number
  summary: string
}

// ─── Core Metrics ───

export type MetricStatus = "above" | "at" | "below"

export interface CoreMetric {
  id: string
  name: string
  value: number
  target: number
  unit: string
  status: MetricStatus
  trend: number[]
}

// ─── Threats ───

export type ThreatCategory = "aging" | "no-leads" | "recon-delay" | "pricing-risk" | "margin-erosion" | "stock-photos" | "wholesale-candidate"

export interface Threat {
  id: string
  category: ThreatCategory
  label: string
  count: number
  description: string
  severity: "critical" | "warning"
  href: string
  filterParams?: string
  vehicles?: ThreatVehicle[]
}

export interface ThreatVehicle {
  vin: string
  year: number
  make: string
  model: string
  detail: string
}

// ─── Opportunities ───

export type OpportunityCategory = "hot-vehicle" | "price-drop-follow-up" | "demand-not-in-stock" | "service-lane-acquisition" | "market-gap" | "campaign-ready"

export interface Opportunity {
  id: string
  category: OpportunityCategory
  label: string
  count: number
  description: string
  impact: "high" | "medium"
  href: string
  filterParams?: string
  items?: OpportunityItem[]
}

export interface OpportunityItem {
  id: string
  title: string
  detail: string
}

// ─── Insights ───

export interface InsightPreset {
  id: string
  question: string
  category: "service" | "sales" | "inventory" | "market"
  icon: string
}

// ─── Sourcing ───

export interface DemandSignal {
  id: string
  vehicleDescription: string
  source: "vini-sales" | "vini-service" | "market-data" | "customer-inquiry"
  sourceLabel: string
  requestCount: number
  avgBudget: number
  urgency: "high" | "medium" | "low"
  inStock: boolean
  segment: string
}

export interface ServiceLaneOpportunity {
  id: string
  customerName: string
  currentVehicle: string
  roAmount: number
  visitReason: string
  buySignal: string
  estimatedEquity: number
}

export interface MarketGap {
  segment: string
  marketDemand: number
  yourInventory: number
  gap: number
  avgPrice: number
  monthlyOpportunity: number
}

export interface TradeInOpportunity {
  id: string
  customerName: string
  vehicleOffered: string
  estimatedACV: number
  estimatedFrontGross: number
  source: string
  daysOld: number
}

// ─── Studio AI (studio routes) ───

export type MediaStatus = "real-photos" | "clone-photos" | "stock-photos" | "no-photos"
export type PublishStatus = "live" | "pending" | "not-published"

/**
 * Studio processing stage for Images, 360°, or Video in the inventory Media column.
 * Draft, Review, and Processing while work is in flight; Ready when that asset type is cleared for the listing.
 */
export type StudioMediaAssetStage = "draft" | "review" | "processing" | "ready"

/** Optional per–asset-type overrides; omitted keys are derived from listing flags when absent. */
export interface MerchandisingVehicleMediaPipeline {
  images?: StudioMediaAssetStage
  /** 360° spin */
  spin360?: StudioMediaAssetStage
  video?: StudioMediaAssetStage
}

export interface MerchandisingVehicle {
  vin: string
  year: number
  make: string
  model: string
  trim: string
  /** Dealer stock number shown in inventory tables (e.g. STK1122). */
  stockNumber?: string
  /** Correlation or DMS id shown next to stock (optional). */
  listingExternalId?: string
  /** ISO 8601; drives “Last updated” when present. */
  listingUpdatedAt?: string
  bodyStyle?: string
  exteriorColor?: string
  fuelType?: string
  thumbnailUrl: string
  mediaStatus: MediaStatus
  photoCount: number
  has360: boolean
  hasVideo: boolean
  publishStatus: PublishStatus
  /** ISO 8601; “Last published” line in the publish sync tooltip when status is live. */
  lastPublishedAt?: string
  listingScore: number
  daysInStock: number
  /** ISO 8601; date added to inventory, shown under Age. When omitted, UI derives a date from days in stock. */
  inventoryCreatedAt?: string
  /** Estimated front gross ($); used for holding cost as % of margin. Omit to derive a demo proxy from price. */
  estimatedFrontGross?: number
  vdpViews: number
  price: number
  odometer: number
  /** EPA combined MPG; shown in vehicle spec tooltip when set. */
  combinedMpg?: number
  hasDescription: boolean
  isNew: boolean
  daysToFrontline: number
  wrongHeroAngle: boolean
  incompletePhotoSet: boolean
  hasSunGlare: boolean
  missingWalkaroundVideo: boolean
  /** Per–asset-type processing stage for the Media column. Omit to derive from listing flags. */
  mediaPipeline?: MerchandisingVehicleMediaPipeline
  /** ISO 8601; date Spyne received photos for this vehicle. */
  photosReceivedAt?: string
}

export interface MerchandisingSummary {
  totalVehicles: number
  realPhotos: number
  clonePhotosNeedReal: number
  noPhotos: number
  preliminaryPhotoshoot: number
  newVehicles: number
  usedVehicles: number
  avgDaysToFrontline: number
  /** Average dealer input time (upload / submission) in days. */
  avgInputTimeDays: number
  /** Average Spyne AI processing + publish time in hours. */
  avgSpyneProcessingHours: number
  websiteScore: number
  /** Optional week-by-week series for Studio KPI card chart; last value should match `websiteScore`. */
  websiteScoreTrend?: number[]
  /** Optional series for days-to-frontline card; last value should match `avgDaysToFrontline`. */
  avgDaysToFrontlineTrend?: number[]
  age0to4: number
  age5to30: number
  age31to45: number
  age45Plus: number
  // Wins with photos
  winsWithPhotos: number
  winsWithoutPhotos: number
  totalPhotosCount: number
  // Engagement
  vdpViewsThisWeek: number
  vdpViewsLastWeek: number
  avgVdpTimeSeconds: number
  avgVdpTimeLastWeekSeconds: number
  websiteLeadsThisWeek: number
  websiteLeadsLastWeek: number
  leadConversionRate: number
  leadConversionRateLastWeek: number
}

// ─── Sales ───

export interface LeadFunnelStage {
  stage: string
  count: number
  conversionRate: number
}

export interface VehicleInquiry {
  id: string
  vehicleDescription: string
  vin?: string
  inStock: boolean
  inquiryCount: number
  lastInquiry: string
  source: string
  status: "hot" | "warm" | "cold"
}

export interface FollowUpOpportunity {
  id: string
  customerName: string
  vehicleInterest: string
  lastContact: string
  reason: string
  priority: "high" | "medium" | "low"
}

// ─── Service ───

export interface ServiceBuyOpportunity {
  id: string
  customerName: string
  currentVehicle: string
  vehicleAge: number
  mileage: number
  roTotal: number
  buySignal: string
  estimatedEquity: number
  recommendedAction: string
}

export interface ServicePainPoint {
  id: string
  category: string
  mentionCount: number
  sentiment: "negative" | "neutral"
  topQuotes: string[]
  trend: "rising" | "stable" | "declining"
}

export type ROStatus = "open" | "in-progress" | "waiting-parts" | "waiting-approval" | "completed" | "invoiced"

export interface RepairOrder {
  id: string
  roNumber: string
  customerName: string
  phone: string
  vehicle: string
  vin: string
  mileageIn: number
  advisor: string
  technician: string
  status: ROStatus
  openedAt: string
  promisedTime: string
  laborHours: number
  partsTotal: number
  laborTotal: number
  totalEstimate: number
  complaints: string[]
  bay: string | null
  isWaiter: boolean
  hasConcern: boolean
}

export type BayStatus = "occupied" | "available" | "out-of-service"

export interface ServiceBay {
  id: string
  bayNumber: string
  type: "general" | "express" | "alignment" | "body" | "detail"
  status: BayStatus
  technician: string | null
  currentRO: string | null
  currentVehicle: string | null
  estimatedCompletion: string | null
}

export type AppointmentStatus = "confirmed" | "checked-in" | "in-progress" | "completed" | "no-show" | "cancelled"

export interface ServiceAppointment {
  id: string
  customerName: string
  phone: string
  vehicle: string
  scheduledTime: string
  advisor: string
  serviceType: string
  estimatedDuration: string
  status: AppointmentStatus
  isWaiter: boolean
  notes: string
}

export type ActionItemPriority = "urgent" | "high" | "medium" | "low"
export type ActionItemStatus = "pending" | "in-progress" | "overdue" | "completed"

export interface ServiceActionItem {
  id: string
  title: string
  description: string
  roNumber: string | null
  customerName: string | null
  assignedTo: string
  priority: ActionItemPriority
  status: ActionItemStatus
  dueDate: string
  category: "follow-up" | "approval" | "parts" | "callback" | "warranty" | "inspection"
}

export interface ServiceSummaryData {
  openROs: number
  completedToday: number
  revenueToday: number
  avgROValue: number
  csiScore: number
  csiTarget: number
  techEfficiency: number
  partsGrossMargin: number
  laborGrossMargin: number
  appointmentsToday: number
  waitersInProgress: number
  baysOccupied: number
  totalBays: number
  overdueActions: number
}

export interface ServiceRevenueData {
  day: string
  labor: number
  parts: number
  total: number
}

export interface TechPerformance {
  id: string
  name: string
  hoursAvailable: number
  hoursBilled: number
  efficiency: number
  rosCompleted: number
  avgROValue: number
  comebacks: number
}

// ─── Sales (Operations) ───

export interface SalesSummaryData {
  unitsSoldMTD: number
  unitsTarget: number
  totalGrossMTD: number
  avgFrontGross: number
  avgBackGross: number
  closeRate: number
  appointmentsToday: number
  testDrivesToday: number
  pendingDeals: number
  dealsInFI: number
  beBackCount: number
  avgDaysToClose: number
  newLeadsToday: number
  followUpsDue: number
}

export interface SalesAppointment {
  id: string
  customerName: string
  phone: string
  vehicleInterest: string
  scheduledTime: string
  salesperson: string
  type: "appointment" | "test-drive" | "delivery" | "fi-signing" | "be-back"
  status: "confirmed" | "arrived" | "completed" | "no-show" | "cancelled"
  source: string
  notes: string
}

export interface SalesActionItem {
  id: string
  title: string
  description: string
  customerName: string | null
  assignedTo: string
  priority: ActionItemPriority
  status: ActionItemStatus
  dueDate: string
  category: "follow-up" | "desking" | "trade-appraisal" | "credit-app" | "delivery-prep" | "callback"
}

export interface SalespersonPerformance {
  id: string
  name: string
  unitsSold: number
  totalGross: number
  avgFrontGross: number
  avgBackGross: number
  closeRate: number
  appointments: number
  shows: number
  testDrives: number
  activeLeads: number
  avgResponseTime: string
}

export interface DailyLogEntry {
  id: string
  time: string
  salesperson: string
  activity: "up" | "phone-up" | "internet-lead" | "be-back" | "appointment" | "test-drive" | "write-up" | "sold" | "lost"
  customerName: string
  vehicleInterest: string
  result: string
  notes: string
}

// ─── Lot View ───

export type LotStatus = "frontline" | "in-recon" | "arriving" | "wholesale-candidate" | "sold-pending"
export type PricingPosition = "below-market" | "at-market" | "above-market"

export interface LotVehicle {
  vin: string
  stockNumber: string
  year: number
  make: string
  model: string
  trim: string
  color: string
  mileage: number
  listPrice: number
  marketPrice: number
  acv: number
  pricingPosition: PricingPosition
  costToMarketPct: number
  daysInStock: number
  lotStatus: LotStatus
  photoCount: number
  hasRealPhotos: boolean
  isNew?: boolean
  /** ISO 8601; date Spyne received photos for this vehicle. */
  photosReceivedAt?: string
  /** When false, merchandising CTAs may show Generate 360. Omit when unknown (treated as true in demos). */
  hasSpin360?: boolean
  vdpViews: number
  leads: number
  lastLeadDate: string | null
  recentPriceChange: number | null
  holdingCostPerDay: number
  totalHoldingCost: number
  estimatedFrontGross: number
  segment: string
  location: string
}

export interface LotSummary {
  totalUnits: number
  frontlineReady: number
  inRecon: number
  arriving: number
  avgDaysInStock: number
  avgCostToMarket: number
  totalHoldingCostToday: number
  aged30Plus: number
  aged45Plus: number
  aged60Plus: number
  noLeads5Days: number
  noPhotos: number
}

// ─── Customers ───

export type CustomerStatus = "active-lead" | "sold" | "service-only" | "lost" | "be-back"
export type CustomerSource = "website" | "walk-in" | "phone" | "referral" | "service-lane" | "third-party"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  source: CustomerSource
  assignedSalesperson: string
  firstContactDate: string
  lastContactDate: string
  vehicleInterests: string[]
  currentVehicle: string | null
  estimatedEquity: number | null
  totalTouchpoints: number
  appointmentSet: boolean
  testDriveCompleted: boolean
  creditAppSubmitted: boolean
  notes: string
}

export interface CustomerSummary {
  totalActive: number
  newThisWeek: number
  appointmentsToday: number
  followUpsDue: number
  beBackOpportunities: number
  avgResponseTime: string
  conversionRate: number
  lostThisMonth: number
}

export interface CustomerActivity {
  id: string
  customerId: string
  type: "call" | "email" | "text" | "visit" | "test-drive" | "appointment" | "credit-app" | "deal-closed"
  description: string
  timestamp: string
  salesperson: string
}

// ─── Inspection & Recon (kanban mocks) ───

export type ReconStage = "inspection" | "mechanical" | "body" | "detail" | "photo" | "online"

export interface ReconVehicle {
  vin: string
  year: number
  make: string
  model: string
  currentStage: ReconStage
  daysInRecon: number
  daysInCurrentStage: number
  slaTarget: number
  slaBreach: boolean
  reconCost: number
  estimatedCost: number
  doorRate: number
  internalBilled: number
  doorRateCompliance: number
  assignedTo: string
}

export interface ReconStageStats {
  stage: ReconStage
  label: string
  count: number
  avgDays: number
  breachCount: number
}

// ─── Marketing (channel ROI mocks) ───

export interface MarketingChannel {
  source: string
  spend: number
  leads: number
  appointments: number
  unitsSold: number
  costPerSale: number
  costPerLead: number
  conversionRate: number
}
