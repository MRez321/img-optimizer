import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_BASE         = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// GitHub icon SVG (lucide-react doesn't include Github in all versions)
const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

export const AuthModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { login, register, loginWithGoogle, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode]         = useState<'login' | 'register'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Handle return from GitHub OAuth redirect.
  // GitHub sends the user back to /?auth_success=github (or ?auth_error=...).
  // The backend already set the JWT cookies before redirecting, so we just
  // need to refresh the user state and clean up the URL param.
  useEffect(() => {
    const authSuccess = searchParams.get('auth_success');
    const authError   = searchParams.get('auth_error');

    if (authSuccess === 'github') {
      refreshUser().then(() => {
        setSearchParams({}, { replace: true });
        onClose();
      });
    }

    if (authError) {
      const messages: Record<string, string> = {
        missing_code:          'GitHub login failed — no code received.',
        token_exchange_failed: 'GitHub login failed — could not exchange token.',
        profile_fetch_failed:  'GitHub login failed — could not fetch your profile.',
        no_verified_email:     'GitHub login failed — no verified email on your GitHub account.',
        not_configured:        'GitHub login is not configured on the server.',
        server_error:          'Something went wrong. Please try again.',
      };
      setError(messages[authError] || 'GitHub login failed.');
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Mount Google Identity Services button
  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID || !window.google || !googleBtnRef.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        try {
          setSubmitting(true);
          setError(null);
          await loginWithGoogle(response.credential);
          onClose();
        } catch {
          setError('Google sign-in failed. Try again.');
        } finally {
          setSubmitting(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 320,
      shape: 'rectangular',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name || undefined);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubLogin = () => {
    // Navigate to the backend redirect endpoint — it handles the rest
    window.location.href = `${API_BASE}/api/auth/github`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="modal__tabs">
          <button
            className={`modal__tab ${mode === 'login' ? 'modal__tab--active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            className={`modal__tab ${mode === 'register' ? 'modal__tab--active' : ''}`}
            onClick={() => setMode('register')}
          >
            Create account
          </button>
        </div>

        <h2 className="modal__title">
          {mode === 'login' ? 'Welcome back' : 'Get started'}
        </h2>
        <p className="modal__subtitle">
          {mode === 'login'
            ? 'Sign in to access your optimization history.'
            : 'Takes about ten seconds. No credit card.'}
        </p>

        {/* OAuth buttons */}
        <div className="modal__oauth">
          {GOOGLE_CLIENT_ID && (
            <div className="modal__google" ref={googleBtnRef} />
          )}
          <button
            className="modal__github-btn"
            onClick={handleGithubLogin}
            type="button"
          >
            <GithubIcon />
            Continue with GitHub
          </button>
        </div>

        <div className="modal__divider"><span>or</span></div>

        <form onSubmit={handleSubmit} className="modal__form">
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
            />
          </div>

          {error && (
            <div className="modal__error">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--full" disabled={submitting}>
            {submitting
              ? <Loader2 size={16} className="spin" />
              : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};
