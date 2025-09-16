// models/seed/visitor.seed.js
import mongoose from "mongoose";
import { faker } from "@faker-js/faker"; // Updated import for newer faker
// Try one of these imports based on your file structure:
// Option 1: If your file is models/visitor.model.js
import Visitor from "../visitor.model.js";

// Option 2: If your file is models/Visitor.js (uppercase V)
// import Visitor from "../Visitor.js";

// Option 3: If your file is in root directory
// import Visitor from "../../Visitor.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection - match your main app's env variable
const MONGODB_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/visitor_counter";

/**
 * Generate realistic visitor data with historical data from 2023 to now
 */
function generateVisitorData(count = 5000, startYear = 2023) {
  const visitors = [];
  const today = new Date();
  const startDate = new Date(startYear, 0, 1); // January 1st of start year
  const uniqueIPs = new Set();

  // Calculate total days from start date to now
  const totalDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  console.log(
    `🎲 Generating ${count} visitors from ${startDate.toDateString()} to ${today.toDateString()}`
  );
  console.log(`📅 Date range: ${totalDays} days`);

  // Common user agents by year for realistic historical data
  const userAgentsByYear = {
    2023: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1",
    ],
    2024: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
    ],
    2025: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    ],
  };

  // Generate visitors with realistic distribution over time
  for (let i = 0; i < count; i++) {
    // Generate unique IP (allow some duplicates for realistic return visitors)
    let ip;
    const shouldReuse = Math.random() < 0.15; // 15% chance of return visitor

    if (shouldReuse && uniqueIPs.size > 50) {
      // Reuse an existing IP (return visitor)
      const ipsArray = Array.from(uniqueIPs);
      ip = ipsArray[Math.floor(Math.random() * ipsArray.length)];
    } else {
      // Generate new unique IP
      do {
        ip = faker.internet.ipv4();
      } while (uniqueIPs.has(ip) && uniqueIPs.size < count * 0.85);
      uniqueIPs.add(ip);
    }

    // Random date between start date and now
    const randomTime =
      startDate.getTime() +
      Math.random() * (today.getTime() - startDate.getTime());
    const lastVisit = new Date(randomTime);

    // Get appropriate user agent based on year
    const visitYear = lastVisit.getFullYear();
    const yearUserAgents =
      userAgentsByYear[visitYear] || userAgentsByYear[2025];

    // 70% chance to use realistic user agent, 30% faker generated
    const userAgent =
      Math.random() > 0.3
        ? yearUserAgents[Math.floor(Math.random() * yearUserAgents.length)]
        : faker.internet.userAgent();

    visitors.push({
      ip,
      userAgent,
      lastVisit,
    });
  }

  // Sort by date for more realistic insertion
  visitors.sort((a, b) => a.lastVisit - b.lastVisit);

  return visitors;
}

/**
 * Seed the database
 */
async function seedDatabase() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check existing data
    const existingCount = await Visitor.countDocuments();
    console.log(`📊 Existing visitors in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log("🧹 Clearing existing data...");
      await Visitor.deleteMany({});
      console.log("✅ Existing data cleared");
    }

    // Generate and insert new data (from 2023 to now with 5000 visitors)
    const visitorData = generateVisitorData(5000, 2023);
    console.log("💾 Inserting new visitor data...");

    const result = await Visitor.insertMany(visitorData);
    console.log(`✅ Successfully inserted ${result.length} visitors`);

    // Show some statistics
    const stats = await getVisitorStats();
    console.log("\n📈 Database Statistics:");
    console.log(`   Total Visitors: ${stats.total}`);
    console.log(`   Unique IPs: ${stats.uniqueIPs}`);
    console.log(`   Return Visitors: ${stats.total - stats.uniqueIPs}`);
    console.log(
      `   Date Range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}`
    );
    console.log(`   Visitors by Year:`);
    for (const yearStat of stats.visitorsByYear) {
      console.log(`     ${yearStat._id}: ${yearStat.count} visitors`);
    }
    console.log(`   Most Common User Agent: ${stats.topUserAgent.agent}`);
    console.log(`   Count: ${stats.topUserAgent.count}`);
    console.log(
      `   Mobile vs Desktop: ${stats.deviceStats.mobile} mobile, ${stats.deviceStats.desktop} desktop`
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    console.log("🔌 Closing database connection...");
    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
  }
}

/**
 * Get comprehensive visitor statistics
 */
async function getVisitorStats() {
  const total = await Visitor.countDocuments();
  const uniqueIPs = await Visitor.distinct("ip");

  const dateRange = await Visitor.aggregate([
    {
      $group: {
        _id: null,
        earliest: { $min: "$lastVisit" },
        latest: { $max: "$lastVisit" },
      },
    },
  ]);

  const topUserAgent = await Visitor.aggregate([
    {
      $group: {
        _id: "$userAgent",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  // Visitors by year
  const visitorsByYear = await Visitor.aggregate([
    {
      $group: {
        _id: { $year: "$lastVisit" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Mobile vs Desktop stats
  const deviceStats = await Visitor.aggregate([
    {
      $addFields: {
        isMobile: {
          $or: [
            { $regexMatch: { input: "$userAgent", regex: /iPhone/i } },
            { $regexMatch: { input: "$userAgent", regex: /Android/i } },
            { $regexMatch: { input: "$userAgent", regex: /iPad/i } },
            { $regexMatch: { input: "$userAgent", regex: /Mobile/i } },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$isMobile",
        count: { $sum: 1 },
      },
    },
  ]);

  const mobile = deviceStats.find((d) => d._id === true)?.count || 0;
  const desktop = deviceStats.find((d) => d._id === false)?.count || 0;

  return {
    total,
    uniqueIPs: uniqueIPs.length,
    dateRange: {
      earliest: dateRange[0]?.earliest?.toLocaleDateString() || "N/A",
      latest: dateRange[0]?.latest?.toLocaleDateString() || "N/A",
    },
    topUserAgent: {
      agent: topUserAgent[0]?._id?.substring(0, 50) + "..." || "N/A",
      count: topUserAgent[0]?.count || 0,
    },
    visitorsByYear,
    deviceStats: {
      mobile,
      desktop,
    },
  };
}

// Handle script termination
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, closing database connection...");
  await mongoose.disconnect();
  process.exit(0);
});

// Run the seeder
console.log("🌱 Starting database seeding...");
seedDatabase();
