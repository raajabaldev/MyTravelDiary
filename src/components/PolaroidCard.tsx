import React from 'react';
import type { PaperTheme } from '../types/journal';
import { CameraDoodle, WashiTape } from './ScrapbookDoodles';

interface PolaroidCardProps {
  imageUrl?: string | null;
  imageAlt: string;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  tapeTone?: PaperTheme;
  tiltIndex?: number;
  aspect?: 'landscape' | 'square' | 'tall';
  badge?: string;
  onClick?: () => void;
  footerSlot?: React.ReactNode;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({
  imageUrl,
  imageAlt,
  title,
  subtitle,
  dateLabel,
  tapeTone = 'sage',
  tiltIndex = 0,
  aspect = 'landscape',
  badge,
  onClick,
  footerSlot,
}) => {
  const tiltClass = `polaroid-tilt-${Math.abs(tiltIndex) % 4}`;
  const aspectClass =
    aspect === 'square'
      ? 'polaroid-img-wrap--square'
      : aspect === 'tall'
        ? 'polaroid-img-wrap--tall'
        : '';

  const content = (
    <>
      <WashiTape
        tone={tapeTone}
        style={{
          insetBlockStart: '-11px',
          insetInlineStart: '50%',
          transform: `translateX(-50%) rotate(${tiltIndex % 2 === 0 ? '-3deg' : '3deg'})`,
        }}
      />
      <div className={`polaroid-img-wrap ${aspectClass}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} loading="lazy" />
        ) : (
          <div
            style={{
              inlineSize: '100%',
              blockSize: '100%',
              display: 'grid',
              placeItems: 'center',
              padding: '1.25rem',
              background:
                'radial-gradient(circle at 30% 30%, #fffdf8 0%, #f1e7d6 100%)',
            }}
          >
            <div style={{ textAlign: 'center', opacity: 0.72 }}>
              <CameraDoodle className="" />
              <span
                style={{
                  display: 'block',
                  marginBlockStart: '0.35rem',
                  fontFamily: 'var(--font-stamp)',
                  fontSize: '0.75rem',
                  color: 'var(--ink-sepia)',
                }}
              >
                No photo attached yet
              </span>
            </div>
          </div>
        )}
        {badge ? (
          <span
            className="postage-stamp postage-stamp--butter"
            style={{
              position: 'absolute',
              insetBlockStart: '0.6rem',
              insetInlineEnd: '0.6rem',
              fontSize: '0.7rem',
              padding: '0.22rem 0.55rem',
            }}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="polaroid-caption">{title}</div>
      {(subtitle || dateLabel) && (
        <div className="polaroid-meta">
          {[subtitle, dateLabel].filter(Boolean).join(' · ')}
        </div>
      )}
      {footerSlot}
    </>
  );

  if (onClick) {
    return (
      <article className={`polaroid ${tiltClass}`}>
        <button
          type="button"
          onClick={onClick}
          style={{
            display: 'block',
            inlineSize: '100%',
            padding: 0,
            border: 'none',
            background: 'none',
            textAlign: 'start',
          }}
        >
          {content}
        </button>
      </article>
    );
  }

  return <article className={`polaroid ${tiltClass}`}>{content}</article>;
};

