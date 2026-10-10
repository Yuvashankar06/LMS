
import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/dbConnect.js";
import cookieParser from "cookie-parser";
import useRoute from "./routes/user.route.js";
import cors from "cors";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import { stripeWebhook } from "./controllers/coursePurchase.controller.js";

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow local development and deployed frontend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://lms-frontend-sigma-sooty.vercel.app",
    ],
    credentials: true,
  })
);

// Stripe webhook MUST be before express.json()
app.post(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", useRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});