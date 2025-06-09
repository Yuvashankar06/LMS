import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/dbConnect.js";
import cookieParser from "cookie-parser";
import useRoute from "./routes/user.route.js";
import cors from "cors";
import courseRoute from "./routes/course.route.js"
import mediaRoute from "./routes/media.route.js"
import purchaseRoute from "./routes/purchaseCourse.route.js"
import courseProgressRoute from "./routes/courseProgress.route.js"
import { stripeWebhook } from "./controllers/coursePurchase.controller.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 🟢 Stripe webhook route (MUST be before express.json)
app.post(
  "/api/v1/purchase/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// All other routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", useRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);

app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});