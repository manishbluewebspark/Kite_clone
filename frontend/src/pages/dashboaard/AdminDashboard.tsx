import {
  ArrowTrendingUpIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  return (
<>
    <div className="bg-primary p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-on-dark text-2xl font-bold">Dashboard</h1>
        <button className="flex items-center gap-2 px-4 py-2 border border-overlay-20 rounded-lg text-on-dark text-sm hover:bg-overlay-10 transition-colors">
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Broker Card */}
      <div className="bg-primary-light border border-overlay-20 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="w-14 h-14 bg-surface rounded-xl flex items-center justify-center overflow-hidden">
            {/* ✅ text-blue-dark replaces text-blue-600 */}
            <span className="text-blue-dark font-bold text-xs">CoinDCX</span>
          </div>
          <div>
            <p className="text-on-dark-40 text-xs uppercase tracking-wider mb-1">Change Broker</p>
            <p className="text-on-dark font-semibold text-lg">CoinDCX</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
              <span className="text-accent text-xs">Connected &amp; Ready</span>
            </div>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-overlay-20 rounded-lg text-on-dark text-sm hover:bg-overlay-10 transition-colors">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          Change broker
          <ChevronDownIcon className="w-4 h-4 text-on-dark-40" />
        </button>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* INR Balance */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-on-dark-55 text-sm mb-2">INR Balance</p>
            <p className="text-on-dark text-2xl font-semibold">₹0.00</p>
          </div>
          {/* ✅ bg-blue-soft replaces bg-blue-500 bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-blue-soft flex items-center justify-center">
            {/* ✅ text-blue-muted replaces text-blue-400 */}
            <span className="text-blue-muted text-xl font-bold">₹</span>
          </div>
        </div>

        {/* USDT Balance */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-on-dark-55 text-sm mb-2">USDT Balance</p>
            <p className="text-on-dark text-2xl font-semibold">$0.00</p>
          </div>
          {/* ✅ bg-accent-overlay replaces bg-accent bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-accent-overlay flex items-center justify-center">
            <span className="text-accent text-xl font-bold">$</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-on-dark-55 text-sm mb-2">Total Orders</p>
            <p className="text-on-dark text-2xl font-semibold">0</p>
          </div>
          {/* ✅ bg-blue-soft replaces bg-blue-500 bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-blue-soft flex items-center justify-center">
            {/* ✅ text-blue-muted replaces text-blue-400 */}
            <ArrowTrendingUpIcon className="w-6 h-6 text-blue-muted" />
          </div>
        </div>
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* INR Locked */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center gap-4">
          {/* ✅ bg-yellow-soft replaces bg-yellow-500 bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-yellow-soft flex items-center justify-center shrink-0">
            {/* ✅ text-yellow-muted replaces text-yellow-400 */}
            <LockClosedIcon className="w-5 h-5 text-yellow-muted" />
          </div>
          <div>
            <p className="text-on-dark-55 text-sm mb-1">INR Locked</p>
            <p className="text-on-dark text-xl font-semibold">₹0.00</p>
          </div>
        </div>

        {/* USDT Locked */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center gap-4">
          {/* ✅ bg-yellow-soft replaces bg-yellow-500 bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-yellow-soft flex items-center justify-center shrink-0">
            {/* ✅ text-yellow-muted replaces text-yellow-400 */}
            <LockClosedIcon className="w-5 h-5 text-yellow-muted" />
          </div>
          <div>
            <p className="text-on-dark-55 text-sm mb-1">USDT Locked</p>
            <p className="text-on-dark text-xl font-semibold">$0.00</p>
          </div>
        </div>

        {/* USDT/INR Rate */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5 flex items-center gap-4">
          {/* ✅ bg-blue-soft replaces bg-blue-500 bg-opacity-20 */}
          <div className="w-11 h-11 rounded-xl bg-blue-soft flex items-center justify-center shrink-0">
            {/* ✅ text-blue-muted replaces text-blue-400 */}
            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-muted" />
          </div>
          <div>
            <p className="text-on-dark-55 text-sm mb-1">USDT/INR Rate</p>
            <p className="text-on-dark text-xl font-semibold">₹98.00</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order Distribution */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-on-dark font-semibold text-lg">Order Distribution</h3>
              <p className="text-on-dark-40 text-xs mt-0.5">By order type</p>
            </div>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-overlay-20 rounded-lg text-on-dark text-sm hover:bg-overlay-10 transition-colors">
              Today
              <ChevronDownIcon className="w-4 h-4 text-on-dark-40" />
            </button>
          </div>
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-56 gap-3">
            <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline
                points="2,8 14,16 24,10 34,22 46,28"
                stroke="#4B5563"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <polyline
                points="34,22 38,26 46,28"
                stroke="#4B5563"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <p className="text-on-dark-40 text-sm">No order data available</p>
          </div>
        </div>

        {/* Order Success */}
        <div className="bg-primary-light border border-overlay-20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-on-dark font-semibold text-lg">Order Success</h3>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-overlay-20 rounded-lg text-on-dark text-sm hover:bg-overlay-10 transition-colors">
              Today
              <ChevronDownIcon className="w-4 h-4 text-on-dark-40" />
            </button>
          </div>

          {/* Total & Success mini cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-primary border border-overlay-20 rounded-xl p-4">
              <p className="text-on-dark-55 text-sm mb-2">Total</p>
              <p className="text-on-dark text-2xl font-bold">0</p>
            </div>
            <div className="bg-primary border border-overlay-20 rounded-xl p-4">
              <p className="text-on-dark-55 text-sm mb-2">Success</p>
              <p className="text-accent text-2xl font-bold">0</p>
            </div>
          </div>

          {/* Bar Chart Placeholder */}
          <div className="relative h-36">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pr-2">
              {[4, 3, 2, 1, 0].map((n) => (
                <span key={n} className="text-on-dark-40 text-xs">{n}</span>
              ))}
            </div>
            {/* Chart area */}
            <div className="ml-6 h-full border-b border-l border-overlay-20 flex items-end justify-around pb-1 px-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-0"></div>
                <span className="text-on-dark-40 text-xs">Total</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-0"></div>
                <span className="text-on-dark-40 text-xs">Success</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</>
  );
}