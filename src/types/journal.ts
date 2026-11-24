export type PaperTheme = 'sage' | 'pink' | 'butter' | 'blue';

export type StickerMotif =
  | 'aeroplane'
  | 'mountains'
  | 'flowers'
  | 'camera'
  | 'stars'
  | 'compass';

export type PageRoute =
  | { page: 'home' }
  | { page: 'travels' }
  | { page: 'add' }
  | { page: 'destination'; id: string }
  | { page: 'wishlist' }
  | { page: 'map' };

export interface DestinationPhoto {
  id: string;
  destinationId: string;
  storagePath: string;
  url: string;
  caption: string;
  isCover: boolean;
  sortOrder: number;
  rotationDeg: number;
  tapeStyle: PaperTheme;
  createdAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  travelDate: string | null;
  description: string;
  isWishlist: boolean;
  wishlistNotes: string;
  isFeatured: boolean;
  isPublished: boolean;
  latitude: number | null;
  longitude: number | null;
  paperTheme: PaperTheme;
  stickerMotif: StickerMotif;
  createdAt: string;
  updatedAt: string;
  photos: DestinationPhoto[];
}

export interface NewPhotoDraft {
  localId: string;
  file: File;
  previewUrl: string;
  caption: string;
  isCover: boolean;
  rotationDeg: number;
  tapeStyle: PaperTheme;
}

export interface CreateDestinationPayload {
  name: string;
  country: string;
  city: string;
  travelDate: string | null;
  description: string;
  isWishlist: boolean;
  wishlistNotes: string;
  isFeatured: boolean;
  isPublished: boolean;
  latitude: number | null;
  longitude: number | null;
  paperTheme: PaperTheme;
  stickerMotif: StickerMotif;
  photos: NewPhotoDraft[];
}

export interface UpdateDestinationPayload {
  name?: string;
  country?: string;
  city?: string;
  travelDate?: string | null;
  description?: string;
  isWishlist?: boolean;
  wishlistNotes?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  paperTheme?: PaperTheme;
  stickerMotif?: StickerMotif;
}

export type BackendMode = 'supabase' | 'local-preview';

