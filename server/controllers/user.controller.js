import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js"

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required.",
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "User Already Exist" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword,
        });
        return res
            .status(201)
            .json({ success: true, message: "User Created Go to login" });
    } catch (error) {
        console.log(error);

        return res
            .status(500)
            .json({ success: false, message: "Falied to register" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "All fields are required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or Password",
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or Password",
            });
        }
        generateToken(res, user, `Welcome Back ${user.name}`);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ success: false, message: "Falied to Login" });
    }
};

export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({ success: true, message: "Logged Out successfully" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Falied to LogOut" });

    }
}

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.id;
        // const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "enrolledCourses",
        populate: {
          path: "creator",
          select: "name photoUrl",
        },
      });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Profile Not Found",
            });
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Falied to get user" });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { name } = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        // extract public id of old  image of the url if it exists
        if (user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteMedia(publicId);
        }

        // uploadd new photo
        const cloudResponse = await uploadMedia(profilePhoto.path);
        const photoUrl =cloudResponse.secure_url;

        const updatedData = { name, photoUrl };
        const updatedUser = await User.findByIdAndUpdate(userId,updatedData,{new:true}).select("-password");
        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile Updated Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Falied to get user" });
    }
}


// controllers/authController.js


export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  await sendEmail(
    email,
    "Password Reset OTP",
    `Your OTP for password reset is ${otp}. It expires in 10 minutes.`
  );

  res.json({ message: "OTP sent to your email" });
};


export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified successfully" });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const hashedPassword = await bcrypt.hash(newPassword, 10); // ✅ Hash it

  user.password = hashedPassword; // ✅ Save hashed password
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully" });
};

