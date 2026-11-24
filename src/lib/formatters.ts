import type { Destination, DestinationPhoto, NewPhotoDraft, PaperTheme } from '../types/journal';

const ROTATION_PRESETS = [-2.2, 1.6, -1.1, 2.3, -1.7, 0.9];
const TAPE_TONES: PaperTheme[] = ['sage', 'pink', 'butter', 'blue'];

export function formatTravelDate(dateStr: string | null): string {
  if (!dateStr) return 'Undated memory';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatLocation(city: string, country: string): string {
  const parts = [city.trim(), country.trim()].filter(Boolean);
  return parts.join(', ');
}

export function getCoverPhoto(destination: Destination): DestinationPhoto | null {
  if (destination.photos.length === 0) return null;
  return (
    destination.photos.find((p) => p.isCover) ??
    destination.photos[0] ??
    null
  );
}

export function buildPhotoDraftsFromFiles(
  files: FileList | File[],
  existingCount: number,
  markFirstAsCoverIfEmpty: boolean
): NewPhotoDraft[] {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
  return list.map((file, idx) => {
    const seed = existingCount + idx;
    return {
      localId: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
      isCover: markFirstAsCoverIfEmpty && idx === 0,
      rotationDeg: ROTATION_PRESETS[seed % ROTATION_PRESETS.length],
      tapeStyle: TAPE_TONES[seed % TAPE_TONES.length],
    };
  });
}

