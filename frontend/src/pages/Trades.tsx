import { useMemo, useState } from "react";
import { HiChevronDown, HiOutlineFilter, HiOutlineDownload, HiOutlineRefresh } from "react-icons/hi";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import FilterOrdersModal from "../components/modal/FilterOrdersModal";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Trades() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const columnDefs: ColDef[] = useMemo(
        () => [
            { headerName: "Symbol", field: "symbol" },
            { headerName: "Type", field: "type" },
            { headerName: "Status", field: "status" },
            { headerName: "Quantity", field: "quantity" },
            { headerName: "Price", field: "price" },
            { headerName: "Leverage", field: "leverage" },
            { headerName: "Currency", field: "currency" },
            { headerName: "Amount", field: "amount" },
            { headerName: "Source", field: "source" },
            { headerName: "Source Type", field: "sourceType" },
            { headerName: "Broker", field: "broker" },
            { headerName: "Timestamp", field: "timestamp" },
            { headerName: "Actions", field: "actions", cellRenderer: () => <span className="text-blue-400 cursor-pointer">View</span> },
        ],
        []
    );

    // Default column properties
    const defaultColDef: ColDef = useMemo(
        () => ({
            flex: 1,
            minWidth: 120,
            sortable: true,
            filter: true,
            resizable: true,
        }),
        []
    );

    // Dummy data (empty for now)
    const rowData: any[] = [];

    return (
        <div className="bg-[#020817] text-white p-6 ">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">Trades</h1>
            </div>

            {/* Top Controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-3">
                    {/* Today Dropdown */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md bg-[#020817] hover:bg-[#0b1220]">
                        Today
                        <HiChevronDown size={16} />
                    </button>

                    {/* Filters */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md hover:bg-[#0b1220]">
                        <HiOutlineFilter size={16} />
                        Filters
                    </button>
                </div>

                <div className="flex gap-3">
                    {/* Export */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md hover:bg-[#0b1220] text-gray-300">
                        <HiOutlineDownload size={16} />
                        Export
                    </button>

                    {/* Refresh */}
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-md hover:bg-[#0b1220]">
                        <HiOutlineRefresh size={16} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* AG Grid Container */}
            <div className="ag-theme-quartz-dark w-full">
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    animateRows={true}
                    domLayout="autoHeight"
                />
            </div>


            <FilterOrdersModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </div>
    );
}