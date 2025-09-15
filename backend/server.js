import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Visitor from "./models/visitor.model.js";

dotenv.config();

const app = express();

app.use(express.json());
app.set("trust proxy", true);

app.get("/", async (req, res) => {
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

    res.json({
      message: "Visit logged",
      ip: visitor.ip,
      lastVisit: visitor.lastVisit,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error logging visitor" });
  }
});

app.listen(2306, () => {
  connectDB();
  console.log("Server started at http://localhost:2306");
});
