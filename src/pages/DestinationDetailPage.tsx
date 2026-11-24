import React, { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  Edit3,
  ImagePlus,
  MapPin,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type {
  Destination,
  DestinationPhoto,
  NewPhotoDraft,
  PaperTheme,
  StickerMotif,
  UpdateDestinationPayload,
} from '../types/journal';
import { formatLocation, formatTravelDate } from '../lib/formatters';
import { suggestCoordinatesForPlace } from '../data/worldPlacesLookup';
import { PhotoUploadArea } from '../components/PhotoUploadArea';
import { WorldMapCanvas } from '../components/WorldMapCanvas';
import {
  CloudDoodle,
  FlowersDoodle,
  StarsDoodle,
  StickerByMotif,
  WashiTape,
} from '../components/ScrapbookDoodles';

interface DestinationDetailPageProps {
  destination: Destination;
  onBack: () => void;
  onUpdateDestination: (id: string, updates: UpdateDestinationPayload) => Promise<void>;
  onDeleteDestination: (destination: Destination) => Promise<void>;
  onAddPhotos: (destination: Destination, drafts: NewPhotoDraft[]) => Promise<void>;
  onSetCoverPhoto: (destinationId: string, photoId: string) => Promise<void>;
  onUpdatePhotoCaption: (photoId: string, caption: string) => Promise<void>;
  onDeletePhoto: (destination: Destination, photo: DestinationPhoto) => Promise<void>;
}

const PAPER_THEMES: Array<{ id: PaperTheme; label: string; swatch: string }> = [
  { id: 'sage', label: 'Sage Leaf', swatch: '#E2EBE0' },
  { id: 'pink', label: 'Dusty Rose', swatch: '#F6E2E2' },
  { id: 'butter', label: 'Butter Sun', swatch: '#FBF0CB' },
  { id: 'blue', label: 'Muted Sky', swatch: '#E0EBF2' },
];

const STICKER_MOTIFS: Array<{ id: StickerMotif; label: string }> = [
  { id: 'aeroplane', label: 'Plane' },
  { id: 'mountains', label: 'Peaks' },
  { id: 'flowers', label: 'Flower' },
  { id: 'camera', label: 'Camera' },
  { id: 'stars', label: 'Stars' },
  { id: 'compass', label: 'Compass' },
];

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  destination,
  onBack,
  onUpdateDestination,
  onDeleteDestination,
  onAddPhotos,
  onSetCoverPhoto,
  onUpdatePhotoCaption,
  onDeletePhoto,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [newPhotoDrafts, setNewPhotoDrafts] = useState<NewPhotoDraft[]>([]);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit form state
  const nameId = useId();
  const cityId = useId();
  const countryId = useId();
  const dateId = useId();
  const descId = useId();

  const [editName, setEditName] = useState(destination.name);
  const [editCity, setEditCity] = useState(destination.city);
  const [editCountry, setEditCountry] = useState(destination.country);
  const [editDate, setEditDate] = useState(destination.travelDate ?? '');
  const [editDesc, setEditDesc] = useState(destination.description);
  const [editTheme, setEditTheme] = useState<PaperTheme>(destination.paperTheme);
  const [editMotif, setEditMotif] = useState<StickerMotif>(destination.stickerMotif);
  const [editFeatured, setEditFeatured] = useState(destination.isFeatured);
  const [editCoords, setEditCoords] = useState<{ lat: number; lng: number } | null>(
    destination.latitude !== null && destination.longitude !== null
      ? { lat: destination.latitude, lng: destination.longitude }
      : null
  );
  const [showEditMap, setShowEditMap] = useState(false);

  // Lightbox & Delete dialogs
  const lightboxRef = useRef<HTMLDialogElement | null>(null);
  const deleteDialogRef = useRef<HTMLDialogElement | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [photoDeleteConfirm, setPhotoDeleteConfirm] = useState<DestinationPhoto | null>(null);

  useEffect(() => {
    setEditName(destination.name);
    setEditCity(destination.city);
    setEditCountry(destination.country);
    setEditDate(destination.travelDate ?? '');
    setEditDesc(destination.description);
    setEditTheme(destination.paperTheme);
    setEditMotif(destination.stickerMotif);
    setEditFeatured(destination.isFeatured);
    setEditCoords(
      destination.latitude !== null && destination.longitude !== null
        ? { lat: destination.latitude, lng: destination.longitude }
        : null
    );
  }, [destination]);

  const activePhoto =
    destination.photos.find((p) => p.id === activePhotoId) ?? null;

  const openLightbox = (photo: DestinationPhoto) => {
    setActivePhotoId(photo.id);
    setCaptionDraft(photo.caption);
    setPhotoDeleteConfirm(null);
    lightboxRef.current?.showModal();
  };

  const closeLightbox = () => {
    lightboxRef.current?.close();
    setActivePhotoId(null);
    setPhotoDeleteConfirm(null);
  };

  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg('Place name cannot be empty.');
      return;
    }
    setErrorMsg(null);
    setBusyMessage('Saving your scrapbook changes...');
    try {
      await onUpdateDestination(destination.id, {
        name: editName.trim(),
        city: editCity.trim(),
        country: editCountry.trim(),
        travelDate: editDate || null,
        description: editDesc.trim(),
        paperTheme: editTheme,
        stickerMotif: editMotif,
        isFeatured: editFeatured,
        latitude: editCoords ? editCoords.lat : null,
        longitude: editCoords ? editCoords.lng : null,
      });
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not update entry.');
    } finally {
      setBusyMessage(null);
    }
  };

  const handleToggleFeatured = async () => {
    setErrorMsg(null);
    setBusyMessage('Updating featured stamp...');
    try {
      await onUpdateDestination(destination.id, {
        isFeatured: !destination.isFeatured,
      });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not update featured status.');
    } finally {
      setBusyMessage(null);
    }
  };

  const handleUploadMorePhotos = async () => {
    if (newPhotoDrafts.length === 0) return;
    setErrorMsg(null);
    setBusyMessage('Adding photographs to your collage...');
    try {
      await onAddPhotos(destination, newPhotoDrafts);
      newPhotoDrafts.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setNewPhotoDrafts([]);
      setShowAddPhotos(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to upload photographs.');
    } finally {
      setBusyMessage(null);
    }
  };

  const handleSaveCaption = async () => {
    if (!activePhoto) return;
    setErrorMsg(null);
    setBusyMessage('Saving caption...');
    try {
      await onUpdatePhotoCaption(activePhoto.id, captionDraft);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save caption.');
    } finally {
      setBusyMessage(null);
    }
  };

  const handleConfirmPhotoDelete = async (photo: DestinationPhoto) => {
    setErrorMsg(null);
    setBusyMessage('Removing photograph...');
    try {
      await onDeletePhoto(destination, photo);
      setPhotoDeleteConfirm(null);
      if (activePhotoId === photo.id) {
        closeLightbox();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete photograph.');
    } finally {
      setBusyMessage(null);
    }
  };

  const handleConfirmDestinationDelete = async () => {
    setErrorMsg(null);
    setBusyMessage('Removing scrapbook page...');
    try {
      await onDeleteDestination(destination);
      deleteDialogRef.current?.close();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not delete destination.');
      setBusyMessage(null);
    }
  };

  const locationLabel = formatLocation(destination.city, destination.country);
  const dateLabel = formatTravelDate(destination.travelDate);

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Top Scrapbook Action Ribbon */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <button
          type="button"
          className="btn-scrapbook btn-scrapbook--ghost"
          onClick={onBack}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to My Travels
        </button>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <button
            type="button"
            aria-pressed={destination.isFeatured}
            className={`btn-scrapbook ${destination.isFeatured ? '' : 'btn-scrapbook--ghost'}`}
            onClick={handleToggleFeatured}
            disabled={Boolean(busyMessage)}
          >
            <Sparkles size={16} aria-hidden="true" />
            {destination.isFeatured ? 'Featured Memory' : 'Feature on Home'}
          </button>

          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--sage"
            onClick={() => setShowAddPhotos((v) => !v)}
            disabled={Boolean(busyMessage)}
          >
            <ImagePlus size={16} aria-hidden="true" />
            Add Photos
          </button>

          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--ghost"
            onClick={() => setIsEditing((v) => !v)}
            disabled={Boolean(busyMessage)}
          >
            <Edit3 size={16} aria-hidden="true" />
            {isEditing ? 'Close Editor' : 'Edit Page'}
          </button>

          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--danger"
            onClick={() => deleteDialogRef.current?.showModal()}
            disabled={Boolean(busyMessage)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete Place
          </button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="journal-alert journal-alert--error">
          <span>{errorMsg}</span>
        </div>
      )}

      {busyMessage && (
        <div role="status" className="journal-alert">
          <span>{busyMessage}</span>
        </div>
      )}

      {/* Main Scrapbook Spread */}
      <article
        className={`paper-sheet paper-sheet--dotted theme-${destination.paperTheme}`}
        style={{
          overflow: 'visible',
          backgroundColor: 'var(--paper-card)',
        }}
      >
        <WashiTape
          tone={destination.paperTheme}
          style={{ insetBlockStart: '-12px', insetInlineStart: '32px', transform: 'rotate(-4deg)' }}
        />
        <WashiTape
          tone="butter"
          style={{ insetBlockStart: '-10px', insetInlineEnd: '40px', transform: 'rotate(5deg)' }}
        />

        {/* Decorative margin doodles */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBlockEnd: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ inlineSize: '68px' }}>
              <StickerByMotif motif={destination.stickerMotif} />
            </div>
            <div style={{ inlineSize: '58px', opacity: 0.78 }}>
              <CloudDoodle />
            </div>
          </div>

          {/* Circular Ink Postmark */}
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.55rem 0.95rem',
              borderRadius: '999px',
              border: '2px dashed var(--accent-deep)',
              backgroundColor: 'var(--accent-bg)',
              color: 'var(--accent-deep)',
              fontFamily: 'var(--font-stamp)',
              fontSize: '0.74rem',
              transform: 'rotate(-4deg)',
              textAlign: 'center',
            }}
          >
            <span>AIRMAIL POSTMARK</span>
            <strong>{dateLabel}</strong>
          </div>
        </div>

        {/* Title & Metadata */}
        <header style={{ marginBlockEnd: '1.75rem' }}>
          <h1
            id="main-heading"
            tabIndex={-1}
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              lineHeight: 0.98,
              color: 'var(--ink-espresso)',
            }}
          >
            {destination.name}
          </h1>

          {/* Hand-drawn underline flourish */}
          <svg
            aria-hidden="true"
            viewBox="0 0 280 14"
            fill="none"
            style={{ inlineSize: 'min(280px, 75%)', blockSize: '12px', marginBlockStart: '0.2rem' }}
          >
            <path
              d="M3 9C65 3 160 12 277 5"
              stroke="#DB9FA3"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              marginBlockStart: '0.85rem',
            }}
          >
            {locationLabel && (
              <span className={`postage-stamp postage-stamp--${destination.paperTheme}`}>
                <MapPin size={14} aria-hidden="true" />
                {locationLabel}
              </span>
            )}
            <span className="postage-stamp">
              <Calendar size={14} aria-hidden="true" />
              {dateLabel}
            </span>
            {destination.latitude !== null && destination.longitude !== null && (
              <span className="postage-stamp postage-stamp--blue">
                <Compass size={14} aria-hidden="true" />
                {destination.latitude.toFixed(2)}°, {destination.longitude.toFixed(2)}°
              </span>
            )}
          </div>
        </header>

        {/* Inline Edit Drawer */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdits}
            className="paper-sheet paper-sheet--lined"
            style={{
              marginBlockEnd: '2rem',
              backgroundColor: '#FFFDF6',
              borderColor: 'var(--ink-muted)',
              display: 'grid',
              gap: '1.1rem',
            }}
          >
            <h2 style={{ fontSize: '2rem' }}>Edit Scrapbook Details</h2>

            <div className="field-group">
              <label htmlFor={nameId} className="field-label">
                Place Name *
              </label>
              <input
                id={nameId}
                type="text"
                required
                className="field-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem',
              }}
            >
              <div className="field-group">
                <label htmlFor={cityId} className="field-label">
                  City
                </label>
                <input
                  id={cityId}
                  type="text"
                  className="field-input"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor={countryId} className="field-label">
                  Country
                </label>
                <input
                  id={countryId}
                  type="text"
                  className="field-input"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor={dateId} className="field-label">
                  Travel Date
                </label>
                <input
                  id={dateId}
                  type="date"
                  className="field-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor={descId} className="field-label">
                Personal Description &amp; Memories
              </label>
              <textarea
                id={descId}
                className="field-textarea"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {PAPER_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={editTheme === t.id}
                    onClick={() => setEditTheme(t.id)}
                    className="btn-scrapbook btn-scrapbook--ghost"
                    style={{
                      minBlockSize: '34px',
                      padding: '0.25rem 0.7rem',
                      fontSize: '0.85rem',
                      backgroundColor: t.swatch,
                      borderColor:
                        editTheme === t.id ? 'var(--ink-espresso)' : 'var(--ink-faint)',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {STICKER_MOTIFS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={editMotif === m.id}
                    onClick={() => setEditMotif(m.id)}
                    className={`btn-scrapbook ${editMotif === m.id ? '' : 'btn-scrapbook--ghost'}`}
                    style={{
                      minBlockSize: '34px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map pin adjust */}
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <span className="field-hint">
                  Map pin:{' '}
                  {editCoords
                    ? `${editCoords.lat.toFixed(2)}°, ${editCoords.lng.toFixed(2)}°`
                    : 'Not pinned yet'}
                </span>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--ghost"
                  style={{ minBlockSize: '34px', padding: '0.25rem 0.75rem', fontSize: '0.88rem' }}
                  onClick={() => {
                    const match = suggestCoordinatesForPlace(editName, editCity, editCountry);
                    if (match) setEditCoords({ lat: match.lat, lng: match.lng });
                    setShowEditMap(true);
                  }}
                >
                  <Compass size={14} aria-hidden="true" />
                  Locate / Edit Pin
                </button>
                {editCoords && (
                  <button
                    type="button"
                    className="btn-scrapbook btn-scrapbook--ghost"
                    style={{ minBlockSize: '34px', padding: '0.25rem 0.75rem', fontSize: '0.88rem' }}
                    onClick={() => setEditCoords(null)}
                  >
                    Clear Pin
                  </button>
                )}
              </div>

              {showEditMap && (
                <WorldMapCanvas
                  mode="picker"
                  pickedCoords={editCoords}
                  onPickCoords={(c) => setEditCoords(c)}
                />
              )}
            </div>

            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontFamily: 'var(--font-note)',
                fontSize: '1.05rem',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={editFeatured}
                onChange={(e) => setEditFeatured(e.target.checked)}
                style={{ inlineSize: '18px', blockSize: '18px' }}
              />
              Feature this destination on the Home page
            </label>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-scrapbook btn-scrapbook--pink">
                <Save size={16} aria-hidden="true" />
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Add More Photos Drawer */}
        {showAddPhotos && (
          <div
            className="paper-sheet"
            style={{
              marginBlockEnd: '2rem',
              backgroundColor: 'var(--paper-warm)',
              display: 'grid',
              gap: '1rem',
            }}
          >
            <PhotoUploadArea
              drafts={newPhotoDrafts}
              onChange={setNewPhotoDrafts}
              allowCoverSelection
              existingHasCover={destination.photos.some((p) => p.isCover)}
              label="Add More Photographs"
              hint="Upload extra snapshots to tape into this destination's collage."
            />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                onClick={() => {
                  newPhotoDrafts.forEach((p) => URL.revokeObjectURL(p.previewUrl));
                  setNewPhotoDrafts([]);
                  setShowAddPhotos(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--sage"
                disabled={newPhotoDrafts.length === 0 || Boolean(busyMessage)}
                onClick={handleUploadMorePhotos}
              >
                <ImagePlus size={16} aria-hidden="true" />
                Upload {newPhotoDrafts.length || ''} Photo{newPhotoDrafts.length === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        )}

        {/* Two-Part Scrapbook Body: Handwritten Story + Creative Polaroid Collage */}
        <div style={{ display: 'grid', gap: '2.25rem' }}>
          {/* User-Written Travel Memories Note */}
          <section
            className="paper-sheet paper-sheet--lined"
            style={{
              position: 'relative',
              backgroundColor: 'var(--accent-bg)',
              borderColor: 'var(--accent-mid)',
              transform: 'rotate(-0.4deg)',
            }}
          >
            <WashiTape
              tone="pink"
              style={{ insetBlockStart: '-11px', insetInlineStart: '20px', transform: 'rotate(-6deg)' }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBlockEnd: '0.65rem',
              }}
            >
              <h2 style={{ fontSize: '2rem' }}>Travel Notes &amp; Memories</h2>
              <div aria-hidden="true" style={{ inlineSize: '48px', opacity: 0.85 }}>
                <FlowersDoodle />
              </div>
            </div>

            {destination.description ? (
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: '1.07rem',
                  lineHeight: 1.85,
                  color: 'var(--ink-espresso)',
                  maxInlineSize: '68ch',
                }}
              >
                {destination.description}
              </div>
            ) : (
              <p style={{ color: 'var(--ink-sepia)', fontStyle: 'italic' }}>
                No written memories added yet. Click &ldquo;Edit Page&rdquo; to jot down your
                story here.
              </p>
            )}
          </section>

          {/* Creative Polaroid Collage */}
          <section>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBlockEnd: '1.2rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '2.25rem' }}>Photograph Collage</h2>
                <span className="postage-stamp">
                  {destination.photos.length}{' '}
                  {destination.photos.length === 1 ? 'Snapshot' : 'Snapshots'}
                </span>
              </div>
              <div aria-hidden="true" style={{ inlineSize: '64px' }}>
                <StarsDoodle />
              </div>
            </div>

            {destination.photos.length === 0 ? (
              <div
                className="paper-sheet"
                style={{
                  textAlign: 'center',
                  paddingBlock: '2.5rem',
                  borderStyle: 'dashed',
                }}
              >
                <p style={{ color: 'var(--ink-sepia)' }}>
                  No photographs taped onto this page yet.
                </p>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--sage"
                  style={{ marginBlockStart: '1rem' }}
                  onClick={() => setShowAddPhotos(true)}
                >
                  <ImagePlus size={17} aria-hidden="true" />
                  Add Photographs
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(245px, 1fr))',
                  gap: '2.2rem 1.85rem',
                  alignItems: 'start',
                }}
              >
                {destination.photos.map((photo, index) => {
                  const isFeatureTile = photo.isCover && destination.photos.length > 2;
                  return (
                    <figure
                      key={photo.id}
                      className="polaroid"
                      style={{
                        margin: 0,
                        gridColumn: isFeatureTile ? 'span 1' : undefined,
                        transform: `rotate(${photo.rotationDeg || (index % 2 === 0 ? -1.8 : 1.7)}deg)`,
                      }}
                    >
                      <WashiTape
                        tone={photo.tapeStyle}
                        style={{
                          insetBlockStart: '-11px',
                          insetInlineStart: index % 2 === 0 ? '26%' : '72%',
                          transform: `translateX(-50%) rotate(${index % 2 === 0 ? '-4deg' : '4deg'})`,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => openLightbox(photo)}
                        aria-label={`View larger photograph${photo.caption ? `: ${photo.caption}` : ''}`}
                        style={{
                          display: 'block',
                          inlineSize: '100%',
                          padding: 0,
                          border: 'none',
                          background: 'none',
                        }}
                      >
                        <div
                          className={`polaroid-img-wrap ${
                            index % 3 === 1 ? 'polaroid-img-wrap--square' : ''
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || `${destination.name} travel memory ${index + 1}`}
                          />
                          {photo.isCover && (
                            <span
                              className="postage-stamp postage-stamp--butter"
                              style={{
                                position: 'absolute',
                                insetBlockStart: '0.5rem',
                                insetInlineStart: '0.5rem',
                                fontSize: '0.68rem',
                                padding: '0.2rem 0.5rem',
                              }}
                            >
                              Cover Photo
                            </span>
                          )}
                        </div>
                      </button>

                      <figcaption
                        className="polaroid-caption"
                        style={{
                          minBlockSize: '1.6rem',
                          fontSize: '1.25rem',
                          color: photo.caption ? 'var(--ink-espresso)' : 'var(--ink-muted)',
                        }}
                      >
                        {photo.caption || 'Click photo to add a note'}
                      </figcaption>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.4rem',
                          marginBlockStart: '0.55rem',
                        }}
                      >
                        <button
                          type="button"
                          className={`btn-scrapbook ${photo.isCover ? '' : 'btn-scrapbook--ghost'}`}
                          disabled={photo.isCover || Boolean(busyMessage)}
                          onClick={() => onSetCoverPhoto(destination.id, photo.id)}
                          style={{
                            minBlockSize: '32px',
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.84rem',
                          }}
                        >
                          <Star
                            size={13}
                            aria-hidden="true"
                            fill={photo.isCover ? 'currentColor' : 'none'}
                          />
                          {photo.isCover ? 'Cover' : 'Set Cover'}
                        </button>

                        <button
                          type="button"
                          className="btn-scrapbook btn-scrapbook--danger"
                          aria-label={`Delete photograph ${index + 1}`}
                          disabled={Boolean(busyMessage)}
                          onClick={() => {
                            if (photoDeleteConfirm?.id === photo.id) {
                              handleConfirmPhotoDelete(photo);
                            } else {
                              setPhotoDeleteConfirm(photo);
                            }
                          }}
                          style={{
                            minBlockSize: '32px',
                            padding: '0.2rem 0.65rem',
                            fontSize: '0.82rem',
                          }}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          {photoDeleteConfirm?.id === photo.id ? 'Confirm?' : 'Remove'}
                        </button>
                      </div>
                    </figure>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </article>

      {/* Lightbox Modal for Individual Photograph */}
      <dialog
        ref={lightboxRef}
        className="lightbox-dialog"
        aria-labelledby="lightbox-title"
        onCancel={(e) => {
          e.preventDefault();
          closeLightbox();
        }}
      >
        {activePhoto && (
          <div
            className="polaroid"
            style={{
              maxInlineSize: '760px',
              marginInline: 'auto',
              padding: '16px 16px 22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBlockEnd: '0.65rem',
              }}
            >
              <h2 id="lightbox-title" style={{ fontSize: '1.7rem' }}>
                {destination.name}
              </h2>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                aria-label="Close photograph viewer"
                onClick={closeLightbox}
                style={{ minBlockSize: '36px', padding: '0.25rem 0.65rem' }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div
              style={{
                maxBlockSize: '60dvh',
                overflow: 'hidden',
                borderRadius: '4px',
                backgroundColor: 'var(--paper-warm)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || destination.name}
                style={{
                  maxBlockSize: '60dvh',
                  inlineSize: 'auto',
                  maxInlineSize: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gap: '0.75rem',
                marginBlockStart: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label htmlFor="lightbox-caption-input" className="field-hint" style={{ inlineSize: '100%' }}>
                  Handwritten caption
                </label>
                <input
                  id="lightbox-caption-input"
                  type="text"
                  className="field-input"
                  style={{ flex: '1 1 220px', fontFamily: 'var(--font-hand)', fontSize: '1.25rem' }}
                  value={captionDraft}
                  onChange={(e) => setCaptionDraft(e.target.value)}
                  placeholder="Write a personal note for this photograph..."
                />
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--sage"
                  onClick={handleSaveCaption}
                  disabled={Boolean(busyMessage)}
                >
                  <Save size={15} aria-hidden="true" />
                  Save Note
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: '0.6rem',
                }}
              >
                <button
                  type="button"
                  className={`btn-scrapbook ${activePhoto.isCover ? '' : 'btn-scrapbook--ghost'}`}
                  disabled={activePhoto.isCover || Boolean(busyMessage)}
                  onClick={() => onSetCoverPhoto(destination.id, activePhoto.id)}
                >
                  <Star
                    size={15}
                    aria-hidden="true"
                    fill={activePhoto.isCover ? 'currentColor' : 'none'}
                  />
                  {activePhoto.isCover ? 'Current Cover Photo' : 'Set as Cover Photo'}
                </button>

                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--danger"
                  disabled={Boolean(busyMessage)}
                  onClick={() => handleConfirmPhotoDelete(activePhoto)}
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Delete Photograph
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* Delete Destination Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        className="scrapbook-dialog"
        aria-labelledby="delete-dest-title"
      >
        <div style={{ padding: '1.75rem', display: 'grid', gap: '1rem' }}>
          <h2 id="delete-dest-title" style={{ fontSize: '2.1rem' }}>
            Remove &ldquo;{destination.name}&rdquo;?
          </h2>
          <p style={{ color: 'var(--ink-sepia)' }}>
            This will permanently delete this scrapbook page and all {destination.photos.length}{' '}
            attached photograph{destination.photos.length === 1 ? '' : 's'} from your private
            journal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--ghost"
              onClick={() => deleteDialogRef.current?.close()}
            >
              Keep Page
            </button>
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--danger"
              onClick={handleConfirmDestinationDelete}
            >
              <Trash2 size={16} aria-hidden="true" />
              Yes, Delete Permanently
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

