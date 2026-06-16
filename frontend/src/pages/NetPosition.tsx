import React, { useMemo } from "react";
import { FiRefreshCw, FiLogOut } from "react-icons/fi";

import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

const NetPosition: React.FC = () => {
  // AG Grid column definitions
  const columnDefs: ColDef[] = useMemo(() => [
    { headerName: "", field: "select", checkboxSelection: true, width: 50 },
    { headerName: "Symbol", field: "symbol" },
    { headerName: "Type", field: "type" },
    { headerName: "Position", field: "position" },
    { headerName: "Avg Price", field: "avgPrice" },
    { headerName: "Leverage", field: "leverage" },
    { headerName: "LTP", field: "ltp" },
    { headerName: "P&L", field: "pl" },
    { headerName: "P&L %", field: "plPercent" },
    { headerName: "ROE %", field: "roe" },
    { headerName: "Stop Loss", field: "stopLoss" },
    { headerName: "Take Profit", field: "takeProfit" },
    { headerName: "Action", field: "action" },
  ], []);

  // AG Grid default column properties
  const defaultColDef: ColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  }), []);

  return (
    <div className="bg-[#020c1b] text-white p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Net Position</h1>
        </div>

        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-400">Total P&amp;L</span>
            <p className="text-green-400 font-semibold">+ ₹0.00 ↑</p>
          </div>
          <div>
            <span className="text-gray-400">Investment</span>
            <p className="font-semibold">₹0.00 ↑</p>
          </div>
          <div>
            <span className="text-gray-400">Current Value</span>
            <p className="font-semibold">₹0.00 ↑</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        {/* <button className="flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800">
          <FiExternalLink />
          PiP View
        </button> */}

        <button className="flex items-center gap-2 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800">
          <FiRefreshCw />
          Refresh
        </button>

        <button className="flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-md hover:bg-orange-700">
          <FiLogOut />
          Exit Selected
        </button>

        <button className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-md hover:bg-red-700">
          <FiLogOut />
          Exit All
        </button>
      </div>

      {/* AG Grid Table */}
      <div className="ag-theme-quartz-dark w-full">
        <AgGridReact
          rowData={[]}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          domLayout="autoHeight"
        />
      </div>
    </div>
  );
};

export default NetPosition;