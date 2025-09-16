"use client";

import { useEffect, useState } from "react";
import { ChartAreaGradient } from "@/components/charts/ChartAreaGradient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VisitorInfo, VisitorTotals } from "@/api/visitor";
import {
  fetchVisitorStats,
  fetchVisitorInfo,
  fetchTotalVisitors,
} from "@/api/visitor";

export type Range = "day" | "week" | "month" | "year";

export default function App() {
  const [stats, setStats] = useState<{ label: string; count: number }[]>([]);
  const [visitor, setVisitor] = useState<VisitorInfo | null>(null);
  const [totalStats, setTotalStats] = useState<VisitorTotals | null>(null);
  const [range, setRange] = useState<Range>("day");

  useEffect(() => {
    async function loadData() {
      try {
        // Load all data in parallel
        const [statData, visitorData, totalData] = await Promise.all([
          fetchVisitorStats(range),
          fetchVisitorInfo(),
          fetchTotalVisitors(),
        ]);
        const res = await fetch("http://localhost:2306/api/visitor/log");
        if (!res.ok) throw new Error("Failed to log visitor");
        const data = await res.json();
        setVisitor({
          ip: data.ip,
          lastVisit: data.lastVisit,
          userAgent: data.userAgent,
        });

        setStats(statData.map((s) => ({ label: s._id, count: s.count })));
        setVisitor(visitorData);
        setTotalStats(totalData);
      } catch (err) {
        console.error("Failed to load visitor data:", err);
      }
    }

    loadData();
  }, [range]);

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Visitor Counter</span>
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            {totalStats ? (
              <>
                <span>
                  <strong>Total Visitors:</strong>{" "}
                  {totalStats.totalVisitors.toLocaleString()}
                </span>
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong>Unique Visitors:</strong>{" "}
                  {totalStats.uniqueVisitors.toLocaleString()}
                </span>
              </>
            ) : (
              <span>Loading visitor statistics...</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <ChartAreaGradient
            data={stats}
            range={range}
            onRangeChange={setRange}
          />
        </CardContent>

        {visitor && (
          <CardFooter className="flex flex-col gap-2">
            <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 items-center">
              <span className="font-medium text-muted-foreground text-right">
                Your IP Address:
              </span>
              <span className="break-all font-mono text-sm py-1 rounded">
                {visitor.ip}
              </span>

              <span className="font-medium text-muted-foreground text-right">
                Last Visited:
              </span>
              <span className="font-mono text-sm">
                {new Date(visitor.lastVisit).toLocaleString()}
              </span>

              <span className="font-medium text-muted-foreground text-right">
                User Agent:
              </span>
              <span className="break-all text-sm py-1 rounded">
                {visitor.userAgent}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
