import express from "express"
import isAuthenticated from './../middleware/isAuthenticated.js';
import { createCheckOutSession, getAllPurchasedCourse, getCourseDetailWithPurchaseStatus, stripeWebhook } from "../controllers/coursePurchase.controller.js";

const router = express.Router();

router.post("/checkout/create-checkout-session",isAuthenticated,createCheckOutSession);
router.post("/webhook",express.raw({type:"application/json"}),stripeWebhook);

router.get("/course/:courseId/detail-with-status",isAuthenticated,getCourseDetailWithPurchaseStatus);
router.get("/",isAuthenticated,getAllPurchasedCourse);

export default router;