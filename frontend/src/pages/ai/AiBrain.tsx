import { useState } from "react";
import { FiPlus, FiSend } from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";
import { HiSparkles } from "react-icons/hi2";

const suggestions = [
  "What's the current price of Bitcoin?",
  "Analyze Ethereum's technical indicators",
  "Compare SOL vs AVAX",
  "Best entry points for BTC right now?",
];

export default function AIBrain() {
  const [input, setInput] = useState("");

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[300px] min-w-[300px] bg-[#0d1520] flex flex-col border-r border-[#1c2a3a]">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <span className="text-base font-semibold text-white tracking-wide">
            Conversations
          </span>
          <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#1c2a3a] transition-colors text-gray-400 hover:text-white">
            <FiPlus size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1c2a3a] mx-0" />

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <p className="text-sm text-gray-500 leading-relaxed">
            No conversations yet.
            <br />
            Start a new chat!
          </p>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[#1c2a3a] hover:bg-[#1c2a3a] transition-colors text-sm text-gray-300 hover:text-white">
            <FiPlus size={16} />
            <span>New Chat</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0f1923]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="flex flex-col items-center text-center max-w-lg">
            {/* Bot Icon */}
            <div className="w-16 h-16 rounded-full bg-[#142030] border border-[#1e3448] flex items-center justify-center mb-5 shadow-lg shadow-blue-900/20">
              <RiRobot2Line size={30} className="text-[#5b9bd5]" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
              Crypto Quick Guide
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-sm">
              Your AI-powered cryptocurrency assistant. Ask about prices, market
              analysis, trading strategies, and more.
            </p>

            {/* Suggestion Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-[#112030] border border-[#1e3448] hover:bg-[#162840] hover:border-[#2a4a68] transition-all duration-150 text-left text-sm text-gray-300 hover:text-white group"
                >
                  <HiSparkles
                    size={14}
                    className="text-[#5b9bd5] shrink-0 group-hover:text-[#7ab8e8] transition-colors"
                  />
                  <span className="leading-snug">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1c2a3a]" />

        {/* Input Bar */}
        <div className="px-8 py-4 bg-[#0f1923]">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 bg-[#0d1520] border border-[#1c2a3a] rounded-xl px-4 py-3 focus-within:border-[#2a4a68] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any cryptocurrency..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
              <button
                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-[#5b9bd5] transition-colors disabled:opacity-30"
                disabled={!input.trim()}
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-3 text-center">
          <p className="text-xs text-gray-600">
            AI responses are for informational purposes only. Always do your own
            research.
          </p>
        </div>
      </main>
    </div>
  );
}