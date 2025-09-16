import mongoose from "mongoose";
import Visitor from "../models/visitor.model.js";

export const getVisitorStats = async (req, res) => {
  try {
    const { range = "day" } = req.query; // default group by day
    let groupFormat;

    switch (range) {
      case "day":
        groupFormat = "%Y-%m-%d"; // daily
        break;
      case "week":
        groupFormat = "%Y-%U"; // week of year
        break;
      case "month":
        groupFormat = "%Y-%m"; // month
        break;
      case "year":
        groupFormat = "%Y"; // year
        break;
      default:
        groupFormat = "%Y-%m-%d";
    }

    const stats = await Visitor.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$lastVisit" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching stats" });
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
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging visitor" });
  }
};
