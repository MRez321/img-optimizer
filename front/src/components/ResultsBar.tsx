import type { CompressedFile } from '../types';

interface ResultsBarProps {
    files: CompressedFile[];
    onClear: () => void;
    onDownloadAll: () => void;
}

export default function ResultsBar({ files, onClear, onDownloadAll }: ResultsBarProps) {
    const totalSaved = files.reduce((sum, file) => {
        if (file.compressedSize) {
            return sum + (file.originalSize - file.compressedSize);
        }
        return sum;
    }, 0);

    return (
        <div className="max-w-6xl mx-auto px-6 mt-8 flex justify-between items-center">
            <button
                onClick={onClear}
                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition"
            >
                Clear List
            </button>

            <div className="text-xl font-semibold">
                Total Saved: <span className="text-emerald-400">{(totalSaved / 1024).toFixed(1)} KB</span>
            </div>

            <button
                onClick={onDownloadAll}
                disabled={files.length === 0}
                className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Download All as ZIP
            </button>
        </div>
    );
}