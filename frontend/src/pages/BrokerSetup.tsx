import { useState } from "react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

const brokers = ["CoinDCX", "CoinSwitch", "Delta Exchange"];

export default function BrokerSetup() {
  const [selectedBroker, setSelectedBroker] = useState("CoinDCX");
  const [open, setOpen] = useState(false);

  return (
    <div className=" bg-[#020c1b] text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Broker Setup</h1>
      </div>

      {/* Card */}
      <div className="bg-[#071a2f] border border-[#0f2a44] rounded-lg p-6">
        {/* Select Broker */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Select Broker
          </label>

          <div className="relative">
            {/* Selected */}
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center justify-between bg-[#020c1b] border border-[#0f2a44] rounded-md px-4 py-3 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white text-black text-xs px-2 py-1 rounded font-bold">
                  CoinDCX
                </div>
                <span>{selectedBroker}</span>
              </div>

              <FaChevronDown className="text-gray-400" />
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute w-full mt-2 bg-[#020c1b] border border-[#0f2a44] rounded-md overflow-hidden z-10">
                {brokers.map((broker) => (
                  <div
                    key={broker}
                    onClick={() => {
                      setSelectedBroker(broker);
                      setOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#0f2a44] ${
                      selectedBroker === broker
                        ? "bg-[#0f2a44]"
                        : ""
                    }`}
                  >
                    <span>{broker}</span>
                    {selectedBroker === broker && (
                      <FaCheck size={14} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Webhook */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            Webhook
          </label>
          <input
            type="text"
            placeholder="Enter webhook"
            className="w-full bg-[#020c1b] border border-[#0f2a44] rounded-md px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* API Key */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            API Key
          </label>
          <input
            type="text"
            placeholder="Enter API key"
            className="w-full bg-[#020c1b] border border-[#0f2a44] rounded-md px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* API Secret */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            API Secret
          </label>
          <input
            type="password"
            placeholder="Enter API secret"
            className="w-full bg-[#020c1b] border border-[#0f2a44] rounded-md px-4 py-3 outline-none focus:border-blue-500"
          />
        </div>

        {/* Button */}
        <button className="w-full bg-[#2b6cb0] hover:bg-[#2c5282] transition rounded-md py-3 font-medium">
          Update Configuration
        </button>
      </div>
    </div>
  );
}