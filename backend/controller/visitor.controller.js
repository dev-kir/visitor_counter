import mongoose from "mongoose";
import Visitor from "../models/visitor.model.js";

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
