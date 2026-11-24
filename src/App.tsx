import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Compass,
  Heart,
  Home,
  Lock,
  LogOut,
  Map as MapIcon,
  PlusCircle,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type {
  BackendMode,
  CreateDestinationPayload,
  Destination,
  DestinationPhoto,
  NewPhotoDraft,
  PageRoute,
  UpdateDestinationPayload,
} from './types/journal';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { revokeLocalPhotoUrls } from './lib/localJournalStore';
import {
  addDestinationPhotos,
  createDestination,
  deleteDestination,
  deletePhoto,
  listDestinations,
  setCoverPhoto,
  updateDestination,
  updatePhotoCaption,
} from './lib/journalRepository';
import { PrivateAuthGate } from './pages/PrivateAuthGate';
import { HomePage } from './pages/HomePage';
import { MyTravelsPage } from './pages/MyTravelsPage';
import { AddPlacePage } from './pages/AddPlacePage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { TravelMapPage } from './pages/TravelMapPage';
import { AeroplaneDoodle } from './components/ScrapbookDoodles';

function parseHashRoute(): PageRoute {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!hash || hash === 'home') return { page: 'home' };
  if (hash === 'travels') return { page: 'travels' };
  if (hash === 'add') return { page: 'add' };
  if (hash === 'wishlist') return { page: 'wishlist' };
  if (hash === 'map') return { page: 'map' };
  if (hash.startsWith('destination/')) {
    const id = decodeURIComponent(hash.slice('destination/'.length));
    if (id) return { page: 'destination', id };
  }
  return { page: 'home' };
}

