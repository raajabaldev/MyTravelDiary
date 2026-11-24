import React, { useId, useRef, useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Edit3,
  Heart,
  MapPin,
  PlusCircle,
  Save,
  Trash2,
} from 'lucide-react';
import type {
  CreateDestinationPayload,
  Destination,
  NewPhotoDraft,
  PageRoute,
  UpdateDestinationPayload,
} from '../types/journal';
import { formatLocation, getCoverPhoto } from '../lib/formatters';
import { suggestCoordinatesForPlace } from '../data/worldPlacesLookup';
import { PhotoUploadArea } from '../components/PhotoUploadArea';
import { PolaroidCard } from '../components/PolaroidCard';
import { WorldMapCanvas } from '../components/WorldMapCanvas';
import {
  AeroplaneDoodle,
  FlowersDoodle,
  StarsDoodle,
  WashiTape,
} from '../components/ScrapbookDoodles';

interface WishlistPageProps {
  destinations: Destination[];
  loading: boolean;
  onCreateWishlist: (payload: CreateDestinationPayload) => Promise<string>;
  onUpdateDestination: (id: string, updates: UpdateDestinationPayload) => Promise<void>;
  onDeleteDestination: (destination: Destination) => Promise<void>;
  onNavigate: (route: PageRoute) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  destinations,
  loading,
  onCreateWishlist,
  onUpdateDestination,
  onDeleteDestination,
  onNavigate,
}) => {
  const wishlistItems = destinations.filter((d) => d.isWishlist);

  const nameId = useId();
  const cityId = useId();
  const countryId = useId();
  const notesId = useId();
  const visitDateId = useId();
  const visitDescId = useId();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [photos, setPhotos] = useState<NewPhotoDraft[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const [visitTarget, setVisitTarget] = useState<Destination | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitMemories, setVisitMemories] = useState('');
  const visitDialogRef = useRef<HTMLDialogElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCity('');
    setCountry('');
    setNotes('');
    setCoords(null);
    setShowMapPicker(false);
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
  };

  const handleAddWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a destination name.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    try {
      const resolvedCoords =
        coords ?? suggestCoordinatesForPlace(name, city, country);

      await onCreateWishlist({
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        travelDate: null,
        description: '',
        isWishlist: true,
        wishlistNotes: notes.trim(),
        isFeatured: false,
        latitude: resolvedCoords ? resolvedCoords.lat : null,
        longitude: resolvedCoords ? resolvedCoords.lng : null,
        paperTheme: 'butter',
        stickerMotif: 'stars',
        photos,
      });

      resetForm();
      setShowForm(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save wishlist item.');
    } finally {
      setSaving(false);
    }
  };

  const openMarkVisitedDialog = (dest: Destination) => {
    setVisitTarget(dest);
    setVisitDate(new Date().toISOString().slice(0, 10));
    setVisitMemories(dest.wishlistNotes || '');
    visitDialogRef.current?.showModal();
  };

  const handleConfirmMarkVisited = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitTarget) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await onUpdateDestination(visitTarget.id, {
        isWishlist: false,
        travelDate: visitDate || null,
        description: visitMemories.trim(),
        paperTheme: 'sage',
      });
      const convertedId = visitTarget.id;
      visitDialogRef.current?.close();
      setVisitTarget(null);
      onNavigate({ page: 'destination', id: convertedId });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not convert to visited.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async (dest: Destination) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await onUpdateDestination(dest.id, {
        wishlistNotes: editNotes.trim(),
      });
      setEditingId(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not update notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.85rem' }}>
      <section className="paper-sheet paper-sheet--dotted" style={{ overflow: 'visible' }}>
        <WashiTape
          tone="butter"
          style={{ insetBlockStart: '-12px', insetInlineStart: '28px', transform: 'rotate(-3deg)' }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBlockEnd: '0.35rem' }}>
              <span className="postage-stamp postage-stamp--butter">
                <Heart size={13} aria-hidden="true" />
                {wishlistItems.length} Dream {wishlistItems.length === 1 ? 'Place' : 'Places'}
              </span>
            </div>
            <h1 id="main-heading" tabIndex={-1} style={{ fontSize: 'clamp(2.3rem, 5vw, 3.3rem)' }}>
              My Wishlist
            </h1>
            <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.25rem' }}>
              Postcards to your future self—places you hope to wander through someday.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ inlineSize: '68px' }}>
              <StarsDoodle />
            </div>
            <button
              type="button"
              className="btn-scrapbook"
              onClick={() => setShowForm((v) => !v)}
            >
              <PlusCircle size={18} aria-hidden="true" />
              {showForm ? 'Close Form' : 'Add Dream Destination'}
            </button>
          </div>
        </div>
      </section>

      {errorMsg && (
        <div role="alert" className="journal-alert journal-alert--error">
          <span>{errorMsg}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAddWishlist}
          className="paper-sheet paper-sheet--lined"
          style={{ display: 'grid', gap: '1.2rem', backgroundColor: '#FFFDF6' }}
        >
          <h2 style={{ fontSize: '2.05rem' }}>Pin a Place to Your Wishlist</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '0.9rem',
            }}
          >
            <div className="field-group">
              <label htmlFor={nameId} className="field-label">
                Destination Name *
              </label>
              <input
                id={nameId}
                type="text"
                required
                className="field-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lofoten Islands"
              />
            </div>

            <div className="field-group">
              <label htmlFor={cityId} className="field-label">
                City <span className="field-hint">(optional)</span>
              </label>
              <input
                id={cityId}
                type="text"
                className="field-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Reine"
              />
            </div>

            <div className="field-group">
              <label htmlFor={countryId} className="field-label">
                Country <span className="field-hint">(optional)</span>
              </label>
              <input
                id={countryId}
                type="text"
                className="field-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Norway"
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor={notesId} className="field-label">
              Personal Notes
            </label>
            <textarea
              id={notesId}
              className="field-textarea"
              style={{ minBlockSize: '105px' }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Seasons to go, trails to hike, bakeries to find..."
            />
          </div>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
              <span className="field-hint">
                Map Pin:{' '}
                {coords ? `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°` : 'Auto-matched if known'}
              </span>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                style={{ minBlockSize: '36px', padding: '0.25rem 0.75rem', fontSize: '0.88rem' }}
                onClick={() => {
                  const match = suggestCoordinatesForPlace(name, city, country);
                  if (match) setCoords({ lat: match.lat, lng: match.lng });
                  setShowMapPicker((v) => !v);
                }}
              >
                <Compass size={14} aria-hidden="true" />
                {showMapPicker ? 'Hide Map Picker' : 'Pick on Map'}
              </button>
            </div>
            {showMapPicker && (
              <WorldMapCanvas
                mode="picker"
                pickedCoords={coords}
                onPickCoords={(c) => setCoords(c)}
              />
            )}
          </div>

          <PhotoUploadArea
            drafts={photos}
            onChange={setPhotos}
            allowCoverSelection={false}
            label="Inspiration Photograph (optional)"
            hint="Upload your own reference photo if you have one."
          />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--ghost"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-scrapbook" disabled={saving}>
              <Save size={16} aria-hidden="true" />
              {saving ? 'Pinning...' : 'Save to Wishlist'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.8rem' }}>
            Unfolding your wishlist postcards...
          </p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="paper-sheet paper-sheet--lined" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBlockEnd: '0.85rem' }}>
            <div style={{ inlineSize: '90px' }}>
              <AeroplaneDoodle className="float-gentle" />
            </div>
            <div style={{ inlineSize: '64px' }}>
              <FlowersDoodle />
            </div>
          </div>
          <h2 style={{ fontSize: '2.1rem' }}>Your wishlist pinboard is open</h2>
          <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.4rem' }}>
            Jot down places you want to visit next, and tick them off once you&apos;ve been!
          </p>
          {!showForm && (
            <button
              type="button"
              className="btn-scrapbook"
              style={{ marginBlockStart: '1.2rem' }}
              onClick={() => setShowForm(true)}
            >
              <PlusCircle size={17} aria-hidden="true" />
              Add First Wishlist Place
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem 1.75rem',
          }}
        >
          {wishlistItems.map((dest, idx) => {
            const cover = getCoverPhoto(dest);
            const loc = formatLocation(dest.city, dest.country);
            const isEditingNotes = editingId === dest.id;

            return (
              <article
                key={dest.id}
                className="paper-sheet"
                style={{
                  backgroundColor: idx % 2 === 0 ? '#FFFDF7' : '#FBF6EB',
                  display: 'grid',
                  gap: '1rem',
                  alignContent: 'start',
                }}
              >
                <WashiTape
                  tone={idx % 2 === 0 ? 'butter' : 'blue'}
                  style={{
                    insetBlockStart: '-10px',
                    insetInlineStart: '50%',
                    transform: 'translateX(-50%) rotate(-2deg)',
                  }}
                />

                {cover ? (
                  <PolaroidCard
                    imageUrl={cover.url}
                    imageAlt={dest.name}
                    title={dest.name}
                    subtitle={loc || undefined}
                    tapeTone="butter"
                    tiltIndex={idx}
                    badge="Wishlist"
                  />
                ) : (
                  <div style={{ paddingBlockStart: '0.4rem' }}>
                    <span className="postage-stamp postage-stamp--butter">
                      <MapPin size={12} aria-hidden="true" />
                      Wishlist Postcard
                    </span>
                    <h2 style={{ fontSize: '2.05rem', marginBlockStart: '0.55rem' }}>
                      {dest.name}
                    </h2>
                    {loc && (
                      <p className="polaroid-meta" style={{ marginBlockStart: '0.2rem' }}>
                        {loc}
                      </p>
                    )}
                  </div>
                )}

                {isEditingNotes ? (
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    <label htmlFor={`edit-notes-${dest.id}`} className="field-hint">
                      Personal notes
                    </label>
                    <textarea
                      id={`edit-notes-${dest.id}`}
                      className="field-textarea"
                      style={{ minBlockSize: '95px' }}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn-scrapbook btn-scrapbook--ghost"
                        style={{ minBlockSize: '36px', padding: '0.25rem 0.8rem', fontSize: '0.9rem' }}
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-scrapbook btn-scrapbook--sage"
                        style={{ minBlockSize: '36px', padding: '0.25rem 0.8rem', fontSize: '0.9rem' }}
                        onClick={() => handleSaveNotes(dest)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      color: dest.wishlistNotes ? 'var(--ink-espresso)' : 'var(--ink-muted)',
                      fontSize: '0.96rem',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {dest.wishlistNotes || 'No personal notes jotted down yet.'}
                  </p>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBlockStart: 'auto',
                    paddingBlockStart: '0.65rem',
                    borderBlockStart: '1.5px dashed var(--ink-faint)',
                  }}
                >
                  <button
                    type="button"
                    className="btn-scrapbook btn-scrapbook--sage"
                    style={{ flex: '1 1 auto', minBlockSize: '38px', fontSize: '0.95rem' }}
                    onClick={() => openMarkVisitedDialog(dest)}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Mark as Visited
                  </button>

                  <button
                    type="button"
                    aria-label={`Edit notes for ${dest.name}`}
                    className="btn-scrapbook btn-scrapbook--ghost"
                    style={{ minBlockSize: '38px', padding: '0.3rem 0.7rem' }}
                    onClick={() => {
                      setEditingId(dest.id);
                      setEditNotes(dest.wishlistNotes);
                    }}
                  >
                    <Edit3 size={15} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${dest.name} from wishlist`}
                    className="btn-scrapbook btn-scrapbook--danger"
                    style={{ minBlockSize: '38px', padding: '0.3rem 0.7rem' }}
                    onClick={() => onDeleteDestination(dest)}
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Mark as Visited Dialog */}
      <dialog
        ref={visitDialogRef}
        className="scrapbook-dialog"
        aria-labelledby="mark-visited-title"
      >
        {visitTarget && (
          <form onSubmit={handleConfirmMarkVisited} style={{ padding: '1.75rem', display: 'grid', gap: '1rem' }}>
            <h2 id="mark-visited-title" style={{ fontSize: '2.1rem' }}>
              You visited {visitTarget.name}!
            </h2>
            <p style={{ color: 'var(--ink-sepia)' }}>
              Move this place from your wishlist into your visited travel journal.
            </p>

            <div className="field-group">
              <label htmlFor={visitDateId} className="field-label">
                Travel Date <span className="field-hint">(optional)</span>
              </label>
              <input
                id={visitDateId}
                type="date"
                className="field-input"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label htmlFor={visitDescId} className="field-label">
                Travel Memories
              </label>
              <textarea
                id={visitDescId}
                className="field-textarea"
                value={visitMemories}
                onChange={(e) => setVisitMemories(e.target.value)}
                placeholder="Write down what this trip was really like..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                onClick={() => visitDialogRef.current?.close()}
              >
                Cancel
              </button>
              <button type="submit" className="btn-scrapbook btn-scrapbook--sage" disabled={saving}>
                <CheckCircle2 size={17} aria-hidden="true" />
                {saving ? 'Moving...' : 'Move to My Travels'}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
};

