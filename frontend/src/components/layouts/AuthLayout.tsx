import React from "react";

type AuthType =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email";

interface PanelConfig {
  badge: string;
  title: string;
  subtitle: string;
  gradient: string;
  features: { icon: string; label: string }[];
  stats: { value: string; label: string }[];
}

interface AuthLayoutProps {
  type: AuthType;
  children: React.ReactNode;
}

// ─── Panel configs ─────────────────────────────────────────────────────────────

const PANEL_CONFIGS: Record<AuthType, PanelConfig> = {
  login: {
    badge: "Trusted by 50,000+ traders",
    title: "Your Gateway to Smarter Crypto",
    subtitle:
      "Real-time insights, portfolio tracking, and intelligent alerts — all in one place.",
    gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
    features: [
      { icon: "📊", label: "Live market data, zero delay" },
      { icon: "🔒", label: "Bank-grade security & 2FA" },
      { icon: "🤖", label: "AI-powered portfolio insights" },
      { icon: "⚡", label: "Instant trade execution" },
    ],
    stats: [
      { value: "$2.4B+", label: "Volume tracked" },
      { value: "150+", label: "Coins supported" },
      { value: "99.9%", label: "Uptime" },
    ],
  },

  register: {
    badge: "Join 50,000+ crypto enthusiasts",
    title: "Start Your Crypto Journey Today",
    subtitle:
      "Create a free account and get access to powerful tools built for modern traders.",
    gradient: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)",
    features: [
      { icon: "🚀", label: "Get started in under 2 minutes" },
      { icon: "📈", label: "Track unlimited portfolios" },
      { icon: "🔔", label: "Custom price alerts" },
      { icon: "🌐", label: "Access from any device" },
    ],
    stats: [
      { value: "Free", label: "Forever plan" },
      { value: "2 min", label: "Setup time" },
      { value: "24/7", label: "Support" },
    ],
  },

  "forgot-password": {
    badge: "Secure account recovery",
    title: "We've Got You Covered",
    subtitle:
      "Reset your password safely in seconds. Your funds and data are always protected.",
    gradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
    features: [
      { icon: "📧", label: "Reset link sent to your email" },
      { icon: "🛡️", label: "Encrypted recovery process" },
      { icon: "⏱️", label: "Link expires in 15 minutes" },
      { icon: "✅", label: "Your funds stay safe" },
    ],
    stats: [
      { value: "<1 min", label: "Recovery time" },
      { value: "256-bit", label: "Encryption" },
      { value: "100%", label: "Secure" },
    ],
  },

  "reset-password": {
    badge: "Almost there!",
    title: "Create a Strong New Password",
    subtitle:
      "Choose a password you haven't used before. Mix letters, numbers, and symbols.",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
    features: [
      { icon: "🔐", label: "At least 8 characters" },
      { icon: "🔢", label: "Include numbers & symbols" },
      { icon: "🔄", label: "Don't reuse old passwords" },
      { icon: "💾", label: "Saved securely with hashing" },
    ],
    stats: [
      { value: "AES-256", label: "Encryption" },
      { value: "0", label: "Stored plaintext" },
      { value: "100%", label: "Private" },
    ],
  },

  "verify-email": {
    badge: "One last step!",
    title: "Verify Your Email Address",
    subtitle:
      "We sent a verification link to your inbox. Click it to activate your account.",
    gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #06b6d4 100%)",
    features: [
      { icon: "📬", label: "Check your inbox or spam folder" },
      { icon: "🔗", label: "Click the verification link" },
      { icon: "⏳", label: "Link valid for 24 hours" },
      { icon: "🎉", label: "Account activated instantly" },
    ],
    stats: [
      { value: "24h", label: "Link validity" },
      { value: "Free", label: "Resend anytime" },
      { value: "Instant", label: "Activation" },
    ],
  },
};

// ─── Decorative elements ──────────────────────────────────────────────────────

function GridOverlay() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none">
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="auth-grid"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 8 0 L 0 0 0 8"
              fill="none"
              stroke="white"
              strokeWidth="0.4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
    </div>
  );
}

function Orbs() {
  return (
    <>
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.18), transparent)",
        }}
      />
      <div
        className="absolute bottom-10 -left-16 w-56 h-56 rounded-full blur-2xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.10), transparent)",
        }}
      />
    </>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({ config }: { config: PanelConfig }) {
  const { badge, title, subtitle, gradient, features, stats } = config;

  return (
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center p-12"
      style={{ background: gradient }}
    >
      <GridOverlay />
      <Orbs />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {badge}
        </span>

        {/* Title & subtitle */}
        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
            {title}
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-sm">
            {subtitle}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-white/85 text-sm font-medium">{f.label}</span>
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-2">
          {stats.map((s, i) => (
            <React.Fragment key={i}>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">{s.value}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.label}</div>
              </div>
              {i < stats.length - 1 && (
                <div className="h-10 w-px bg-white/20" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AuthLayout (main export) ─────────────────────────────────────────────────

export default function AuthLayout({ type, children }: AuthLayoutProps) {
  const config = PANEL_CONFIGS[type];

  return (
    <div className="min-h-screen flex">
      {/* Left — your form comes here as children */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-linear-to-br from-blue-50 to-indigo-50">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right — auto panel based on type */}
      <RightPanel config={config} />
    </div>
  );
}