function toHashPath(route: PageRoute): string {
  switch (route.page) {
    case 'home':
      return '#/home';
    case 'travels':
      return '#/travels';
    case 'add':
      return '#/add';
    case 'wishlist':
      return '#/wishlist';
    case 'map':
      return '#/map';
    case 'destination':
      return `#/destination/${encodeURIComponent(route.id)}`;
  }
}

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [localPreviewActive, setLocalPreviewActive] = useState(false);

  const [route, setRoute] = useState<PageRoute>(() => parseHashRoute());
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const backendMode: BackendMode | null = isSupabaseConfigured
    ? session
      ? 'supabase'
      : null
    : localPreviewActive
      ? 'local-preview'
      : null;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((nextRoute: PageRoute) => {
    window.location.hash = toHashPath(nextRoute);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const refreshJournal = useCallback(async () => {
    if (!backendMode) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      if (backendMode === 'local-preview') {
        revokeLocalPhotoUrls();
      }
      const list = await listDestinations(backendMode);
      setDestinations(list);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to load journal.');
    } finally {
      setLoading(false);
    }
  }, [backendMode]);

  useEffect(() => {
    if (backendMode) {
      refreshJournal();
    } else {
      setDestinations([]);
    }
  }, [backendMode, refreshJournal]);

  // Update page title dynamically for accessibility
  useEffect(() => {
    const baseTitle = "The Places I've Been";
    if (!backendMode) {
      document.title = `Private Journal | ${baseTitle}`;
      return;
    }
    switch (route.page) {
      case 'home':
        document.title = `Home | ${baseTitle}`;
        break;
      case 'travels':
        document.title = `My Travels | ${baseTitle}`;
        break;
      case 'add':
        document.title = `Add a Place | ${baseTitle}`;
        break;
      case 'wishlist':
        document.title = `My Wishlist | ${baseTitle}`;
        break;
      case 'map':
        document.title = `Travel Map | ${baseTitle}`;
        break;
      case 'destination': {
        const current = destinations.find((d) => d.id === route.id);
        document.title = current ? `${current.name} | ${baseTitle}` : `Scrapbook Page | ${baseTitle}`;
        break;
      }
    }
  }, [route, destinations, backendMode]);

  const handleCreate = async (payload: CreateDestinationPayload): Promise<string> => {
    if (!backendMode) throw new Error('Journal is locked.');
    const id = await createDestination(backendMode, payload);
    await refreshJournal();
    return id;
  };

  const handleUpdateDestination = async (
    id: string,
    updates: UpdateDestinationPayload
  ): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await updateDestination(backendMode, id, updates);
    await refreshJournal();
  };

  const handleDeleteDestination = async (dest: Destination): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await deleteDestination(backendMode, dest);
    await refreshJournal();
    if (route.page === 'destination' && route.id === dest.id) {
      navigate({ page: 'travels' });
    }
  };

  const handleAddPhotos = async (dest: Destination, drafts: NewPhotoDraft[]): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await addDestinationPhotos(backendMode, dest, drafts);
    await refreshJournal();
  };

  const handleSetCoverPhoto = async (destinationId: string, photoId: string): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await setCoverPhoto(backendMode, destinationId, photoId);
    await refreshJournal();
  };

  const handleUpdatePhotoCaption = async (photoId: string, caption: string): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await updatePhotoCaption(backendMode, photoId, caption);
    await refreshJournal();
  };

  const handleDeletePhoto = async (
    dest: Destination,
    photo: DestinationPhoto
  ): Promise<void> => {
    if (!backendMode) throw new Error('Journal is locked.');
    await deletePhoto(backendMode, dest, photo);
    await refreshJournal();
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setLocalPreviewActive(false);
    setDestinations([]);
  };

  if (!authReady) {
    return (
      <main className="journal-shell" style={{ paddingBlockStart: '4rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-hand)', fontSize: '2rem' }}>
          Opening your travel diary...
        </p>
      </main>
    );
  }

  if (!backendMode) {
    return (
      <PrivateAuthGate
        supabaseConfigured={isSupabaseConfigured}
        onEnterLocalPreview={() => setLocalPreviewActive(true)}
      />
    );
  }

  const activeDestination =
    route.page === 'destination'
      ? destinations.find((d) => d.id === route.id) ?? null
      : null;

  return (
    <>
      <a href="#main-heading" className="skip-link">
        Skip to main content
      </a>

      <div className="journal-shell">
        <header className="journal-header">
          <div className="journal-header-top">
            <button
              type="button"
              className="journal-brand"
              onClick={() => navigate({ page: 'home' })}
            >
              <span style={{ inlineSize: '52px', display: 'inline-block' }}>
                <AeroplaneDoodle />
              </span>
              <span>
                <span className="journal-brand-title">The Places I&apos;ve Been</span>
                <span className="journal-brand-sub">Private Personal Travel Scrapbook</span>
              </span>
            </button>

            <div className="journal-status-area">
              <span
                className={`postage-stamp ${
                  backendMode === 'supabase' ? 'postage-stamp--sage' : 'postage-stamp--butter'
                }`}
              >
                <Lock size={12} aria-hidden="true" />
                {backendMode === 'supabase'
                  ? 'Private Supabase Vault'
                  : 'Local Browser Preview'}
              </span>

              <button
                type="button"
                className="btn-scrapbook btn-scrapbook--ghost"
                style={{ minBlockSize: '36px', padding: '0.25rem 0.85rem', fontSize: '0.9rem' }}
                onClick={handleSignOut}
              >
                <LogOut size={14} aria-hidden="true" />
                {backendMode === 'supabase' ? 'Lock Journal' : 'Exit Preview'}
              </button>
            </div>
          </div>

          <nav className="journal-nav" aria-label="Primary">
            <button
              type="button"
              className="nav-tab"
              aria-current={route.page === 'home' ? 'page' : undefined}
              onClick={() => navigate({ page: 'home' })}
            >
              <Home size={16} aria-hidden="true" />
              Home
            </button>

            <button
              type="button"
              className="nav-tab"
              aria-current={
                route.page === 'travels' || route.page === 'destination' ? 'page' : undefined
              }
              onClick={() => navigate({ page: 'travels' })}
            >
              <BookOpen size={16} aria-hidden="true" />
              My Travels
            </button>

            <button
              type="button"
              className="nav-tab"
              aria-current={route.page === 'wishlist' ? 'page' : undefined}
              onClick={() => navigate({ page: 'wishlist' })}
            >
              <Heart size={16} aria-hidden="true" />
              My Wishlist
            </button>

            <button
              type="button"
              className="nav-tab"
              aria-current={route.page === 'map' ? 'page' : undefined}
              onClick={() => navigate({ page: 'map' })}
            >
              <MapIcon size={16} aria-hidden="true" />
              Travel Map
            </button>

            <button
              type="button"
              className="nav-tab nav-tab-add"
              aria-current={route.page === 'add' ? 'page' : undefined}
              onClick={() => navigate({ page: 'add' })}
            >
              <PlusCircle size={17} aria-hidden="true" />
              Add a Place
            </button>
          </nav>
        </header>

        {errorMsg && (
          <div role="alert" className="journal-alert journal-alert--error" style={{ marginBlockEnd: '1.25rem' }}>
            <span>{errorMsg}</span>
          </div>
        )}

        <main>
          {route.page === 'home' && (
            <HomePage
              destinations={destinations}
              loading={loading}
              onNavigate={navigate}
            />
          )}

          {route.page === 'travels' && (
            <MyTravelsPage
              destinations={destinations}
              loading={loading}
              onNavigate={navigate}
            />
          )}

          {route.page === 'add' && (
            <AddPlacePage
              onCreate={handleCreate}
              onSuccessNavigate={(newId) => navigate({ page: 'destination', id: newId })}
              onCancel={() => navigate({ page: 'travels' })}
            />
          )}

          {route.page === 'wishlist' && (
            <WishlistPage
              destinations={destinations}
              loading={loading}
              onCreateWishlist={handleCreate}
              onUpdateDestination={handleUpdateDestination}
              onDeleteDestination={handleDeleteDestination}
              onNavigate={navigate}
            />
          )}

          {route.page === 'map' && (
            <TravelMapPage
              destinations={destinations}
              loading={loading}
              onNavigate={navigate}
            />
          )}

          {route.page === 'destination' &&
            (loading && !activeDestination ? (
              <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
                <p style={{ fontFamily: 'var(--font-hand)', fontSize: '1.85rem' }}>
                  Opening this scrapbook page...
                </p>
              </div>
            ) : activeDestination ? (
              <DestinationDetailPage
                destination={activeDestination}
                onBack={() => navigate({ page: 'travels' })}
                onUpdateDestination={handleUpdateDestination}
                onDeleteDestination={handleDeleteDestination}
                onAddPhotos={handleAddPhotos}
                onSetCoverPhoto={handleSetCoverPhoto}
                onUpdatePhotoCaption={handleUpdatePhotoCaption}
                onDeletePhoto={handleDeletePhoto}
              />
            ) : (
              <div className="paper-sheet" style={{ textAlign: 'center', paddingBlock: '3rem' }}>
                <Compass size={34} aria-hidden="true" style={{ marginInline: 'auto' }} />
                <h1 id="main-heading" tabIndex={-1} style={{ fontSize: '2.2rem', marginBlockStart: '0.6rem' }}>
                  Scrapbook page not found
                </h1>
                <p style={{ color: 'var(--ink-sepia)', marginBlockStart: '0.35rem' }}>
                  This travel entry may have been removed or moved.
                </p>
                <button
                  type="button"
                  className="btn-scrapbook btn-scrapbook--ghost"
                  style={{ marginBlockStart: '1rem' }}
                  onClick={() => navigate({ page: 'travels' })}
                >
                  Return to My Travels
                </button>
              </div>
            ))}
        </main>
      </div>
    </>
  );
};

