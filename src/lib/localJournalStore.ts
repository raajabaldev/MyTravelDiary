import type {
  CreateDestinationPayload,
  Destination,
  DestinationPhoto,
  NewPhotoDraft,
  PaperTheme,
  UpdateDestinationPayload,
} from '../types/journal';

const DB_NAME = 'places_ive_been_local_db';
const DB_VERSION = 1;
const DEST_STORE = 'destinations';
const PHOTO_STORE = 'photos';

interface StoredDestinationRecord {
  id: string;
  name: string;
  country: string;
  city: string;
  travelDate: string | null;
  description: string;
  isWishlist: boolean;
  wishlistNotes: string;
  isFeatured: boolean;
  isPublished?: boolean;
  latitude: number | null;
  longitude: number | null;
  paperTheme: PaperTheme;
  stickerMotif: Destination['stickerMotif'];
  createdAt: string;
  updatedAt: string;
}

interface StoredPhotoRecord {
  id: string;
  destinationId: string;
  blob: Blob;
  caption: string;
  isCover: boolean;
  sortOrder: number;
  rotationDeg: number;
  tapeStyle: PaperTheme;
  createdAt: string;
}

const activeObjectUrls = new Set<string>();

function openLocalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DEST_STORE)) {
        db.createObjectStore(DEST_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        const photoStore = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        photoStore.createIndex('destinationId', 'destinationId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local journal DB'));
  });
}

