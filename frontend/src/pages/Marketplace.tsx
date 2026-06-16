import React from "react";
import {
  FaChartLine,
  FaFire,
  FaSearch,
  FaShieldAlt,
} from "react-icons/fa";

const Marketplace: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] to-[#1e3a8a] rounded-2xl p-6 flex justify-between items-center border border-[#1e293b]">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500">
            <FaChartLine className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">
              Discover Marketplaces
            </h1>
            <p className="text-gray-400 text-sm">
              Explore top-performing trading strategies by expert traders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2 text-green-400">
            ● Live
          </span>
          <span className="flex items-center gap-2 text-blue-400">
            <FaShieldAlt /> Verified
          </span>
        </div>
      </div>

      {/* Marketplace Leaders */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <FaFire className="text-orange-400" />
          Marketplace Leaders
        </h2>

        <div className="border border-[#1e293b] rounded-xl p-6 text-center text-gray-400 bg-[#020617]">
          No trending marketplaces available
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            More features and strategies
          </h2>

          <div className="flex gap-2">
            <button className="bg-blue-600 px-4 py-1.5 rounded-md text-sm">
              Table View
            </button>
            <button className="border border-[#1e293b] px-4 py-1.5 rounded-md text-sm">
              Grid View
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-wrap gap-3 items-center border border-[#1e293b] rounded-xl p-4 bg-[#020617]">
          <div className="flex items-center gap-2 bg-[#020617] border border-[#1e293b] rounded-lg px-3 py-2 w-[280px]">
            <FaSearch className="text-gray-400" />
            <input
              placeholder="Search strategies or providers..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <select className="bg-[#020617] border border-[#1e293b] px-3 py-2 rounded-lg text-sm">
            <option>Name</option>
          </select>

          <button className="border border-[#1e293b] px-4 py-2 rounded-lg text-sm">
            Reset Filters
          </button>
        </div>

        {/* Table */}
        <div className="mt-6 border border-[#1e293b] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 bg-[#0f172a] px-6 py-3 text-sm text-gray-400">
            <div>Marketplace</div>
            <div>Category</div>
            <div>Recommended Margin</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Row */}
          <div className="grid grid-cols-5 items-center px-6 py-4 border-t border-[#1e293b]">
            {/* Marketplace */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-blue-500"></div>
              <div>
                <p className="font-medium">Fibonacci Retracement</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  The Fibonacci Retracement Strategy identifies potential support and resistance levels where price may pull back and then continue the trend.
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <span className="text-xs px-3 py-1 rounded-full border border-[#1e293b]">
                Crypto
              </span>
            </div>

            {/* Margin */}
            <div>₹ 30000</div>

            {/* Status */}
            <div>
              <span className="bg-blue-600 text-xs px-3 py-1 rounded-full">
                Active
              </span>
            </div>

            {/* Actions */}
            <div>
              <button className="bg-blue-600 px-4 py-1.5 rounded-md text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;