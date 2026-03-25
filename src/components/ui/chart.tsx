"use client"

import * as React from "react"
import type { TooltipContentProps } from "recharts"
import { Tooltip } from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
}

type ChartContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  config: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, style, ...props }, ref) => {
    const colorVars = Object.entries(config).reduce<Record<string, string>>((acc, [key, item]) => {
      if (item.color) acc[`--color-${key}`] = item.color
      return acc
    }, {})

    return (
      <div
        ref={ref}
        className={cn("w-full text-xs text-muted-foreground", className)}
        style={{ ...colorVars, ...style }}
        {...props}
      />
    )
  }
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = Tooltip

type ChartValueType = number | string | ReadonlyArray<number | string>
type ChartNameType = number | string

type ChartTooltipContentProps = TooltipContentProps<ChartValueType, ChartNameType> & {
  indicator?: "line" | "dot" | "dashed"
  hideLabel?: boolean
  labelKey?: string
  nameKey?: string
  className?: string
}

const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      label,
      className,
      indicator = "dot",
      hideLabel = false,
      labelKey,
      nameKey,
      formatter,
      labelFormatter,
    },
    ref
  ) => {
    if (!active || !payload?.length) return null

    const resolvedLabel =
      (labelKey && payload[0]?.payload?.[labelKey]) ??
      (labelFormatter ? labelFormatter(label, payload) : label)

    return (
      <div ref={ref} className={cn("grid gap-2 rounded-lg border bg-background p-3 shadow-sm", className)}>
        {!hideLabel && resolvedLabel ? (
          <div className="text-[11px] text-muted-foreground">{resolvedLabel}</div>
        ) : null}
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const value = item.value ?? 0
            const name =
              (nameKey && item.payload?.[nameKey]) ??
              item.name ??
              item.dataKey ??
              `Item ${index + 1}`
            const color = item.color ?? `var(--color-${item.dataKey ?? "value"})`

            return (
              <div key={`${item.dataKey ?? "value"}-${index}`} className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block",
                    indicator === "dot" && "h-2.5 w-2.5 rounded-full",
                    indicator === "line" && "h-[2px] w-3 rounded-full",
                    indicator === "dashed" && "h-[2px] w-3 rounded-full border border-dashed"
                  )}
                  style={{
                    backgroundColor: indicator === "dashed" ? "transparent" : color,
                    borderColor: indicator === "dashed" ? color : "transparent",
                  }}
                />
                <span className="text-muted-foreground">{name}</span>
                <span className="ml-auto font-medium text-foreground">
                  {formatter ? formatter(value, String(name), item, index, payload) : value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
