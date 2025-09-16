export type VisitorStats = {
  _id: string; // e.g. "2025-09-15"
  count: number;
};

export type VisitorInfo = {
  ip: string;
  lastVisit: string;
  userAgent: string;
};

export type VisitorTotals = {
  totalVisitors: number;
  uniqueVisitors: number;
};

// Fetch total visitor counts
// export async function fetchTotalVisitors(): Promise<VisitorTotals> {
//   const response = await fetch("http://localhost:2306/api/visitors/total");
//   if (!response.ok) throw new Error("Failed to fetch total visitors");
//   return response.json();
// }

export async function fetchTotalVisitors() {
  const res = await fetch(`http://localhost:2306/api/visitor/total`);
  if (!res.ok) throw new Error("Failed to fetch total visitors");
  return res.json() as Promise<VisitorTotals>;
}

// Fetch visitor stats
export async function fetchVisitorStats(
  range: "day" | "week" | "month" | "year" = "day"
) {
  const res = await fetch(
    `http://localhost:2306/api/visitor/stats?range=${range}`
  );
  if (!res.ok) throw new Error("Failed to fetch visitor stats");
  return res.json() as Promise<VisitorStats[]>;
}

// Fetch visitor info (latest visitor)
export async function fetchVisitorInfo() {
  const res = await fetch(`http://localhost:2306/api/visitor/log`);
  if (!res.ok) throw new Error("Failed to fetch visitor info");
  return res.json() as Promise<VisitorInfo>;
}
