import express from "express";

import { logVisitor } from "../controller/visitor.controller.js";

const router = express.Router();

router.get("/log", logVisitor);

export default router;
