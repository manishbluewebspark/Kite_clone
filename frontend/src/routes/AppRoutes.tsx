import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster, ToastBar  } from "react-hot-toast";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import Watchlist from "../pages/Watchlist";
import Orders from "../pages/Orders";
import Trades from "../pages/Trades";
import NetPosition from "../pages/NetPosition";
import RiskManagement from "../pages/RiskManagement";
import BrokerSetup from "../pages/BrokerSetup";
import Marketplace from "../pages/Marketplace";
import MyMarketPlaces from "../pages/MyMarketPlaces";

import DashboardLayout from "../layout/DashboardLayout";
import { useAuthStore } from "../store/useAuthStore";
import { meApi } from "../api/authApi";
import AIChartAnalyzer from "../pages/ai/AiChartAnalyzer";
import AIStrategyGenerator from "../pages/ai/AiStrategyGenerator";
import AIBrain from "../pages/ai/AiBrain";
import AdvancedChartAnalysis from "../pages/analytics/AdvancedChartAnalysis";
import CryptoLive from "../pages/analytics/CryptoLive";
import CryptoTrends from "../pages/analytics/CryptoTrends";
import CryptoMarketHeatmap from "../pages/analytics/CryptoMarketHeatmap";
import SeasonalityAnalysis from "../pages/analytics/SeasonalityAnalysis";
import Pricing from "../pages/account/Pricing";
import FAQ from "../pages/account/FAQ";
import AIRiskRewards from "../pages/ai/AIRiskRewards";
import AIRiskRewardsAssistant from "../pages/ai/AIRiskRewardsAssistant";

// ============================== admin =============================
import Users from "../pages/admin/Users";
import AddUsers from "../pages/admin/AddUsers";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOtp from "../pages/auth/VerifyOtp";
import ResetPassword from "../pages/auth/ResetPassword";


import Holdings from "../pages/holdings/Holdings";
import Positions from "../pages/Positions";
import Funds from "../pages/Funds";
import WithdrawFunds from "../pages/WithdrawFunds";
import Bids from "../pages/Bids";
import pluckSound from "../../public/sound/pluck.mp3";

const playedToasts = new Set<string>();
const toastAudio = new Audio(pluckSound);

function ProtectedLayout() {
  const { isAuth } = useAuthStore();
  if (!isAuth) return <Navigate to="/" />;
  return <DashboardLayout><Outlet /></DashboardLayout>;
}

export default function AppRoutes() {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await meApi();
        setUser(res.data.user);
      } catch (err) {
        // optionally handle error
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
{/* <Toaster
  position="bottom-right"
  toastOptions={{
    duration: 3000,
    className: "my-toast",
    style: {
      background: "#ffffff",
      color: "#000000",
      borderLeft: "4px solid #4CAF50",
      padding: "16px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    success: {
      icon: null,
      className: "my-toast-success",
      style: {
        background: "#ffffff",
        color: "#000000",
        borderLeft: "15px solid #4CAF50",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    },
    error: {
      icon: null,
      className: "my-toast-error",
      style: {
        background: "#ffffff",
        color: "#000000",
        borderLeft: "15px solid #f44336",
        padding: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      },
    },
  }}
>
  {(t) => {
    if (t.visible && !playedToasts.has(t.id)) {
      toastAudio.currentTime = 0;
      toastAudio.play().catch(() => {});
      playedToasts.add(t.id);
    }

    return <ToastBar toast={t} />;
  }}
</Toaster> */}


<Toaster position="bottom-right">
  {(t) => {
    if (t.visible && !playedToasts.has(t.id)) {
      toastAudio.currentTime = 0;
      toastAudio.play().catch(() => {});
      playedToasts.add(t.id);
    }
    return t.type === "custom" ? (
      <>{typeof t.message === "function" ? t.message(t) : t.message}</>
    ) : (
      <ToastBar toast={t} />
    );
  }}
</Toaster>

      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/net-position" element={<NetPosition />} />
          <Route path="/risk-management" element={<RiskManagement />} />
          <Route path="/broker-setup" element={<BrokerSetup />} />
          <Route path="/market-places" element={<Marketplace />} />
          <Route path="/my-marketplaces" element={<MyMarketPlaces />} />
          <Route path="/ai-chart-analyzar" element={<AIChartAnalyzer />} />
          <Route path="/ai-strategy-generator" element={<AIStrategyGenerator />} />
          <Route path="/ai-calculator" element={<AIRiskRewards />} />
          <Route path="/ai-assistant" element={<AIRiskRewardsAssistant />} />
          <Route path="/ai-brain" element={<AIBrain />} />
          <Route path="/advanced-chart-analysis" element={<AdvancedChartAnalysis />} />
          <Route path="/crypto-live" element={<CryptoLive />} />
          <Route path="/crypto-trends" element={<CryptoTrends />} />
          <Route path="/market-heatmap" element={<CryptoMarketHeatmap />} />
          <Route path="/seasonality-analysis" element={<SeasonalityAnalysis />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq" element={<AIRiskRewards />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/funds" element={<Funds />} />
          <Route path="/withdraw" element={<WithdrawFunds />} />
          <Route path="/bids" element={<Bids />} />

          {/* ================================= admin ==================================== */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/add-users" element={<AddUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}