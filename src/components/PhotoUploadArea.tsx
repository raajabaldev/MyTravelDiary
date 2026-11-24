import React, { useId, useRef, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import type { NewPhotoDraft } from '../types/journal';
import { buildPhotoDraftsFromFiles } from '../lib/formatters';
import { WashiTape } from './ScrapbookDoodles';

interface PhotoUploadAreaProps {
  drafts: NewPhotoDraft[];
  onChange: React.Dispatch<React.SetStateAction<NewPhotoDraft[]>>;
  allowCoverSelection?: boolean;
  existingHasCover?: boolean;
  label?: string;
  hint?: string;
}

export const PhotoUploadArea: React.FC<PhotoUploadAreaProps> = ({
  drafts,
  onChange,
  allowCoverSelection = true,
  existingHasCover = false,
  label = 'Photographs',
  hint = 'Add one or more travel photographs. You can pick which one becomes the cover and jot down a manual caption.',
}) => {
  const inputId = useId();
  const hintId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const appendFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onChange((prev) => {
      const hasCoverAlready = existingHasCover || prev.some((p) => p.isCover);
      const next = buildPhotoDraftsFromFiles(files, prev.length, !hasCoverAlready);
      return [...prev, ...next];
    });
  };

  const handleRemove = (localId: string) => {
    onChange((prev) => {
      const target = prev.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const remaining = prev.filter((p) => p.localId !== localId);
      if (!existingHasCover && target?.isCover && remaining[0]) {
        remaining[0] = { ...remaining[0], isCover: true };
      }
      return remaining;
    });
  };

  const handleSetCover = (localId: string) => {
    onChange((prev) =>
      prev.map((p) => ({
        ...p,
        isCover: p.localId === localId,
      }))
    );
  };

  const handleCaptionChange = (localId: string, caption: string) => {
    onChange((prev) =>
      prev.map((p) => (p.localId === localId ? { ...p, caption } : p))
    );
  };

  return (
    <div className="field-group">
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <p id={hintId} className="field-hint">
        {hint}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          appendFiles(e.dataTransfer.files);
        }}
        style={{
          marginBlockStart: '0.45rem',
          padding: '1.5rem 1.25rem',
          borderRadius: '14px',
          border: `2px dashed ${isDragging ? 'var(--pink-deep)' : 'var(--ink-muted)'}`,
          backgroundColor: isDragging ? 'var(--pink-bg)' : 'var(--paper-lined)',
          textAlign: 'center',
          transition: 'background-color 150ms ease, border-color 150ms ease',
        }}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          aria-describedby={hintId}
          onChange={(e) => {
            appendFiles(e.target.files);
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />

        <ImagePlus
          size={30}
          aria-hidden="true"
          style={{ marginInline: 'auto', color: 'var(--ink-sepia)' }}
        />
        <p
          style={{
            marginBlockStart: '0.5rem',
            fontFamily: 'var(--font-note)',
            fontSize: '1.1rem',
          }}
        >
          Drag &amp; drop photos here, or choose files from your device
        </p>
        <button
          type="button"
          className="btn-scrapbook btn-scrapbook--sage"
          style={{ marginBlockStart: '0.85rem' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus size={18} aria-hidden="true" />
          Choose Photographs
        </button>
      </div>

      {drafts.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.4rem',
            marginBlockStart: '1.25rem',
          }}
        >
          {drafts.map((draft, index) => (
            <div
              key={draft.localId}
              className="polaroid"
              style={{
                transform: `rotate(${draft.rotationDeg}deg)`,
              }}
            >
              <WashiTape
                tone={draft.tapeStyle}
                style={{
                  insetBlockStart: '-10px',
                  insetInlineStart: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
              <div className="polaroid-img-wrap">
                <img
                  src={draft.previewUrl}
                  alt={draft.caption || `Selected photograph ${index + 1}`}
                />
              </div>

              <div style={{ marginBlockStart: '0.65rem' }}>
                <label
                  htmlFor={`draft-cap-${draft.localId}`}
                  className="field-hint"
                  style={{ display: 'block', marginBlockEnd: '0.25rem' }}
                >
                  Handwritten caption (optional)
                </label>
                <input
                  id={`draft-cap-${draft.localId}`}
                  type="text"
                  className="field-input"
                  value={draft.caption}
                  onChange={(e) => handleCaptionChange(draft.localId, e.target.value)}
                  placeholder="Write a note for this photo..."
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.15rem',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.4rem',
                  marginBlockStart: '0.65rem',
                }}
              >
                {allowCoverSelection ? (
                  <button
                    type="button"
                    className={`btn-scrapbook ${draft.isCover ? '' : 'btn-scrapbook--ghost'}`}
                    style={{
                      minBlockSize: '34px',
                      padding: '0.25rem 0.7rem',
                      fontSize: '0.88rem',
                    }}
                    onClick={() => handleSetCover(draft.localId)}
                  >
                    <Star
                      size={14}
                      aria-hidden="true"
                      fill={draft.isCover ? 'currentColor' : 'none'}
                    />
                    {draft.isCover ? 'Cover Photo' : 'Set Cover'}
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--danger"
                  aria-label={`Remove photograph ${index + 1}`}
                  style={{
                    minBlockSize: '34px',
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.85rem',
                  }}
                  onClick={() => handleRemove(draft.localId)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

