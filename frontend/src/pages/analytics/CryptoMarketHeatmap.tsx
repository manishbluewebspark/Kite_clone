export default function CryptoMarketHeatmap(){
const chartUrl = import.meta.env.VITE_CRYPTO_MARKET_HEATMAP_URL;

    if (!chartUrl) {
        return (
            <div className="w-full h-screen bg-[#091020] flex items-center justify-center">
                <p className="text-red-400 text-sm font-medium">
                    Chart URL not configured. Please set <code className="bg-white/10 px-1 rounded">NEXT_PUBLIC_TRADINGVIEW_CHART_URL</code> in your .env file.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-[#091020]">
            <div className="p-3">
                <h1 className="text-2xl font-semibold text-white">Crypto Market Heatmap</h1>
            </div>
            <iframe
                src={chartUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowTransparency={true}
                scrolling="no"
                allowFullScreen={true}
                className="block border-none w-full h-full"
            />
        </div>
    );
}