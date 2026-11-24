import React from 'react';
import { ArrowRight, Compass, MapPin, PlusCircle, Sparkles } from 'lucide-react';
import type { Destination, PageRoute } from '../types/journal';
import { formatLocation, formatTravelDate, getCoverPhoto } from '../lib/formatters';
import { PolaroidCard } from '../components/PolaroidCard';
import {
  AeroplaneDoodle,
  CameraDoodle,
  CloudDoodle,
  FoldedMapDoodle,
  MountainsDoodle,
  StarsDoodle,
  WashiTape,
} from '../components/ScrapbookDoodles';

interface HomePageProps {
  destinations: Destination[];
  loading: boolean;
  isOwner: boolean;
  onNavigate: (route: PageRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  destinations,
  loading,
  isOwner,
  onNavigate,
}) => {
  const visited = destinations.filter((d) => !d.isWishlist);
  const wishlistCount = destinations.filter((d) => d.isWishlist).length;

  const uniqueCountries = new Set(
    visited.map((d) => d.country.trim().toLowerCase()).filter(Boolean)
  ).size;

  const totalPhotos = visited.reduce((sum, d) => sum + d.photos.length, 0);

  const featuredMemories = visited.filter((d) => d.isFeatured);
  const recentDestinations = visited.slice(0, 4);

  return (
    <div style={{ display: 'grid', gap: '2.4rem' }}>
      {/* Welcome Scrapbook Cover Spread */}
      <section
        className="paper-sheet paper-sheet--dotted"
        style={{
          overflow: 'visible',
          background:
            'linear-gradient(135deg, #fffdf8 0%, #faf3e4 55%, #f4ebe0 100%)',
        }}
      >
        <WashiTape
          tone="butter"
          style={{ insetBlockStart: '-12px', insetInlineStart: '24px', transform: 'rotate(-4deg)' }}
        />
        <WashiTape
          tone="pink"
          style={{ insetBlockStart: '-11px', insetInlineEnd: '36px', transform: 'rotate(5deg)' }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBlockEnd: '0.85rem' }}>
              <span className="postage-stamp postage-stamp--sage">
                <Compass size={14} aria-hidden="true" />
                Personal Scrapbook
              </span>
              <span className="postage-stamp postage-stamp--pink">
                {visited.length} {visited.length === 1 ? 'Place' : 'Places'} Visited
              </span>
            </div>

            <h1
              id="main-heading"
              tabIndex={-1}
              style={{
                fontSize: 'clamp(2.8rem, 6vw, 4.4rem)',
                lineHeight: 0.98,
                color: 'var(--ink-espresso)',
              }}
            >
              The Places I&apos;ve Been
            </h1>

            <p
              style={{
                marginBlockStart: '0.9rem',
                fontSize: '1.08rem',
                color: 'var(--ink-sepia)',
                maxInlineSize: '48ch',
              }}
            >
              Every ticket stub, quiet morning coffee, winding train ride, and sunlit photograph
              kept safely inside your own private travel diary.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.85rem',
                marginBlockStart: '1.5rem',
              }}
            >
              {isOwner && (
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--pink"
                  onClick={() => onNavigate({ page: 'add' })}
                >
                  <PlusCircle size={19} aria-hidden="true" />
                  Add a Place
                </button>
              )}

              <button
                type="button"
                className={`btn-scrapbook ${isOwner ? 'btn-scrapbook--ghost' : 'btn-scrapbook--pink'}`}
                onClick={() => onNavigate({ page: 'travels' })}
              >
                Browse My Travels
                <ArrowRight size={17} aria-hidden="true" />
              </button>

              {!isOwner && (
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--ghost"
                  onClick={() => onNavigate({ page: 'map' })}
                >
                  Explore Travel Map
                </button>
              )}
            </div>
          </div>

          {/* Hand-drawn Scrapbook Corner Collage & Passport Stamp Stats */}
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gap: '1rem',
              padding: '1.25rem',
              borderRadius: '16px',
              backgroundColor: 'rgb(255 253 248 / 0.8)',
              border: '1.5px dashed var(--ink-muted)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ inlineSize: '92px' }}>
                <AeroplaneDoodle className="float-gentle" />
              </div>
              <div style={{ inlineSize: '76px' }}>
                <CloudDoodle />
              </div>
              <div style={{ inlineSize: '64px' }}>
                <StarsDoodle />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--sage-bg)',
                  border: '1px solid var(--sage-mid)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--sage-deep)',
                  }}
                >
                  {visited.length}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '0.75rem',
                    marginBlockStart: '0.2rem',
                    color: 'var(--ink-espresso)',
                  }}
                >
                  Destinations Visited
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--butter-bg)',
                  border: '1px solid var(--butter-mid)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--butter-deep)',
                  }}
                >
                  {uniqueCountries}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '0.75rem',
                    marginBlockStart: '0.2rem',
                    color: 'var(--ink-espresso)',
                  }}
                >
                  Countries Stamped
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--pink-bg)',
                  border: '1px solid var(--pink-mid)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--pink-deep)',
                  }}
                >
                  {totalPhotos}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '0.75rem',
                    marginBlockStart: '0.2rem',
                    color: 'var(--ink-espresso)',
                  }}
                >
                  Polaroids Taped In
                </div>
              </div>

              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'var(--blue-bg)',
                  border: '1px solid var(--blue-mid)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-hand)',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: 'var(--blue-deep)',
                  }}
                >
                  {wishlistCount}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-stamp)',
                    fontSize: '0.75rem',
                    marginBlockStart: '0.2rem',
                    color: 'var(--ink-espresso)',
                  }}
                >
                  Wishlist Dreams
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.8rem' }}>
            Turning through your scrapbook pages...
          </p>
        </div>
      ) : visited.length === 0 ? (
        <section
          className="paper-sheet paper-sheet--lined"
          style={{ textAlign: 'center', paddingBlock: '2.75rem' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBlockEnd: '1rem',
            }}
          >
            <div style={{ inlineSize: '90px' }}>
              <MountainsDoodle />
            </div>
            <div style={{ inlineSize: '82px' }}>
              <CameraDoodle />
            </div>
            <div style={{ inlineSize: '86px' }}>
              <FoldedMapDoodle />
            </div>
          </div>
          <h2 style={{ fontSize: '2.2rem' }}>
            {isOwner ? 'Your first blank page awaits' : 'No published adventures yet'}
          </h2>
          <p
            style={{
              marginBlockStart: '0.5rem',
              marginInline: 'auto',
              maxInlineSize: '48ch',
              color: 'var(--ink-sepia)',
            }}
          >
            {isOwner
              ? 'Add your first destination with your own photographs and handwritten travel notes to begin filling this journal.'
              : 'Check back soon—new travel memories and photographs will appear here once published.'}
          </p>
          {isOwner && (
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--sage"
              style={{ marginBlockStart: '1.25rem' }}
              onClick={() => onNavigate({ page: 'add' })}
            >
              <PlusCircle size={18} aria-hidden="true" />
              Add Your First Place
            </button>
          )}
        </section>
      ) : (
        <>
          {/* Featured Travel Memories */}
          <section>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBlockEnd: '1.1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={22} aria-hidden="true" style={{ color: 'var(--butter-deep)' }} />
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)' }}>
                  Featured Travel Memories
                </h2>
              </div>
              {isOwner && (
                <span className="field-hint">
                  Star any destination page to pin it here
                </span>
              )}
            </div>

            {featuredMemories.length === 0 ? (
              <div
                className="paper-sheet paper-sheet--lined"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <p style={{ color: 'var(--ink-sepia)' }}>
                  No memories have been starred as featured yet. Open any place in{' '}
                  <strong>My Travels</strong> and mark it as featured to showcase it here.
                </p>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--ghost"
                  onClick={() => onNavigate({ page: 'travels' })}
                >
                  Open My Travels
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                  gap: '1.75rem',
                }}
              >
                {featuredMemories.map((dest, idx) => {
                  const cover = getCoverPhoto(dest);
                  const location = formatLocation(dest.city, dest.country);
                  return (
                    <article
                      key={dest.id}
                      className={`paper-sheet theme-${dest.paperTheme}`}
                      style={{
                        backgroundColor: 'var(--accent-bg)',
                        borderColor: 'var(--accent-mid)',
                        display: 'grid',
                        gap: '1rem',
                        transform: `rotate(${idx % 2 === 0 ? '-0.8deg' : '0.8deg'})`,
                      }}
                    >
                      <WashiTape
                        tone={dest.paperTheme}
                        style={{
                          insetBlockStart: '-11px',
                          insetInlineEnd: '24px',
                          transform: 'rotate(4deg)',
                        }}
                      />
                      <PolaroidCard
                        imageUrl={cover?.url ?? null}
                        imageAlt={cover?.caption || dest.name}
                        title={dest.name}
                        subtitle={location || undefined}
                        dateLabel={formatTravelDate(dest.travelDate)}
                        tapeTone={dest.paperTheme}
                        tiltIndex={idx}
                        badge="Featured"
                        onClick={() => onNavigate({ page: 'destination', id: dest.id })}
                      />
                      {dest.description && (
                        <p
                          style={{
                            fontSize: '0.95rem',
                            color: 'var(--ink-espresso)',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {dest.description}
                        </p>
                      )}
                      <div>
                        <button
                          type="button"
                          className="btn-scrapbook btn-scrapbook--ghost"
                          onClick={() => onNavigate({ page: 'destination', id: dest.id })}
                        >
                          Read Scrapbook Page
                          <ArrowRight size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recently Added Destinations */}
          <section>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                marginBlockEnd: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={22} aria-hidden="true" style={{ color: 'var(--pink-deep)' }} />
                <h2 style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.5rem)' }}>
                  Recently Added Destinations
                </h2>
              </div>
              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                onClick={() => onNavigate({ page: 'travels' })}
              >
                View All ({visited.length})
              </button>
            </div>

            <div className="polaroid-gallery">
              {recentDestinations.map((dest, idx) => {
                const cover = getCoverPhoto(dest);
                return (
                  <PolaroidCard
                    key={dest.id}
                    imageUrl={cover?.url ?? null}
                    imageAlt={cover?.caption || dest.name}
                    title={dest.name}
                    subtitle={formatLocation(dest.city, dest.country) || undefined}
                    dateLabel={formatTravelDate(dest.travelDate)}
                    tapeTone={dest.paperTheme}
                    tiltIndex={idx}
                    onClick={() => onNavigate({ page: 'destination', id: dest.id })}
                  />
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

