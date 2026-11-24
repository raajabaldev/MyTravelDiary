interface PlaceCoords {
  label: string;
  lat: number;
  lng: number;
}

/**
 * Offline coordinate hints for common travel countries and cities so users
 * can quickly drop a pin on the map without external geocoding services,
 * or click anywhere on the interactive map picker for exact placement.
 */
const PLACE_COORDINATES: PlaceCoords[] = [
  { label: 'tokyo', lat: 35.6762, lng: 139.6503 },
  { label: 'kyoto', lat: 35.0116, lng: 135.7681 },
  { label: 'osaka', lat: 34.6937, lng: 135.5023 },
  { label: 'japan', lat: 36.2048, lng: 138.2529 },
  { label: 'paris', lat: 48.8566, lng: 2.3522 },
  { label: 'nice', lat: 43.7102, lng: 7.262 },
  { label: 'lyon', lat: 45.764, lng: 4.8357 },
  { label: 'france', lat: 46.2276, lng: 2.2137 },
  { label: 'rome', lat: 41.9028, lng: 12.4964 },
  { label: 'venice', lat: 45.4408, lng: 12.3155 },
  { label: 'florence', lat: 43.7696, lng: 11.2558 },
  { label: 'milan', lat: 45.4642, lng: 9.19 },
  { label: 'amalfi', lat: 40.6333, lng: 14.6029 },
  { label: 'italy', lat: 41.8719, lng: 12.5674 },
  { label: 'london', lat: 51.5072, lng: -0.1276 },
  { label: 'edinburgh', lat: 55.9533, lng: -3.1883 },
  { label: 'united kingdom', lat: 54.0, lng: -2.0 },
  { label: 'uk', lat: 54.0, lng: -2.0 },
  { label: 'scotland', lat: 56.4907, lng: -4.2026 },
  { label: 'dublin', lat: 53.3498, lng: -6.2603 },
  { label: 'ireland', lat: 53.1424, lng: -7.6921 },
  { label: 'barcelona', lat: 41.3874, lng: 2.1686 },
  { label: 'madrid', lat: 40.4168, lng: -3.7038 },
  { label: 'seville', lat: 37.3891, lng: -5.9845 },
  { label: 'spain', lat: 40.4637, lng: -3.7492 },
  { label: 'lisbon', lat: 38.7223, lng: -9.1393 },
  { label: 'porto', lat: 41.1579, lng: -8.6291 },
  { label: 'portugal', lat: 39.3999, lng: -8.2245 },
  { label: 'amsterdam', lat: 52.3676, lng: 4.9041 },
  { label: 'netherlands', lat: 52.1326, lng: 5.2913 },
  { label: 'berlin', lat: 52.52, lng: 13.405 },
  { label: 'munich', lat: 48.1351, lng: 11.582 },
  { label: 'germany', lat: 51.1657, lng: 10.4515 },
  { label: 'zurich', lat: 47.3769, lng: 8.5417 },
  { label: 'interlaken', lat: 46.6863, lng: 7.8632 },
  { label: 'zermatt', lat: 46.0207, lng: 7.7491 },
  { label: 'switzerland', lat: 46.8182, lng: 8.2275 },
  { label: 'vienna', lat: 48.2082, lng: 16.3738 },
  { label: 'austria', lat: 47.5162, lng: 14.5501 },
  { label: 'prague', lat: 50.0755, lng: 14.4378 },
  { label: 'czechia', lat: 49.8175, lng: 15.473 },
  { label: 'athens', lat: 37.9838, lng: 23.7275 },
  { label: 'santorini', lat: 36.3932, lng: 25.4615 },
  { label: 'greece', lat: 39.0742, lng: 21.8243 },
  { label: 'istanbul', lat: 41.0082, lng: 28.9784 },
  { label: 'cappadocia', lat: 38.6431, lng: 34.8289 },
  { label: 'turkey', lat: 38.9637, lng: 35.2433 },
  { label: 'reykjavik', lat: 64.1466, lng: -21.9426 },
  { label: 'iceland', lat: 64.9631, lng: -19.0208 },
  { label: 'oslo', lat: 59.9139, lng: 10.7522 },
  { label: 'bergen', lat: 60.3913, lng: 5.3221 },
  { label: 'norway', lat: 60.472, lng: 8.4689 },
  { label: 'stockholm', lat: 59.3293, lng: 18.0686 },
  { label: 'sweden', lat: 60.1282, lng: 18.6435 },
  { label: 'copenhagen', lat: 55.6761, lng: 12.5683 },
  { label: 'denmark', lat: 56.2639, lng: 9.5018 },
  { label: 'helsinki', lat: 60.1699, lng: 24.9384 },
  { label: 'finland', lat: 61.9241, lng: 25.7482 },
  { label: 'new york', lat: 40.7128, lng: -74.006 },
  { label: 'san francisco', lat: 37.7749, lng: -122.4194 },
  { label: 'los angeles', lat: 34.0522, lng: -118.2437 },
  { label: 'chicago', lat: 41.8781, lng: -87.6298 },
  { label: 'seattle', lat: 47.6062, lng: -122.3321 },
  { label: 'honolulu', lat: 21.3069, lng: -157.8583 },
  { label: 'hawaii', lat: 19.8968, lng: -155.5828 },
  { label: 'united states', lat: 39.8283, lng: -98.5795 },
  { label: 'usa', lat: 39.8283, lng: -98.5795 },
  { label: 'banff', lat: 51.1784, lng: -115.5708 },
  { label: 'vancouver', lat: 49.2827, lng: -123.1207 },
  { label: 'toronto', lat: 43.6532, lng: -79.3832 },
  { label: 'montreal', lat: 45.5017, lng: -73.5673 },
  { label: 'canada', lat: 56.1304, lng: -106.3468 },
  { label: 'mexico city', lat: 19.4326, lng: -99.1332 },
  { label: 'oaxaca', lat: 17.0732, lng: -96.7266 },
  { label: 'cancun', lat: 21.1619, lng: -86.8515 },
  { label: 'mexico', lat: 23.6345, lng: -102.5528 },
  { label: 'peru', lat: -9.19, lng: -75.0152 },
  { label: 'cusco', lat: -13.5319, lng: -71.9675 },
  { label: 'machu picchu', lat: -13.1631, lng: -72.545 },
  { label: 'rio de janeiro', lat: -22.9068, lng: -43.1729 },
  { label: 'brazil', lat: -14.235, lng: -51.9253 },
  { label: 'buenos aires', lat: -34.6037, lng: -58.3816 },
  { label: 'patagonia', lat: -50.9423, lng: -73.4068 },
  { label: 'argentina', lat: -38.4161, lng: -63.6167 },
  { label: 'chile', lat: -35.6751, lng: -71.543 },
  { label: 'colombia', lat: 4.5709, lng: -74.2973 },
  { label: 'cartagena', lat: 10.391, lng: -75.4794 },
  { label: 'marrakech', lat: 31.6295, lng: -7.9811 },
  { label: 'morocco', lat: 31.7917, lng: -7.0926 },
  { label: 'cairo', lat: 30.0444, lng: 31.2357 },
  { label: 'egypt', lat: 26.8206, lng: 30.8025 },
  { label: 'cape town', lat: -33.9249, lng: 18.4241 },
  { label: 'south africa', lat: -30.5595, lng: 22.9375 },
  { label: 'kenya', lat: -0.0236, lng: 37.9062 },
  { label: 'nairobi', lat: -1.2921, lng: 36.8219 },
  { label: 'tanzania', lat: -6.369, lng: 34.8888 },
  { label: 'zanzibar', lat: -6.1659, lng: 39.2026 },
  { label: 'dubai', lat: 25.2048, lng: 55.2708 },
  { label: 'jordan', lat: 30.5852, lng: 36.2384 },
  { label: 'petra', lat: 30.3285, lng: 35.4444 },
  { label: 'mumbai', lat: 19.076, lng: 72.8777 },
  { label: 'delhi', lat: 28.7041, lng: 77.1025 },
  { label: 'jaipur', lat: 26.9124, lng: 75.7873 },
  { label: 'udaipur', lat: 24.5854, lng: 73.7125 },
  { label: 'kerala', lat: 10.8505, lng: 76.2711 },
  { label: 'goa', lat: 15.2993, lng: 74.124 },
  { label: 'ladakh', lat: 34.1526, lng: 77.5771 },
  { label: 'india', lat: 20.5937, lng: 78.9629 },
  { label: 'nepal', lat: 28.3949, lng: 84.124 },
  { label: 'kathmandu', lat: 27.7172, lng: 85.324 },
  { label: 'sri lanka', lat: 7.8731, lng: 80.7718 },
  { label: 'bangkok', lat: 13.7563, lng: 100.5018 },
  { label: 'chiang mai', lat: 18.7883, lng: 98.9853 },
  { label: 'thailand', lat: 15.87, lng: 100.9925 },
  { label: 'hanoi', lat: 21.0278, lng: 105.8342 },
  { label: 'ho chi minh', lat: 10.8231, lng: 106.6297 },
  { label: 'vietnam', lat: 14.0583, lng: 108.2772 },
  { label: 'bali', lat: -8.4095, lng: 115.1889 },
  { label: 'indonesia', lat: -0.7893, lng: 113.9213 },
  { label: 'singapore', lat: 1.3521, lng: 103.8198 },
  { label: 'seoul', lat: 37.5665, lng: 126.978 },
  { label: 'busan', lat: 35.1796, lng: 129.0756 },
  { label: 'south korea', lat: 35.9078, lng: 127.7669 },
  { label: 'taipei', lat: 25.033, lng: 121.5654 },
  { label: 'taiwan', lat: 23.6978, lng: 120.9605 },
  { label: 'hong kong', lat: 22.3193, lng: 114.1694 },
  { label: 'beijing', lat: 39.9042, lng: 116.4074 },
  { label: 'shanghai', lat: 31.2304, lng: 121.4737 },
  { label: 'china', lat: 35.8617, lng: 104.1954 },
  { label: 'sydney', lat: -33.8688, lng: 151.2093 },
  { label: 'melbourne', lat: -37.8136, lng: 144.9631 },
  { label: 'australia', lat: -25.2744, lng: 133.7751 },
  { label: 'queenstown', lat: -45.0312, lng: 168.6626 },
  { label: 'auckland', lat: -36.8509, lng: 174.7645 },
  { label: 'new zealand', lat: -40.9006, lng: 174.886 }
];

export function suggestCoordinatesForPlace(
  name: string,
  city: string,
  country: string
): { lat: number; lng: number; matched: string } | null {
  const candidates = [city, name, country]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  for (const candidate of candidates) {
    const exact = PLACE_COORDINATES.find((p) => p.label === candidate);
    if (exact) {
      return { lat: exact.lat, lng: exact.lng, matched: exact.label };
    }
    const partial = PLACE_COORDINATES.find(
      (p) => candidate.includes(p.label) || p.label.includes(candidate)
    );
    if (partial) {
      return { lat: partial.lat, lng: partial.lng, matched: partial.label };
    }
  }
  return null;
}

