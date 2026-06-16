import { useState, useRef, useCallback, useEffect } from "react";
import {
  FiUpload,
  FiTrendingUp,
  FiClock,
  FiChevronRight,
  FiZap,
  FiCheckCircle,
  FiX,
  FiImage,
} from "react-icons/fi";
import { TbTargetArrow } from "react-icons/tb";
import { RiAlertLine, RiBrainLine } from "react-icons/ri";
import { MdOutlineAnalytics } from "react-icons/md";
import { BsInboxFill } from "react-icons/bs";

export default function AIChartAnalyzer() {
  const [activeTab, setActiveTab] = useState<"analyze" | "results" | "history">("analyze");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "analyze", label: "Analyze Chart" },
    { id: "results", label: "Analysis Results" },
    { id: "history", label: "History (0)", icon: <FiClock className="w-4 h-4" /> },
  ] as const;

  const features = [
    {
      icon: <FiTrendingUp className="w-5 h-5 text-emerald-400" />,
      title: "Trend Analysis",
      description: "Market direction & momentum",
    },
    {
      icon: <TbTargetArrow className="w-5 h-5 text-blue-400" />,
      title: "Support & Resistance",
      description: "Key price levels",
    },
    {
      icon: <RiAlertLine className="w-5 h-5 text-orange-400" />,
      title: "Risk Management",
      description: "Stop loss & targets",
    },
    {
      icon: <RiBrainLine className="w-5 h-5 text-purple-400" />,
      title: "Pattern Recognition",
      description: "Chart patterns & formations",
    },
  ];

  // Process file into base64 preview
  const processFile = (file: File) => {
    if (!file.type.match(/image\/(png|jpeg|webp)/)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) processFile(file);
        break;
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedImage(null);
    setUploadedFileName("");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#1e2a3a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Chart Analyzer</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400">
              <span className="hover:text-gray-300 cursor-pointer">Dashboard</span>
              <FiChevronRight className="w-3.5 h-3.5" />
              <span className="text-white">AI Chart Analyzer</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#131c28] border border-[#1e2a3a] rounded-lg px-3 py-2">
            <FiZap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">AI Tokens:</span>
            <span className="text-sm font-semibold bg-blue-500 text-white rounded px-1.5 py-0.5">5/5</span>
            <div className="w-20 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden ml-1">
              <div className="h-full w-full bg-blue-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e2a3a] w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-2 flex-1 py-3.5 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? "text-white bg-[#131c28] border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-300 hover:bg-[#0f1923]"
              }`}
          >
            {'icon' in tab && tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── ANALYZE TAB ── */}
      {activeTab === "analyze" && (
        <div className="p-5 flex gap-5">
          {/* Left Panel */}
          <div className="flex-1 bg-[#0f1923] border border-[#1e2a3a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <FiUpload className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Upload Chart</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Upload, drag & drop, or paste a trading chart for AI analysis
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden
                ${isDragging ? "border-blue-500 bg-blue-500/5" : "border-[#1e3a5a] hover:border-[#2a4a6a] bg-[#0a1520]"}
                ${uploadedImage ? "p-4" : "py-16 px-8"}`}
            >
              {uploadedImage ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <div className="relative w-full">
                    <img
                      src={uploadedImage}
                      alt="Uploaded chart"
                      className="w-full max-h-64 object-contain rounded-lg border border-[#1e2a3a]"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                    >
                      <FiX className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiImage className="w-4 h-4 text-blue-400" />
                    <span className="truncate max-w-xs">{uploadedFileName}</span>
                  </div>
                  <p className="text-xs text-gray-500">Click or drop to replace image</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-900/40">
                    <FiUpload className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Chart</h3>
                  <p className="text-sm text-gray-400 mb-5 text-center">
                    Drag & drop, click to browse, or paste from clipboard
                  </p>
                  <div className="flex gap-2 mb-4">
                    {["PNG", "JPG", "WEBP"].map((fmt) => (
                      <span key={fmt} className="px-3 py-1 text-xs font-medium text-gray-300 bg-[#131c28] border border-[#1e2a3a] rounded-md">
                        {fmt}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="px-2 py-0.5 bg-[#131c28] border border-[#1e2a3a] rounded text-gray-400 font-mono">Ctrl</span>
                    <span>+</span>
                    <span className="px-2 py-0.5 bg-[#131c28] border border-[#1e2a3a] rounded text-gray-400 font-mono">V</span>
                    <span>to paste</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[440px] bg-[#0f1923] border border-[#1e2a3a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <MdOutlineAnalytics className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">AI Analysis Features</h2>
            </div>
            <div className="flex flex-col gap-2.5">
              {features.map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#131c28] border border-[#1e2a3a] rounded-lg px-4 py-3.5 hover:border-[#2a3a4a] transition-colors">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-white">{feature.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#0d1f35] border border-blue-500/40 rounded-lg px-4 py-3.5 flex items-start gap-3">
              <FiCheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-blue-400">AI-Powered Analysis Ready</div>
                <div className="text-xs text-blue-400/70 mt-0.5">Upload your chart to get instant insights</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {activeTab === "results" && (
        <div className="p-5 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-center">
            <MdOutlineAnalytics className="w-12 h-12 text-gray-600" />
            <p className="text-white font-semibold">No Results Yet</p>
            <p className="text-gray-500 text-sm">Upload a chart to see your analysis results here.</p>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="p-5 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 bg-[#131c28] border border-[#1e2a3a] rounded-2xl flex items-center justify-center">
              <BsInboxFill className="w-7 h-7 text-gray-500" />
            </div>
            <div>
              <p className="text-white font-semibold text-base">No History Found</p>
              <p className="text-gray-500 text-sm mt-1">Your past chart analyses will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}