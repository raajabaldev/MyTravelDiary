import React, { useEffect, useId, useRef, useState } from 'react';
import { KeyRound, Lock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AeroplaneDoodle, WashiTape } from './ScrapbookDoodles';

interface OwnerLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setErrorMsg(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg('Supabase is not configured in .env.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      setPassword('');
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="scrapbook-dialog"
      aria-labelledby="owner-login-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="paper-sheet paper-sheet--dotted"
        style={{
          border: 'none',
          boxShadow: 'none',
          overflow: 'visible',
        }}
      >
        <WashiTape
          tone="pink"
          style={{ insetBlockStart: '-12px', insetInlineStart: '24px', transform: 'rotate(-4deg)' }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <span className="postage-stamp postage-stamp--butter">
            <Lock size={13} aria-hidden="true" />
            Journal Owner Access
          </span>

          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--ghost"
            aria-label="Close owner login"
            onClick={onClose}
            style={{ minBlockSize: '36px', padding: '0.25rem 0.65rem' }}
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBlockStart: '0.9rem',
          }}
        >
          <div>
            <h2 id="owner-login-title" style={{ fontSize: '2.2rem' }}>
              Owner Sign In
            </h2>
            <p className="field-hint">
              Visitors can browse freely. Sign in as the owner to add, edit, or publish entries.
            </p>
          </div>
          <div style={{ inlineSize: '74px', flexShrink: 0 }}>
            <AeroplaneDoodle />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginBlockStart: '1.25rem',
            display: 'grid',
            gap: '1rem',
          }}
        >
          {errorMsg && (
            <div role="alert" className="journal-alert journal-alert--error">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="field-group">
            <label htmlFor={emailId} className="field-label">
              Owner Email
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field-group">
            <label htmlFor={passwordId} className="field-label">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              required
              autoComplete="current-password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.7rem',
              marginBlockStart: '0.35rem',
            }}
          >
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-scrapbook btn-scrapbook--pink"
              disabled={submitting}
            >
              <KeyRound size={17} aria-hidden="true" />
              {submitting ? 'Signing in...' : 'Sign In as Owner'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

