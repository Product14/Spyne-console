import React from 'react'

interface SidePanelWrapperProps {
  children: React.ReactNode
}

export default function SidePanelWrapper({ children }: SidePanelWrapperProps) {
  return (
    <div className="w-full sm:w-[380px] md:w-[400px] bg-white absolute right-0 top-0 h-full overflow-y-scroll lg:w-[480px] xl:w-[520px] bg-card border-l-2 border-l-primary/20 transition-all duration-300 shadow-xl flex-shrink-0">
      <div className="flex flex-col">
        {children}
      </div>
    </div>
  );
}