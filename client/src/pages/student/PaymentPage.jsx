import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PaymentPage = () => {
  const { courseId } = useParams();
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] =
    useCreateCheckoutSessionMutation();

  useEffect(() => {
    const initiatePayment = async () => {
      await createCheckoutSession(courseId);
    };

    initiatePayment();
  }, [courseId]);

  useEffect(() => {
    if (isSuccess) {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server.");
      }
    }
    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session.");
    }
  }, [data, isSuccess, isError, error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-lg">
        <Loader2 className="animate-spin h-5 w-5" />
        <span>Redirecting to payment...</span>
      </div>
    </div>
  );
};

export default PaymentPage;