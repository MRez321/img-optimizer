import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../lib/api';

export const AccountPage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [code, setCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!user) {
    return (
      <div className="account-page">
        <p>You need to sign in to view this page.</p>
      </div>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    setSavedMsg(null);
    try {
      await api.updateProfile({ name });
      await refreshUser();
      setSavedMsg('Saved.');
    } catch {
      setSavedMsg('Could not save changes.');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(null), 3000);
    }
  };

  const sendVerification = async () => {
    setSendingCode(true);
    setVerifyStatus(null);
    try {
      await api.requestEmailVerification();
      setVerifyOpen(true);
      setVerifyStatus('Code sent — check your email (and the server console if testing locally).');
    } catch {
      setVerifyStatus('Could not send code. Try again shortly.');
    } finally {
      setSendingCode(false);
    }
  };

  const confirmCode = async () => {
    setConfirming(true);
    setVerifyStatus(null);
    try {
      await api.confirmEmailVerification(code);
      await refreshUser();
      setVerifyOpen(false);
      setCode('');
    } catch (err: any) {
      setVerifyStatus(err?.response?.data?.error || 'Invalid or expired code.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="account-page">
      <button className="back-link" onClick={() => navigate('/')}>
        <ArrowLeft size={15} /> Back to optimizer
      </button>

      <h1 className="account-page__title">Account</h1>

      <div className="account-card">
        <div className="account-card__header">
          <span className="account-avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user.name || user.email)[0].toUpperCase()}
          </span>
          <div>
            <div className="account-card__email">{user.email}</div>
            {user.emailVerified ? (
              <span className="verified-pill">
                <ShieldCheck size={13} /> Email verified
              </span>
            ) : (
              <span className="unverified-pill">
                <ShieldAlert size={13} /> Not verified
              </span>
            )}
          </div>
        </div>

        {!user.emailVerified && (
          <div className="verify-block">
            {!verifyOpen ? (
              <button className="btn btn--secondary" onClick={sendVerification} disabled={sendingCode}>
                {sendingCode ? <Loader2 size={14} className="spin" /> : 'Send verification code'}
              </button>
            ) : (
              <div className="verify-form">
                <input
                  type="text"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                />
                <button className="btn btn--primary" onClick={confirmCode} disabled={confirming || code.length === 0}>
                  {confirming ? <Loader2 size={14} className="spin" /> : 'Confirm'}
                </button>
              </div>
            )}
            {verifyStatus && <p className="verify-status">{verifyStatus}</p>}
          </div>
        )}

        <div className="account-card__divider" />

        <div className="field">
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <button className="btn btn--primary" onClick={saveProfile} disabled={saving}>
          {saving ? <Loader2 size={14} className="spin" /> : 'Save changes'}
        </button>
        {savedMsg && <span className="save-msg">{savedMsg}</span>}
      </div>
    </div>
  );
};
