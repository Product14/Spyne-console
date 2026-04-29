import type {
  LifecycleNode, CoreMetric, Threat, ThreatVehicle, Opportunity, OpportunityItem,
  InsightPreset, DemandSignal, ServiceLaneOpportunity, MarketGap, TradeInOpportunity,
  MerchandisingVehicle, MerchandisingSummary, LeadFunnelStage, VehicleInquiry, FollowUpOpportunity,
  ServiceBuyOpportunity, ServicePainPoint,
  LotVehicle, LotSummary, Customer, CustomerSummary, CustomerActivity,
  RepairOrder, ServiceBay, ServiceAppointment, ServiceActionItem, ServiceSummaryData,
  ServiceRevenueData, TechPerformance,
  SalesSummaryData, SalesAppointment, SalesActionItem, SalespersonPerformance, DailyLogEntry,
  ReconStage, ReconVehicle, ReconStageStats, MarketingChannel,
} from "@/services/max-2/max-2.types"
import { demoVehicleThumbnailByKey } from "@/lib/demo-vehicle-hero-images"

// ─── Lifecycle Strip ───

export const mockLifecycle: LifecycleNode[] = [
  { stage: "sourcing", label: "Sourcing", href: "/max-2/sourcing", health: "yellow", openTasks: 3, threats: 1, opportunities: 8, summary: "8 unmet vehicle requests" },
  { stage: "recon", label: "Inspection & Recon", href: "/max-2/recon", health: "red", openTasks: 5, threats: 2, opportunities: 1, summary: "2 SLA breaches" },
  { stage: "studio", label: "Studio AI", href: "/max-2/studio", health: "yellow", openTasks: 4, threats: 3, opportunities: 2, summary: "3 stock-photo-only units" },
  { stage: "marketing", label: "Marketing", href: "/max-2/marketing", health: "green", openTasks: 2, threats: 0, opportunities: 4, summary: "2 hot-car campaigns available" },
  { stage: "sales", label: "Sales", href: "/max-2/sales", health: "yellow", openTasks: 6, threats: 1, opportunities: 4, summary: "4 urgent close opportunities" },
  { stage: "service", label: "Service", href: "/max-2/service", health: "green", openTasks: 2, threats: 0, opportunities: 2, summary: "2 buyback candidates" },
]

// ─── Core Metrics ───

export const mockCoreMetrics: CoreMetric[] = [
  { id: "units-mtd", name: "Units Sold MTD", value: 78, target: 100, unit: "units", status: "below", trend: [92, 88, 101, 95, 103, 78] },
  { id: "turn-rate", name: "Turn Rate", value: 1.8, target: 1.8, unit: "x", status: "at", trend: [1.5, 1.6, 1.7, 1.8, 1.9, 1.8] },
  { id: "holding-cost", name: "Holding Cost/Day", value: 46.44, target: 45, unit: "$/day", status: "at", trend: [48, 47, 46, 47, 46, 46.44] },
  { id: "days-to-frontline", name: "Days to Frontline", value: 2.8, target: 3, unit: "days", status: "above", trend: [4.2, 3.8, 3.5, 3.1, 2.9, 2.8] },
  { id: "aged-45-plus", name: "Aged 45+ Units", value: 8, target: 10, unit: "%", status: "above", trend: [14, 12, 11, 10, 9, 8] },
  { id: "avg-gross-margin", name: "Avg Gross Margin", value: 3500, target: 3500, unit: "$", status: "at", trend: [3200, 3350, 3400, 3450, 3500, 3500] },
]

// ─── Threats ───

export const mockThreats: Threat[] = [
  {
    id: "t1", category: "aging", label: "Aged 45+ days", count: 3, severity: "critical",
    description: "3 cars aged 45+ days — need walk and wholesale decision",
    href: "/max-2/sourcing?filter=aged-45",
    vehicles: [
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "48 days, ROI/Day $71" },
      { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", detail: "55 days, ROI/Day $64" },
      { vin: "5NPE34AF9GH100009", year: 2020, make: "Hyundai", model: "Sonata", detail: "42 days, ROI/Day $64" },
    ],
  },
  {
    id: "t2", category: "no-leads", label: "No leads in 5+ days", count: 2, severity: "warning",
    description: "2 cars live for 5+ days with zero leads",
    href: "/max-2/marketing?filter=no-leads",
    vehicles: [
      { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", detail: "5 days online, 0 leads, rank #14" },
      { vin: "1N4BL4BV5LC100006", year: 2019, make: "Nissan", model: "Altima", detail: "7 days online, 0 leads" },
    ],
  },
  {
    id: "t3", category: "recon-delay", label: "Stuck in recon", count: 4, severity: "critical",
    description: "4 cars stuck in recon past 3-day SLA",
    href: "/max-2/recon?filter=sla-breach",
    vehicles: [
      { vin: "RVIN006", year: 2021, make: "Nissan", model: "Rogue", detail: "3.5 days in detail" },
      { vin: "RVIN008", year: 2020, make: "Subaru", model: "Outback", detail: "4 days in photo" },
      { vin: "RVIN011", year: 2019, make: "Mazda", model: "CX-3", detail: "3.2 days in mechanical" },
      { vin: "RVIN012", year: 2020, make: "Ford", model: "Edge", detail: "3.8 days in body" },
    ],
  },
  {
    id: "t4", category: "pricing-risk", label: "Priced above market", count: 2, severity: "warning",
    description: "2 cars priced above market average and losing VDP clicks",
    href: "/max-2/marketing?filter=overpriced",
    vehicles: [
      { vin: "WBAPH5C55BA100005", year: 2020, make: "BMW", model: "3 Series", detail: "101.2% C2M, rank #14, VDPs down 35%" },
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "94.5% C2M, rank #11, VDPs down 22%" },
    ],
  },
  {
    id: "t5", category: "stock-photos", label: "Stock photos only", count: 3, severity: "warning",
    description: "3 units online with stock photos only — hurting conversion",
    href: "/max-2/studio?filter=stock-photos",
    vehicles: [
      { vin: "RVIN002", year: 2020, make: "Toyota", model: "Tacoma", detail: "8 stock photos, 0 real" },
      { vin: "RVIN004", year: 2022, make: "Hyundai", model: "Tucson", detail: "6 stock photos, 0 real" },
      { vin: "RVIN010", year: 2021, make: "Honda", model: "Civic", detail: "4 stock photos, 0 real" },
    ],
  },
  {
    id: "t6", category: "margin-erosion", label: "Margin erosion", count: 2, severity: "warning",
    description: "2 units with daily burn exceeding remaining margin in <10 days",
    href: "/max-2/sourcing?filter=margin-risk",
    vehicles: [
      { vin: "KNDJP3A54J7100010", year: 2019, make: "Kia", model: "Sportage", detail: "$3,500 margin left, $46/day burn = 76 days" },
      { vin: "3GNAXUEV9NL100007", year: 2018, make: "Chevrolet", model: "Equinox", detail: "$2,100 margin left, $46/day burn = 45 days" },
    ],
  },
]

// ─── Opportunities ───

export const mockOpportunities: Opportunity[] = [
  {
    id: "o1", category: "hot-vehicle", label: "Hot vehicles with rising demand", count: 4, impact: "high",
    description: "4 vehicles with increasing VDP views and market demand this week",
    href: "/max-2/sales?filter=hot-vehicles",
    items: [
      { id: "h1", title: "2021 Ford F-150 XLT", detail: "VDPs up 42% this week, 3 leads pending" },
      { id: "h2", title: "2022 Audi Q5 Premium", detail: "VDPs up 38%, segment demand rising 15%" },
      { id: "h3", title: "2021 Mazda CX-5 Touring", detail: "VDPs up 28%, 2 appointment requests" },
      { id: "h4", title: "2020 Toyota RAV4 XLE", detail: "VDPs up 25%, price sweet spot for zip 78704" },
    ],
  },
  {
    id: "o2", category: "price-drop-follow-up", label: "Price-drop follow-up", count: 3, impact: "medium",
    description: "3 recently repriced vehicles — alert past inquirers",
    href: "/max-2/marketing?filter=price-drop",
    items: [
      { id: "p1", title: "2019 Chevrolet Silverado LT", detail: "Dropped $1,000 on Day 18 — 5 past inquiries to notify" },
      { id: "p2", title: "2022 Honda CR-V EX-L", detail: "Dropped $1,300 on Day 20 — 3 past inquiries" },
      { id: "p3", title: "2020 Hyundai Sonata SEL", detail: "Dropped $600 on Day 35 — 2 past inquiries" },
    ],
  },
  {
    id: "o3", category: "demand-not-in-stock", label: "Requested vehicles not in stock", count: 8, impact: "high",
    description: "8 customer demand signals for vehicles you don't currently carry",
    href: "/max-2/sourcing?filter=unmet-demand",
    items: [
      { id: "d1", title: "Toyota Tacoma TRD ($32-38k)", detail: "6 inquiries this month, 0 in stock" },
      { id: "d2", title: "Honda Pilot EX-L ($35-42k)", detail: "4 inquiries, 0 in stock" },
      { id: "d3", title: "Jeep Wrangler ($28-35k)", detail: "5 inquiries, 0 in stock" },
      { id: "d4", title: "Subaru Outback ($25-32k)", detail: "3 inquiries, 0 in stock" },
      { id: "d5", title: "Ford Bronco Sport ($28-35k)", detail: "4 inquiries, 0 in stock" },
      { id: "d6", title: "Toyota 4Runner ($38-45k)", detail: "3 inquiries, 0 in stock" },
      { id: "d7", title: "Kia Telluride ($35-42k)", detail: "3 inquiries, 0 in stock" },
      { id: "d8", title: "Hyundai Palisade ($38-45k)", detail: "2 inquiries, 0 in stock" },
    ],
  },
  {
    id: "o4", category: "service-lane-acquisition", label: "Service-lane acquisitions", count: 2, impact: "high",
    description: "2 service customers with high-equity vehicles you can acquire",
    href: "/max-2/service?filter=acquisition",
    items: [
      { id: "s1", title: "Maria Gonzalez — 2021 Toyota Highlander", detail: "$8K+ equity, $2,800 RO, expressed upgrade interest" },
      { id: "s2", title: "Robert Kim — 2020 Honda Accord", detail: "$5K+ equity, lease ending in 60 days" },
    ],
  },
  {
    id: "o5", category: "campaign-ready", label: "Campaign-ready vehicles", count: 4, impact: "medium",
    description: "4 vehicles ready for targeted campaigns based on segment demand",
    href: "/max-2/marketing?filter=campaign-ready",
    items: [
      { id: "c1", title: "2021 Ford F-150 XLT", detail: "Truck segment demand up 12%, no active campaign" },
      { id: "c2", title: "2022 Audi Q5 Premium", detail: "Luxury crossover demand strong, no campaign" },
      { id: "c3", title: "2020 Toyota RAV4 XLE", detail: "SUV <$30k demand high, no campaign" },
      { id: "c4", title: "2021 Mazda CX-5 Touring", detail: "Crossover demand rising, no campaign" },
    ],
  },
]

// ─── Insights ───

export const mockInsightPresets: InsightPreset[] = [
  { id: "i1", question: "What are the top pain points from service calls this week?", category: "service", icon: "Wrench" },
  { id: "i2", question: "Which vehicles are customers requesting most that we don't have?", category: "inventory", icon: "Search" },
  { id: "i3", question: "What are the top objections in sales calls this month?", category: "sales", icon: "Phone" },
  { id: "i4", question: "Why are some deals not closing — what patterns do you see?", category: "sales", icon: "TrendingDown" },
  { id: "i5", question: "What's changing in my local market this month?", category: "market", icon: "Globe" },
  { id: "i6", question: "Which SUVs under $35k have the highest demand right now?", category: "inventory", icon: "Car" },
]

// ─── Sourcing ───

