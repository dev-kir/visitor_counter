import mongoose from "mongoose";
import Visitor from "../models/visitor.model.js";

export const getVisitorStats = async (req, res) => {
  try {
    const { range = "day" } = req.query;
    const now = new Date();
    let matchStage = {};
    let groupStage = {};
    let dateRange = [];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    switch (range) {
      case "day":
        const start24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        matchStage = {
          lastVisit: { $gte: start24h, $lte: now },
        };

        // Generate labels for last 24 hours
        dateRange = [];
        for (let i = 23; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 60 * 60 * 1000);
          const label = d.getHours().toString().padStart(2, "0") + ":00";
          dateRange.push(label);
        }

        groupStage = {
          _id: {
            $dateToString: {
              format: "%H:00",
              date: "$lastVisit",
              timezone: "UTC",
            },
          },
          count: { $sum: 1 },
        };
        break;

      case "week":
        // Last 7 days
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6);
        startOfWeek.setHours(0, 0, 0, 0);

        matchStage = {
          lastVisit: { $gte: startOfWeek },
        };

        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          dateRange.push(`${dayNames[date.getDay()]} ${date.getDate()}`);
        }

        groupStage = {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$lastVisit",
            },
          },
          count: { $sum: 1 },
        };
        break;

      case "month":
        // Last 30 days
        const startOf30Days = new Date(now);
        startOf30Days.setDate(now.getDate() - 29);
        startOf30Days.setHours(0, 0, 0, 0);

        matchStage = {
          lastVisit: { $gte: startOf30Days },
        };

        // Generate last 30 days range
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          dateRange.push(date.toISOString().split("T")[0]); // "YYYY-MM-DD"
        }

        groupStage = {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$lastVisit",
            },
          },
          count: { $sum: 1 },
        };
        break;

      case "year":
        // Last 12 months
        const startOfYear = new Date(
          now.getFullYear() - 1,
          now.getMonth() + 1,
          1
        );

        matchStage = {
          lastVisit: { $gte: startOfYear },
        };

        // Generate last 12 months
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          dateRange.push(
            `${monthNames[date.getMonth()]} ${date.getFullYear()}`
          );
        }

        groupStage = {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$lastVisit",
            },
          },
          count: { $sum: 1 },
        };
        break;

      default:
        throw new Error("Invalid range parameter");
    }

    // Execute aggregation
    const rawStats = await Visitor.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $sort: { _id: 1 } },
    ]);

    // Create a map for easy lookup
    const statsMap = new Map(rawStats.map((item) => [item._id, item.count]));

    // Fill in missing periods with 0 counts
    const stats = dateRange.map((period) => {
      let lookupKey = period;

      // Convert display format back to database format for lookup
      switch (range) {
        case "week":
          // Convert "Mon 16" back to "2025-09-16" format
          const today = new Date();
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 6);
          const dayIndex = dateRange.indexOf(period);
          const targetDate = new Date(weekStart);
          targetDate.setDate(weekStart.getDate() + dayIndex);
          lookupKey = targetDate.toISOString().split("T")[0];
          break;

        // case "month":
        //   // Day number is already correct
        //   lookupKey = period.padStart(2, "0");
        //   break;
        case "month":
          // Already stored as "YYYY-MM-DD"
          lookupKey = period;
          break;

        case "year":
          // Convert "Jan 2025" back to "2025-01"
          const parts = period.split(" ");
          const monthIndex = monthNames.indexOf(parts[0]) + 1;
          lookupKey = `${parts[1]}-${monthIndex.toString().padStart(2, "0")}`;
          break;
      }

      return {
        _id: period,
        count: statsMap.get(lookupKey) || 0,
      };
    });

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching stats" });
  }
};

export const getTotalVisitors = async (req, res) => {
  try {
    const totalCount = await Visitor.countDocuments();
    const uniqueIPs = await Visitor.distinct("ip");

    res.status(200).json({
      totalVisitors: totalCount,
      uniqueVisitors: uniqueIPs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching visitor count" });
  }
};

export const logVisitor = async (req, res) => {
  try {
    const ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.ip;

    const userAgent = req.headers["user-agent"];

    const visitor = await Visitor.findOneAndUpdate(
      { ip },
      { userAgent, lastVisit: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Visit logged",
      ip: visitor.ip,
      lastVisit: visitor.lastVisit,
      userAgent: visitor.userAgent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging visitor" });
  }
};
