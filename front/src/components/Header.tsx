import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ChevronDown, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

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
          press<span className="header__brand-accent">.</span>
        </span>
      </Link>

      <div className="header__actions">
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
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
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
