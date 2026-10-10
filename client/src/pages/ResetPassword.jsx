// ResetPassword.jsx
import { useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResetPassword = ({ email }) => {
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post("/api/auth/reset-password", {
        email,
        newPassword,
      });
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="space-y-4 w-[300px]">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      <Input
        placeholder="New Password"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button onClick={handleReset}>Reset Password</Button>
    </div>
  );
};

export default ResetPassword;
