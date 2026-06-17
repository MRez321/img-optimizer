import { Settings2 } from 'lucide-react';
import type { ProcessOptions } from '../types';

interface OptionsPanelProps {
  options: ProcessOptions;
  onChange: (options: ProcessOptions) => void;
  disabled?: boolean;
}

const FORMATS: ProcessOptions['format'][] = ['webp', 'jpeg', 'png', 'tiff', 'gif'];

export const OptionsPanel = ({ options, onChange, disabled }: OptionsPanelProps) => {
  const update = (patch: Partial<ProcessOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="options-panel">
      <div className="options-panel__header">
        <Settings2 size={15} />
        <span>Compression settings</span>
      </div>

      <div className="options-panel__row">
        <div className="options-panel__field">
          <label>Output format</label>
          <div className="format-pills">
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                className={`format-pill ${options.format === f ? 'format-pill--active' : ''}`}
                onClick={() => update({ format: f })}
                disabled={disabled}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="options-panel__row">
        <div className="options-panel__field options-panel__field--grow">
          <label htmlFor="quality">
            Quality <span className="options-panel__value">{options.quality}</span>
          </label>
          <input
            id="quality"
            type="range"
            min={1}
            max={100}
            value={options.quality}
            onChange={(e) => update({ quality: Number(e.target.value) })}
            disabled={disabled || options.lossless}
            className="slider"
          />
        </div>

        <div className="options-panel__field" style={{ width: 120 }}>
          <label htmlFor="resizeWidth">Max width</label>
          <input
            id="resizeWidth"
            type="number"
            min={1}
            placeholder="auto"
            value={options.resize?.width ?? ''}
            onChange={(e) =>
              update({
                resize: e.target.value ? { width: Number(e.target.value) } : undefined,
              })
            }
            disabled={disabled}
          />
        </div>
      </div>

      <div className="options-panel__toggles">
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.stripMetadata}
            onChange={(e) => update({ stripMetadata: e.target.checked })}
            disabled={disabled}
          />
          <span>Strip metadata</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.progressive}
            onChange={(e) => update({ progressive: e.target.checked })}
            disabled={disabled}
          />
          <span>Progressive</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.lossless}
            onChange={(e) => update({ lossless: e.target.checked })}
            disabled={disabled}
          />
          <span>Lossless</span>
        </label>
      </div>
    </div>
  );
};
