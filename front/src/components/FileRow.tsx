import { CheckCircle2, AlertTriangle, Loader2, Download, ImageIcon, X } from 'lucide-react';
import { formatBytes, formatPercent } from '../lib/format';
import type { QueuedFile } from '../types';
import { API_BASE } from '../lib/api';

interface FileRowProps {
  item: QueuedFile;
  onRemove?: (id: string) => void;
}

export const FileRow = ({ item, onRemove }: FileRowProps) => {
  const { file, status, result, errorMessage } = item;

  // Bar width: 100% while pending/processing (original size visual),
  // shrinks to the actual optimized ratio once done.
  const ratio = result ? Math.max(result.optimizedSize / result.originalSize, 0.04) : 1;
  const widthPercent = status === 'done' ? ratio * 100 : 100;

  return (
    <div className={`file-row file-row--${status}`}>
      <div className="file-row__icon">
        {status === 'done' && <CheckCircle2 size={16} className="file-row__icon-done" />}
        {status === 'error' && <AlertTriangle size={16} className="file-row__icon-error" />}
        {(status === 'uploading' || status === 'processing') && (
          <Loader2 size={16} className="spin file-row__icon-loading" />
        )}
        {status === 'queued' && <ImageIcon size={16} className="file-row__icon-queued" />}
      </div>

      <div className="file-row__main">
        <div className="file-row__top">
          <span className="file-row__name">{file.name}</span>
          <span className="file-row__sizes">
            {result ? (
              <>
                <span className="file-row__size-original">{formatBytes(result.originalSize)}</span>
                <span className="file-row__arrow">→</span>
                <span className="file-row__size-optimized">{formatBytes(result.optimizedSize)}</span>
              </>
            ) : (
              <span className="file-row__size-original">{formatBytes(file.size)}</span>
            )}
          </span>
          {onRemove && (status === 'queued' || status === 'error') && (
            <button
              className="file-row__remove"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${file.name}`}
              type="button"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="compression-bar">
          <div
            className={`compression-bar__fill compression-bar__fill--${status}`}
            style={{ width: `${widthPercent}%` }}
          />
        </div>

        <div className="file-row__bottom">
          {status === 'queued' && <span className="file-row__status-text">Waiting…</span>}
          {status === 'uploading' && <span className="file-row__status-text">Uploading…</span>}
          {status === 'processing' && <span className="file-row__status-text">Compressing…</span>}
          {status === 'error' && (
            <span className="file-row__status-text file-row__status-text--error">{errorMessage || 'Failed'}</span>
          )}
          {status === 'done' && result && (
            <>
              <span className="file-row__savings">{formatPercent(result.savings)} smaller</span>
              <span className="file-row__dims">
                {result.width}×{result.height}
              </span>
              <a
                href={`${API_BASE}${result.downloadUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="file-row__download"
              >
                <Download size={13} /> Download
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
