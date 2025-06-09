// VerifyOtp.jsx
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VerifyOtp = ({ onStepChange, email }) => {
  const [otp, setOtp] = useState("");

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("/api/auth/verify-otp", { email, otp });
      toast.success(res.data.message);
      onStepChange("reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="space-y-4 w-[300px]">
      <h2 className="text-xl font-semibold">Verify OTP</h2>
      <Input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button onClick={handleVerifyOtp}>Verify</Button>
    </div>
  );
};

export default VerifyOtp;
