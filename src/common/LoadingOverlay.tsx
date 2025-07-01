import type { LoadingOverlayProps } from "./types";

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-blue-950 bg-opacity-70 flex items-center justify-center z-[9999] transition-opacity duration-300 backdrop-blur-sm">
            <div className="flex flex-col items-center text-white p-6 rounded-xl bg-blue-800/80 shadow-2xl">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
                <p className="mt-4 text-xl font-semibold">Loading data...</p>
            </div>
        </div>
    );
};
