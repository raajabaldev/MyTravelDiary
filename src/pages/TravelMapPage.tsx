import React, { useMemo, useState } from 'react';
import { ArrowRight, Compass, Heart, MapPin } from 'lucide-react';
import type { Destination, PageRoute } from '../types/journal';
import { formatLocation, formatTravelDate, getCoverPhoto } from '../lib/formatters';
import { WorldMapCanvas } from '../components/WorldMapCanvas';
import { PolaroidCard } from '../components/PolaroidCard';
import { FoldedMapDoodle, WashiTape } from '../components/ScrapbookDoodles';

interface TravelMapPageProps {
  destinations: Destination[];
  loading: boolean;
  onNavigate: (route: PageRoute) => void;
}

type MapFilter = 'all' | 'visited' | 'wishlist';

export const TravelMapPage: React.FC<TravelMapPageProps> = ({
  destinations,
  loading,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);

  const visibleDestinations = useMemo(() => {
    return destinations.filter((d) => {
      if (filter === 'visited') return !d.isWishlist;
      if (filter === 'wishlist') return d.isWishlist;
      return true;
    });
  }, [destinations, filter]);

  const pinned = visibleDestinations.filter(
    (d) => d.latitude !== null && d.longitude !== null
  );
  const unpinned = visibleDestinations.filter(
    (d) => d.latitude === null || d.longitude === null
  );

  const selectedDestination =
    pinned.find((d) => d.id === selectedDestId) ?? null;

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <section className="paper-sheet" style={{ overflow: 'visible' }}>
        <WashiTape
          tone="blue"
          style={{ insetBlockStart: '-12px', insetInlineStart: '28px', transform: 'rotate(-3deg)' }}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBlockEnd: '1.25rem',
          }}
        >
          <div>
            <h1 id="main-heading" tabIndex={-1} style={{ fontSize: 'clamp(2.3rem, 5vw, 3.3rem)' }}>
              Travel Map
            </h1>
            <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.2rem' }}>
              Click any pin to peek at its postcard and jump straight into that scrapbook page.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ inlineSize: '72px' }}>
              <FoldedMapDoodle />
            </div>
          </div>
        </div>

        {/* Filter & Legend Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
            marginBlockEnd: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              aria-pressed={filter === 'all'}
              className={`btn-scrapbook ${filter === 'all' ? '' : 'btn-scrapbook--ghost'}`}
              style={{ minBlockSize: '38px', padding: '0.3rem 0.95rem', fontSize: '0.95rem' }}
              onClick={() => setFilter('all')}
            >
              <Compass size={15} aria-hidden="true" />
              All Pins ({destinations.filter((d) => d.latitude !== null).length})
            </button>
            <button
              type="button"
              aria-pressed={filter === 'visited'}
              className={`btn-scrapbook ${filter === 'visited' ? 'btn-scrapbook--pink' : 'btn-scrapbook--ghost'}`}
              style={{ minBlockSize: '38px', padding: '0.3rem 0.95rem', fontSize: '0.95rem' }}
              onClick={() => setFilter('visited')}
            >
              <MapPin size={15} aria-hidden="true" />
              Visited ({destinations.filter((d) => !d.isWishlist && d.latitude !== null).length})
            </button>
            <button
              type="button"
              aria-pressed={filter === 'wishlist'}
              className={`btn-scrapbook ${filter === 'wishlist' ? '' : 'btn-scrapbook--ghost'}`}
              style={{ minBlockSize: '38px', padding: '0.3rem 0.95rem', fontSize: '0.95rem' }}
              onClick={() => setFilter('wishlist')}
            >
              <Heart size={15} aria-hidden="true" />
              Wishlist ({destinations.filter((d) => d.isWishlist && d.latitude !== null).length})
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.85rem',
              fontFamily: 'var(--font-stamp)',
              fontSize: '0.78rem',
              color: 'var(--ink-sepia)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                aria-hidden="true"
                style={{
                  inlineSize: '12px',
                  blockSize: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#DB9FA3',
                  border: '1.5px solid #362C25',
                }}
              />
              Visited Pin
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                aria-hidden="true"
                style={{
                  inlineSize: '12px',
                  blockSize: '12px',
                  borderRadius: '2px',
                  transform: 'rotate(45deg)',
                  backgroundColor: '#ECD07B',
                  border: '1.5px solid #362C25',
                }}
              />
              Wishlist Star
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', paddingBlock: '3rem' }}>
            <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.8rem' }}>
              Unrolling your world map...
            </p>
          </div>
        ) : (
          <WorldMapCanvas
            mode="explore"
            destinations={pinned}
            selectedDestinationId={selectedDestId}
            onSelectDestination={(dest) => setSelectedDestId(dest.id)}
          />
        )}
      </section>

      {/* Selected Pin Postcard Drawer */}
      {selectedDestination && (
        <section
          className="paper-sheet paper-sheet--lined"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          <div style={{ maxInlineSize: '300px' }}>
            <PolaroidCard
              imageUrl={getCoverPhoto(selectedDestination)?.url ?? null}
              imageAlt={selectedDestination.name}
              title={selectedDestination.name}
              subtitle={formatLocation(selectedDestination.city, selectedDestination.country) || undefined}
              dateLabel={
                selectedDestination.isWishlist
                  ? 'Wishlist Dream'
                  : formatTravelDate(selectedDestination.travelDate)
              }
              tapeTone={selectedDestination.paperTheme}
              badge={selectedDestination.isWishlist ? 'Wishlist' : 'Visited'}
            />
          </div>

          <div style={{ display: 'grid', gap: '0.85rem' }}>
            <span
              className={`postage-stamp ${
                selectedDestination.isWishlist ? 'postage-stamp--butter' : 'postage-stamp--pink'
              }`}
              style={{ justifySelf: 'start' }}
            >
              {selectedDestination.isWishlist ? 'Wishlist Destination' : 'Visited Scrapbook Entry'}
            </span>
            <h2 style={{ fontSize: '2.35rem' }}>{selectedDestination.name}</h2>
            <p style={{ color: 'var(--ink-sepia)', maxInlineSize: '55ch' }}>
              {selectedDestination.isWishlist
                ? selectedDestination.wishlistNotes || 'No wishlist notes added yet.'
                : selectedDestination.description || 'Open the scrapbook page to read and add notes.'}
            </p>
            <div>
              {selectedDestination.isWishlist ? (
                <button
                  type="button"
                  className="btn-scrapbook"
                  onClick={() => onNavigate({ page: 'wishlist' })}
                >
                  Open in My Wishlist
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--pink"
                  onClick={() =>
                    onNavigate({ page: 'destination', id: selectedDestination.id })
                  }
                >
                  Open Scrapbook Page
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Unpinned hint list if any places lack coordinates */}
      {unpinned.length > 0 && (
        <section className="paper-sheet" style={{ backgroundColor: 'var(--paper-warm)' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Places Without Map Pins ({unpinned.length})</h2>
          <p className="field-hint" style={{ marginBlockStart: '0.25rem' }}>
            Open any destination below and click &ldquo;Edit Page&rdquo; → &ldquo;Locate / Edit Pin&rdquo; to place it on the map.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBlockStart: '0.85rem' }}>
            {unpinned.map((d) => (
              <button
                key={d.id}
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                style={{ minBlockSize: '36px', padding: '0.25rem 0.85rem', fontSize: '0.92rem' }}
                onClick={() =>
                  onNavigate(
                    d.isWishlist ? { page: 'wishlist' } : { page: 'destination', id: d.id }
                  )
                }
              >
                {d.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

