import { FaBrain } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";

const features = [
  {
    title: "AI-Powered Strategy Creation",
    description: "Generate custom trading strategies using advanced AI algorithms",
  },
  {
    title: "Market Analysis Integration",
    description: "Incorporate real-time market data and technical indicators",
  },
  {
    title: "Backtesting & Optimization",
    description: "Test and optimize strategies with historical data",
  },
];

export default function AIStrategyGenerator() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-2xl w-full text-center gap-6">

        {/* Brain Icon */}
        <div className="w-20 h-20 rounded-full bg-[#1a2a4a] flex items-center justify-center border border-[#1e3a6e]">
          <FaBrain className="text-[#4a8fd4] text-4xl" />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-white text-4xl font-extrabold tracking-tight">
            AI Strategy Generator
          </h1>
          <p className="text-gray-400 text-base">
            Intelligent trading strategy creation powered by AI
          </p>
        </div>

        {/* Card */}
        <div className="w-full border border-[#1e3a6e] rounded-2xl bg-[#111827] px-10 py-8 flex flex-col gap-7">

          {/* Coming Soon */}
          <div className="flex items-center justify-center gap-2 text-orange-400 text-xl font-semibold">
            <MdAccessTime className="text-2xl" />
            <span>Coming Soon</span>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-6 text-left">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <IoSparkles className="text-[#4a8fd4] text-2xl mt-0.5 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{feature.title}</p>
                  <p className="text-gray-400 text-sm mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer text */}
        <p className="text-gray-400 text-sm">
          We're working hard to bring you this exciting feature. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}