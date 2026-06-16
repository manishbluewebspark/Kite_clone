import { useState } from "react";
import {
  FiTrendingUp,
  FiZap,
  FiBarChart2,
  FiMail,
  FiShield,
  FiHeadphones,
  FiUser,
  FiSliders,
  FiActivity,
  FiMessageSquare,
  FiStar,
  FiCpu,
  FiUsers,
} from "react-icons/fi";
import { RiVipCrownLine } from "react-icons/ri";

type BillingCycle = "monthly" | "yearly";

interface Feature {
  icon: React.ReactNode;
  label: string;
}

interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: Feature[];
  cta: string;
  highlighted: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    name: "Starter",
    description: "Perfect for beginners exploring automated trading",
    monthlyPrice: 5999,
    yearlyPrice: 4799,
    icon: <FiTrendingUp size={22} />,
    highlighted: false,
    cta: "Choose Starter",
    features: [
      { icon: <FiZap size={14} />, label: "1 Broker Connection" },
      { icon: <FiActivity size={14} />, label: "3 Live Deployments" },
      { icon: <FiBarChart2 size={14} />, label: "Basic Backtesting" },
      { icon: <FiMail size={14} />, label: "Email Support" },
      { icon: <FiShield size={14} />, label: "Risk Management Tools" },
    ],
  },
  {
    name: "Pro",
    description: "For serious traders ready to scale their strategies",
    monthlyPrice: 8999,
    yearlyPrice: 7199,
    icon: <RiVipCrownLine size={22} />,
    highlighted: true,
    cta: "Choose Pro",
    features: [
      { icon: <FiZap size={14} />, label: "1 Broker Connection" },
      { icon: <FiActivity size={14} />, label: "25 Live Deployments" },
      { icon: <FiCpu size={14} />, label: "1 Basic Pine Script Templates" },
      { icon: <FiMessageSquare size={14} />, label: "Email + WhatsApp Support" },
      { icon: <FiUser size={14} />, label: "Human Support" },
      { icon: <FiShield size={14} />, label: "Risk Management Tools" },
      { icon: <FiSliders size={14} />, label: "Custom Indicators" },
      { icon: <FiBarChart2 size={14} />, label: "Intermediate Backtesting" },
      { icon: <FiBarChart2 size={14} />, label: "Intermediate Analytics" },
    ],
  },
  {
    name: "Premium",
    description: "Ultimate power for professional algorithmic traders",
    monthlyPrice: 12999,
    yearlyPrice: 10399,
    icon: <FiTrendingUp size={22} />,
    highlighted: false,
    cta: "Choose Premium",
    features: [
      { icon: <FiZap size={14} />, label: "1 Broker Connection" },
      { icon: <FiActivity size={14} />, label: "Unlimited Live Deployments" },
      { icon: <FiCpu size={14} />, label: "1 Multi-Target Pine Script Templates" },
      { icon: <FiUsers size={14} />, label: "RM (Relationship Manager) Support" },
      { icon: <FiCpu size={14} />, label: "Instant Chart Bot AI Support" },
      { icon: <FiHeadphones size={14} />, label: "Priority Support" },
      { icon: <FiShield size={14} />, label: "Risk Management Tools" },
      { icon: <FiSliders size={14} />, label: "Custom Indicators" },
      { icon: <FiBarChart2 size={14} />, label: "Advanced Backtesting" },
      { icon: <FiBarChart2 size={14} />, label: "Advanced Analytics" },
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN").format(price);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-6 py-16"
      style={{ background: "#0d1117" }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-white leading-tight">
          Choose Your Trading
        </h1>
        <h1 className="text-5xl font-extrabold text-blue-500 leading-tight mb-4">
          Plan
        </h1>
        <p className="text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
          Unlock the power of algorithmic trading with our comprehensive plans designed for
          every trader's journey
        </p>
      </div>

      {/* Toggle */}
      <div
        className="flex items-center gap-4 rounded-full px-6 py-2 mb-12"
        style={{ background: "#161b22", border: "1px solid #21262d" }}
      >
        <span
          className={`text-sm font-medium cursor-pointer transition-colors ${
            billing === "monthly" ? "text-white" : "text-gray-500"
          }`}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </span>

        {/* Toggle Switch */}
        <button
          onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
          className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
          style={{ background: billing === "yearly" ? "#3b82f6" : "#374151" }}
        >
          <span
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
            style={{ left: billing === "yearly" ? "calc(100% - 1.25rem)" : "0.25rem" }}
          />
        </button>

        <span
          className={`text-sm font-medium cursor-pointer transition-colors ${
            billing === "yearly" ? "text-white" : "text-gray-500"
          }`}
          onClick={() => setBilling("yearly")}
        >
          Yearly
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {plans.map((plan) => (
          <div key={plan.name} className="relative flex flex-col">
            {/* Most Popular Badge */}
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-1.5 rounded-full"
                  style={{ background: "#3b82f6" }}
                >
                  <FiStar size={11} />
                  Most Popular
                </span>
              </div>
            )}

            <div
              className="flex flex-col flex-1 rounded-2xl p-7 transition-all duration-200"
              style={{
                background: plan.highlighted ? "#0f1d35" : "#161b22",
                border: plan.highlighted ? "2px solid #3b82f6" : "1px solid #21262d",
              }}
            >
              {/* Plan Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 mx-auto"
                style={{
                  background: plan.highlighted ? "#1e3a5f" : "#1c2128",
                  color: plan.highlighted ? "#60a5fa" : "#8b949e",
                }}
              >
                {plan.icon}
              </div>

              {/* Plan Name & Description */}
              <h2 className="text-xl font-bold text-white text-center mb-2">
                {plan.name}
              </h2>
              <p className="text-gray-400 text-sm text-center leading-relaxed mb-6">
                {plan.description}
              </p>

              {/* Price */}
              <div className="text-center mb-8">
                <span className="text-4xl font-extrabold text-white">
                  ₹{formatPrice(
                    billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
                  )}
                </span>
                <span className="text-gray-400 text-sm ml-1">/month</span>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span
                      className="flex-shrink-0"
                      style={{ color: plan.highlighted ? "#60a5fa" : "#4b5563" }}
                    >
                      {feature.icon}
                    </span>
                    <span className="text-gray-300 text-sm">{feature.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: plan.highlighted
                    ? "#3b82f6"
                    : "transparent",
                  border: plan.highlighted ? "none" : "1px solid #3b82f6",
                  color: "#fff",
                }}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}