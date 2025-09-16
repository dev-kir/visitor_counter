import express from "express";

import {
  getVisitorStats,
  logVisitor,
} from "../controller/visitor.controller.js";

const router = express.Router();

router.get("/stats", getVisitorStats);
router.get("/log", logVisitor);

export default router;
