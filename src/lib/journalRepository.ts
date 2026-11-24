import type {
  BackendMode,
  CreateDestinationPayload,
  Destination,
  DestinationPhoto,
  NewPhotoDraft,
  PaperTheme,
  StickerMotif,
  UpdateDestinationPayload,
} from '../types/journal';
import {
  addLocalPhotos,
  createLocalDestination,
  deleteLocalDestination,
  deleteLocalPhoto,
  listLocalDestinations,
  setLocalCoverPhoto,
  updateLocalDestination,
  updateLocalPhotoCaption,
} from './localJournalStore';
import { STORAGE_BUCKET, supabase } from './supabase';

interface DbDestinationRow {
  id: string;
  user_id: string;
  name: string;
  country: string | null;
  city: string | null;
  travel_date: string | null;
  description: string;
  is_wishlist: boolean;
  wishlist_notes: string;
  is_featured: boolean;
  latitude: number | null;
  longitude: number | null;
  paper_theme: string;
  sticker_motif: string;
  created_at: string;
  updated_at: string;
  destination_photos?: DbPhotoRow[];
}

interface DbPhotoRow {
  id: string;
  destination_id: string;
  user_id: string;
  storage_path: string;
  caption: string;
  is_cover: boolean;
  sort_order: number;
  rotation_deg: number;
  tape_style: string;
  created_at: string;
}

function asPaperTheme(val: string): PaperTheme {
  if (val === 'pink' || val === 'butter' || val === 'blue' || val === 'sage') return val;
  return 'sage';
}

function asStickerMotif(val: string): StickerMotif {
  if (
    val === 'aeroplane' ||
    val === 'mountains' ||
    val === 'flowers' ||
    val === 'camera' ||
    val === 'stars' ||
    val === 'compass'
  ) {
    return val;
  }
  return 'aeroplane';
}

function getFileExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (fromName && fromName.length <= 5) return fromName;
  const fromMime = file.type.split('/').pop()?.toLowerCase();
  if (fromMime === 'jpeg') return 'jpg';
  return fromMime || 'jpg';
}

async function requireSupabaseUser() {
  if (!supabase) {
    throw new Error('Supabase client is not configured.');
  }
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Please unlock your travel journal first.');
  }
  return { client: supabase, userId: data.user.id };
}

