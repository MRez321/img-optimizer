import type { CompressedFile } from '../../types/types.ts';

interface ResultsBarProps {
    files: CompressedFile[];
    onClear: () => void;
    onDownloadAll: () => void;
}

export default function ResultsBar({ files, onClear, onDownloadAll }: ResultsBarProps) {
    const completedFiles = files.filter(f => f.status === 'completed');

    const totalOriginal = completedFiles.reduce((sum, f) => sum + f.originalSize, 0);
    const totalCompressed = completedFiles.reduce((sum, f) => sum + (f.compressedSize ?? 0), 0);
    const totalSavedKB = ((totalOriginal - totalCompressed) / 1024).toFixed(1);
    const totalSavedPct = totalOriginal > 0
        ? ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(1)
        : '0';

    return (
        <div className="max-w-6xl mx-auto px-6 mt-8 flex justify-between items-center">
            <button
                onClick={onClear}
                className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition"
            >
                Clear List
            </button>

            <div className="text-center">
                <div className="text-xl font-semibold">
                    Total Saved:{' '}
                    <span className="text-emerald-400">{totalSavedKB} KB</span>
                </div>
                {totalOriginal > 0 && (
                    <div className="text-sm text-gray-400 mt-1">
                        {totalSavedPct}% reduction across {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <button
                onClick={onDownloadAll}
                disabled={completedFiles.length === 0}
                className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-2xl font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
                Download All as ZIP
            </button>
        </div>
    );
}