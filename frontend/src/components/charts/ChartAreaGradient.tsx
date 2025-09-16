"use client";

import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Range } from "../../App";

type DataPoint = { label: string; count: number };

type Props = {
  data: DataPoint[];
  range: Range;
  onRangeChange: (r: Range) => void;
};

const RANGE_LABELS: Record<Range, string> = {
  day: "Last 24 hours",
  week: "Last 7 days",
  month: "Last 30 days",
  year: "Last 12 months",
};

const RANGE_VALUES: Record<Range, string> = {
  day: "24h",
  week: "7d",
  month: "30d",
  year: "12m",
};

const RANGE_DESCRIPTIONS: Record<Range, string> = {
  day: "Showing total visitors for the last 24 hours",
  week: "Showing total visitors for the last 7 days",
  month: "Showing total visitors for the last 30 days",
  year: "Showing total visitors for the last 12 months",
};

export function ChartAreaGradient({ data, range, onRangeChange }: Props) {
  // Calculate Y-axis domain with +10 padding
  //   const maxValue = Math.max(...data.map((d) => d.count), 0);
  //   const yAxisMax = maxValue + 10;
  const maxValue = Math.max(...data.map((d) => d.count), 0);
  const yAxisMax = Math.ceil(maxValue + Math.max(maxValue * 0.05, 1));

  // Custom tick formatter for different ranges
  const tickFormatter = (value: string) => {
    switch (range) {
      case "day":
        return value; // Already formatted as "00:00", "01:00", etc.
      case "week":
        return value; // Already formatted as "Mon 16", "Tue 17", etc.
      //   case "month":
      //     return `${value}`; // Day number
      case "month":
        return new Date(value).getDate().toString(); //
      case "year":
        return value; // Already formatted as "Jan 2025", etc.
      default:
        return value;
    }
  };

  // Custom tooltip label formatter
  const tooltipLabelFormatter = (label: string) => {
    switch (range) {
      case "day":
        return `${label} on ${new Date().toDateString()}`;
      case "week":
        return `${label}`;
      //   case "month":
      //     const currentMonth = new Date().toLocaleString("default", {
      //       month: "long",
      //       year: "numeric",
      //     });
      //     return `Day ${label} of ${currentMonth}`;
      case "month":
        return new Date(label).toLocaleDateString("default", {
          day: "numeric",
          month: "short",
        });
      case "year":
        return `${label}`;
      default:
        return label;
    }
  };

  // Determine tick interval based on data length
  const getTickInterval = () => {
    const dataLength = data.length;
    switch (range) {
      case "day":
        return dataLength > 12 ? 2 : 1; // Show every 2nd hour if more than 12 hours
      case "week":
        return 0; // Show all 7 days
      case "month":
        return dataLength > 15 ? Math.ceil(dataLength / 10) : 1; // Limit to ~10 ticks max
      case "year":
        return 0; // Show all 12 months
      default:
        return 1;
    }
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Visitors Chart</CardTitle>
          <CardDescription>{RANGE_DESCRIPTIONS[range]}</CardDescription>
        </div>
        <Select
          value={RANGE_VALUES[range]}
          onValueChange={(value) => {
            const rangeKey = Object.entries(RANGE_VALUES).find(
              ([_, v]) => v === value
            )?.[0] as Range;
            if (rangeKey) onRangeChange(rangeKey);
          }}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
              <SelectItem
                key={r}
                value={RANGE_VALUES[r]}
                className="rounded-lg"
              >
                {RANGE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={{
            visitors: {
              label: "Visitors",
              color: "var(--foreground)",
            },
          }}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-visitors)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-visitors)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={tickFormatter}
              interval={getTickInterval()}
              angle={range === "year" ? -45 : 0}
              textAnchor={range === "year" ? "end" : "middle"}
              height={range === "year" ? 80 : 50}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, yAxisMax]}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={tooltipLabelFormatter}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillVisitors)"
              stroke="var(--color-visitors)"
              strokeWidth={2}
              dot={data.length <= 31} // Show dots only for month view or less
              activeDot={{ r: 4, fill: "var(--color-visitors)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