export async function listDestinations(mode: BackendMode): Promise<Destination[]> {
  if (mode === 'local-preview') {
    return listLocalDestinations();
  }

  const { client } = await requireSupabaseUser();
  const { data, error } = await client
    .from('destinations')
    .select(
      `
      id,
      user_id,
      name,
      country,
      city,
      travel_date,
      description,
      is_wishlist,
      wishlist_notes,
      is_featured,
      latitude,
      longitude,
      paper_theme,
      sticker_motif,
      created_at,
      updated_at,
      destination_photos (
        id,
        destination_id,
        user_id,
        storage_path,
        caption,
        is_cover,
        sort_order,
        rotation_deg,
        tape_style,
        created_at
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Could not load your scrapbook: ${error.message}`);
  }

  const rows = (data ?? []) as DbDestinationRow[];
  const allPaths = rows.flatMap((r) =>
    (r.destination_photos ?? []).map((p) => p.storage_path)
  );

  const signedUrlMap = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signedList, error: signedError } = await client.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(allPaths, 60 * 60);

    if (signedError) {
      throw new Error(`Could not unlock private photographs: ${signedError.message}`);
    }

    for (const item of signedList ?? []) {
      if (item.path && item.signedUrl) {
        signedUrlMap.set(item.path, item.signedUrl);
      }
    }
  }

  return rows.map((row) => {
    const photos: DestinationPhoto[] = (row.destination_photos ?? [])
      .map((p) => ({
        id: p.id,
        destinationId: p.destination_id,
        storagePath: p.storage_path,
        url: signedUrlMap.get(p.storage_path) ?? '',
        caption: p.caption,
        isCover: p.is_cover,
        sortOrder: p.sort_order,
        rotationDeg: p.rotation_deg,
        tapeStyle: asPaperTheme(p.tape_style),
        createdAt: p.created_at,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return {
      id: row.id,
      name: row.name,
      country: row.country ?? '',
      city: row.city ?? '',
      travelDate: row.travel_date,
      description: row.description,
      isWishlist: row.is_wishlist,
      wishlistNotes: row.wishlist_notes,
      isFeatured: row.is_featured,
      latitude: row.latitude,
      longitude: row.longitude,
      paperTheme: asPaperTheme(row.paper_theme),
      stickerMotif: asStickerMotif(row.sticker_motif),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      photos,
    };
  });
}

async function uploadPhotosToSupabase(
  destinationId: string,
  drafts: NewPhotoDraft[],
  startSortOrder: number,
  forceFirstAsCover: boolean
): Promise<void> {
  if (drafts.length === 0) return;
  const { client, userId } = await requireSupabaseUser();
  const uploadedPaths: string[] = [];

  try {
    const rowsToInsert: Array<{
      destination_id: string;
      user_id: string;
      storage_path: string;
      caption: string;
      is_cover: boolean;
      sort_order: number;
      rotation_deg: number;
      tape_style: string;
    }> = [];

    const hasExplicitCover = drafts.some((d) => d.isCover);

    for (let i = 0; i < drafts.length; i += 1) {
      const draft = drafts[i];
      const ext = getFileExtension(draft.file);
      const storagePath = `${userId}/${destinationId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await client.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, draft.file, {
          cacheControl: '3600',
          upsert: false,
          contentType: draft.file.type || undefined,
        });

      if (uploadError) {
        throw new Error(`Photo upload failed: ${uploadError.message}`);
      }

      uploadedPaths.push(storagePath);

      rowsToInsert.push({
        destination_id: destinationId,
        user_id: userId,
        storage_path: storagePath,
        caption: draft.caption,
        is_cover: hasExplicitCover ? draft.isCover : forceFirstAsCover && i === 0,
        sort_order: startSortOrder + i,
        rotation_deg: draft.rotationDeg,
        tape_style: draft.tapeStyle,
      });
    }

    const { error: insertError } = await client
      .from('destination_photos')
      .insert(rowsToInsert);

    if (insertError) {
      throw new Error(`Could not save photograph details: ${insertError.message}`);
    }
  } catch (err) {
    if (uploadedPaths.length > 0) {
      await client.storage.from(STORAGE_BUCKET).remove(uploadedPaths);
    }
    throw err;
  }
}

export async function createDestination(
  mode: BackendMode,
  payload: CreateDestinationPayload
): Promise<string> {
  if (mode === 'local-preview') {
    return createLocalDestination(payload);
  }

  const { client, userId } = await requireSupabaseUser();

  const { data, error } = await client
    .from('destinations')
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      country: payload.country.trim() || null,
      city: payload.city.trim() || null,
      travel_date: payload.travelDate || null,
      description: payload.description.trim(),
      is_wishlist: payload.isWishlist,
      wishlist_notes: payload.wishlistNotes.trim(),
      is_featured: payload.isFeatured,
      latitude: payload.latitude,
      longitude: payload.longitude,
      paper_theme: payload.paperTheme,
      sticker_motif: payload.stickerMotif,
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Could not save this place: ${error?.message ?? 'Unknown error'}`);
  }

  try {
    await uploadPhotosToSupabase(data.id, payload.photos, 0, true);
  } catch (photoErr) {
    await client.from('destinations').delete().eq('id', data.id);
    throw photoErr;
  }

  return data.id;
}

export async function updateDestination(
  mode: BackendMode,
  id: string,
  updates: UpdateDestinationPayload
): Promise<void> {
  if (mode === 'local-preview') {
    return updateLocalDestination(id, updates);
  }

  const { client } = await requireSupabaseUser();

  const dbPayload: Record<string, unknown> = {};
  if (updates.name !== undefined) dbPayload.name = updates.name.trim();
  if (updates.country !== undefined) dbPayload.country = updates.country.trim() || null;
  if (updates.city !== undefined) dbPayload.city = updates.city.trim() || null;
  if (updates.travelDate !== undefined) dbPayload.travel_date = updates.travelDate || null;
  if (updates.description !== undefined) dbPayload.description = updates.description.trim();
  if (updates.isWishlist !== undefined) dbPayload.is_wishlist = updates.isWishlist;
  if (updates.wishlistNotes !== undefined) dbPayload.wishlist_notes = updates.wishlistNotes.trim();
  if (updates.isFeatured !== undefined) dbPayload.is_featured = updates.isFeatured;
  if (updates.latitude !== undefined) dbPayload.latitude = updates.latitude;
  if (updates.longitude !== undefined) dbPayload.longitude = updates.longitude;
  if (updates.paperTheme !== undefined) dbPayload.paper_theme = updates.paperTheme;
  if (updates.stickerMotif !== undefined) dbPayload.sticker_motif = updates.stickerMotif;

  const { error } = await client.from('destinations').update(dbPayload).eq('id', id);
  if (error) {
    throw new Error(`Could not update destination: ${error.message}`);
  }
}

export async function deleteDestination(
  mode: BackendMode,
  destination: Destination
): Promise<void> {
  if (mode === 'local-preview') {
    return deleteLocalDestination(destination.id);
  }

  const { client } = await requireSupabaseUser();

  const storagePaths = destination.photos
    .map((p) => p.storagePath)
    .filter((p) => p && !p.startsWith('local://'));

  if (storagePaths.length > 0) {
    const { error: storageErr } = await client.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths);
    if (storageErr) {
      throw new Error(`Could not remove stored photos: ${storageErr.message}`);
    }
  }

  const { error } = await client.from('destinations').delete().eq('id', destination.id);
  if (error) {
    throw new Error(`Could not delete destination: ${error.message}`);
  }
}

export async function addDestinationPhotos(
  mode: BackendMode,
  destination: Destination,
  drafts: NewPhotoDraft[]
): Promise<void> {
  if (drafts.length === 0) return;
  const hasExistingCover = destination.photos.some((p) => p.isCover);

  if (mode === 'local-preview') {
    return addLocalPhotos(destination.id, drafts, destination.photos.length, hasExistingCover);
  }

  const { client } = await requireSupabaseUser();

  if (drafts.some((d) => d.isCover)) {
    const { error: clearErr } = await client
      .from('destination_photos')
      .update({ is_cover: false })
      .eq('destination_id', destination.id);
    if (clearErr) {
      throw new Error(`Could not update existing cover photo: ${clearErr.message}`);
    }
  }

  await uploadPhotosToSupabase(
    destination.id,
    drafts,
    destination.photos.length,
    !hasExistingCover
  );
}

export async function setCoverPhoto(
  mode: BackendMode,
  destinationId: string,
  photoId: string
): Promise<void> {
  if (mode === 'local-preview') {
    return setLocalCoverPhoto(destinationId, photoId);
  }

  const { client } = await requireSupabaseUser();

  const { error: clearErr } = await client
    .from('destination_photos')
    .update({ is_cover: false })
    .eq('destination_id', destinationId);
  if (clearErr) {
    throw new Error(`Could not change cover photo: ${clearErr.message}`);
  }

  const { error: setErr } = await client
    .from('destination_photos')
    .update({ is_cover: true })
    .eq('id', photoId);
  if (setErr) {
    throw new Error(`Could not set cover photo: ${setErr.message}`);
  }
}

export async function updatePhotoCaption(
  mode: BackendMode,
  photoId: string,
  caption: string
): Promise<void> {
  if (mode === 'local-preview') {
    return updateLocalPhotoCaption(photoId, caption);
  }

  const { client } = await requireSupabaseUser();
  const { error } = await client
    .from('destination_photos')
    .update({ caption: caption.trim() })
    .eq('id', photoId);

  if (error) {
    throw new Error(`Could not save caption: ${error.message}`);
  }
}

export async function deletePhoto(
  mode: BackendMode,
  destination: Destination,
  photo: DestinationPhoto
): Promise<void> {
  if (mode === 'local-preview') {
    return deleteLocalPhoto(destination.id, photo.id);
  }

  const { client } = await requireSupabaseUser();

  if (photo.storagePath && !photo.storagePath.startsWith('local://')) {
    const { error: storageErr } = await client.storage
      .from(STORAGE_BUCKET)
      .remove([photo.storagePath]);
    if (storageErr) {
      throw new Error(`Could not delete image file: ${storageErr.message}`);
    }
  }

  const { error } = await client.from('destination_photos').delete().eq('id', photo.id);
  if (error) {
    throw new Error(`Could not remove photograph: ${error.message}`);
  }

  if (photo.isCover) {
    const nextCover = destination.photos
      .filter((p) => p.id !== photo.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0];

    if (nextCover) {
      await setCoverPhoto(mode, destination.id, nextCover.id);
    }
  }
}

