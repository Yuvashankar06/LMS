
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PurchaseCourseProtectedRoute = ({ children }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } =
    useGetCourseDetailWithStatusQuery(courseId, {
      refetchOnMountOrArgChange: true, // Ensure fresh status
    });

  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCheckingStatus(false);
    }, 1500); // Give time for webhook to complete (adjust as needed)
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading || checkingStatus) return <p>Verifying your payment...</p>;

  if (!data || error) {
    return <Navigate to={`/course-detail/${courseId}`} />;
  }

  const isPurchased = data?.purchased === true;
  const isPaymentCompleted = data?.purchaseStatus === "completed";

  if (!isPurchased || !isPaymentCompleted) {
    return <Navigate to={`/payment/${courseId}`} />;
  }

  return children;
};

export default PurchaseCourseProtectedRoute;