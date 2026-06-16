import React, { useState } from "react";

const RiskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"settings" | "alerts">("settings");
  const [tpSl, setTpSl] = useState(false);
  const [repainting, setRepainting] = useState(false);

  return (
    <div className=" bg-[#020c1b] text-white p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-5">Risk Management</h1>

      {/* Tabs */}
      <div className="bg-[#0b1a2d] rounded-md p-1 flex mb-6">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 text-sm rounded-md ${
            activeTab === "settings"
              ? "bg-[#020c1b]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Risk Settings
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex-1 py-2 text-sm rounded-md ${
            activeTab === "alerts"
              ? "bg-[#020c1b]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Risk Alerts
        </button>
      </div>

      {/* Content */}
      <div className="bg-[#071426] rounded-lg p-6 border border-[#0f2a44]">
        {activeTab === "settings" ? (
          <div className="space-y-6">
            {/* TP/SL */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">TP/SL Active</span>

              <ToggleSwitch checked={tpSl} onChange={setTpSl} />
            </div>

            {/* Repainting */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Repainting Control (Buy/Short)
              </span>

              <ToggleSwitch checked={repainting} onChange={setRepainting} />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            Coming Soon 
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskManagement;

/* Toggle Component */
type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

const ToggleSwitch: React.FC<ToggleProps> = ({ checked, onChange }) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        checked ? "bg-blue-600" : "bg-gray-700"
      }`}
    >
      <div
        className={`bg-[#020c1b] w-4 h-4 rounded-full shadow-md transform transition ${
          checked ? "translate-x-6" : ""
        }`}
      />
    </div>
  );
};