import express from 'express';
import { register, login, getUserProfile, logout, updateProfile, forgotPassword, verifyOTP, resetPassword } from '../controllers/user.controller.js';
import isAuthenticated from './../middleware/isAuthenticated.js';
import upload from '../utils/multer.js';

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated,upload.single("profilePhoto"),updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;










