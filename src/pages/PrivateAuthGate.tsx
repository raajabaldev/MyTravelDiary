import React, { useId, useState } from 'react';
import { BookHeart, KeyRound, Lock, Sparkles } from 'lucide-react';
import {
  AeroplaneDoodle,
  CompassDoodle,
  FlowersDoodle,
  MountainsDoodle,
  WashiTape,
} from '../components/ScrapbookDoodles';
import { supabase } from '../lib/supabase';

interface PrivateAuthGateProps {
  supabaseConfigured: boolean;
  onEnterLocalPreview: () => void;
}

export const PrivateAuthGate: React.FC<PrivateAuthGateProps> = ({
  supabaseConfigured,
  onEnterLocalPreview,
}) => {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to unlock journal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="journal-shell" style={{ paddingBlockStart: 'clamp(1.5rem, 5vw, 3.5rem)' }}>
      <div
        className="paper-sheet paper-sheet--dotted"
        style={{
          maxInlineSize: '680px',
          marginInline: 'auto',
          overflow: 'visible',
        }}
      >
        <WashiTape
          tone="pink"
          style={{ insetBlockStart: '-12px', insetInlineStart: '28px', transform: 'rotate(-4deg)' }}
        />
        <WashiTape
          tone="sage"
          style={{ insetBlockStart: '-10px', insetInlineEnd: '30px', transform: 'rotate(5deg)' }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span className="postage-stamp postage-stamp--butter">
            <Lock size={14} aria-hidden="true" />
            Private Single-User Diary
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AeroplaneDoodle className="float-gentle" />
          </div>
        </div>

        <h1
          style={{
            marginBlockStart: '1rem',
            fontSize: 'clamp(2.5rem, 6vw, 3.8rem)',
            lineHeight: 1.05,
          }}
        >
          The Places I&apos;ve Been
        </h1>
        <p
          style={{
            marginBlockStart: '0.55rem',
            color: 'var(--ink-sepia)',
            fontSize: '1.05rem',
            maxInlineSize: '52ch',
          }}
        >
          A quiet, private scrapbook for your own travel photographs, handwritten memories, and
          faraway daydreams.
        </p>

        {supabaseConfigured ? (
          <form
            onSubmit={handleSignIn}
            style={{
              marginBlockStart: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
            }}
          >
            {errorMsg && (
              <div role="alert" className="journal-alert journal-alert--error">
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="field-group">
              <label htmlFor={emailId} className="field-label">
                Journal Owner Email
              </label>
              <input
                id={emailId}
                type="email"
                className="field-input"
                autoComplete="email"
                required
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
                className="field-input"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your private passphrase"
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.85rem',
                marginBlockStart: '0.4rem',
              }}
            >
              <button type="submit" className="btn-scrapbook btn-scrapbook--pink" disabled={submitting}>
                <KeyRound size={18} aria-hidden="true" />
                {submitting ? 'Unlocking diary...' : 'Unlock My Journal'}
              </button>
              <span className="field-hint">
                Public sign-ups are disabled. Create your single owner user inside Supabase Auth.
              </span>
            </div>
          </form>
        ) : (
          <div style={{ marginBlockStart: '1.75rem', display: 'grid', gap: '1.25rem' }}>
            <div className="journal-alert">
              <BookHeart size={22} aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Connect your private Supabase backend when ready</strong>
                <p style={{ marginBlockStart: '0.25rem', fontSize: '0.92rem' }}>
                  No <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> were
                  found in <code>.env</code> yet. To store entries and private photographs in
                  Supabase:
                </p>
                <ol style={{ marginBlock: '0.5rem 0', paddingInlineStart: '1.25rem', fontSize: '0.9rem' }}>
                  <li>
                    Run <code>supabase/schema.sql</code> in your Supabase SQL Editor.
                  </li>
                  <li>
                    In Supabase Authentication, disable public sign-ups and create your single owner
                    account.
                  </li>
                  <li>
                    Copy <code>.env.example</code> to <code>.env</code> with your project URL and
                    anon key, then restart the dev server.
                  </li>
                </ol>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--sage"
                onClick={onEnterLocalPreview}
              >
                <Sparkles size={18} aria-hidden="true" />
                Open Local Browser Journal
              </button>
              <span className="field-hint">
                Saves entries &amp; photos privately in this browser&apos;s IndexedDB until Supabase
                is connected.
              </span>
            </div>
          </div>
        )}

        <div
          style={{
            marginBlockStart: '2rem',
            paddingBlockStart: '1rem',
            borderBlockStart: '1.5px dashed var(--ink-faint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            gap: '1rem',
            opacity: 0.85,
          }}
        >
          <div style={{ inlineSize: '76px' }}>
            <MountainsDoodle />
          </div>
          <div style={{ inlineSize: '58px' }}>
            <FlowersDoodle />
          </div>
          <div style={{ inlineSize: '58px' }}>
            <CompassDoodle />
          </div>
        </div>
      </div>
    </main>
  );
};

