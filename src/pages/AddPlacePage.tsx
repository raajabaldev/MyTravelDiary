import React, { useId, useState } from 'react';
import { Check, Compass, MapPin, Save, Sparkles, X } from 'lucide-react';
import type {
  CreateDestinationPayload,
  NewPhotoDraft,
  PaperTheme,
  StickerMotif,
} from '../types/journal';
import { suggestCoordinatesForPlace } from '../data/worldPlacesLookup';
import { PhotoUploadArea } from '../components/PhotoUploadArea';
import { WorldMapCanvas } from '../components/WorldMapCanvas';
import {
  AeroplaneDoodle,
  StickerByMotif,
  WashiTape,
} from '../components/ScrapbookDoodles';

interface AddPlacePageProps {
  onCreate: (payload: CreateDestinationPayload) => Promise<string>;
  onSuccessNavigate: (newId: string) => void;
  onCancel: () => void;
}

const PAPER_THEMES: Array<{ id: PaperTheme; label: string; swatch: string }> = [
  { id: 'sage', label: 'Sage Leaf', swatch: '#E2EBE0' },
  { id: 'pink', label: 'Dusty Rose', swatch: '#F6E2E2' },
  { id: 'butter', label: 'Butter Sun', swatch: '#FBF0CB' },
  { id: 'blue', label: 'Muted Sky', swatch: '#E0EBF2' },
];

const STICKER_MOTIFS: Array<{ id: StickerMotif; label: string }> = [
  { id: 'aeroplane', label: 'Paper Plane' },
  { id: 'mountains', label: 'Peaks' },
  { id: 'flowers', label: 'Wildflower' },
  { id: 'camera', label: 'Film Camera' },
  { id: 'stars', label: 'Night Stars' },
  { id: 'compass', label: 'Compass' },
];

