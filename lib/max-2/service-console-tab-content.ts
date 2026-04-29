/**
 * In-page copy for `/max-2/service` tab bodies (not the sticky secondary nav labels).
 * Repair Order (RO) and drive-oriented language for shared Console V2 components.
 */
export const SERVICE_CONSOLE_TAB_CONTENT = {
  campaigns: {
    subTabCampaigns: "RO campaigns",
    subTabPipeline: "Drive outreach",
    sectionAriaLabel: "Service campaigns",
    searchPlaceholder: "Search RO campaigns…",
    newCampaignButton: "New campaign",
    pipelineQueueHeading: "Guest queue",
    pipelineQueueEmpty: "No guests in this filter",
    pipelineSequencesHeading: "Active sequences",
  },
  actionItems: {
    pageDescription: "MPI follow-ups, declined work callbacks, and open RO tasks",
    filterExpress: "Express",
    filterMainShop: "Main shop",
    filterAll: "All",
  },
  appointments: {
    detailBookedServiceLabel: "Service booked",
    detailEstimateLabel: "RO estimate",
    detailAgentNoteLabel: "Advisor note",
  },
  customers: {
    pageTitle: "Service guests",
    pageDescriptionPipeline: "service pipeline",
    pageDescriptionTable:
      "scheduler, phone, and campaign intake · sorted by last touch",
    searchPlaceholder: "Search name, vehicle, advisor…",
    viewAriaLabel: "Service guests view",
    columnAdvisor: "Advisor",
    swimlaneEmpty: "No guests",
  },
  customerProfile: {
    backToList: "All service guests",
    notFound: "Guest not found.",
  },
} as const
