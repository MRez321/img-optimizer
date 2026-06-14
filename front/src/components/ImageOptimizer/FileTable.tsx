import type { CompressedFile } from '../../types/types.ts';

interface FileTableProps {
    files: CompressedFile[];
    onDownload: (file: CompressedFile) => void;
    onCompare: (file: CompressedFile) => void;
}

export default function FileTable({ files, onDownload, onCompare }: FileTableProps) {
    return (
        <div className="max-w-6xl mx-auto px-6">
            <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-800 text-left text-sm text-gray-400">
                        <th className="py-5 px-8 font-normal">Name</th>
                        <th className="py-5 px-6 font-normal">Before</th>
                        <th className="py-5 px-6 font-normal">Status</th>
                        <th className="py-5 px-6 font-normal">After</th>
                        <th className="py-5 px-8 font-normal text-right">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {files.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-800/50 transition">
                            <td className="py-5 px-8 flex items-center gap-4">
                                {file.originalPreview && (
                                    <img
                                        src={file.originalPreview}
                                        alt={file.name}
                                        className="w-12 h-12 object-cover rounded-lg border border-gray-700"
                                    />
                                )}
                                <div>
                                    <div className="font-medium truncate max-w-xs">{file.name}</div>
                                    {file.width && file.height && (
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {file.width} × {file.height}px
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="py-5 px-6 text-gray-300">
                                {(file.originalSize / 1024).toFixed(1)} KB
                            </td>
                            <td className="py-5 px-6">
                                {file.status === 'compressing' && (
                                    <span className="text-amber-400">Compressing...</span>
                                )}
                                {file.status === 'completed' && file.compressionRatio !== undefined && (
                                    <span className="text-emerald-400 font-medium">
                                            Saved {file.compressionRatio.toFixed(1)}%
                                        </span>
                                )}
                                {file.status === 'error' && (
                                    <span className="text-red-400">Failed</span>
                                )}
                            </td>
                            <td className="py-5 px-6 text-gray-300">
                                {file.compressedSize
                                    ? `${(file.compressedSize / 1024).toFixed(1)} KB`
                                    : '—'}
                            </td>
                            <td className="py-5 px-8 text-right">
                                {file.status === 'completed' && (
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => onCompare(file)}
                                            className="px-5 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-xl transition"
                                        >
                                            Compare
                                        </button>
                                        <button
                                            onClick={() => onDownload(file)}
                                            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition"
                                        >
                                            Download
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}