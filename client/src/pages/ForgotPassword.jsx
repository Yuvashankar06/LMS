// // ForgotPassword.jsx
// import { useState } from "react";
// import axios from "axios";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// const ForgotPassword = ({ onStepChange, setEmail }) => {
//   const [emailInput, setEmailInput] = useState("");

//   const handleSendOtp = async () => {
//     try {
//       const res = await axios.post("/api/auth/forgot-password", {
//         email: emailInput,
//       });
//       toast.success(res.data.message);
//       setEmail(emailInput);
//       onStepChange("verify-otp");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error sending OTP");
//     }
//   };

//   return (
//     <div className="space-y-4 w-[300px]">
//       <h2 className="text-xl font-semibold">Forgot Password</h2>
//       <Input
//         placeholder="Enter your email"
//         value={emailInput}
//         onChange={(e) => setEmailInput(e.target.value)}
//       />
//       <Button onClick={handleSendOtp}>Send OTP</Button>
//     </div>
//   );
// };

// export default ForgotPassword;


import { useState } from "react";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
} from "@/features/api/authApi";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [forgotPassword] = useForgotPasswordMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resetPassword] = useResetPasswordMutation();

  const handleEmailSubmit = async () => {
    try {
      await forgotPassword(email).unwrap();
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send OTP");
    }
  };

  const handleOtpVerify = async () => {
    try {
      await verifyOtp({ email, otp }).unwrap();
      toast.success("OTP Verified");
      setStep(3);
    } catch (err) {
      toast.error(err?.data?.message || "Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword({ email, newPassword }).unwrap();
      toast.success("Password reset successfully");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      toast.error(err?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="w-[400px] mx-auto mt-20 p-6 border rounded-md shadow">
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-2 border mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleEmailSubmit} className="w-full btn-primary">
            Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full p-2 border mb-4"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleOtpVerify} className="w-full btn-primary">
            Verify OTP
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-2 border mb-4"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleResetPassword} className="w-full btn-primary">
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
