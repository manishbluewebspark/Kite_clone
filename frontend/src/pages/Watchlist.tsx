import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { FiPlus, FiRefreshCw, FiSettings } from "react-icons/fi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import TradingGuideModal from "../components/modal/TradingGuideModal";
import AddWatchlist from "../components/modal/AddWatchlist";

// AG Grid setup
ModuleRegistry.registerModules([AllCommunityModule]);

const columnDefs: ColDef[] = [
  { field: "symbol", headerName: "Symbol", flex: 1 },
  { field: "leverage", headerName: "Leverage", flex: 1 },
  { field: "amount", headerName: "Amount", flex: 1 },
  { field: "orderType", headerName: "Order Type", flex: 1 },
  { field: "targetPrice", headerName: "Target Price", flex: 1 },
  { field: "stopLoss", headerName: "Stop Loss", flex: 1 },
];

const defaultColDef: ColDef = {
  sortable: true,
  filter: true,
  resizable: true,
};

const Watchlist: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <div className="p-6 bg-primary text-secondary rounded-2xl">
      {/* Header / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Watchlist</h1>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-global">
            <HiOutlineInformationCircle className="mr-1" /> Trading Guide
          </button>
          <button className="btn-global">
            <FiSettings className="mr-1" /> Settings
          </button>
          <button className="btn-global">
            <FiRefreshCw className="mr-1" /> Refresh
          </button>
          <button 
          onClick={() => setIsWishlistOpen(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm">
            <FiPlus className="mr-1" /> Create Watchlist
          </button>
        </div>
      </div>

      <div className="ag-theme-quartz-dark w-full">
        <AgGridReact
          rowData={[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          domLayout="autoHeight"
        />
      </div>


      <TradingGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AddWatchlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onAdd={(data) => console.log(data)}
      />
    </div>
  );
};

export default Watchlist;