function runTx<T>(
  db: IDBDatabase,
  stores: string | string[],
  mode: IDBTransactionMode,
  work: (tx: IDBTransaction) => Promise<T> | T
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let resultValue: T;
    tx.oncomplete = () => resolve(resultValue);
    tx.onerror = () => reject(tx.error ?? new Error('Local database transaction failed'));
    Promise.resolve(work(tx))
      .then((val) => {
        resultValue = val;
      })
      .catch((err) => {
        tx.abort();
        reject(err);
      });
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

export function revokeLocalPhotoUrls(): void {
  activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  activeObjectUrls.clear();
}

export async function listLocalDestinations(): Promise<Destination[]> {
  const db = await openLocalDb();
  const [destRecords, photoRecords] = await Promise.all([
    runTx(db, DEST_STORE, 'readonly', (tx) =>
      reqToPromise(tx.objectStore(DEST_STORE).getAll() as IDBRequest<StoredDestinationRecord[]>)
    ),
    runTx(db, PHOTO_STORE, 'readonly', (tx) =>
      reqToPromise(tx.objectStore(PHOTO_STORE).getAll() as IDBRequest<StoredPhotoRecord[]>)
    ),
  ]);

  const photosByDest = new Map<string, DestinationPhoto[]>();
  for (const rec of photoRecords) {
    const objectUrl = URL.createObjectURL(rec.blob);
    activeObjectUrls.add(objectUrl);
    const list = photosByDest.get(rec.destinationId) ?? [];
    list.push({
      id: rec.id,
      destinationId: rec.destinationId,
      storagePath: `local://${rec.id}`,
      url: objectUrl,
      caption: rec.caption,
      isCover: rec.isCover,
      sortOrder: rec.sortOrder,
      rotationDeg: rec.rotationDeg,
      tapeStyle: rec.tapeStyle,
      createdAt: rec.createdAt,
    });
    photosByDest.set(rec.destinationId, list);
  }

  return destRecords
    .map((d) => ({
      ...d,
      isPublished: d.isPublished ?? true,
      photos: (photosByDest.get(d.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createLocalDestination(payload: CreateDestinationPayload): Promise<string> {
  const db = await openLocalDb();
  const now = new Date().toISOString();
  const destId = crypto.randomUUID();

  const destRecord: StoredDestinationRecord = {
    id: destId,
    name: payload.name,
    country: payload.country,
    city: payload.city,
    travelDate: payload.travelDate,
    description: payload.description,
    isWishlist: payload.isWishlist,
    wishlistNotes: payload.wishlistNotes,
    isFeatured: payload.isFeatured,
    isPublished: payload.isPublished ?? true,
    latitude: payload.latitude,
    longitude: payload.longitude,
    paperTheme: payload.paperTheme,
    stickerMotif: payload.stickerMotif,
    createdAt: now,
    updatedAt: now,
  };

  await runTx(db, [DEST_STORE, PHOTO_STORE], 'readwrite', async (tx) => {
    tx.objectStore(DEST_STORE).put(destRecord);
    const photoStore = tx.objectStore(PHOTO_STORE);
    const hasExplicitCover = payload.photos.some((p) => p.isCover);

    payload.photos.forEach((draft, idx) => {
      const photoRec: StoredPhotoRecord = {
        id: crypto.randomUUID(),
        destinationId: destId,
        blob: draft.file,
        caption: draft.caption,
        isCover: hasExplicitCover ? draft.isCover : idx === 0,
        sortOrder: idx,
        rotationDeg: draft.rotationDeg,
        tapeStyle: draft.tapeStyle,
        createdAt: now,
      };
      photoStore.put(photoRec);
    });
  });

  return destId;
}

export async function updateLocalDestination(
  id: string,
  updates: UpdateDestinationPayload
): Promise<void> {
  const db = await openLocalDb();
  await runTx(db, DEST_STORE, 'readwrite', async (tx) => {
    const store = tx.objectStore(DEST_STORE);
    const existing = await reqToPromise(store.get(id) as IDBRequest<StoredDestinationRecord | undefined>);
    if (!existing) throw new Error('Destination not found');
    store.put({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  });
}

export async function deleteLocalDestination(id: string): Promise<void> {
  const db = await openLocalDb();
  await runTx(db, [DEST_STORE, PHOTO_STORE], 'readwrite', async (tx) => {
    tx.objectStore(DEST_STORE).delete(id);
    const photoStore = tx.objectStore(PHOTO_STORE);
    const index = photoStore.index('destinationId');
    const photos = await reqToPromise(
      index.getAll(id) as IDBRequest<StoredPhotoRecord[]>
    );
    for (const p of photos) {
      photoStore.delete(p.id);
    }
  });
}

export async function addLocalPhotos(
  destinationId: string,
  drafts: NewPhotoDraft[],
  existingCount: number,
  hasExistingCover: boolean
): Promise<void> {
  const db = await openLocalDb();
  const now = new Date().toISOString();
  await runTx(db, PHOTO_STORE, 'readwrite', async (tx) => {
    const store = tx.objectStore(PHOTO_STORE);
    const shouldMakeFirstCover = !hasExistingCover && !drafts.some((d) => d.isCover);

    if (drafts.some((d) => d.isCover)) {
      const index = store.index('destinationId');
      const existing = await reqToPromise(
        index.getAll(destinationId) as IDBRequest<StoredPhotoRecord[]>
      );
      for (const p of existing) {
        if (p.isCover) {
          store.put({ ...p, isCover: false });
        }
      }
    }

    drafts.forEach((draft, idx) => {
      store.put({
        id: crypto.randomUUID(),
        destinationId,
        blob: draft.file,
        caption: draft.caption,
        isCover: shouldMakeFirstCover ? idx === 0 : draft.isCover,
        sortOrder: existingCount + idx,
        rotationDeg: draft.rotationDeg,
        tapeStyle: draft.tapeStyle,
        createdAt: now,
      } satisfies StoredPhotoRecord);
    });
  });
}

export async function setLocalCoverPhoto(destinationId: string, photoId: string): Promise<void> {
  const db = await openLocalDb();
  await runTx(db, PHOTO_STORE, 'readwrite', async (tx) => {
    const store = tx.objectStore(PHOTO_STORE);
    const index = store.index('destinationId');
    const photos = await reqToPromise(
      index.getAll(destinationId) as IDBRequest<StoredPhotoRecord[]>
    );
    for (const p of photos) {
      store.put({ ...p, isCover: p.id === photoId });
    }
  });
}

export async function updateLocalPhotoCaption(photoId: string, caption: string): Promise<void> {
  const db = await openLocalDb();
  await runTx(db, PHOTO_STORE, 'readwrite', async (tx) => {
    const store = tx.objectStore(PHOTO_STORE);
    const photo = await reqToPromise(store.get(photoId) as IDBRequest<StoredPhotoRecord | undefined>);
    if (!photo) throw new Error('Photo not found');
    store.put({ ...photo, caption });
  });
}

export async function deleteLocalPhoto(destinationId: string, photoId: string): Promise<void> {
  const db = await openLocalDb();
  await runTx(db, PHOTO_STORE, 'readwrite', async (tx) => {
    const store = tx.objectStore(PHOTO_STORE);
    const target = await reqToPromise(store.get(photoId) as IDBRequest<StoredPhotoRecord | undefined>);
    store.delete(photoId);

    if (target?.isCover) {
      const index = store.index('destinationId');
      const remaining = (
        await reqToPromise(index.getAll(destinationId) as IDBRequest<StoredPhotoRecord[]>)
      )
        .filter((p) => p.id !== photoId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (remaining[0]) {
        store.put({ ...remaining[0], isCover: true });
      }
    }
  });
}

