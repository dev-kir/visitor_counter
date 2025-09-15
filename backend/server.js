import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import visitorRoutes from "./routes/visitor.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2306;

app.use(express.json());
app.set("trust proxy", true);

app.use("/api/visitor", visitorRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
