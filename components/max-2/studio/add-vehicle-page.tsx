"use client"

import * as React from "react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  max2Classes,
  spyneComponentClasses,
} from "@/lib/design-system/max-2"
import { MaterialSymbol } from "@/components/max-2/material-symbol"
import {
  SpyneFilterSelectChevron,
  SpyneFilterSelectWrap,
  SpyneSegmentedButton,
  SpyneSegmentedControl,
} from "@/components/max-2/spyne-toolbar-controls"
import { SpyneChip } from "@/components/max-2/spyne-ui"
import { demoVehicleHeroThumbnailOptions } from "@/lib/demo-vehicle-hero-images"

const VIN_PLACEHOLDER = "00000000000000000"

function formatVIN(value: string) {
  return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "").slice(0, 17)
}

export function AddVehiclePage() {
  const [vin, setVin] = React.useState("")
  const [vehicleType, setVehicleType] = React.useState<"pre-owned" | "new">("pre-owned")
  const [skipVin, setSkipVin] = React.useState(false)
  const [websiteUrl, setWebsiteUrl] = React.useState("")
  const folderInputRef = React.useRef<HTMLInputElement>(null)

  const canProceed = skipVin || vin.length >= 5

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <section
        className={cn(
          "rounded-[8px] border border-spyne-border bg-spyne-surface p-6 shadow-none sm:p-8",
          "flex flex-col gap-6"
        )}
      >
        <h2
          className={cn(
            "text-center text-xl font-semibold leading-snug tracking-tight text-spyne-primary sm:text-[22px]"
          )}
        >
          Transform your media!
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="add-vehicle-enter-by" className="text-sm text-spyne-text-secondary">
            Enter
          </label>
          <SpyneFilterSelectWrap className="w-full max-w-md">
            <select
              id="add-vehicle-enter-by"
              className={cn(spyneComponentClasses.filterSelect, "w-full")}
              defaultValue="vin"
            >
              <option value="vin">Vehicle Identification Number (VIN)</option>
            </select>
            <SpyneFilterSelectChevron />
          </SpyneFilterSelectWrap>
        </div>

        <div className="space-y-1.5">
          <div
            className={cn(
              "flex overflow-hidden rounded-md border border-spyne-border bg-spyne-surface",
              "focus-within:border-spyne-primary focus-within:ring-[3px] focus-within:ring-spyne-primary/15"
            )}
          >
            <div
              className={cn(
                "flex shrink-0 items-center gap-1.5 border-r border-spyne-border bg-muted px-3 py-2.5",
                "text-sm font-medium text-spyne-text-secondary"
              )}
            >
              <span>VIN</span>
              <button
                type="button"
                className="inline-flex rounded-sm text-spyne-text-secondary outline-none ring-spyne-primary hover:text-spyne-text focus-visible:ring-2"
                aria-label="About the VIN"
                title="A VIN is 17 characters. Letters I, O, and Q are not used."
              >
                <MaterialSymbol name="info" size={16} className="text-current" />
              </button>
            </div>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder={VIN_PLACEHOLDER}
              disabled={skipVin}
              value={vin}
              onChange={(e) => setVin(formatVIN(e.target.value))}
              className={cn(
                "min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm font-mono tracking-wider",
                "text-spyne-text placeholder:text-muted-foreground",
                "outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm text-spyne-text-secondary">Vehicle Type:</span>
            <SpyneSegmentedControl aria-label="Vehicle type" className="w-fit">
              <SpyneSegmentedButton
                type="button"
                active={vehicleType === "pre-owned"}
                onClick={() => setVehicleType("pre-owned")}
              >
                Pre-owned
              </SpyneSegmentedButton>
              <SpyneSegmentedButton
                type="button"
                active={vehicleType === "new"}
                onClick={() => setVehicleType("new")}
              >
                New
              </SpyneSegmentedButton>
            </SpyneSegmentedControl>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-spyne-text">
            <Checkbox
              checked={skipVin}
              onCheckedChange={(v) => setSkipVin(v === true)}
              className="size-5 rounded-full border-spyne-border data-[state=checked]:border-spyne-primary data-[state=checked]:bg-spyne-primary"
            />
            Continue without VIN
          </label>
        </div>

        <button
          type="button"
          disabled={!canProceed}
          className={cn(
            spyneComponentClasses.btnPrimaryLg,
            "flex w-full items-center justify-center gap-2 disabled:pointer-events-none"
          )}
        >
          Proceed
          <MaterialSymbol name="arrow_forward" size={24} />
        </button>
      </section>

      <section className="space-y-3">
        <h3 className={max2Classes.sectionTitle}>Import form</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <div
            className={cn(
              "rounded-[8px] border border-spyne-border bg-spyne-surface p-4 shadow-none sm:p-5",
              "flex flex-col gap-4"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MaterialSymbol name="folder" size={24} className="text-spyne-text" />
                <span className="text-sm font-semibold text-spyne-text">Folder</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-spyne-primary hover:underline"
              >
                <MaterialSymbol name="article" size={16} className="text-spyne-primary" />
                Folder structure
              </button>
            </div>
            <input
              ref={folderInputRef}
              type="file"
              className="hidden"
              multiple
              // Directory upload (Chromium): non-standard attribute, supported in browsers.
              {...({ webkitdirectory: "" } as object)}
            />
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className={cn(
                spyneComponentClasses.btnSecondaryMd,
                "flex w-full items-center justify-center gap-2 border-spyne-border"
              )}
            >
              <MaterialSymbol name="upload" size={20} />
              Upload
            </button>
            <div className="flex items-end justify-center gap-4 pt-1">
              <button
                type="button"
                disabled
                aria-label="Google Drive"
                title="Google Drive (coming soon)"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-spyne-border bg-muted/40",
                  "text-spyne-text-secondary opacity-60"
                )}
              >
                <MaterialSymbol name="add_to_drive" size={20} />
              </button>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-medium leading-none text-spyne-text-secondary">
                  Coming soon
                </span>
                <button
                  type="button"
                  disabled
                  aria-label="Dropbox"
                  title="Dropbox (coming soon)"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border border-spyne-border bg-muted/40",
                    "text-spyne-text-secondary opacity-60"
                  )}
                >
                  <MaterialSymbol name="cloud" size={20} />
                </button>
              </div>
              <button
                type="button"
                disabled
                aria-label="iCloud"
                title="iCloud (coming soon)"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border border-spyne-border bg-muted/40",
                  "text-spyne-text-secondary opacity-60"
                )}
              >
                <MaterialSymbol name="cloud_queue" size={20} />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "rounded-[8px] border border-spyne-border bg-spyne-surface p-4 shadow-none sm:p-5",
              "flex flex-col gap-4"
            )}
          >
            <div className="flex items-center gap-2">
              <MaterialSymbol name="public" size={24} className="text-spyne-text" />
              <span className="text-sm font-semibold text-spyne-text">Website URL</span>
            </div>
            <div
              className={cn(
                "flex overflow-hidden rounded-md border border-spyne-border bg-spyne-surface",
                "focus-within:border-spyne-primary focus-within:ring-[3px] focus-within:ring-spyne-primary/15"
              )}
            >
              <span className="flex shrink-0 items-center pl-3 text-spyne-text-secondary">
                <MaterialSymbol name="search" size={20} />
              </span>
              <input
                type="url"
                placeholder="Enter your Vehicle Detail Page URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className={cn(
                  "min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-2 pl-2 text-sm",
                  "text-spyne-text placeholder:text-muted-foreground outline-none focus:ring-0"
                )}
              />
              <div className="flex shrink-0 items-center p-1.5">
                <button
                  type="button"
                  disabled={!websiteUrl.trim()}
                  className={cn(
                    spyneComponentClasses.btnPrimaryMd,
                    "flex h-9 w-9 items-center justify-center p-0 disabled:pointer-events-none"
                  )}
                  aria-label="Import from URL"
                >
                  <MaterialSymbol name="arrow_forward" size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 pb-2">
        <p className="text-center text-sm text-spyne-text-secondary">
          Don&apos;t have a vehicle to upload?{" "}
          <button type="button" className="font-semibold text-spyne-primary hover:underline">
            Take a Demo
          </button>
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-1 [scrollbar-width:thin]">
          {demoVehicleHeroThumbnailOptions.map((thumb) => (
            <button
              key={thumb.src}
              type="button"
              className={cn(
                "relative shrink-0 overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spyne-primary",
                thumb.kind === "3d"
                  ? "ring-2 ring-spyne-primary ring-offset-2 ring-offset-background"
                  : "border border-spyne-border"
              )}
            >
              <span className="pointer-events-none absolute left-1 top-1 z-[1]">
                {thumb.kind === "3d" ? (
                  <SpyneChip variant="soft" tone="primary" compact>
                    3D Background
                  </SpyneChip>
                ) : (
                  <SpyneChip variant="outline" tone="neutral" compact>
                    2D Background
                  </SpyneChip>
                )}
              </span>
              <Image
                src={thumb.src}
                alt={thumb.alt}
                width={112}
                height={78}
                className="h-[78px] w-[112px] object-contain object-center bg-muted"
              />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