export const mockDemandSignals: DemandSignal[] = [
  { id: "ds1", vehicleDescription: "Toyota Tacoma TRD ($32-38k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 6, avgBudget: 35000, urgency: "high", inStock: false, segment: "Truck $30-45k" },
  { id: "ds2", vehicleDescription: "Honda Pilot EX-L ($35-42k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 4, avgBudget: 38000, urgency: "high", inStock: false, segment: "SUV $35-45k" },
  { id: "ds3", vehicleDescription: "Jeep Wrangler ($28-35k)", source: "customer-inquiry", sourceLabel: "Website Inquiry", requestCount: 5, avgBudget: 31000, urgency: "high", inStock: false, segment: "SUV $25-35k" },
  { id: "ds4", vehicleDescription: "Subaru Outback ($25-32k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 3, avgBudget: 28000, urgency: "medium", inStock: false, segment: "Crossover $25-35k" },
  { id: "ds5", vehicleDescription: "Ford Bronco Sport ($28-35k)", source: "market-data", sourceLabel: "Market Intel", requestCount: 4, avgBudget: 30000, urgency: "medium", inStock: false, segment: "SUV $25-35k" },
  { id: "ds6", vehicleDescription: "Toyota 4Runner ($38-45k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 3, avgBudget: 41000, urgency: "medium", inStock: false, segment: "SUV $35-45k" },
  { id: "ds7", vehicleDescription: "Ford F-150 XLT ($30-38k)", source: "vini-sales", sourceLabel: "Sales Calls", requestCount: 8, avgBudget: 34000, urgency: "high", inStock: true, segment: "Truck $30-45k" },
  { id: "ds8", vehicleDescription: "Toyota RAV4 ($25-32k)", source: "customer-inquiry", sourceLabel: "Website Inquiry", requestCount: 5, avgBudget: 27000, urgency: "medium", inStock: true, segment: "Crossover $25-35k" },
]

export const mockServiceLaneOpps: ServiceLaneOpportunity[] = [
  { id: "sl1", customerName: "Maria Gonzalez", currentVehicle: "2021 Toyota Highlander XLE", roAmount: 2800, visitReason: "Major service (60k)", buySignal: "Asked about new models, expressed frustration with repair cost", estimatedEquity: 8200 },
  { id: "sl2", customerName: "Robert Kim", currentVehicle: "2020 Honda Accord Sport", roAmount: 450, visitReason: "Routine maintenance", buySignal: "Lease ending in 60 days, asked about purchase options", estimatedEquity: 5100 },
  { id: "sl3", customerName: "Jennifer Walsh", currentVehicle: "2019 Chevrolet Equinox LT", roAmount: 1900, visitReason: "Transmission concern", buySignal: "Mentioned wanting something bigger, asked about trade value", estimatedEquity: 3800 },
]

export const mockMarketGaps: MarketGap[] = [
  { segment: "Truck $30-45k", marketDemand: 310, yourInventory: 18, gap: 25, avgPrice: 37400, monthlyOpportunity: 50000 },
  { segment: "SUV < $30k", marketDemand: 420, yourInventory: 52, gap: 15, avgPrice: 26800, monthlyOpportunity: 30000 },
  { segment: "Crossover $25-40k", marketDemand: 350, yourInventory: 28, gap: 18, avgPrice: 31500, monthlyOpportunity: 36000 },
  { segment: "Economy < $15k", marketDemand: 260, yourInventory: 22, gap: 8, avgPrice: 12400, monthlyOpportunity: 16000 },
  { segment: "Luxury $40k+", marketDemand: 180, yourInventory: 12, gap: 5, avgPrice: 48900, monthlyOpportunity: 15000 },
]

export const mockTradeInOpps: TradeInOpportunity[] = [
  { id: "ti1", customerName: "David Park", vehicleOffered: "2020 Toyota Camry SE", estimatedACV: 19500, estimatedFrontGross: 2200, source: "Walk-in appraisal", daysOld: 1 },
  { id: "ti2", customerName: "Sarah Thompson", vehicleOffered: "2021 Honda CR-V EX", estimatedACV: 24000, estimatedFrontGross: 2800, source: "Online trade tool", daysOld: 2 },
  { id: "ti3", customerName: "Mike Rodriguez", vehicleOffered: "2019 Ford F-150 XLT", estimatedACV: 28000, estimatedFrontGross: 3200, source: "Sales desk", daysOld: 0 },
]

// ─── Helpers ───

function daysAgoIso(n: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

// ─── Studio AI (studio routes) ───

const mockMerchandisingVehiclesBase: MerchandisingVehicle[] = [
  { vin: "1FTEW1EP5MFA10001", stockNumber: "S10001", year: 2021, make: "Ford",       model: "F-150",     trim: "XLT",      thumbnailUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 42, has360: true,  hasVideo: true,  publishStatus: "live",          lastPublishedAt: "2025-11-05T10:30:00.000Z", listingScore: 95, daysInStock: 8,  vdpViews: 340, price: 38500, estimatedFrontGross: 3800, odometer: 32400, combinedMpg: 20, bodyStyle: "Pickup", exteriorColor: "Oxford White", fuelType: "Gasoline", hasDescription: true,  isNew: false, daysToFrontline: 2, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: true,  missingWalkaroundVideo: false },
  { vin: "5YJSA1E26MF123456", stockNumber: "S10035", year: 0,    make: "",         model: "",          trim: "",          thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 0,  vdpViews: 0,   price: 0,     odometer: 0,     hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10002", stockNumber: "S10002", year: 2020, make: "Toyota",     model: "Camry",     trim: "SE",       thumbnailUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 36, has360: true,  hasVideo: false, publishStatus: "live",          listingScore: 88, daysInStock: 12, vdpViews: 210, price: 24900, odometer: 35200, combinedMpg: 32, bodyStyle: "Sedan", exteriorColor: "Celestial Silver", fuelType: "Gasoline", hasDescription: true,  isNew: false, daysToFrontline: 3, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: true,  mediaPipeline: { images: "ready", spin360: "ready", video: "processing" } },
  { vin: "1FTEW1EP5MFA10003", stockNumber: "S10003", year: 2019, make: "Chevrolet",  model: "Silverado", trim: "LT",       thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 30, has360: false, hasVideo: false, publishStatus: "live",          listingScore: 72, daysInStock: 22, vdpViews: 185, price: 36500, odometer: 28900, combinedMpg: 17, bodyStyle: "Pickup", exteriorColor: "Black", fuelType: "Gasoline", hasDescription: true,  isNew: false, daysToFrontline: 1, wrongHeroAngle: true,  incompletePhotoSet: false, hasSunGlare: true,  missingWalkaroundVideo: true,  mediaPipeline: { images: "processing", spin360: "draft", video: "draft" } },
  { vin: "1FTEW1EP5MFA10004", stockNumber: "S10004", year: 2022, make: "Honda",      model: "CR-V",      trim: "EX-L",     thumbnailUrl: "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 28, has360: false, hasVideo: false, publishStatus: "live",          listingScore: 68, daysInStock: 28, vdpViews: 150, price: 29400, odometer: 18200, combinedMpg: 30, bodyStyle: "SUV", exteriorColor: "Crystal Black", fuelType: "Gasoline", hasDescription: true,  isNew: false, daysToFrontline: 2, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10005", stockNumber: "S10005", year: 2020, make: "BMW",        model: "3 Series",  trim: "330i",     thumbnailUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 8,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 35, daysInStock: 35, vdpViews: 62,  price: 33500, odometer: 42100, combinedMpg: 26, bodyStyle: "Sedan", exteriorColor: "Alpine White", fuelType: "Gasoline", hasDescription: false, isNew: false, daysToFrontline: 5, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: true,  missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10006", stockNumber: "S10006", year: 2019, make: "Nissan",     model: "Altima",    trim: "2.5 SV",   thumbnailUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 6,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 30, daysInStock: 38, vdpViews: 44,  price: 18900, odometer: 55200, hasDescription: false, isNew: false, daysToFrontline: 4, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10007", stockNumber: "S10007", year: 2021, make: "Mazda",      model: "CX-5",      trim: "Touring",  thumbnailUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 38, has360: true,  hasVideo: true,  publishStatus: "live",          listingScore: 92, daysInStock: 5,  vdpViews: 280, price: 28900, odometer: 24600, hasDescription: true,  isNew: false, daysToFrontline: 1, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10008", stockNumber: "S10008", year: 2024, make: "Hyundai",    model: "Tucson",    trim: "SEL",      thumbnailUrl: "https://images.unsplash.com/photo-1606611013016-969c19ba27d5?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 4,  has360: false, hasVideo: false, publishStatus: "pending",       listingScore: 18, daysInStock: 3,  vdpViews: 0,   price: 32200, odometer: 12,    hasDescription: false, isNew: true,  daysToFrontline: 3, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true,  mediaPipeline: { images: "review", spin360: "draft", video: "draft" } },
  { vin: "1FTEW1EP5MFA10009", stockNumber: "S10009", year: 2022, make: "Toyota",     model: "RAV4",      trim: "XLE",      thumbnailUrl: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 40, has360: true,  hasVideo: false, publishStatus: "live",          listingScore: 90, daysInStock: 19, vdpViews: 295, price: 29400, odometer: 28900, hasDescription: true,  isNew: false, daysToFrontline: 2, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: true,  missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10010", stockNumber: "S10010", year: 2025, make: "Audi",       model: "Q5",        trim: "Premium",  thumbnailUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 32, has360: false, hasVideo: false, publishStatus: "live",          listingScore: 70, daysInStock: 6,  vdpViews: 175, price: 48900, odometer: 8,     hasDescription: true,  isNew: true,  daysToFrontline: 1, wrongHeroAngle: true,  incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: true,  mediaPipeline: { images: "review", spin360: "processing", video: "draft" } },
  { vin: "1FTEW1EP5MFA10011", stockNumber: "S10011", year: 2020, make: "Honda",      model: "Civic",     trim: "Sport",    thumbnailUrl: "", mediaStatus: "no-photos", photoCount: 0, has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 1,  vdpViews: 0,   price: 24500, odometer: 22400, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10012", stockNumber: "S10012", year: 2025, make: "Toyota",     model: "Camry",     trim: "SE",       thumbnailUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 44, has360: true,  hasVideo: true,  publishStatus: "live",          listingScore: 97, daysInStock: 4,  vdpViews: 420, price: 31800, odometer: 5,     hasDescription: true,  isNew: true,  daysToFrontline: 1, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10013", stockNumber: "S10013", year: 2018, make: "Chevrolet",  model: "Equinox",   trim: "LT",       thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 22, has360: false, hasVideo: false, publishStatus: "live",          listingScore: 55, daysInStock: 48, vdpViews: 38,  price: 21500, odometer: 61300, hasDescription: true,  isNew: false, daysToFrontline: 3, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10014", stockNumber: "S10014", year: 2019, make: "Kia",        model: "Sportage",  trim: "LX",       thumbnailUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=120&h=80&fit=crop", mediaStatus: "real-photos",  photoCount: 20, has360: false, hasVideo: false, publishStatus: "live",          listingScore: 60, daysInStock: 55, vdpViews: 28,  price: 19800, odometer: 52800, hasDescription: false, isNew: false, daysToFrontline: 4, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10015", stockNumber: "S10015", year: 2020, make: "Hyundai",    model: "Sonata",    trim: "SEL",      thumbnailUrl: "https://images.unsplash.com/photo-1606611013016-969c19ba27d5?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 5,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 40, daysInStock: 42, vdpViews: 55,  price: 22900, odometer: 38700, hasDescription: true,  isNew: false, daysToFrontline: 6, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  // ── Additional vehicles for fuller action-item tables ──
  { vin: "1FTEW1EP5MFA10016", stockNumber: "S10016", year: 2023, make: "Ford",       model: "Bronco",     trim: "Big Bend",  thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 2,  vdpViews: 0,   price: 37800, odometer: 15200, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10017", stockNumber: "S10017", year: 2024, make: "Toyota",     model: "Tacoma",     trim: "TRD Sport", thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 1,  vdpViews: 0,   price: 42500, odometer: 8,     hasDescription: false, isNew: true,  daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10018", stockNumber: "S10018", year: 2022, make: "Jeep",       model: "Wrangler",   trim: "Sahara",    thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 1,  vdpViews: 0,   price: 44200, odometer: 21300, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10019", stockNumber: "S10019", year: 2021, make: "Subaru",     model: "Outback",    trim: "Premium",   thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 3,  vdpViews: 0,   price: 27600, odometer: 34800, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10020", stockNumber: "S10020", year: 2023, make: "Volkswagen", model: "Tiguan",     trim: "SE",        thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 2,  vdpViews: 0,   price: 31400, odometer: 9800,  hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10021", stockNumber: "S10021", year: 2020, make: "GMC",        model: "Terrain",    trim: "SLE",       thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 4,  vdpViews: 0,   price: 23800, odometer: 45200, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10022", stockNumber: "S10022", year: 2024, make: "Kia",        model: "Telluride",  trim: "EX",        thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 1,  vdpViews: 0,   price: 45900, odometer: 5,     hasDescription: false, isNew: true,  daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10023", stockNumber: "S10023", year: 2019, make: "Lexus",      model: "RX 350",     trim: "Base",      thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 2,  vdpViews: 0,   price: 34500, odometer: 52100, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10024", stockNumber: "S10024", year: 2021, make: "Dodge",      model: "Durango",    trim: "GT",        thumbnailUrl: "", mediaStatus: "no-photos",    photoCount: 0,  has360: false, hasVideo: false, publishStatus: "not-published", listingScore: 0,  daysInStock: 3,  vdpViews: 0,   price: 35200, odometer: 29400, hasDescription: false, isNew: false, daysToFrontline: 0, wrongHeroAngle: false, incompletePhotoSet: false, hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10025", stockNumber: "S10025", year: 2022, make: "Nissan",     model: "Pathfinder", trim: "SL",        thumbnailUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 6,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 42, daysInStock: 33, vdpViews: 32,  price: 33700, odometer: 31500, hasDescription: false, isNew: false, daysToFrontline: 5, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10026", stockNumber: "S10026", year: 2023, make: "Honda",      model: "Pilot",      trim: "Sport",     thumbnailUrl: "https://images.unsplash.com/photo-1568844293986-8d0400f4745b?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 7,  has360: false, hasVideo: false, publishStatus: "pending",       listingScore: 38, daysInStock: 14, vdpViews: 18,  price: 41200, odometer: 11200, hasDescription: false, isNew: false, daysToFrontline: 4, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true,  mediaPipeline: { images: "processing", spin360: "review", video: "draft" } },
  { vin: "1FTEW1EP5MFA10027", stockNumber: "S10027", year: 2020, make: "Toyota",     model: "Highlander", trim: "LE",        thumbnailUrl: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 4,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 35, daysInStock: 50, vdpViews: 22,  price: 29800, odometer: 58200, hasDescription: true,  isNew: false, daysToFrontline: 7, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10028", stockNumber: "S10028", year: 2021, make: "Chevrolet",  model: "Blazer",     trim: "RS",        thumbnailUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 3,  has360: false, hasVideo: false, publishStatus: "pending",       listingScore: 28, daysInStock: 18, vdpViews: 12,  price: 34100, odometer: 26800, hasDescription: false, isNew: false, daysToFrontline: 5, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10029", stockNumber: "S10029", year: 2022, make: "Mazda",      model: "CX-9",       trim: "Touring",   thumbnailUrl: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 5,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 32, daysInStock: 40, vdpViews: 41,  price: 36200, odometer: 28400, hasDescription: false, isNew: false, daysToFrontline: 6, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10030", stockNumber: "S10030", year: 2019, make: "Ford",       model: "Edge",       trim: "SEL",       thumbnailUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 7,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 30, daysInStock: 46, vdpViews: 29,  price: 22400, odometer: 62100, hasDescription: false, isNew: false, daysToFrontline: 5, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: false },
  { vin: "1FTEW1EP5MFA10031", stockNumber: "S10031", year: 2023, make: "Hyundai",    model: "Palisade",   trim: "SEL",       thumbnailUrl: "https://images.unsplash.com/photo-1606611013016-969c19ba27d5?w=120&h=80&fit=crop", mediaStatus: "clone-photos", photoCount: 5,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 45, daysInStock: 25, vdpViews: 48,  price: 43500, odometer: 14200, hasDescription: true,  isNew: false, daysToFrontline: 4, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10032", stockNumber: "S10032", year: 2020, make: "Acura",      model: "RDX",        trim: "A-Spec",    thumbnailUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 3,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 25, daysInStock: 52, vdpViews: 15,  price: 31200, odometer: 47300, hasDescription: false, isNew: false, daysToFrontline: 8, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10033", stockNumber: "S10033", year: 2021, make: "Ram",        model: "1500",       trim: "Big Horn",  thumbnailUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 6,  has360: false, hasVideo: false, publishStatus: "pending",       listingScore: 28, daysInStock: 38, vdpViews: 35,  price: 39800, odometer: 33600, hasDescription: true,  isNew: false, daysToFrontline: 6, wrongHeroAngle: false, incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
  { vin: "1FTEW1EP5MFA10034", stockNumber: "S10034", year: 2022, make: "Infiniti",   model: "QX60",       trim: "Luxe",      thumbnailUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=120&h=80&fit=crop", mediaStatus: "stock-photos", photoCount: 4,  has360: false, hasVideo: false, publishStatus: "live",          listingScore: 22, daysInStock: 44, vdpViews: 19,  price: 42800, odometer: 22800, hasDescription: false, isNew: false, daysToFrontline: 7, wrongHeroAngle: true,  incompletePhotoSet: true,  hasSunGlare: false, missingWalkaroundVideo: true  },
]

export const mockMerchandisingVehicles: MerchandisingVehicle[] = mockMerchandisingVehiclesBase.map((v) => ({
  ...v,
  thumbnailUrl: demoVehicleThumbnailByKey(v.vin),
  photosReceivedAt: v.photoCount > 0 ? daysAgoIso(Math.max(1, v.daysInStock - 1)) : undefined,
}))

export const mockMerchandisingSummary: MerchandisingSummary = {
  totalVehicles: 35,
  realPhotos: 6,
  clonePhotosNeedReal: 10,
  noPhotos: 10,
  preliminaryPhotoshoot: 12,
  newVehicles: 5,
  usedVehicles: 29,
  avgDaysToFrontline: 2.5,
  avgInputTimeDays: 1.7,
  avgSpyneProcessingHours: 2.8,
  websiteScore: 7.2,
  websiteScoreTrend: [6.0, 6.85, 6.35, 6.9, 6.45, 7.05, 6.75, 7.2],
  avgDaysToFrontlineTrend: [4.6, 3.4, 4.1, 3.2, 3.8, 2.9, 3.3, 2.5],
  age0to4: 4,
  age5to30: 6,
  age31to45: 3,
  age45Plus: 2,
  // Wins with photos
  winsWithPhotos: 45,
  winsWithoutPhotos: 13,
  totalPhotosCount: 892,
  // Engagement
  vdpViewsThisWeek: 1284,
  vdpViewsLastWeek: 1105,
  avgVdpTimeSeconds: 142,
  avgVdpTimeLastWeekSeconds: 118,
  websiteLeadsThisWeek: 38,
  websiteLeadsLastWeek: 31,
  leadConversionRate: 2.96,
  leadConversionRateLastWeek: 2.81,
}

// ─── Sales ───

export const mockLeadFunnel: LeadFunnelStage[] = [
  { stage: "Website Visits", count: 4200, conversionRate: 100 },
  { stage: "VDP Views", count: 1850, conversionRate: 44 },
  { stage: "Leads Generated", count: 420, conversionRate: 22.7 },
  { stage: "Appointments Set", count: 156, conversionRate: 37.1 },
  { stage: "Shows", count: 106, conversionRate: 67.9 },
  { stage: "Deals Closed", count: 78, conversionRate: 73.6 },
]

export const mockVehicleInquiries: VehicleInquiry[] = [
  { id: "vi1", vehicleDescription: "2021 Ford F-150 XLT", vin: "1FTEW1EP5MFA00001", inStock: true, inquiryCount: 8, lastInquiry: "2 hours ago", source: "Website + Phone", status: "hot" },
  { id: "vi2", vehicleDescription: "2022 Audi Q5 Premium", vin: "WA1LFAFP1EA100011", inStock: true, inquiryCount: 5, lastInquiry: "4 hours ago", source: "Website", status: "hot" },
  { id: "vi3", vehicleDescription: "Toyota Tacoma TRD (any)", vin: undefined, inStock: false, inquiryCount: 6, lastInquiry: "Yesterday", source: "Sales Calls", status: "hot" },
  { id: "vi4", vehicleDescription: "2021 Mazda CX-5 Touring", vin: "JM1NDAL75N0100008", inStock: true, inquiryCount: 4, lastInquiry: "Today", source: "Walk-in + Website", status: "warm" },
  { id: "vi5", vehicleDescription: "Honda Pilot EX-L (any)", vin: undefined, inStock: false, inquiryCount: 4, lastInquiry: "2 days ago", source: "Website", status: "warm" },
  { id: "vi6", vehicleDescription: "2020 Toyota RAV4 XLE", vin: "4T1B11HK5KU100012", inStock: true, inquiryCount: 3, lastInquiry: "Today", source: "Phone", status: "warm" },
]

export const mockFollowUps: FollowUpOpportunity[] = [
  { id: "fu1", customerName: "James Wilson", vehicleInterest: "2021 Ford F-150 XLT", lastContact: "3 days ago", reason: "Asked for financing info, never responded", priority: "high" },
  { id: "fu2", customerName: "Amanda Chen", vehicleInterest: "2022 Honda CR-V EX-L", lastContact: "5 days ago", reason: "Price just dropped $1,300 — notify", priority: "high" },
  { id: "fu3", customerName: "Carlos Mendez", vehicleInterest: "SUV under $30k", lastContact: "1 week ago", reason: "Visited lot but didn't buy, no follow-up yet", priority: "medium" },
  { id: "fu4", customerName: "Rachel Green", vehicleInterest: "2022 Audi Q5 Premium", lastContact: "2 days ago", reason: "Test drove, said 'thinking about it'", priority: "high" },
]

// ─── Service ───

export const mockServiceBuyOpps: ServiceBuyOpportunity[] = [
  { id: "sb1", customerName: "Maria Gonzalez", currentVehicle: "2021 Toyota Highlander XLE", vehicleAge: 4, mileage: 62000, roTotal: 2800, buySignal: "Asked about new models, frustrated with repair cost", estimatedEquity: 8200, recommendedAction: "Offer trade-in appraisal, show payment comparison" },
  { id: "sb2", customerName: "Robert Kim", currentVehicle: "2020 Honda Accord Sport", vehicleAge: 5, mileage: 48000, roTotal: 450, buySignal: "Lease ending in 60 days", estimatedEquity: 5100, recommendedAction: "Present lease-end options, show used inventory" },
  { id: "sb3", customerName: "Jennifer Walsh", currentVehicle: "2019 Chevrolet Equinox LT", vehicleAge: 6, mileage: 78000, roTotal: 1900, buySignal: "Wants something bigger, asked about trade value", estimatedEquity: 3800, recommendedAction: "Appraise trade, show 3-row SUV options" },
  { id: "sb4", customerName: "Thomas Brown", currentVehicle: "2018 Ford Explorer XLT", vehicleAge: 7, mileage: 92000, roTotal: 3200, buySignal: "Repair cost exceeds 15% of vehicle value", estimatedEquity: 2100, recommendedAction: "Show total cost of ownership, offer upgrade path" },
]

export const mockServicePainPoints: ServicePainPoint[] = [
  { id: "sp1", category: "Repair Cost Frustration", mentionCount: 18, sentiment: "negative", topQuotes: ["This repair costs more than my payment", "I didn't expect this bill"], trend: "rising" },
  { id: "sp2", category: "Wait Time Complaints", mentionCount: 12, sentiment: "negative", topQuotes: ["I've been waiting 3 hours", "Nobody told me it would take this long"], trend: "stable" },
  { id: "sp3", category: "Parts Availability", mentionCount: 8, sentiment: "negative", topQuotes: ["The part won't be here for 2 weeks?", "I can't wait that long"], trend: "declining" },
  { id: "sp4", category: "Vehicle Upgrade Interest", mentionCount: 15, sentiment: "neutral", topQuotes: ["What would I get for my car?", "I've been thinking about something newer"], trend: "rising" },
]

// ─── Service Operations ───

export const mockRepairOrders: RepairOrder[] = [
  { id: "ro1", roNumber: "RO-24-1042", customerName: "Maria Gonzalez", phone: "(512) 555-0218", vehicle: "2021 Toyota Highlander XLE", vin: "5TDDZRFH0MS100001", mileageIn: 62340, advisor: "Tony R.", technician: "Mike S.", status: "in-progress", openedAt: "8:15 AM", promisedTime: "3:00 PM", laborHours: 4.2, partsTotal: 820, laborTotal: 630, totalEstimate: 1450, complaints: ["Engine light on", "Brake noise", "60k service"], bay: "Bay 3", isWaiter: false, hasConcern: false },
  { id: "ro2", roNumber: "RO-24-1043", customerName: "Robert Kim", phone: "(512) 555-0375", vehicle: "2020 Honda Accord Sport", vin: "1HGCV1F34LA100002", mileageIn: 48200, advisor: "Lisa M.", technician: "Carlos D.", status: "in-progress", openedAt: "8:30 AM", promisedTime: "11:00 AM", laborHours: 1.5, partsTotal: 120, laborTotal: 225, totalEstimate: 345, complaints: ["Oil change", "Tire rotation"], bay: "Bay 6", isWaiter: true, hasConcern: false },
  { id: "ro3", roNumber: "RO-24-1044", customerName: "Jennifer Walsh", phone: "(512) 555-0778", vehicle: "2019 Chevrolet Equinox LT", vin: "3GNAXUEV9NL100003", mileageIn: 78100, advisor: "Tony R.", technician: "Brian W.", status: "waiting-approval", openedAt: "7:45 AM", promisedTime: "2:00 PM", laborHours: 6.0, partsTotal: 1340, laborTotal: 900, totalEstimate: 2240, complaints: ["Transmission shudder", "AC not cold"], bay: "Bay 2", isWaiter: false, hasConcern: true },
  { id: "ro4", roNumber: "RO-24-1045", customerName: "Thomas Brown", phone: "(512) 555-0445", vehicle: "2018 Ford Explorer XLT", vin: "1FMSK8FH7JGA00004", mileageIn: 92400, advisor: "Lisa M.", technician: "Mike S.", status: "waiting-parts", openedAt: "Yesterday", promisedTime: "Tomorrow 12:00 PM", laborHours: 3.0, partsTotal: 680, laborTotal: 450, totalEstimate: 1130, complaints: ["Water pump leak"], bay: null, isWaiter: false, hasConcern: false },
  { id: "ro5", roNumber: "RO-24-1046", customerName: "David Park", phone: "(512) 555-0456", vehicle: "2020 Toyota Camry SE", vin: "4T1B11HK5KU100005", mileageIn: 35200, advisor: "Tony R.", technician: "Carlos D.", status: "open", openedAt: "9:00 AM", promisedTime: "1:00 PM", laborHours: 2.0, partsTotal: 95, laborTotal: 300, totalEstimate: 395, complaints: ["30k service", "Windshield wiper replacement"], bay: null, isWaiter: true, hasConcern: false },
  { id: "ro6", roNumber: "RO-24-1047", customerName: "Amanda Chen", phone: "(512) 555-0287", vehicle: "2018 Nissan Rogue SV", vin: "JN8AT2MV5JW100006", mileageIn: 71800, advisor: "Lisa M.", technician: "Brian W.", status: "completed", openedAt: "7:30 AM", promisedTime: "11:30 AM", laborHours: 2.5, partsTotal: 340, laborTotal: 375, totalEstimate: 715, complaints: ["Brakes squealing", "Cabin filter replacement"], bay: "Bay 1", isWaiter: false, hasConcern: false },
  { id: "ro7", roNumber: "RO-24-1048", customerName: "Sarah Thompson", phone: "(512) 555-0533", vehicle: "2018 Toyota RAV4 LE", vin: "2T3BFREV5JW100007", mileageIn: 68400, advisor: "Tony R.", technician: "Carlos D.", status: "in-progress", openedAt: "9:15 AM", promisedTime: "2:30 PM", laborHours: 3.5, partsTotal: 420, laborTotal: 525, totalEstimate: 945, complaints: ["Alignment", "Tie rod replacement", "Brake flush"], bay: "Bay 5", isWaiter: false, hasConcern: false },
  { id: "ro8", roNumber: "RO-24-1049", customerName: "James Wilson", phone: "(512) 555-0142", vehicle: "2017 Toyota Tundra SR5", vin: "5TFDY5F17HX100008", mileageIn: 88600, advisor: "Lisa M.", technician: "Mike S.", status: "invoiced", openedAt: "Yesterday", promisedTime: "Yesterday 4:00 PM", laborHours: 5.0, partsTotal: 1150, laborTotal: 750, totalEstimate: 1900, complaints: ["Suspension noise", "4WD service", "Battery replacement"], bay: null, isWaiter: false, hasConcern: false },
]

export const mockServiceBays: ServiceBay[] = [
  { id: "b1", bayNumber: "Bay 1", type: "general", status: "occupied", technician: "Brian W.", currentRO: "RO-24-1047", currentVehicle: "2018 Nissan Rogue SV", estimatedCompletion: "11:30 AM" },
  { id: "b2", bayNumber: "Bay 2", type: "general", status: "occupied", technician: "Brian W.", currentRO: "RO-24-1044", currentVehicle: "2019 Chevrolet Equinox LT", estimatedCompletion: "2:00 PM" },
  { id: "b3", bayNumber: "Bay 3", type: "general", status: "occupied", technician: "Mike S.", currentRO: "RO-24-1042", currentVehicle: "2021 Toyota Highlander XLE", estimatedCompletion: "3:00 PM" },
  { id: "b4", bayNumber: "Bay 4", type: "alignment", status: "available", technician: null, currentRO: null, currentVehicle: null, estimatedCompletion: null },
  { id: "b5", bayNumber: "Bay 5", type: "general", status: "occupied", technician: "Carlos D.", currentRO: "RO-24-1048", currentVehicle: "2018 Toyota RAV4 LE", estimatedCompletion: "2:30 PM" },
  { id: "b6", bayNumber: "Bay 6", type: "express", status: "occupied", technician: "Carlos D.", currentRO: "RO-24-1043", currentVehicle: "2020 Honda Accord Sport", estimatedCompletion: "11:00 AM" },
  { id: "b7", bayNumber: "Bay 7", type: "express", status: "available", technician: null, currentRO: null, currentVehicle: null, estimatedCompletion: null },
  { id: "b8", bayNumber: "Bay 8", type: "body", status: "out-of-service", technician: null, currentRO: null, currentVehicle: null, estimatedCompletion: null },
]

export const mockServiceAppointments: ServiceAppointment[] = [
  { id: "sa1", customerName: "Lisa Chang", phone: "(512) 555-0912", vehicle: "2017 Honda HR-V EX", scheduledTime: "10:30 AM", advisor: "Tony R.", serviceType: "Oil Change + Inspection", estimatedDuration: "1.5 hrs", status: "confirmed", isWaiter: true, notes: "First visit — wants prices for tires too" },
  { id: "sa2", customerName: "Carlos Mendez", phone: "(512) 555-0391", vehicle: "2019 Ford Escape SE", scheduledTime: "11:00 AM", advisor: "Lisa M.", serviceType: "Brake Inspection", estimatedDuration: "1 hr", status: "confirmed", isWaiter: false, notes: "Heard grinding noise when braking" },
  { id: "sa3", customerName: "Rachel Green", phone: "(512) 555-0104", vehicle: "2019 BMW X3 xDrive30i", scheduledTime: "1:00 PM", advisor: "Tony R.", serviceType: "40k Service", estimatedDuration: "3 hrs", status: "confirmed", isWaiter: false, notes: "Drop off, needs loaner" },
  { id: "sa4", customerName: "Brian Foster", phone: "(512) 555-0855", vehicle: "2015 Chevrolet Colorado LT", scheduledTime: "2:00 PM", advisor: "Lisa M.", serviceType: "AC Recharge + Diagnostic", estimatedDuration: "2 hrs", status: "confirmed", isWaiter: true, notes: "" },
  { id: "sa5", customerName: "Mike Rodriguez", phone: "(512) 555-0601", vehicle: "2021 Ford F-150 XLT", scheduledTime: "8:00 AM", advisor: "Tony R.", serviceType: "First Oil Change", estimatedDuration: "45 min", status: "completed", isWaiter: true, notes: "New purchase — comp'd first service" },
  { id: "sa6", customerName: "No Name Provided", phone: "(512) 555-0999", vehicle: "2020 Hyundai Sonata SEL", scheduledTime: "9:00 AM", advisor: "Lisa M.", serviceType: "Recall — Fuel Pump", estimatedDuration: "2 hrs", status: "no-show", isWaiter: false, notes: "Recall notice mailed, never confirmed" },
]

export const mockServiceActionItems: ServiceActionItem[] = [
  { id: "ai1", title: "Customer approval needed — RO-24-1044", description: "Jennifer Walsh needs to approve $2,240 transmission repair. Called twice, no answer.", roNumber: "RO-24-1044", customerName: "Jennifer Walsh", assignedTo: "Tony R.", priority: "urgent", status: "overdue", dueDate: "Today 10:00 AM", category: "approval" },
  { id: "ai2", title: "Parts on order — Water pump for Explorer", description: "Water pump for 2018 Ford Explorer on order from Ford, ETA tomorrow morning.", roNumber: "RO-24-1045", customerName: "Thomas Brown", assignedTo: "Lisa M.", priority: "high", status: "in-progress", dueDate: "Tomorrow 10:00 AM", category: "parts" },
  { id: "ai3", title: "Callback — Maria Gonzalez decline follow-up", description: "Maria declined cabin filter ($89). Follow up next visit or call in 2 weeks.", roNumber: "RO-24-1042", customerName: "Maria Gonzalez", assignedTo: "Tony R.", priority: "medium", status: "pending", dueDate: "Mar 25", category: "follow-up" },
  { id: "ai4", title: "Warranty claim submission", description: "Submit warranty claim for Robert Kim's Honda — powertrain coverage may apply to valve adjustment.", roNumber: "RO-24-1043", customerName: "Robert Kim", assignedTo: "Lisa M.", priority: "high", status: "pending", dueDate: "Today 3:00 PM", category: "warranty" },
  { id: "ai5", title: "Multi-point inspection results — call customer", description: "Sarah Thompson's RAV4 has worn rear brakes. Need to discuss additional work.", roNumber: "RO-24-1048", customerName: "Sarah Thompson", assignedTo: "Tony R.", priority: "high", status: "pending", dueDate: "Today 12:00 PM", category: "callback" },
  { id: "ai6", title: "Reschedule no-show — recall appointment", description: "Hyundai Sonata recall customer didn't show. Attempt to reschedule.", roNumber: null, customerName: null, assignedTo: "Lisa M.", priority: "medium", status: "pending", dueDate: "Today 2:00 PM", category: "follow-up" },
  { id: "ai7", title: "Vehicle inspection — pre-purchase", description: "Walk-in customer wants pre-purchase inspection on a vehicle they're buying privately.", roNumber: null, customerName: null, assignedTo: "Tony R.", priority: "low", status: "pending", dueDate: "Today 4:00 PM", category: "inspection" },
]

export const mockServiceSummary: ServiceSummaryData = {
  openROs: 6,
  completedToday: 2,
  revenueToday: 4815,
  avgROValue: 1140,
  csiScore: 4.6,
  csiTarget: 4.5,
  techEfficiency: 92,
  partsGrossMargin: 48,
  laborGrossMargin: 72,
  appointmentsToday: 6,
  waitersInProgress: 2,
  baysOccupied: 5,
  totalBays: 8,
  overdueActions: 1,
}

export const mockServiceRevenue: ServiceRevenueData[] = [
  { day: "Mon", labor: 2800, parts: 1900, total: 4700 },
  { day: "Tue", labor: 3200, parts: 2400, total: 5600 },
  { day: "Wed", labor: 2600, parts: 1700, total: 4300 },
  { day: "Thu", labor: 3500, parts: 2800, total: 6300 },
  { day: "Fri", labor: 2900, parts: 2100, total: 5000 },
  { day: "Today", labor: 1980, parts: 2835, total: 4815 },
]

export const mockTechPerformance: TechPerformance[] = [
  { id: "tp1", name: "Mike S.", hoursAvailable: 8.0, hoursBilled: 7.8, efficiency: 97.5, rosCompleted: 3, avgROValue: 1250, comebacks: 0 },
  { id: "tp2", name: "Carlos D.", hoursAvailable: 8.0, hoursBilled: 7.2, efficiency: 90.0, rosCompleted: 4, avgROValue: 680, comebacks: 0 },
  { id: "tp3", name: "Brian W.", hoursAvailable: 8.0, hoursBilled: 7.0, efficiency: 87.5, rosCompleted: 2, avgROValue: 1480, comebacks: 1 },
]

// ─── Sales Operations ───

export const mockSalesSummary: SalesSummaryData = {
  unitsSoldMTD: 78,
  unitsTarget: 100,
  totalGrossMTD: 273000,
  avgFrontGross: 2800,
  avgBackGross: 1200,
  closeRate: 73.6,
  appointmentsToday: 5,
  testDrivesToday: 3,
  pendingDeals: 4,
  dealsInFI: 2,
  beBackCount: 1,
  avgDaysToClose: 4.2,
  newLeadsToday: 6,
  followUpsDue: 4,
}

export const mockSalesAppointments: SalesAppointment[] = [
  { id: "sap1", customerName: "David Park", phone: "(512) 555-0456", vehicleInterest: "Toyota Camry SE / Honda Civic Sport", scheduledTime: "10:00 AM", salesperson: "Sarah K.", type: "fi-signing", status: "confirmed", source: "Walk-in", notes: "Credit approved, trade appraisal done. Ready to close." },
  { id: "sap2", customerName: "Lisa Chang", phone: "(512) 555-0912", vehicleInterest: "2021 Mazda CX-5 Touring", scheduledTime: "11:30 AM", salesperson: "Marcus D.", type: "appointment", status: "confirmed", source: "AutoTrader", notes: "First visit. Has been shopping online for 2 weeks." },
  { id: "sap3", customerName: "Rachel Green", phone: "(512) 555-0104", vehicleInterest: "2022 Audi Q5 Premium", scheduledTime: "1:00 PM", salesperson: "Jake P.", type: "be-back", status: "confirmed", source: "Referral", notes: "Test drove yesterday. Coming back to discuss numbers." },
  { id: "sap4", customerName: "Amanda Chen", phone: "(512) 555-0287", vehicleInterest: "2022 Honda CR-V EX-L", scheduledTime: "2:30 PM", salesperson: "Sarah K.", type: "test-drive", status: "confirmed", source: "Website", notes: "Price just dropped $1,300. Called to schedule." },
  { id: "sap5", customerName: "James Wilson", phone: "(512) 555-0142", vehicleInterest: "2021 Ford F-150 XLT", scheduledTime: "9:00 AM", salesperson: "Marcus D.", type: "appointment", status: "no-show", source: "Website", notes: "Asked for financing info earlier. Did not show." },
]

export const mockSalesActionItems: SalesActionItem[] = [
  { id: "sai1", title: "Call James Wilson — hot lead gone cold", description: "No-showed 9 AM appointment. Had asked about financing. Try to reschedule.", customerName: "James Wilson", assignedTo: "Marcus D.", priority: "urgent", status: "overdue", dueDate: "Today 10:00 AM", category: "follow-up" },
  { id: "sai2", title: "Desk deal — Rachel Green (Audi Q5)", description: "Be-back at 1 PM. Prepare numbers with $6,100 trade equity. She wants payment under $650/mo.", customerName: "Rachel Green", assignedTo: "Jake P.", priority: "high", status: "pending", dueDate: "Today 12:30 PM", category: "desking" },
  { id: "sai3", title: "Trade appraisal — Sarah Thompson", description: "Online trade tool submission for 2018 RAV4. Needs appraisal before appointment can be set.", customerName: "Sarah Thompson", assignedTo: "Jake P.", priority: "high", status: "pending", dueDate: "Today 11:00 AM", category: "trade-appraisal" },
  { id: "sai4", title: "Follow up Carlos Mendez — lot visitor", description: "Walked the lot last week, interested in SUV under $30k. No follow-up sent yet.", customerName: "Carlos Mendez", assignedTo: "Marcus D.", priority: "medium", status: "pending", dueDate: "Today 2:00 PM", category: "follow-up" },
  { id: "sai5", title: "Delivery prep — Mike Rodriguez (F-150)", description: "Deal closed. F&I complete. Vehicle needs detail and delivery prep for pickup tomorrow.", customerName: "Mike Rodriguez", assignedTo: "Marcus D.", priority: "high", status: "in-progress", dueDate: "Tomorrow 10:00 AM", category: "delivery-prep" },
  { id: "sai6", title: "Run credit app — David Park", description: "Trade-in appraisal complete. Customer submitted credit app. Pull bureau and get approvals.", customerName: "David Park", assignedTo: "Sarah K.", priority: "high", status: "completed", dueDate: "Today 9:00 AM", category: "credit-app" },
  { id: "sai7", title: "Contact be-back — Jennifer Walsh", description: "Service customer with $3,800 equity in 2019 Equinox. Wants a 3-row SUV. Not contacted in 8 days.", customerName: "Jennifer Walsh", assignedTo: "Sarah K.", priority: "medium", status: "pending", dueDate: "Today 3:00 PM", category: "callback" },
]

export const mockSalespersonPerformance: SalespersonPerformance[] = [
  { id: "sp-1", name: "Marcus D.", unitsSold: 28, totalGross: 98000, avgFrontGross: 2800, avgBackGross: 1200, closeRate: 78, appointments: 42, shows: 35, testDrives: 30, activeLeads: 8, avgResponseTime: "1.2 hrs" },
  { id: "sp-2", name: "Sarah K.", unitsSold: 24, totalGross: 86400, avgFrontGross: 2600, avgBackGross: 1000, closeRate: 72, appointments: 38, shows: 30, testDrives: 25, activeLeads: 6, avgResponseTime: "1.5 hrs" },
  { id: "sp-3", name: "Jake P.", unitsSold: 26, totalGross: 93600, avgFrontGross: 3000, avgBackGross: 1400, closeRate: 76, appointments: 40, shows: 33, testDrives: 28, activeLeads: 5, avgResponseTime: "1.8 hrs" },
]

export const mockDailyLog: DailyLogEntry[] = [
  { id: "dl1", time: "8:15 AM", salesperson: "Marcus D.", activity: "internet-lead", customerName: "Lisa Chang", vehicleInterest: "2021 Mazda CX-5", result: "Appointment set 11:30 AM", notes: "AutoTrader lead" },
  { id: "dl2", time: "8:30 AM", salesperson: "Sarah K.", activity: "appointment", customerName: "David Park", vehicleInterest: "Toyota Camry / Honda Civic", result: "In F&I", notes: "Credit approved, closing today" },
  { id: "dl3", time: "9:00 AM", salesperson: "Marcus D.", activity: "appointment", customerName: "James Wilson", vehicleInterest: "2021 Ford F-150 XLT", result: "No-show", notes: "Called, no answer" },
  { id: "dl4", time: "9:20 AM", salesperson: "Jake P.", activity: "internet-lead", customerName: "Sarah Thompson", vehicleInterest: "2021 Honda CR-V EX", result: "Appraisal needed", notes: "Online trade tool submission" },
  { id: "dl5", time: "9:45 AM", salesperson: "Sarah K.", activity: "phone-up", customerName: "New caller", vehicleInterest: "SUV under $25k", result: "Appointment tomorrow 10 AM", notes: "Budget buyer, needs financing" },
  { id: "dl6", time: "10:15 AM", salesperson: "Jake P.", activity: "up", customerName: "Walk-in couple", vehicleInterest: "2022 Audi Q5 Premium", result: "Test drive", notes: "Serious buyers, trading 2019 Lexus RX" },
  { id: "dl7", time: "10:30 AM", salesperson: "Marcus D.", activity: "be-back", customerName: "Rachel Green", vehicleInterest: "2022 Audi Q5 Premium", result: "Confirmed 1 PM", notes: "Coming back to discuss numbers" },
]

// ─── Lot View ───

const mockLotVehiclesBase: LotVehicle[] = [
  { vin: "1FTEW1EP5MFA00001", stockNumber: "A1001", year: 2021, make: "Ford", model: "F-150", trim: "XLT", color: "Oxford White", mileage: 32400, listPrice: 38500, marketPrice: 37800, acv: 33200, pricingPosition: "at-market", costToMarketPct: 98.2, daysInStock: 8, lotStatus: "frontline", photoCount: 42, hasRealPhotos: true, hasSpin360: false, vdpViews: 340, leads: 3, lastLeadDate: "2 hours ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 368, estimatedFrontGross: 3800, segment: "Truck $30-45k", location: "Lot A - Row 3" },
  { vin: "4T1B11HK5KU100012", stockNumber: "A1002", year: 2020, make: "Toyota", model: "RAV4", trim: "XLE", color: "Lunar Rock", mileage: 28900, listPrice: 29400, marketPrice: 29100, acv: 25600, pricingPosition: "at-market", costToMarketPct: 97.9, daysInStock: 19, lotStatus: "frontline", photoCount: 40, hasRealPhotos: true, vdpViews: 295, leads: 2, lastLeadDate: "Today", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 874, estimatedFrontGross: 2800, segment: "Crossover $25-35k", location: "Lot A - Row 5" },
  { vin: "WA1LFAFP1EA100011", stockNumber: "A1003", year: 2022, make: "Audi", model: "Q5", trim: "Premium", color: "Navarra Blue", mileage: 18200, listPrice: 44900, marketPrice: 44500, acv: 39200, pricingPosition: "at-market", costToMarketPct: 99.1, daysInStock: 6, lotStatus: "frontline", photoCount: 32, hasRealPhotos: false, vdpViews: 175, leads: 5, lastLeadDate: "4 hours ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 276, estimatedFrontGross: 4200, segment: "Luxury $40k+", location: "Lot B - Row 1" },
  { vin: "JM1NDAL75N0100008", stockNumber: "A1004", year: 2021, make: "Mazda", model: "CX-5", trim: "Touring", color: "Soul Red Crystal", mileage: 24600, listPrice: 28900, marketPrice: 28400, acv: 24800, pricingPosition: "at-market", costToMarketPct: 98.2, daysInStock: 5, lotStatus: "frontline", photoCount: 38, hasRealPhotos: true, vdpViews: 280, leads: 4, lastLeadDate: "Today", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 230, estimatedFrontGross: 3100, segment: "Crossover $25-35k", location: "Lot A - Row 2" },
  { vin: "WBAPH5C55BA100005", stockNumber: "A1005", year: 2020, make: "BMW", model: "3 Series", trim: "330i", color: "Mineral Grey", mileage: 42100, listPrice: 33500, marketPrice: 33100, acv: 28900, pricingPosition: "above-market", costToMarketPct: 101.2, daysInStock: 35, lotStatus: "frontline", photoCount: 8, hasRealPhotos: false, vdpViews: 62, leads: 0, lastLeadDate: null, recentPriceChange: -500, holdingCostPerDay: 46, totalHoldingCost: 1610, estimatedFrontGross: 2400, segment: "Luxury $30-40k", location: "Lot B - Row 4" },
  { vin: "1N4BL4BV5LC100006", stockNumber: "A1006", year: 2019, make: "Nissan", model: "Altima", trim: "2.5 SV", color: "Gun Metallic", mileage: 55200, listPrice: 18900, marketPrice: 19200, acv: 15800, pricingPosition: "below-market", costToMarketPct: 95.4, daysInStock: 38, lotStatus: "frontline", photoCount: 6, hasRealPhotos: false, vdpViews: 44, leads: 0, lastLeadDate: null, recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 1748, estimatedFrontGross: 1800, segment: "Economy < $20k", location: "Lot C - Row 1" },
  { vin: "3GNAXUEV9NL100007", stockNumber: "A1007", year: 2018, make: "Chevrolet", model: "Equinox", trim: "LT", color: "Mosaic Black", mileage: 61300, listPrice: 21500, marketPrice: 21800, acv: 17200, pricingPosition: "below-market", costToMarketPct: 94.5, daysInStock: 48, lotStatus: "wholesale-candidate", photoCount: 22, hasRealPhotos: true, vdpViews: 38, leads: 0, lastLeadDate: null, recentPriceChange: -1000, holdingCostPerDay: 46, totalHoldingCost: 2208, estimatedFrontGross: 1100, segment: "Crossover $20-25k", location: "Lot C - Row 3" },
  { vin: "5NPE34AF9GH100009", stockNumber: "A1008", year: 2020, make: "Hyundai", model: "Sonata", trim: "SEL", color: "Shimmering Silver", mileage: 38700, listPrice: 22900, marketPrice: 23500, acv: 19400, pricingPosition: "below-market", costToMarketPct: 93.8, daysInStock: 42, lotStatus: "frontline", photoCount: 28, hasRealPhotos: true, vdpViews: 55, leads: 1, lastLeadDate: "6 days ago", recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 1932, estimatedFrontGross: 1900, segment: "Sedan $20-25k", location: "Lot A - Row 7" },
  { vin: "KNDJP3A54J7100010", stockNumber: "A1009", year: 2019, make: "Kia", model: "Sportage", trim: "LX", color: "Pacific Blue", mileage: 52800, listPrice: 19800, marketPrice: 20200, acv: 16300, pricingPosition: "below-market", costToMarketPct: 95.1, daysInStock: 55, lotStatus: "wholesale-candidate", photoCount: 20, hasRealPhotos: true, vdpViews: 28, leads: 0, lastLeadDate: null, recentPriceChange: -800, holdingCostPerDay: 46, totalHoldingCost: 2530, estimatedFrontGross: 800, segment: "Crossover $15-20k", location: "Lot C - Row 2" },
  { vin: "2T1BURHE5JC100003", stockNumber: "A1010", year: 2020, make: "Toyota", model: "Corolla", trim: "LE", color: "Classic Silver", mileage: 35200, listPrice: 19500, marketPrice: 19800, acv: 16500, pricingPosition: "below-market", costToMarketPct: 96.5, daysInStock: 14, lotStatus: "frontline", photoCount: 34, hasRealPhotos: true, vdpViews: 120, leads: 2, lastLeadDate: "Yesterday", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 644, estimatedFrontGross: 2200, segment: "Economy < $20k", location: "Lot A - Row 6" },
  { vin: "RVINNEW001", stockNumber: "A1011", year: 2021, make: "Honda", model: "Civic", trim: "Sport", color: "Rallye Red", mileage: 22400, listPrice: 24500, marketPrice: 24200, acv: 20800, pricingPosition: "at-market", costToMarketPct: 98.8, daysInStock: 2, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 92, estimatedFrontGross: 2800, segment: "Sedan $20-25k", location: "Recon Bay" },
  { vin: "RVINNEW002", stockNumber: "A1012", year: 2022, make: "Hyundai", model: "Tucson", trim: "SEL", color: "Amazon Gray", mileage: 19800, listPrice: 28200, marketPrice: 27800, acv: 24100, pricingPosition: "at-market", costToMarketPct: 98.6, daysInStock: 3, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 138, estimatedFrontGross: 3100, segment: "Crossover $25-35k", location: "Recon Bay" },
  { vin: "RVINNEW003", stockNumber: "A1013", year: 2023, make: "Toyota", model: "Camry", trim: "SE", color: "Midnight Black", mileage: 12100, listPrice: 27800, marketPrice: 27500, acv: 24200, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 0, lotStatus: "arriving", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 0, estimatedFrontGross: 2900, segment: "Sedan $25-30k", location: "In Transit" },
  { vin: "RVINNEW004", stockNumber: "A1014", year: 2021, make: "Subaru", model: "Forester", trim: "Premium", color: "Jasper Green", mileage: 31200, listPrice: 27200, marketPrice: 27000, acv: 23500, pricingPosition: "at-market", costToMarketPct: 99.3, daysInStock: 1, lotStatus: "arriving", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 46, estimatedFrontGross: 2800, segment: "Crossover $25-35k", location: "In Transit" },
  { vin: "SOLDVIN001", stockNumber: "A0998", year: 2021, make: "Chevrolet", model: "Silverado", trim: "LT", color: "Summit White", mileage: 28900, listPrice: 36500, marketPrice: 36200, acv: 31800, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 22, lotStatus: "sold-pending", photoCount: 30, hasRealPhotos: true, vdpViews: 185, leads: 4, lastLeadDate: "3 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1012, estimatedFrontGross: 3500, segment: "Truck $30-45k", location: "Delivery Prep" },

  // ── Aged 45+ vehicles ──────────────────────────────────────────────────
  { vin: "AGE001", stockNumber: "A1015", year: 2019, make: "Ford", model: "F-150", trim: "Lariat", color: "Agate Black", mileage: 58200, listPrice: 34900, marketPrice: 34200, acv: 29500, pricingPosition: "above-market", costToMarketPct: 102.0, daysInStock: 62, lotStatus: "frontline", photoCount: 18, hasRealPhotos: true, vdpViews: 22, leads: 0, lastLeadDate: null, recentPriceChange: -1200, holdingCostPerDay: 46, totalHoldingCost: 2852, estimatedFrontGross: 1200, segment: "Truck $30-45k", location: "Lot C - Row 5" },
  { vin: "AGE002", stockNumber: "A1016", year: 2018, make: "Toyota", model: "RAV4", trim: "LE", color: "Blizzard Pearl", mileage: 67400, listPrice: 22500, marketPrice: 22800, acv: 18900, pricingPosition: "below-market", costToMarketPct: 96.2, daysInStock: 51, lotStatus: "frontline", photoCount: 14, hasRealPhotos: true, vdpViews: 31, leads: 0, lastLeadDate: null, recentPriceChange: -900, holdingCostPerDay: 46, totalHoldingCost: 2346, estimatedFrontGross: 1400, segment: "Crossover $20-25k", location: "Lot C - Row 4" },
  { vin: "AGE003", stockNumber: "A1017", year: 2017, make: "Nissan", model: "Altima", trim: "2.5 S", color: "Brilliant Silver", mileage: 72100, listPrice: 14500, marketPrice: 14800, acv: 11200, pricingPosition: "below-market", costToMarketPct: 95.9, daysInStock: 68, lotStatus: "wholesale-candidate", photoCount: 10, hasRealPhotos: false, vdpViews: 12, leads: 0, lastLeadDate: null, recentPriceChange: -1500, holdingCostPerDay: 46, totalHoldingCost: 3128, estimatedFrontGross: 500, segment: "Economy < $20k", location: "Lot C - Row 6" },
  { vin: "AGE004", stockNumber: "A1018", year: 2019, make: "Hyundai", model: "Sonata", trim: "SE", color: "Phantom Black", mileage: 48900, listPrice: 18200, marketPrice: 18600, acv: 14800, pricingPosition: "below-market", costToMarketPct: 94.8, daysInStock: 58, lotStatus: "wholesale-candidate", photoCount: 16, hasRealPhotos: true, vdpViews: 18, leads: 0, lastLeadDate: null, recentPriceChange: -700, holdingCostPerDay: 46, totalHoldingCost: 2668, estimatedFrontGross: 600, segment: "Sedan $15-20k", location: "Lot C - Row 7" },
  { vin: "AGE005", stockNumber: "A1019", year: 2018, make: "Chevrolet", model: "Equinox", trim: "LS", color: "Silver Ice", mileage: 64500, listPrice: 18900, marketPrice: 19400, acv: 15100, pricingPosition: "below-market", costToMarketPct: 93.5, daysInStock: 52, lotStatus: "wholesale-candidate", photoCount: 12, hasRealPhotos: false, vdpViews: 15, leads: 0, lastLeadDate: null, recentPriceChange: -1100, holdingCostPerDay: 46, totalHoldingCost: 2392, estimatedFrontGross: 700, segment: "Crossover $15-20k", location: "Lot C - Row 8" },
  { vin: "AGE006", stockNumber: "A1020", year: 2019, make: "Kia", model: "Sportage", trim: "EX", color: "Burnished Copper", mileage: 55600, listPrice: 21200, marketPrice: 21800, acv: 17400, pricingPosition: "below-market", costToMarketPct: 94.2, daysInStock: 47, lotStatus: "frontline", photoCount: 20, hasRealPhotos: true, vdpViews: 25, leads: 0, lastLeadDate: null, recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 2162, estimatedFrontGross: 900, segment: "Crossover $20-25k", location: "Lot C - Row 1" },
  { vin: "AGE007", stockNumber: "A1021", year: 2017, make: "Toyota", model: "Corolla", trim: "SE", color: "Blue Crush", mileage: 78200, listPrice: 14800, marketPrice: 15100, acv: 11800, pricingPosition: "below-market", costToMarketPct: 95.4, daysInStock: 72, lotStatus: "wholesale-candidate", photoCount: 8, hasRealPhotos: false, vdpViews: 9, leads: 0, lastLeadDate: null, recentPriceChange: -1800, holdingCostPerDay: 46, totalHoldingCost: 3312, estimatedFrontGross: 400, segment: "Economy < $20k", location: "Lot C - Row 9" },
  { vin: "AGE008", stockNumber: "A1022", year: 2018, make: "Mazda", model: "CX-5", trim: "Sport", color: "Machine Gray", mileage: 59300, listPrice: 23200, marketPrice: 23600, acv: 19400, pricingPosition: "below-market", costToMarketPct: 95.8, daysInStock: 49, lotStatus: "frontline", photoCount: 22, hasRealPhotos: true, vdpViews: 32, leads: 0, lastLeadDate: null, recentPriceChange: -500, holdingCostPerDay: 46, totalHoldingCost: 2254, estimatedFrontGross: 1100, segment: "Crossover $20-25k", location: "Lot B - Row 6" },

  // ── No leads (frontline, >5 days) ──────────────────────────────────────
  { vin: "NL001", stockNumber: "A1023", year: 2021, make: "Ford", model: "F-150", trim: "XL", color: "Velocity Blue", mileage: 34800, listPrice: 35200, marketPrice: 35000, acv: 30200, pricingPosition: "at-market", costToMarketPct: 99.4, daysInStock: 18, lotStatus: "frontline", photoCount: 30, hasRealPhotos: true, vdpViews: 48, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 828, estimatedFrontGross: 3000, segment: "Truck $30-45k", location: "Lot A - Row 8" },
  { vin: "NL002", stockNumber: "A1024", year: 2020, make: "Toyota", model: "Camry", trim: "LE", color: "Celestial Silver", mileage: 31200, listPrice: 23800, marketPrice: 23600, acv: 20100, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 22, lotStatus: "frontline", photoCount: 28, hasRealPhotos: true, vdpViews: 55, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1012, estimatedFrontGross: 2500, segment: "Sedan $20-25k", location: "Lot A - Row 9" },
  { vin: "NL003", stockNumber: "A1025", year: 2021, make: "Subaru", model: "Forester", trim: "Base", color: "Crystal White", mileage: 27600, listPrice: 26400, marketPrice: 26200, acv: 22800, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 15, lotStatus: "frontline", photoCount: 24, hasRealPhotos: true, vdpViews: 38, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 690, estimatedFrontGross: 2600, segment: "Crossover $25-35k", location: "Lot B - Row 2" },
  { vin: "NL004", stockNumber: "A1026", year: 2020, make: "Honda", model: "Civic", trim: "LX", color: "Modern Steel", mileage: 29400, listPrice: 21900, marketPrice: 21700, acv: 18500, pricingPosition: "at-market", costToMarketPct: 99.1, daysInStock: 12, lotStatus: "frontline", photoCount: 26, hasRealPhotos: true, vdpViews: 42, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 552, estimatedFrontGross: 2400, segment: "Sedan $20-25k", location: "Lot A - Row 10" },
  { vin: "NL005", stockNumber: "A1027", year: 2019, make: "Mazda", model: "CX-5", trim: "Grand Touring", color: "Deep Crystal Blue", mileage: 41200, listPrice: 27800, marketPrice: 27500, acv: 23600, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 28, lotStatus: "frontline", photoCount: 20, hasRealPhotos: true, vdpViews: 35, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1288, estimatedFrontGross: 2200, segment: "Crossover $25-35k", location: "Lot B - Row 3" },
  { vin: "NL006", stockNumber: "A1028", year: 2021, make: "Hyundai", model: "Tucson", trim: "SE", color: "Portofino Gray", mileage: 25800, listPrice: 26100, marketPrice: 25900, acv: 22200, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 10, lotStatus: "frontline", photoCount: 32, hasRealPhotos: true, vdpViews: 50, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 460, estimatedFrontGross: 2800, segment: "Crossover $25-35k", location: "Lot B - Row 5" },
  { vin: "NL007", stockNumber: "A1029", year: 2020, make: "Chevrolet", model: "Equinox", trim: "Premier", color: "Cajun Red", mileage: 33100, listPrice: 25600, marketPrice: 25400, acv: 21800, pricingPosition: "at-market", costToMarketPct: 99.2, daysInStock: 20, lotStatus: "frontline", photoCount: 22, hasRealPhotos: true, vdpViews: 30, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 920, estimatedFrontGross: 2400, segment: "Crossover $25-35k", location: "Lot A - Row 11" },

  // ── Above market ───────────────────────────────────────────────────────
  { vin: "AM001", stockNumber: "A1030", year: 2022, make: "Audi", model: "Q5", trim: "Prestige", color: "Mythos Black", mileage: 15200, listPrice: 48900, marketPrice: 46800, acv: 41200, pricingPosition: "above-market", costToMarketPct: 104.5, daysInStock: 25, lotStatus: "frontline", photoCount: 36, hasRealPhotos: true, vdpViews: 88, leads: 1, lastLeadDate: "5 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1150, estimatedFrontGross: 4800, segment: "Luxury $40k+", location: "Lot B - Row 7" },
  { vin: "AM002", stockNumber: "A1031", year: 2021, make: "BMW", model: "3 Series", trim: "M340i", color: "Alpine White", mileage: 22800, listPrice: 42500, marketPrice: 40200, acv: 35800, pricingPosition: "above-market", costToMarketPct: 105.7, daysInStock: 30, lotStatus: "frontline", photoCount: 28, hasRealPhotos: true, vdpViews: 72, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1380, estimatedFrontGross: 4200, segment: "Luxury $40k+", location: "Lot B - Row 8" },
  { vin: "AM003", stockNumber: "A1032", year: 2020, make: "Ford", model: "F-150", trim: "Platinum", color: "Star White", mileage: 38600, listPrice: 45200, marketPrice: 43500, acv: 38100, pricingPosition: "above-market", costToMarketPct: 103.9, daysInStock: 33, lotStatus: "frontline", photoCount: 24, hasRealPhotos: true, vdpViews: 58, leads: 1, lastLeadDate: "8 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1518, estimatedFrontGross: 3600, segment: "Truck $40k+", location: "Lot A - Row 12" },
  { vin: "AM004", stockNumber: "A1033", year: 2021, make: "Toyota", model: "RAV4", trim: "Limited", color: "Blueprint", mileage: 20400, listPrice: 35800, marketPrice: 34200, acv: 30100, pricingPosition: "above-market", costToMarketPct: 104.7, daysInStock: 18, lotStatus: "frontline", photoCount: 34, hasRealPhotos: true, vdpViews: 92, leads: 2, lastLeadDate: "3 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 828, estimatedFrontGross: 3400, segment: "Crossover $30-40k", location: "Lot A - Row 13" },
  { vin: "AM005", stockNumber: "A1034", year: 2020, make: "Mazda", model: "CX-5", trim: "Signature", color: "Polymetal Gray", mileage: 28900, listPrice: 33200, marketPrice: 31800, acv: 27600, pricingPosition: "above-market", costToMarketPct: 104.4, daysInStock: 22, lotStatus: "frontline", photoCount: 30, hasRealPhotos: true, vdpViews: 65, leads: 1, lastLeadDate: "4 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1012, estimatedFrontGross: 3200, segment: "Crossover $30-40k", location: "Lot B - Row 9" },
  { vin: "AM006", stockNumber: "A1035", year: 2019, make: "Chevrolet", model: "Silverado", trim: "High Country", color: "Iridescent Pearl", mileage: 42300, listPrice: 41800, marketPrice: 39900, acv: 34800, pricingPosition: "above-market", costToMarketPct: 104.8, daysInStock: 38, lotStatus: "frontline", photoCount: 18, hasRealPhotos: true, vdpViews: 42, leads: 0, lastLeadDate: null, recentPriceChange: -800, holdingCostPerDay: 46, totalHoldingCost: 1748, estimatedFrontGross: 2800, segment: "Truck $40k+", location: "Lot A - Row 14" },
  { vin: "AM007", stockNumber: "A1036", year: 2021, make: "Hyundai", model: "Sonata", trim: "Limited", color: "Hampton Gray", mileage: 19200, listPrice: 29800, marketPrice: 28400, acv: 24600, pricingPosition: "above-market", costToMarketPct: 104.9, daysInStock: 16, lotStatus: "frontline", photoCount: 32, hasRealPhotos: true, vdpViews: 78, leads: 2, lastLeadDate: "2 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 736, estimatedFrontGross: 3200, segment: "Sedan $25-30k", location: "Lot A - Row 15" },
  { vin: "AM008", stockNumber: "A1037", year: 2020, make: "Kia", model: "Sportage", trim: "SX Turbo", color: "Snow White Pearl", mileage: 31500, listPrice: 28400, marketPrice: 27100, acv: 23200, pricingPosition: "above-market", costToMarketPct: 104.8, daysInStock: 26, lotStatus: "frontline", photoCount: 24, hasRealPhotos: true, vdpViews: 52, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1196, estimatedFrontGross: 2600, segment: "Crossover $25-30k", location: "Lot B - Row 10" },
  { vin: "AM009", stockNumber: "A1038", year: 2019, make: "Honda", model: "Civic", trim: "Touring", color: "Cosmic Blue", mileage: 35800, listPrice: 24900, marketPrice: 23600, acv: 20400, pricingPosition: "above-market", costToMarketPct: 105.5, daysInStock: 28, lotStatus: "frontline", photoCount: 20, hasRealPhotos: true, vdpViews: 45, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1288, estimatedFrontGross: 2200, segment: "Sedan $20-25k", location: "Lot A - Row 16" },

  // ── In Recon ───────────────────────────────────────────────────────────
  { vin: "RC001", stockNumber: "A1039", year: 2021, make: "Toyota", model: "RAV4", trim: "XSE", color: "Magnetic Gray", mileage: 21400, listPrice: 31200, marketPrice: 30800, acv: 27100, pricingPosition: "at-market", costToMarketPct: 98.7, daysInStock: 4, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 184, estimatedFrontGross: 3200, segment: "Crossover $30-35k", location: "Recon Bay" },
  { vin: "RC002", stockNumber: "A1040", year: 2022, make: "Ford", model: "F-150", trim: "STX", color: "Carbonized Gray", mileage: 16800, listPrice: 39800, marketPrice: 39200, acv: 34600, pricingPosition: "at-market", costToMarketPct: 98.5, daysInStock: 2, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 92, estimatedFrontGross: 3800, segment: "Truck $35-45k", location: "Recon Bay" },
  { vin: "RC003", stockNumber: "A1041", year: 2020, make: "BMW", model: "3 Series", trim: "330e", color: "Tanzanite Blue", mileage: 28500, listPrice: 35600, marketPrice: 35200, acv: 30800, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 5, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 230, estimatedFrontGross: 3400, segment: "Luxury $30-40k", location: "Recon Bay" },
  { vin: "RC004", stockNumber: "A1042", year: 2021, make: "Mazda", model: "CX-5", trim: "Carbon Edition", color: "Polymetal Gray", mileage: 19600, listPrice: 30400, marketPrice: 30000, acv: 26200, pricingPosition: "at-market", costToMarketPct: 98.7, daysInStock: 3, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 138, estimatedFrontGross: 3100, segment: "Crossover $25-35k", location: "Recon Bay" },
  { vin: "RC005", stockNumber: "A1043", year: 2020, make: "Nissan", model: "Altima", trim: "SR", color: "Scarlet Ember", mileage: 24300, listPrice: 24200, marketPrice: 23900, acv: 20600, pricingPosition: "at-market", costToMarketPct: 98.7, daysInStock: 1, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 46, estimatedFrontGross: 2600, segment: "Sedan $20-25k", location: "Recon Bay" },
  { vin: "RC006", stockNumber: "A1044", year: 2021, make: "Honda", model: "Civic", trim: "EX", color: "Sonic Gray Pearl", mileage: 18900, listPrice: 25800, marketPrice: 25500, acv: 22100, pricingPosition: "at-market", costToMarketPct: 98.8, daysInStock: 2, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 92, estimatedFrontGross: 2800, segment: "Sedan $25-30k", location: "Recon Bay" },
  { vin: "RC007", stockNumber: "A1045", year: 2022, make: "Chevrolet", model: "Equinox", trim: "RS", color: "Midnight Blue", mileage: 14200, listPrice: 28900, marketPrice: 28500, acv: 24800, pricingPosition: "at-market", costToMarketPct: 98.6, daysInStock: 4, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 184, estimatedFrontGross: 3200, segment: "Crossover $25-30k", location: "Recon Bay" },
  { vin: "RC008", stockNumber: "A1046", year: 2021, make: "Kia", model: "Sportage", trim: "Nightfall", color: "Gravity Gray", mileage: 22100, listPrice: 27400, marketPrice: 27100, acv: 23400, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 3, lotStatus: "in-recon", photoCount: 0, hasRealPhotos: false, vdpViews: 0, leads: 0, lastLeadDate: null, recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 138, estimatedFrontGross: 2900, segment: "Crossover $25-30k", location: "Recon Bay" },

  // ── Wholesale candidates ───────────────────────────────────────────────
  { vin: "WS001", stockNumber: "A1047", year: 2017, make: "Ford", model: "F-150", trim: "XL", color: "Ingot Silver", mileage: 82400, listPrice: 22800, marketPrice: 23200, acv: 18400, pricingPosition: "below-market", costToMarketPct: 94.1, daysInStock: 60, lotStatus: "wholesale-candidate", photoCount: 8, hasRealPhotos: false, vdpViews: 10, leads: 0, lastLeadDate: null, recentPriceChange: -2000, holdingCostPerDay: 46, totalHoldingCost: 2760, estimatedFrontGross: 300, segment: "Truck $20-25k", location: "Lot C - Row 10" },
  { vin: "WS002", stockNumber: "A1048", year: 2018, make: "Toyota", model: "Corolla", trim: "L", color: "Classic Silver", mileage: 74200, listPrice: 13200, marketPrice: 13500, acv: 10200, pricingPosition: "below-market", costToMarketPct: 94.4, daysInStock: 56, lotStatus: "wholesale-candidate", photoCount: 6, hasRealPhotos: false, vdpViews: 8, leads: 0, lastLeadDate: null, recentPriceChange: -1200, holdingCostPerDay: 46, totalHoldingCost: 2576, estimatedFrontGross: 200, segment: "Economy < $15k", location: "Lot C - Row 11" },
  { vin: "WS003", stockNumber: "A1049", year: 2017, make: "Hyundai", model: "Sonata", trim: "SE", color: "Ion Silver", mileage: 68900, listPrice: 14800, marketPrice: 15200, acv: 11600, pricingPosition: "below-market", costToMarketPct: 93.9, daysInStock: 64, lotStatus: "wholesale-candidate", photoCount: 10, hasRealPhotos: false, vdpViews: 6, leads: 0, lastLeadDate: null, recentPriceChange: -1400, holdingCostPerDay: 46, totalHoldingCost: 2944, estimatedFrontGross: 400, segment: "Economy < $15k", location: "Lot C - Row 12" },
  { vin: "WS004", stockNumber: "A1050", year: 2018, make: "Nissan", model: "Altima", trim: "2.5 S", color: "Super Black", mileage: 71600, listPrice: 13900, marketPrice: 14200, acv: 10800, pricingPosition: "below-market", costToMarketPct: 94.6, daysInStock: 54, lotStatus: "wholesale-candidate", photoCount: 8, hasRealPhotos: false, vdpViews: 11, leads: 0, lastLeadDate: null, recentPriceChange: -1000, holdingCostPerDay: 46, totalHoldingCost: 2484, estimatedFrontGross: 350, segment: "Economy < $15k", location: "Lot C - Row 13" },
  { vin: "WS005", stockNumber: "A1051", year: 2017, make: "Chevrolet", model: "Equinox", trim: "L", color: "Summit White", mileage: 76800, listPrice: 15400, marketPrice: 15900, acv: 12100, pricingPosition: "below-market", costToMarketPct: 93.2, daysInStock: 58, lotStatus: "wholesale-candidate", photoCount: 6, hasRealPhotos: false, vdpViews: 7, leads: 0, lastLeadDate: null, recentPriceChange: -1600, holdingCostPerDay: 46, totalHoldingCost: 2668, estimatedFrontGross: 250, segment: "Economy < $15k", location: "Lot C - Row 14" },
  { vin: "WS006", stockNumber: "A1052", year: 2018, make: "Kia", model: "Sportage", trim: "LX", color: "Mineral Silver", mileage: 62400, listPrice: 17200, marketPrice: 17800, acv: 13600, pricingPosition: "below-market", costToMarketPct: 93.8, daysInStock: 50, lotStatus: "wholesale-candidate", photoCount: 10, hasRealPhotos: false, vdpViews: 14, leads: 0, lastLeadDate: null, recentPriceChange: -900, holdingCostPerDay: 46, totalHoldingCost: 2300, estimatedFrontGross: 500, segment: "Economy < $20k", location: "Lot C - Row 15" },

  // ── High holding cost (frontline, >$1500) ──────────────────────────────
  { vin: "HC001", stockNumber: "A1053", year: 2020, make: "Audi", model: "Q5", trim: "Premium Plus", color: "Florett Silver", mileage: 35400, listPrice: 38200, marketPrice: 37800, acv: 33100, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 40, lotStatus: "frontline", photoCount: 26, hasRealPhotos: true, vdpViews: 68, leads: 1, lastLeadDate: "10 days ago", recentPriceChange: -400, holdingCostPerDay: 46, totalHoldingCost: 1840, estimatedFrontGross: 2800, segment: "Luxury $35-40k", location: "Lot B - Row 11" },
  { vin: "HC002", stockNumber: "A1054", year: 2021, make: "Chevrolet", model: "Silverado", trim: "RST", color: "Black", mileage: 29800, listPrice: 39400, marketPrice: 39000, acv: 34200, pricingPosition: "at-market", costToMarketPct: 98.9, daysInStock: 36, lotStatus: "frontline", photoCount: 30, hasRealPhotos: true, vdpViews: 82, leads: 2, lastLeadDate: "5 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1656, estimatedFrontGross: 3200, segment: "Truck $35-45k", location: "Lot A - Row 17" },
  { vin: "HC003", stockNumber: "A1055", year: 2020, make: "Toyota", model: "RAV4", trim: "Adventure", color: "Lunar Rock", mileage: 38200, listPrice: 32100, marketPrice: 31800, acv: 27600, pricingPosition: "at-market", costToMarketPct: 99.1, daysInStock: 34, lotStatus: "frontline", photoCount: 22, hasRealPhotos: true, vdpViews: 58, leads: 1, lastLeadDate: "7 days ago", recentPriceChange: null, holdingCostPerDay: 46, totalHoldingCost: 1564, estimatedFrontGross: 2800, segment: "Crossover $30-35k", location: "Lot A - Row 18" },
  { vin: "HC004", stockNumber: "A1056", year: 2019, make: "BMW", model: "3 Series", trim: "330i xDrive", color: "Black Sapphire", mileage: 44600, listPrice: 31200, marketPrice: 30800, acv: 26400, pricingPosition: "at-market", costToMarketPct: 98.7, daysInStock: 38, lotStatus: "frontline", photoCount: 16, hasRealPhotos: true, vdpViews: 48, leads: 0, lastLeadDate: null, recentPriceChange: -600, holdingCostPerDay: 46, totalHoldingCost: 1748, estimatedFrontGross: 2200, segment: "Luxury $30-35k", location: "Lot B - Row 12" },
]

export const mockLotVehicles: LotVehicle[] = mockLotVehiclesBase.map((v, i) => ({
  ...v,
  isNew: v.mileage < 500,
  photosReceivedAt: v.hasRealPhotos && v.daysInStock > 0 ? daysAgoIso(Math.max(1, v.daysInStock - 1)) : undefined,
}))

export const mockLotSummary: LotSummary = {
  totalUnits: 15,
  frontlineReady: 9,
  inRecon: 2,
  arriving: 2,
  avgDaysInStock: 19.9,
  avgCostToMarket: 97.6,
  totalHoldingCostToday: 690,
  aged30Plus: 5,
  aged45Plus: 3,
  aged60Plus: 0,
  noLeads5Days: 4,
  noPhotos: 4,
}

// ─── Customers ───

export const mockCustomers: Customer[] = [
  { id: "c1", name: "James Wilson", email: "jwilson@email.com", phone: "(512) 555-0142", status: "active-lead", source: "website", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 7", lastContactDate: "Mar 7", vehicleInterests: ["2021 Ford F-150 XLT"], currentVehicle: "2017 Toyota Tundra SR5", estimatedEquity: 4200, totalTouchpoints: 3, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Asked for financing info, never responded. High intent." },
  { id: "c2", name: "Amanda Chen", email: "achen@email.com", phone: "(512) 555-0287", status: "active-lead", source: "website", assignedSalesperson: "Sarah K.", firstContactDate: "Mar 5", lastContactDate: "Mar 5", vehicleInterests: ["2022 Honda CR-V EX-L"], currentVehicle: "2018 Nissan Rogue SV", estimatedEquity: 2800, totalTouchpoints: 4, appointmentSet: true, testDriveCompleted: false, creditAppSubmitted: false, notes: "Price just dropped $1,300 — needs a callback." },
  { id: "c3", name: "Carlos Mendez", email: "cmendez@email.com", phone: "(512) 555-0391", status: "active-lead", source: "walk-in", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 3", lastContactDate: "Mar 3", vehicleInterests: ["SUV under $30k"], currentVehicle: null, estimatedEquity: null, totalTouchpoints: 1, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Visited lot but didn't buy. No follow-up sent yet." },
  { id: "c4", name: "Rachel Green", email: "rgreen@email.com", phone: "(512) 555-0104", status: "active-lead", source: "referral", assignedSalesperson: "Jake P.", firstContactDate: "Mar 8", lastContactDate: "Mar 8", vehicleInterests: ["2022 Audi Q5 Premium"], currentVehicle: "2019 BMW X3 xDrive30i", estimatedEquity: 6100, totalTouchpoints: 5, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: false, notes: "Test drove, said 'thinking about it'. Hot lead." },
  { id: "c5", name: "Maria Gonzalez", email: "mgonzalez@email.com", phone: "(512) 555-0218", status: "service-only", source: "service-lane", assignedSalesperson: "Unassigned", firstContactDate: "Feb 12", lastContactDate: "Mar 9", vehicleInterests: [], currentVehicle: "2021 Toyota Highlander XLE", estimatedEquity: 8200, totalTouchpoints: 8, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Service customer — frustrated with repair cost, asked about new models." },
  { id: "c6", name: "Robert Kim", email: "rkim@email.com", phone: "(512) 555-0375", status: "service-only", source: "service-lane", assignedSalesperson: "Unassigned", firstContactDate: "Jan 20", lastContactDate: "Mar 8", vehicleInterests: [], currentVehicle: "2020 Honda Accord Sport", estimatedEquity: 5100, totalTouchpoints: 6, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Lease ending in 60 days. Asked about purchase options." },
  { id: "c7", name: "David Park", email: "dpark@email.com", phone: "(512) 555-0456", status: "active-lead", source: "walk-in", assignedSalesperson: "Sarah K.", firstContactDate: "Mar 9", lastContactDate: "Mar 9", vehicleInterests: ["Toyota Camry SE", "Honda Civic Sport"], currentVehicle: "2016 Hyundai Elantra SE", estimatedEquity: 1200, totalTouchpoints: 2, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: true, notes: "Trade-in appraisal done. Ready to close today." },
  { id: "c8", name: "Sarah Thompson", email: "sthompson@email.com", phone: "(512) 555-0533", status: "active-lead", source: "website", assignedSalesperson: "Jake P.", firstContactDate: "Mar 8", lastContactDate: "Mar 9", vehicleInterests: ["2021 Honda CR-V EX"], currentVehicle: "2018 Toyota RAV4 LE", estimatedEquity: 3400, totalTouchpoints: 3, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Used online trade tool. Submitted inquiry." },
  { id: "c9", name: "Mike Rodriguez", email: "mrodriguez@email.com", phone: "(512) 555-0601", status: "sold", source: "phone", assignedSalesperson: "Marcus D.", firstContactDate: "Feb 28", lastContactDate: "Mar 7", vehicleInterests: ["2021 Ford F-150 XLT"], currentVehicle: null, estimatedEquity: null, totalTouchpoints: 7, appointmentSet: true, testDriveCompleted: true, creditAppSubmitted: true, notes: "Deal closed. F&I complete. Pending delivery." },
  { id: "c10", name: "Jennifer Walsh", email: "jwalsh@email.com", phone: "(512) 555-0778", status: "be-back", source: "service-lane", assignedSalesperson: "Sarah K.", firstContactDate: "Feb 15", lastContactDate: "Mar 2", vehicleInterests: ["3-row SUV"], currentVehicle: "2019 Chevrolet Equinox LT", estimatedEquity: 3800, totalTouchpoints: 4, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "Wants something bigger. Mentioned trading in. Not contacted in 8 days." },
  { id: "c11", name: "Brian Foster", email: "bfoster@email.com", phone: "(512) 555-0855", status: "lost", source: "website", assignedSalesperson: "Jake P.", firstContactDate: "Feb 20", lastContactDate: "Feb 25", vehicleInterests: ["Truck under $35k"], currentVehicle: "2015 Chevrolet Colorado LT", estimatedEquity: 1500, totalTouchpoints: 3, appointmentSet: true, testDriveCompleted: false, creditAppSubmitted: false, notes: "No-showed appointment. No response to follow-up." },
  { id: "c12", name: "Lisa Chang", email: "lchang@email.com", phone: "(512) 555-0912", status: "active-lead", source: "third-party", assignedSalesperson: "Marcus D.", firstContactDate: "Mar 10", lastContactDate: "Mar 10", vehicleInterests: ["2021 Mazda CX-5 Touring"], currentVehicle: "2017 Honda HR-V EX", estimatedEquity: 2100, totalTouchpoints: 1, appointmentSet: false, testDriveCompleted: false, creditAppSubmitted: false, notes: "AutoTrader lead just came in. Needs immediate outreach." },
]

export const mockCustomerSummary: CustomerSummary = {
  totalActive: 7,
  newThisWeek: 3,
  appointmentsToday: 2,
  followUpsDue: 4,
  beBackOpportunities: 1,
  avgResponseTime: "1.4 hrs",
  conversionRate: 73.6,
  lostThisMonth: 1,
}

export const mockCustomerActivities: CustomerActivity[] = [
  { id: "ca1", customerId: "c12", type: "call", description: "AutoTrader lead — first outreach needed", timestamp: "Today, 9:15 AM", salesperson: "Marcus D." },
  { id: "ca2", customerId: "c7", type: "credit-app", description: "Credit app submitted, trade appraisal complete", timestamp: "Today, 8:30 AM", salesperson: "Sarah K." },
  { id: "ca3", customerId: "c4", type: "test-drive", description: "Test drove 2022 Audi Q5 — very interested", timestamp: "Yesterday, 3:45 PM", salesperson: "Jake P." },
  { id: "ca4", customerId: "c2", type: "email", description: "Price-drop notification sent for CR-V EX-L", timestamp: "Yesterday, 11:00 AM", salesperson: "Sarah K." },
  { id: "ca5", customerId: "c8", type: "visit", description: "Submitted online trade inquiry", timestamp: "Yesterday, 9:20 AM", salesperson: "Jake P." },
  { id: "ca6", customerId: "c1", type: "call", description: "Left voicemail about financing options", timestamp: "Mar 7, 2:15 PM", salesperson: "Marcus D." },
  { id: "ca7", customerId: "c9", type: "deal-closed", description: "Deal closed — 2021 Ford F-150 XLT", timestamp: "Mar 7, 11:30 AM", salesperson: "Marcus D." },
  { id: "ca8", customerId: "c5", type: "visit", description: "Service visit — 60k mile service, $2,800 RO", timestamp: "Mar 6, 10:00 AM", salesperson: "Unassigned" },
]

// ─── Recon pipeline (shared with Inspection & Recon UI) ───

export const mockReconVehicles: ReconVehicle[] = [
  { vin: "RVIN001", year: 2021, make: "Ford", model: "Escape", currentStage: "inspection", daysInRecon: 0.5, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 0, estimatedCost: 1200, doorRate: 125, internalBilled: 0, doorRateCompliance: 0, assignedTo: "Mike T." },
  { vin: "RVIN002", year: 2020, make: "Toyota", model: "Tacoma", currentStage: "mechanical", daysInRecon: 1.5, daysInCurrentStage: 1, slaTarget: 3, slaBreach: false, reconCost: 450, estimatedCost: 1100, doorRate: 125, internalBilled: 100, doorRateCompliance: 80, assignedTo: "Carlos R." },
  { vin: "RVIN003", year: 2019, make: "Honda", model: "Accord", currentStage: "mechanical", daysInRecon: 2, daysInCurrentStage: 1.5, slaTarget: 3, slaBreach: false, reconCost: 680, estimatedCost: 950, doorRate: 125, internalBilled: 110, doorRateCompliance: 88, assignedTo: "Carlos R." },
  { vin: "RVIN004", year: 2022, make: "Hyundai", model: "Tucson", currentStage: "body", daysInRecon: 2.5, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 800, estimatedCost: 1050, doorRate: 125, internalBilled: 100, doorRateCompliance: 80, assignedTo: "Jake S." },
  { vin: "RVIN005", year: 2020, make: "Chevrolet", model: "Malibu", currentStage: "detail", daysInRecon: 3, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: false, reconCost: 920, estimatedCost: 980, doorRate: 125, internalBilled: 115, doorRateCompliance: 92, assignedTo: "Anna K." },
  { vin: "RVIN006", year: 2021, make: "Nissan", model: "Rogue", currentStage: "detail", daysInRecon: 3.5, daysInCurrentStage: 1, slaTarget: 3, slaBreach: true, reconCost: 1050, estimatedCost: 1100, doorRate: 125, internalBilled: 105, doorRateCompliance: 84, assignedTo: "Anna K." },
  { vin: "RVIN007", year: 2019, make: "Kia", model: "Sorento", currentStage: "photo", daysInRecon: 2.8, daysInCurrentStage: 0.3, slaTarget: 3, slaBreach: false, reconCost: 1180, estimatedCost: 1200, doorRate: 125, internalBilled: 120, doorRateCompliance: 96, assignedTo: "Photo Team" },
  { vin: "RVIN008", year: 2020, make: "Subaru", model: "Outback", currentStage: "photo", daysInRecon: 4, daysInCurrentStage: 0.5, slaTarget: 3, slaBreach: true, reconCost: 1350, estimatedCost: 1400, doorRate: 125, internalBilled: 108, doorRateCompliance: 86, assignedTo: "Photo Team" },
  { vin: "RVIN009", year: 2022, make: "Toyota", model: "Corolla", currentStage: "online", daysInRecon: 2.5, daysInCurrentStage: 0.2, slaTarget: 3, slaBreach: false, reconCost: 850, estimatedCost: 850, doorRate: 125, internalBilled: 122, doorRateCompliance: 98, assignedTo: "Online Team" },
  { vin: "RVIN010", year: 2021, make: "Honda", model: "Civic", currentStage: "inspection", daysInRecon: 0.2, daysInCurrentStage: 0.2, slaTarget: 3, slaBreach: false, reconCost: 0, estimatedCost: 900, doorRate: 125, internalBilled: 0, doorRateCompliance: 0, assignedTo: "Mike T." },
]

const RECON_STAGE_LABELS: Record<ReconStage, string> = {
  inspection: "Inspection",
  mechanical: "Mechanical",
  body: "Body",
  detail: "Detail",
  photo: "Photo",
  online: "Online",
}

export function getReconStageStats(): ReconStageStats[] {
  const stages: ReconStage[] = ["inspection", "mechanical", "body", "detail", "photo", "online"]
  return stages.map((stage) => {
    const vehicles = mockReconVehicles.filter((v) => v.currentStage === stage)
    return {
      stage,
      label: RECON_STAGE_LABELS[stage],
      count: vehicles.length,
      avgDays: vehicles.length ? vehicles.reduce((s, v) => s + v.daysInCurrentStage, 0) / vehicles.length : 0,
      breachCount: vehicles.filter((v) => v.slaBreach).length,
    }
  })
}

// ─── Marketing channel ROI ───

export const mockMarketingChannels: MarketingChannel[] = [
  { source: "Google Ads", spend: 4200, leads: 187, appointments: 48, unitsSold: 19, costPerSale: 221, costPerLead: 22.5, conversionRate: 10.2 },
  { source: "Meta Ads", spend: 1800, leads: 142, appointments: 27, unitsSold: 9, costPerSale: 200, costPerLead: 12.7, conversionRate: 6.3 },
  { source: "AutoTrader / Cars.com", spend: 3500, leads: 92, appointments: 22, unitsSold: 8, costPerSale: 437, costPerLead: 38.0, conversionRate: 8.7 },
  { source: "CRM / Email / SMS", spend: 0, leads: 310, appointments: 67, unitsSold: 31, costPerSale: 0, costPerLead: 0, conversionRate: 10.0 },
]
