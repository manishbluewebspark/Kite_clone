import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/ui/Button";
import AuthLayout from "../../components/layouts/AuthLayout";
import { verifyOtpApi } from "../../api/authApi";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email || localStorage.getItem("resetEmail");

  const handleSubmit = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setIsLoading(true);

      await verifyOtpApi({ email, otp });

      toast.success("OTP verified successfully!");

      navigate("/reset-password", { state: { email } });

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Invalid OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AuthLayout type="verify-email">
      <div className="mb-8 text-center lg:text-left">
        <img src="/logo.png" alt="Logo" className="h-12 mx-auto lg:mx-0" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Verify OTP
        </h1>
        <p className="text-gray-600">
          Enter the OTP sent to your email
        </p>
      </div>

      <div className="space-y-5">
        {/* OTP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            OTP
          </label>

          <input
            type="text"
            value={otp}
            placeholder="Enter OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            onChange={(e) => setOtp(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Back to{" "}
          <a
            href="/forgot-password"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Forgot Password
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}