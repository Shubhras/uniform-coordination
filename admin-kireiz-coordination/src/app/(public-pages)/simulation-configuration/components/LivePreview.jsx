"use client";

// Shared by both tabs — the preview reflects whatever template/export settings
// are currently selected, so it lives above them.
const LivePreview = ({ preview, loading }) => (
    <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC] flex flex-col min-h-[40vh]">
        <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-[#1C2C56]">Live Preview</p>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                Auto-updating
            </span>
        </div>

        <div className="flex-1 bg-white border rounded-lg flex items-center justify-center relative">
            <div className="text-xs text-gray-400">Simulation Layer</div>

            <button
                type="button"
                disabled
                title="Available once the Canvas simulation engine is built"
                className="absolute bg-white border shadow px-3 py-1 rounded text-xs text-[#1C2C56] opacity-50 cursor-not-allowed"
            >
                Expand Preview
            </button>
        </div>

        <div className="text-xs text-[#64748B] mt-4 space-y-1">
            <p>
                <span className="font-medium text-[#1C2C56]">Dimensions:</span>{" "}
                {loading ? "…" : preview?.dimensions || "—"}
            </p>
            <p>
                <span className="font-medium text-[#1C2C56]">Pixels:</span>{" "}
                {loading
                    ? "…"
                    : preview?.pixel_width && preview?.pixel_height
                      ? `${preview.pixel_width} × ${preview.pixel_height} px`
                      : "—"}
            </p>
            <p>
                <span className="font-medium text-[#1C2C56]">File Size Est:</span>{" "}
                {loading ? "…" : preview?.file_size_label || "—"}
            </p>
            <p>
                <span className="font-medium text-[#1C2C56]">Active Layers:</span>{" "}
                {/* No data source yet — see note in simulation_config.py */}
                {preview?.active_layers ?? "—"}
            </p>
        </div>
    </div>
);

export default LivePreview;
