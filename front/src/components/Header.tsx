import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ChevronDown, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const REPO_URL = 'https://github.com/MRez321/img-optimizer';
const REPO_STAR_URL = 'https://github.com/MRez321/img-optimizer/stargazers';

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
);

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const Header = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        <span className="header__brand-mark">
          <Layers size={18} strokeWidth={2.4} />
        </span>
        <span className="header__brand-text">
          Pixel<span className="header__brand-accent">Star</span>
        </span>
      </Link>

      <div className="header__actions">

        {/* GitHub repo widget */}
        <div className="header__github">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header__github-link"
            title="View source on GitHub"
          >
            <GithubIcon />
            <span>Source</span>
          </a>
          <a
            href={REPO_STAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="header__github-star"
            title="Star this repo on GitHub"
          >
            <StarIcon />
            <span>Star</span>
          </a>
        </div>

        {user ? (
          <div className="header__menu" ref={menuRef}>
            <button className="header__user-btn" onClick={() => setMenuOpen((v) => !v)}>
              <span className="header__avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  (user.name || user.email)[0].toUpperCase()
                )}
              </span>
              <span className="header__user-name">{user.name || user.email.split('@')[0]}</span>
              <ChevronDown size={14} className={menuOpen ? 'rotate' : ''} />
            </button>

            {menuOpen && (
              <div className="header__dropdown">
                <div className="header__dropdown-info">
                  <strong>{user.name || 'Unnamed'}</strong>
                  <span>{user.email}</span>
                  {user.emailVerified ? (
                    <span className="header__verified">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  ) : (
                    <span className="header__unverified">Email not verified</span>
                  )}
                </div>
                <div className="header__dropdown-divider" />
                <Link to="/account" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                  <UserIcon size={15} /> Account settings
                </Link>
                <button
                  className="header__dropdown-item header__dropdown-item--danger"
                  onClick={() => { setMenuOpen(false); logout(); }}
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="header__signin-btn" onClick={onAuthClick}>
            Sign in
          </button>
        )}
      </div>
    </header>
  );
};
