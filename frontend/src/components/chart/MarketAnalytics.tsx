import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueFormatterParams, CellClassParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { marketData, type CryptoData } from "../../data/marketData";

ModuleRegistry.registerModules([AllCommunityModule]);

const ChangeRenderer = (params: { value: number }) => {
  const val = params.value;
  const pos = val >= 0;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        fontWeight: 600,
        fontSize: "0.8rem",
        letterSpacing: "0.05em",
        color: pos ? "#34d399" : "#f87171",
      }}
    >
      <svg
        style={{ width: 10, height: 10, marginRight: 4, flexShrink: 0 }}
        viewBox="0 0 10 10"
        fill="currentColor"
      >
        {pos ? <path d="M5 1 L9 7 L1 7 Z" /> : <path d="M5 9 L9 3 L1 3 Z" />}
      </svg>
      {pos ? "+" : ""}
      {val.toFixed(2)}%
    </span>
  );
};

const pctFormatter = (p: ValueFormatterParams) =>
  `${p.value >= 0 ? "+" : ""}${Number(p.value).toFixed(2)}%`;

const pctCellClass = (p: CellClassParams) =>
  p.value >= 0 ? "cell-positive" : "cell-negative";

export default function MarketAnalytics() {
  const columnDefs: ColDef<CryptoData>[] = useMemo(
    () => [
      {
        field: "symbol",
        headerName: "SYMBOL",
        flex: 2,
        minWidth: 140,
        sort: "asc",
        cellStyle: {
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          display: "flex",
          alignItems: "center",
        },
      },
      {
        field: "1h",
        headerName: "1H",
        flex: 1,
        minWidth: 110,
        type: "numericColumn",
        valueFormatter: pctFormatter,
        cellRenderer: ChangeRenderer,
        cellClass: pctCellClass,
      },
      {
        field: "1d",
        headerName: "1D",
        flex: 1,
        minWidth: 110,
        type: "numericColumn",
        valueFormatter: pctFormatter,
        cellRenderer: ChangeRenderer,
        cellClass: pctCellClass,
      },
      {
        field: "1w",
        headerName: "1W",
        flex: 1,
        minWidth: 110,
        type: "numericColumn",
        valueFormatter: pctFormatter,
        cellRenderer: ChangeRenderer,
        cellClass: pctCellClass,
      },
      {
        field: "1m",
        headerName: "1M",
        flex: 1,
        minWidth: 110,
        type: "numericColumn",
        valueFormatter: pctFormatter,
        cellRenderer: ChangeRenderer,
        cellClass: pctCellClass,
      },
    ],
    []
  );

  const defaultColDef: ColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      suppressMovable: false,
      headerClass: "ag-custom-header",
    }),
    []
  );

  return (
    <div className="flex items-start justify-center p-6 bg-primary rounded-2xl">
      <div className="w-full">

        <div className="mb-6">
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Market Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Price changes across timeframes
          </p>
        </div>

        {/* ✅ Fixed height wrapper — no more phantom white space */}
        <div className="ag-theme-quartz-dark w-full" style={{ height: 420 }}>
          <AgGridReact<CryptoData>
            rowData={marketData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
          />
        </div>

      </div>
    </div>
  );
}