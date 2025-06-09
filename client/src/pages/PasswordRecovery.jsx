// PasswordRecovery.jsx
import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import VerifyOtp from "./VerifyOtp";
import ResetPassword from "./ResetPassword";

const PasswordRecovery = () => {
  const [step, setStep] = useState("request-otp");
  const [email, setEmail] = useState("");

  return (
    <div className="flex justify-center mt-20">
      {step === "request-otp" && (
        <ForgotPassword onStepChange={setStep} setEmail={setEmail} />
      )}
      {step === "verify-otp" && (
        <VerifyOtp onStepChange={setStep} email={email} />
      )}
      {step === "reset-password" && <ResetPassword email={email} />}
    </div>
  );
};

export default PasswordRecovery;
