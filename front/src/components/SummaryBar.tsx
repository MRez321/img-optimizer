import { Download, PackageCheck, Wifi, WifiOff } from 'lucide-react';
import { formatBytes, formatPercent } from '../lib/format';
import { API_BASE } from '../lib/api';
import type { ZipReadyEvent } from '../types';

interface SummaryBarProps {
  completed: number;
  expected: number;
  totalOriginal: number;
  totalOptimized: number;
  zipData: ZipReadyEvent | null;
  connected: boolean;
  onManualZip: () => void;
  zipRequestable: boolean;
}

export const SummaryBar = ({
  completed,
  expected,
  totalOriginal,
  totalOptimized,
  zipData,
  connected,
  onManualZip,
  zipRequestable,
}: SummaryBarProps) => {
  const pct = expected > 0 ? (completed / expected) * 100 : 0;
  const savingsPct = totalOriginal > 0 ? ((totalOriginal - totalOptimized) / totalOriginal) * 100 : 0;

  return (
    <div className="summary-bar">
      <div className="summary-bar__top">
        <div className="summary-bar__progress">
          <div className="summary-bar__track">
            <div className="summary-bar__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="summary-bar__count">
            {completed} / {expected || '—'}
          </span>
        </div>

        <div className="summary-bar__conn" title={connected ? 'Live updates connected' : 'Reconnecting…'}>
          {connected ? <Wifi size={13} /> : <WifiOff size={13} />}
        </div>
      </div>

      {totalOriginal > 0 && (
        <div className="summary-bar__stats">
          <div className="summary-stat">
            <span className="summary-stat__label">Original</span>
            <span className="summary-stat__value">{formatBytes(totalOriginal)}</span>
          </div>
          <div className="summary-stat">
            <span className="summary-stat__label">Optimized</span>
            <span className="summary-stat__value">{formatBytes(totalOptimized)}</span>
          </div>
          <div className="summary-stat summary-stat--accent">
            <span className="summary-stat__label">Saved</span>
            <span className="summary-stat__value">{formatPercent(savingsPct)}</span>
          </div>
        </div>
      )}

      {zipData ? (
        <a href={`${API_BASE}${zipData.zipUrl}`} className="zip-banner" target="_blank" rel="noopener noreferrer">
          <PackageCheck size={18} />
          <div className="zip-banner__text">
            <strong>Archive ready</strong>
            <span>{formatPercent(zipData.totalSavings)} total savings across {completed} files</span>
          </div>
          <span className="zip-banner__action">
            <Download size={15} /> Download ZIP
          </span>
        </a>
      ) : zipRequestable && expected > 0 && completed >= expected ? (
        <button className="btn btn--secondary btn--full" onClick={onManualZip}>
          <PackageCheck size={15} /> Build ZIP archive
        </button>
      ) : null}
    </div>
  );
};
