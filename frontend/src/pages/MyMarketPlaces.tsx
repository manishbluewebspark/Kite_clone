import { useState } from "react";
import { FiUsers, FiSearch, FiChevronDown, FiCheck } from "react-icons/fi";
import { BsTable, BsGrid3X3Gap } from "react-icons/bs";
import { TbArrowsSort } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

type ViewMode = "table" | "grid";
type SortOption = "Name" | "Category" | "AUD" | "Date Created";
type StatusOption = "All Status" | "Active" | "Inactive";

export default function MyMarketPlaces() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortBy, setSortBy] = useState<SortOption>("Name");
  const [status, setStatus] = useState<StatusOption>("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const sortOptions: SortOption[] = ["Name", "Category", "AUD", "Date Created"];
  const statusOptions: StatusOption[] = ["All Status", "Active", "Inactive"];

  const handleReset = () => {
    setSearchQuery("");
    setSortBy("Name");
    setStatus("All Status");
    setSortDropdownOpen(false);
    setStatusDropdownOpen(false);
  };

  return (
    <div
      className="rounded-2xl w-full"
      style={{ backgroundColor: "#0d1117", fontFamily: "'Segoe UI', sans-serif" }}
      onClick={() => {
        setSortDropdownOpen(false);
        setStatusDropdownOpen(false);
      }}
    >
      <div className="w-full p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiUsers className="text-blue-400 text-3xl" />
            <h1 className="text-3xl font-bold text-blue-400">My Marketplaces</h1>
          </div>
          <p className="text-gray-400 text-sm ml-1">
            Manage and track your followed trading strategies and investment opportunities
          </p>
        </div>

        {/* Section Header + View Toggle */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-semibold">Your followed marketplaces</h2>
          <div className="flex items-center gap-0">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-l-md transition-all ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-700"
              }`}
            >
              <BsTable className="text-base" />
              Table View
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-r-md transition-all ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-700"
              }`}
            >
              <BsGrid3X3Gap className="text-base" />
              Grid View
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: "#111827", border: "1px solid #1f2937" }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center flex-1 min-w-64 rounded-md px-3 py-2 gap-2" style={{ backgroundColor: "#0d1117", border: "1px solid #374151" }}>
              <FiSearch className="text-gray-500 text-sm shrink-0" />
              <input
                type="text"
                placeholder="Search strategies or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-gray-300 text-sm outline-none w-full placeholder-gray-500"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusDropdownOpen(!statusDropdownOpen);
                  setSortDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-md"
                style={{ backgroundColor: "#0d1117", border: "1px solid #374151", minWidth: "140px" }}
              >
                <span className="flex-1 text-left">{status}</span>
                <FiChevronDown className={`text-gray-400 transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {statusDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-md z-50 py-1 min-w-full"
                  style={{ backgroundColor: "#1a2236", border: "1px solid #374151" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatus(opt);
                        setStatusDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                    >
                      {status === opt && <FiCheck className="text-blue-400 text-xs" />}
                      <span className={status === opt ? "ml-0" : "ml-4"}>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSortDropdownOpen(!sortDropdownOpen);
                  setStatusDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 rounded-md"
                style={{ backgroundColor: "#0d1117", border: "1px solid #374151", minWidth: "150px" }}
              >
                <TbArrowsSort className="text-gray-400 text-base" />
                <span className="flex-1 text-left">{sortBy}</span>
                <FiChevronDown className={`text-gray-400 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {sortDropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 rounded-md z-50 py-1 min-w-full"
                  style={{ backgroundColor: "#1a2236", border: "1px solid #374151" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setSortDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white transition-colors text-left"
                    >
                      {sortBy === opt ? (
                        <FiCheck className="text-blue-400 text-xs shrink-0" />
                      ) : (
                        <span className="w-3 shrink-0" />
                      )}
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Filters */}
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm text-white font-medium rounded-md transition-colors hover:opacity-90"
              style={{ backgroundColor: "#374151" }}
            >
              Reset Filters
            </button>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-white font-semibold text-lg">No marketplaces found</p>
            <p className="text-gray-400 text-sm">You haven't followed any marketplaces yet</p>
            <button 
            onClick={() => navigate("/market-places")}
            className="mt-1 px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              Discover Marketplaces
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}