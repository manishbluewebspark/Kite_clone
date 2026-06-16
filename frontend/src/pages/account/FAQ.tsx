import { useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const faqs = [
  { id: 1, question: "How To Use Marketplace" },
  { id: 2, question: "Automatealgos App Navigation" },
  { id: 3, question: "How To Create Watchlist" },
  { id: 4, question: "How To Connect With CoinDCX" },
  { id: 5, question: "How to create API for CoinDCX" },
  { id: 6, question: "What is an Admin Dashboard?" },
];

const avatars = [
  { label: "A", bg: "bg-blue-500" },
  { label: "B", bg: "bg-teal-400" },
  { label: "C", bg: "bg-slate-400" },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      {/* Top Nav */}
      <div className="px-6 py-4 border-b border-[#1e2a38]">
        <h1 className="text-white font-semibold text-lg">FAQ</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Frequently asked questions
          </h2>
          <p className="text-slate-400 text-sm">
            Get to know more about our platform and services
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-[#111827] border border-[#1e2d3d] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-white text-sm font-medium hover:bg-[#162032] transition-colors duration-200"
              >
                <span>{faq.question}</span>
                <FiChevronDown
                  className={`text-slate-400 transition-transform duration-300 ${
                    openId === faq.id ? "rotate-180" : "rotate-0"
                  }`}
                  size={18}
                />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-slate-400 text-sm border-t border-[#1e2d3d] pt-3">
                  Content for "{faq.question}" goes here. This section provides
                  detailed information to help users understand this topic better.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions Card */}
        <div className="mt-8 bg-[#111827] border border-[#1e2d3d] rounded-xl px-6 py-8 text-center">
          {/* Overlapping Avatars */}
          <div className="flex justify-center mb-4">
            <div className="flex -space-x-3">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center text-white text-sm font-semibold border-2 border-[#111827]`}
                >
                  {a.label}
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-white font-bold text-lg mb-1">
            Still have questions
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Can't find the answer you're looking for? Please chat to our friendly
            team.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200">
            Chat with us
          </button>
        </div>
      </div>
    </div>
  );
}