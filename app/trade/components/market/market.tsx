"use client"
import React from "react"

import DepthChart from "@/components/stateful/depth-chart/depth-chart"
import {
  CustomTabs,
  CustomTabsContent,
  CustomTabsList,
  CustomTabsTrigger,
} from "@/components/stateless/custom-tabs"
import { TVChartContainer } from "@/components/trading-view/trading-view-chart"
import { type ResolutionString } from "@/public/charting_library/charting_library"
import { cn } from "@/utils"

const MENU_ITEMS = [
  {
    name: "Depth chart",
  },
  {
    name: "Price chart",
  },
]

export default function Market({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props} className={cn(className)}>
      <CustomTabs defaultValue={MENU_ITEMS[0]?.name} className="h-full">
        <CustomTabsList className="w-full flex justify-start border-b">
          {MENU_ITEMS.map(({ name }) => (
            <CustomTabsTrigger key={`${name}-tab`} value={name}>
              {name}
            </CustomTabsTrigger>
          ))}
        </CustomTabsList>
        <div className="h-full w-full p-1">
          <CustomTabsContent value="Depth chart">
            <DepthChart />
          </CustomTabsContent>
          <CustomTabsContent value="Price chart">
            <TVChartContainer
              symbol={"AAPL"}
              interval={`1D` as ResolutionString}
            />
          </CustomTabsContent>
        </div>
      </CustomTabs>
    </div>
  )
}
