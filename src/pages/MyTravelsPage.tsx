import React, { useId, useMemo, useState } from 'react';
import { Filter, PlusCircle, Search, Sparkles } from 'lucide-react';
import type { Destination, PageRoute } from '../types/journal';
import { formatLocation, formatTravelDate, getCoverPhoto } from '../lib/formatters';
import { PolaroidCard } from '../components/PolaroidCard';
import { CameraDoodle, StarsDoodle, WashiTape } from '../components/ScrapbookDoodles';

interface MyTravelsPageProps {
  destinations: Destination[];
  loading: boolean;
  onNavigate: (route: PageRoute) => void;
}

type SortOption = 'recent-added' | 'travel-date-desc' | 'travel-date-asc' | 'name-az';

export const MyTravelsPage: React.FC<MyTravelsPageProps> = ({
  destinations,
  loading,
  onNavigate,
}) => {
  const searchId = useId();
  const countryId = useId();
  const sortId = useId();

  const [query, setQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent-added');

  const visited = useMemo(
    () => destinations.filter((d) => !d.isWishlist),
    [destinations]
  );

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const d of visited) {
      if (d.country.trim()) set.add(d.country.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [visited]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = visited.filter((d) => {
      if (featuredOnly && !d.isFeatured) return false;
      if (
        countryFilter !== 'all' &&
        d.country.trim().toLowerCase() !== countryFilter.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name-az') return a.name.localeCompare(b.name);
      if (sortBy === 'travel-date-desc') {
        return (b.travelDate ?? '').localeCompare(a.travelDate ?? '');
      }
      if (sortBy === 'travel-date-asc') {
        if (!a.travelDate && !b.travelDate) return 0;
        if (!a.travelDate) return 1;
        if (!b.travelDate) return -1;
        return a.travelDate.localeCompare(b.travelDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [visited, query, countryFilter, featuredOnly, sortBy]);

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <section className="paper-sheet" style={{ overflow: 'visible' }}>
        <WashiTape
          tone="sage"
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
            <h1 id="main-heading" tabIndex={-1} style={{ fontSize: 'clamp(2.3rem, 5vw, 3.3rem)' }}>
              My Travels
            </h1>
            <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.25rem' }}>
              {visited.length} {visited.length === 1 ? 'destination' : 'destinations'} tucked into
              your gallery. Click any Polaroid to open its full scrapbook page.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ inlineSize: '66px' }}>
              <StarsDoodle />
            </div>
            <button
              type="button"
              className="btn-scrapbook btn-scrapbook--pink"
              onClick={() => onNavigate({ page: 'add' })}
            >
              <PlusCircle size={18} aria-hidden="true" />
              Add a Place
            </button>
          </div>
        </div>

        {/* Search & Filter Stationery Strip */}
        <div
          style={{
            marginBlockStart: '1.4rem',
            padding: '1rem',
            borderRadius: '14px',
            backgroundColor: 'var(--paper-lined)',
            border: '1.5px dashed var(--ink-faint)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))',
            gap: '0.85rem',
            alignItems: 'end',
          }}
        >
          <div className="field-group">
            <label htmlFor={searchId} className="field-hint" style={{ fontWeight: 600 }}>
              <Search size={13} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: '4px' }} />
              Search memories or places
            </label>
            <input
              id={searchId}
              type="search"
              className="field-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kyoto, coastal train, café..."
            />
          </div>

          <div className="field-group">
            <label htmlFor={countryId} className="field-hint" style={{ fontWeight: 600 }}>
              <Filter size={13} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: '4px' }} />
              Country
            </label>
            <select
              id={countryId}
              className="field-select"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              <option value="all">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label htmlFor={sortId} className="field-hint" style={{ fontWeight: 600 }}>
              Arrange by
            </label>
            <select
              id={sortId}
              className="field-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
            >
              <option value="recent-added">Recently added</option>
              <option value="travel-date-desc">Latest travel date</option>
              <option value="travel-date-asc">Earliest travel date</option>
              <option value="name-az">Alphabetical (A–Z)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', minBlockSize: '44px' }}>
            <button
              type="button"
              aria-pressed={featuredOnly}
              className={`btn-scrapbook ${featuredOnly ? '' : 'btn-scrapbook--ghost'}`}
              style={{ inlineSize: '100%' }}
              onClick={() => setFeaturedOnly((v) => !v)}
            >
              <Sparkles size={16} aria-hidden="true" />
              {featuredOnly ? 'Featured Only' : 'All Memories'}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
          <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.8rem' }}>
            Gathering your photographs...
          </p>
        </div>
      ) : visited.length === 0 ? (
        <div className="paper-sheet paper-sheet--lined" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
          <div style={{ inlineSize: '84px', marginInline: 'auto' }}>
            <CameraDoodle />
          </div>
          <h2 style={{ fontSize: '2.1rem', marginBlockStart: '0.6rem' }}>
            No places recorded yet
          </h2>
          <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.4rem' }}>
            Add your first travel memory to see your Polaroid gallery come alive.
          </p>
          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--sage"
            style={{ marginBlockStart: '1.2rem' }}
            onClick={() => onNavigate({ page: 'add' })}
          >
            <PlusCircle size={18} aria-hidden="true" />
            Add a Place
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem' }}>No matching scrapbook pages</h2>
          <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.35rem' }}>
            Try clearing your search or choosing another country filter.
          </p>
          <button
            type="button"
            className="btn-scrapbook btn-scrapbook--ghost"
            style={{ marginBlockStart: '1rem' }}
            onClick={() => {
              setQuery('');
              setCountryFilter('all');
              setFeaturedOnly(false);
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <section className="polaroid-gallery" aria-label="Travel destinations gallery">
          {filtered.map((dest, idx) => {
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
                badge={dest.isFeatured ? 'Featured' : undefined}
                onClick={() => onNavigate({ page: 'destination', id: dest.id })}
              />
            );
          })}
        </section>
      )}
    </div>
  );
};

