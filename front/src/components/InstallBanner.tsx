import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const DISMISSED_KEY = 'pwa-banner-dismissed';

export const InstallBanner = () => {
  const { canInstall, triggerInstall } = usePWA();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true'
  );
  const [installing, setInstalling] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    setInstalling(true);
    const outcome = await triggerInstall();
    if (outcome === 'dismissed') setInstalling(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="install-banner">
      <div className="install-banner__icon">
        <Download size={16} />
      </div>
      <div className="install-banner__text">
        <strong>Install PixelStar</strong>
        <span>Add to your home screen for instant access</span>
      </div>
      <button
        className="install-banner__install"
        onClick={handleInstall}
        disabled={installing}
      >
        {installing ? 'Installing…' : 'Install'}
      </button>
      <button
        className="install-banner__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};