export const AddPlacePage: React.FC<AddPlacePageProps> = ({
  onCreate,
  onSuccessNavigate,
  onCancel,
}) => {
  const nameId = useId();
  const countryId = useId();
  const cityId = useId();
  const dateId = useId();
  const descId = useId();
  const featuredId = useId();
  const publishedId = useId();

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [paperTheme, setPaperTheme] = useState<PaperTheme>('sage');
  const [stickerMotif, setStickerMotif] = useState<StickerMotif>('aeroplane');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [coordNotice, setCoordNotice] = useState<string | null>(null);
  const [photos, setPhotos] = useState<NewPhotoDraft[]>([]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAutoPin = () => {
    const match = suggestCoordinatesForPlace(name, city, country);
    if (match) {
      setCoords({ lat: match.lat, lng: match.lng });
      setShowMapPicker(true);
      setCoordNotice(`Pinned near "${match.matched}". Click anywhere on the map to adjust.`);
    } else {
      setShowMapPicker(true);
      setCoordNotice('No automatic city match found — click anywhere on the map to drop your pin.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a place name before saving this scrapbook page.');
      return;
    }

    setErrorMsg(null);
    setSaving(true);
    try {
      const resolvedCoords =
        coords ?? suggestCoordinatesForPlace(name, city, country);
      const newId = await onCreate({
        name: name.trim(),
        country: country.trim(),
        city: city.trim(),
        travelDate: travelDate || null,
        description: description.trim(),
        isWishlist: false,
        wishlistNotes: '',
        isFeatured,
        isPublished,
        latitude: resolvedCoords ? resolvedCoords.lat : null,
        longitude: resolvedCoords ? resolvedCoords.lng : null,
        paperTheme,
        stickerMotif,
        photos,
      });

      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      onSuccessNavigate(newId);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not save destination.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxInlineSize: '860px', marginInline: 'auto' }}>
      <section className={`paper-sheet paper-sheet--lined theme-${paperTheme}`} style={{ overflow: 'visible' }}>
        <WashiTape
          tone={paperTheme}
          style={{ insetBlockStart: '-12px', insetInlineStart: '28px', transform: 'rotate(-3deg)' }}
        />
        <WashiTape
          tone="butter"
          style={{ insetBlockStart: '-11px', insetInlineEnd: '32px', transform: 'rotate(4deg)' }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBlockEnd: '1.5rem',
          }}
        >
          <div>
            <h1 id="main-heading" tabIndex={-1} style={{ fontSize: 'clamp(2.3rem, 5vw, 3.2rem)' }}>
              Add a New Place
            </h1>
            <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.25rem' }}>
              Everything on this page is written and chosen by you—tuck in your photographs and
              personal memories.
            </p>
          </div>
          <div style={{ inlineSize: '100px' }}>
            <AeroplaneDoodle className="float-gentle" />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.45rem' }}>
          {errorMsg && (
            <div role="alert" className="journal-alert journal-alert--error">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="field-group">
            <label htmlFor={nameId} className="field-label">
              Place Name *
            </label>
            <input
              id={nameId}
              type="text"
              required
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kyoto Autumn Streets, Amalfi Coast, Grandma's Garden"
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
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
                placeholder="e.g., Kyoto"
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
                placeholder="e.g., Japan"
              />
            </div>

            <div className="field-group">
              <label htmlFor={dateId} className="field-label">
                Travel Date <span className="field-hint">(optional)</span>
              </label>
              <input
                id={dateId}
                type="date"
                className="field-input"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </div>

          {/* Interactive Map Pin Dropper */}
          <div
            style={{
              padding: '1rem 1.15rem',
              borderRadius: '14px',
              backgroundColor: 'rgb(255 253 248 / 0.85)',
              border: '1.5px dashed var(--ink-muted)',
              display: 'grid',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.65rem',
              }}
            >
              <div>
                <span className="field-label" style={{ display: 'block', fontSize: '1.28rem' }}>
                  Travel Map Pin <span className="field-hint">(optional)</span>
                </span>
                <span className="field-hint">
                  {coords
                    ? `Pin placed at ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`
                    : 'Drop a pin so this destination appears on your Travel Map.'}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--ghost"
                  style={{ minBlockSize: '38px', padding: '0.35rem 0.9rem', fontSize: '0.95rem' }}
                  onClick={handleAutoPin}
                >
                  <Compass size={15} aria-hidden="true" />
                  Locate from City/Country
                </button>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--sage"
                  style={{ minBlockSize: '38px', padding: '0.35rem 0.9rem', fontSize: '0.95rem' }}
                  onClick={() => setShowMapPicker((v) => !v)}
                >
                  <MapPin size={15} aria-hidden="true" />
                  {showMapPicker ? 'Hide Map Picker' : 'Pick on Map'}
                </button>
                {coords && (
                  <button
                    type="button"
                    className="btn-scrapbook btn-scrapbook--ghost"
                    style={{ minBlockSize: '38px', padding: '0.35rem 0.75rem', fontSize: '0.9rem' }}
                    onClick={() => {
                      setCoords(null);
                      setCoordNotice(null);
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {coordNotice && <p className="field-hint">{coordNotice}</p>}

            {showMapPicker && (
              <WorldMapCanvas
                mode="picker"
                pickedCoords={coords}
                onPickCoords={(picked) => {
                  setCoords(picked);
                  setCoordNotice(`Pin moved to ${picked.lat.toFixed(2)}°, ${picked.lng.toFixed(2)}°`);
                }}
              />
            )}
          </div>

          <PhotoUploadArea
            drafts={photos}
            onChange={setPhotos}
            allowCoverSelection
            existingHasCover={false}
          />

          <div className="field-group">
            <label htmlFor={descId} className="field-label">
              Personal Description &amp; Travel Memories
            </label>
            <textarea
              id={descId}
              className="field-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write down the sounds, small moments, favorite food, or stories you never want to forget..."
            />
          </div>

          {/* Scrapbook Paper & Sticker Customization */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem',
              padding: '1rem 1.15rem',
              borderRadius: '14px',
              backgroundColor: 'rgb(255 253 248 / 0.85)',
              border: '1.5px solid var(--ink-faint)',
            }}
          >
            <div>
              <span className="field-label" style={{ display: 'block', fontSize: '1.25rem', marginBlockEnd: '0.5rem' }}>
                Pastel Paper Accent
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {PAPER_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={paperTheme === t.id}
                    onClick={() => setPaperTheme(t.id)}
                    className="btn-scrapbook btn-scrapbook--ghost"
                    style={{
                      minBlockSize: '36px',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.9rem',
                      backgroundColor: t.swatch,
                      borderColor: paperTheme === t.id ? 'var(--ink-espresso)' : 'var(--ink-faint)',
                    }}
                  >
                    {paperTheme === t.id && <Check size={14} aria-hidden="true" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="field-label" style={{ display: 'block', fontSize: '1.25rem', marginBlockEnd: '0.5rem' }}>
                Page Doodle Sticker
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {STICKER_MOTIFS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    aria-pressed={stickerMotif === m.id}
                    onClick={() => setStickerMotif(m.id)}
                    className={`btn-scrapbook ${stickerMotif === m.id ? '' : 'btn-scrapbook--ghost'}`}
                    style={{
                      minBlockSize: '36px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.88rem',
                    }}
                  >
                    <span style={{ inlineSize: '22px', display: 'inline-block' }}>
                      <StickerByMotif motif={m.id} />
                    </span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.65rem' }}>
            <label
              htmlFor={featuredId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-note)',
                fontSize: '1.1rem',
              }}
            >
              <input
                id={featuredId}
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ inlineSize: '20px', blockSize: '20px', accentColor: 'var(--pink-deep)' }}
              />
              <Sparkles size={17} aria-hidden="true" style={{ color: 'var(--butter-deep)' }} />
              Feature this travel memory on the Home page
            </label>

            <label
              htmlFor={publishedId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-note)',
                fontSize: '1.1rem',
              }}
            >
              <input
                id={publishedId}
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                style={{ inlineSize: '20px', blockSize: '20px', accentColor: 'var(--sage-deep)' }}
              />
              Published (visible to visitors — uncheck to keep as a private draft)
            </label>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              justifyContent: 'flex-end',
              paddingBlockStart: '0.75rem',
              borderBlockStart: '1.5px dashed var(--ink-faint)',
            }}
          >
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-scrapbook btn-scrapbook--pink"
              disabled={saving}
            >
              <Save size={18} aria-hidden="true" />
              {saving ? 'Taping into your scrapbook...' : 'Save to My Journal'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

