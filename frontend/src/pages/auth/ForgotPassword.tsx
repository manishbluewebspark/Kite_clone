// import { useState } from "react";
// import { toast } from "react-toastify";
// import { HiOutlineMail } from "react-icons/hi";
// import Button from "../../components/ui/Button";
// import AuthLayout from "../../components/layouts/AuthLayout";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!email) {
//       toast.error("Please enter your email");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       console.log("Email submitted:", email);

//       toast.success("Reset link sent to your email!");
//     } catch (error: any) {
//       toast.error("Something went wrong");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") handleSubmit();
//   };

//   return (
//     <AuthLayout type="forgot-password">
//       <div className="mb-8 text-center lg:text-left">
//         <img src="/logo.png" alt="Logo" className="h-12 mx-auto lg:mx-0" />
//       </div>

//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">
//           Forgot Password
//         </h1>
//         <p className="text-gray-600">
//           Enter your email to receive reset link
//         </p>
//       </div>

//       <div className="space-y-5">
//         {/* Email */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Email Address
//           </label>
//           <div className="relative">
//             <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
//               <HiOutlineMail className="h-5 w-5" />
//             </span>
//             <input
//               type="email"
//               value={email}
//               placeholder="you@example.com"
//               className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyPress={handleKeyPress}
//               disabled={isLoading}
//             />
//           </div>
//         </div>

//         {/* Submit */}
//         <Button
//           onClick={handleSubmit}
//           disabled={isLoading}
//           className="w-full"
//         >
//           {isLoading ? (
//             <div className="flex items-center justify-center">
//               <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                   fill="none"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 
//                   0 0 5.373 0 12h4zm2 5.291A7.962 
//                   7.962 0 014 12H0c0 3.042 1.135 
//                   5.824 3 7.938l3-2.647z"
//                 />
//               </svg>
//               Sending...
//             </div>
//           ) : (
//             "Send Reset Link"
//           )}
//         </Button>

//         <p className="text-center text-sm text-gray-600">
//           Back to{" "}
//           <a
//             href="/"
//             className="text-blue-600 hover:text-blue-800 font-medium"
//           >
//             Login
//           </a>
//         </p>
//       </div>
//     </AuthLayout>
//   );
// }

import { useState } from "react";
import { toast } from "react-toastify";
import { HiOutlineMail } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button";
import AuthLayout from "../../components/layouts/AuthLayout";
import { sendOtpApi } from "../../api/authApi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);

      // ✅ API CALL
      await sendOtpApi({ email });

      toast.success("OTP sent to your email!");

      // ✅ save email (refresh safe)
      localStorage.setItem("resetEmail", email);

      // ✅ redirect to verify otp page
      navigate("/verify-otp", { state: { email } });

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AuthLayout type="forgot-password">
      <div className="mb-8 text-center lg:text-left">
        <img src="/logo.png" alt="Logo" className="h-12 mx-auto lg:mx-0" />
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-gray-600">
          Enter your email to receive reset link
        </p>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <HiOutlineMail className="h-5 w-5" />
            </span>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress} // 🔥 fixed (onKeyPress deprecated)
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 
                  0 0 5.373 0 12h4zm2 5.291A7.962 
                  7.962 0 014 12H0c0 3.042 1.135 
                  5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </div>
          ) : (
            "Send Reset Link"
          )}
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