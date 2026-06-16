import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

import Button from "../../components/ui/Button";
import AuthLayout from "../../components/layouts/AuthLayout";
import { resetPasswordApi } from "../../api/authApi";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email || localStorage.getItem("resetEmail");

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      await resetPasswordApi({
        email,
        newPassword: password,
      });

      toast.success("Password reset successful!");

      localStorage.removeItem("resetEmail");

      navigate("/");

    } catch (error: any) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AuthLayout type="reset-password">
      <div className="mb-8 text-center lg:text-left">
        <img src="/logo.png" alt="Logo" className="h-12 mx-auto lg:mx-0" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reset Password
        </h1>
        <p className="text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="space-y-5">
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            value={password}
            placeholder="Enter new password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            placeholder="Confirm password"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Updating..." : "Update Password"}
        </Button>

        <p className="text-center text-sm text-gray-600">
          Back to{" "}
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}