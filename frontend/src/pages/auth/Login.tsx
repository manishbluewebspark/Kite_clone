// src/pages/auth/Login.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { loginApi, meApi } from "../../api/authApi";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function Login() {
  const { setUser } = useAuthStore();
  // const [email, setEmail] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // const handleLogin = async () => {
  //   if (!email || !password) { toast.error("Please fill in all fields"); return; }
  //   try {
  //     setIsLoading(true);
  //     await loginApi({ email, password });
  //     const res = await meApi();
  //     setUser(res.data.user);
  //     toast.success("Logged in successfully!");
  //     navigate("/dashboard");
  //   } catch (err: any) {
  //     toast.error(err.response?.data?.message || "Login failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



  const handleLogin = async () => {
  if (!loginId || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    setIsLoading(true);

    await loginApi({
      loginId,
      password,
    });

    const res = await meApi();

    setUser(res.data.user);

    toast.success("Logged in successfully!");
    navigate("/dashboard");
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "Login failed"
    );
  } finally {
    setIsLoading(false);
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#f0f0f0" }}
    >
      {/* Card */}
      <div
        className="w-full rounded-lg p-10"
        style={{
          maxWidth: 360,
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Kite Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="Kite Logo"
            style={{ height: 56, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Title */}
        <h1
          className="text-center font-normal mb-6"
          style={{ fontSize: 22, color: "#333333" }}
        >
          Login to Kite
        </h1>

        {/* Phone / User ID field */}
        <div className="mb-4">
          <div
            className="relative border rounded"
            style={{ borderColor: "#cccccc" }}
          >
            <label
              className="absolute text-xs px-1"
              style={{
                top: -9,
                left: 10,
                backgroundColor: "#ffffff",
                color: "#999999",
                fontSize: 11,
              }}
            >
              Phone number or User ID
            </label>
            {/* <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full px-3 py-3 outline-none bg-transparent text-sm"
              style={{ color: "#333333", fontSize: 14 }}
            /> */}

            <input
  type="text"
  value={loginId}
  onChange={(e) => setLoginId(e.target.value)}
  onKeyDown={handleKeyPress}
  disabled={isLoading}
  className="w-full px-3 py-3 outline-none bg-transparent text-sm"
  style={{ color: "#333333", fontSize: 14 }}
/>
          </div>
        </div>

        {/* Password field */}
        <div className="mb-5">
          <div
            className="relative border rounded"
            style={{ borderColor: "#cccccc" }}
          >
            <label
              className="absolute text-xs px-1"
              style={{
                top: -9,
                left: 10,
                backgroundColor: "#ffffff",
                color: "#999999",
                fontSize: 11,
              }}
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="w-full pl-3 pr-10 py-3 outline-none bg-transparent text-sm"
              style={{ color: "#333333", fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
            >
              {showPassword
                ? <HiOutlineEyeOff className="h-4 w-4" style={{ color: "#999999" }} />
                : <HiOutlineEye className="h-4 w-4" style={{ color: "#999999" }} />}
            </button>
          </div>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded font-medium text-white text-sm flex items-center justify-center"
          style={{
            backgroundColor: isLoading ? "#f07050" : "#f05a28",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: 15,
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#d94e20"; }}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#f05a28"; }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Forgot password */}
        <div className="text-center mt-4">
          <Link
            to="/forgot-password"
            className="text-sm"
            style={{ color: "#555555", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            Forgot user ID or password?
          </Link>
        </div>
      </div>

      {/* App store icons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        {/* Google Play */}
        <a href="#" aria-label="Google Play">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5C3.5 20.5 3 21.33 3 20.5z" fill="#34a853" />
            <path d="M3 3.5l9.5 9.5L3 22.5V3.5z" fill="#4285f4" />
            <path d="M3 3.5l9.5 9.5 5-5L4.5 3C4 2.67 3 2.67 3 3.5z" fill="#ea4335" />
            <path d="M3 20.5l9.5-9.5 5 5-9.5 5.5C3.5 22 3 21.33 3 20.5z" fill="#fbbc05" />
          </svg>
        </a>
        {/* Apple */}
        <a href="#" aria-label="App Store">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#555555">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
        </a>
      </div>

      {/* Zerodha branding */}
      <div className="flex items-center justify-center gap-1 mt-3">
        <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
          <path d="M6 26L16 4L26 26H6Z" fill="#387ED1" />
          <path d="M6 26L16 16L26 26H6Z" fill="#1A5FA8" />
        </svg>
        <span
          className="font-bold tracking-widest"
          style={{ fontSize: 13, color: "#555555", letterSpacing: "0.18em" }}
        >
          ZERODHA
        </span>
      </div>

      {/* Sign up */}
      <p className="mt-3 text-sm" style={{ color: "#555555" }}>
        Don't have an account?{" "}
        <a
          href="https://zerodha.com/open-account"
          className="font-medium"
          style={{ color: "#555555", textDecoration: "underline" }}
        >
          Sign up for free!
        </a>
      </p>

      {/* Legal footer */}
      <div
        className="mt-4 text-center px-6"
        style={{ maxWidth: 420, color: "#aaaaaa", fontSize: 11, lineHeight: "1.6" }}
      >
        <p>
          Zerodha Broking Limited: Member of{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>NSE</a>,{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>BSE</a>,{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>MCX</a>{" "}
          - SEBI Reg. no. INZ000031633,{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>CDSL</a>{" "}
          -{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>SEBI Reg. no. IN-DP-431-2019</a>{" "}
          |{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>Smart Online Dispute Resolution</a>{" "}
          |{" "}
          <a href="#" style={{ color: "#aaa", textDecoration: "underline" }}>SEBI SCORES</a>
        </p>
        <p className="mt-2">v3.0.0</p>
      </div>
    </div>
  );
}