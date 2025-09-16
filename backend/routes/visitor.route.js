import express from "express";

import {
  getVisitorStats,
  logVisitor,
  getTotalVisitors,
} from "../controller/visitor.controller.js";

const router = express.Router();

router.get("/total", getTotalVisitors);
router.get("/stats", getVisitorStats);
router.get("/log", logVisitor);

export default router;
