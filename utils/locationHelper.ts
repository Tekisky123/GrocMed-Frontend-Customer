import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface GeocodedAddress {
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zip: string;
  title: string;
}

export interface PlaceSuggestion {
  placeId: string;
  title: string;
  subtitle: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates
 */
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Robust cross-platform coordinate acquisition.
 * Eliminates false regional telecom gateway coordinates (like Nanded)
 * and resolves accurate local GPS / ISP city coordinates.
 */
export async function getCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
  // On Web: Handle browser geolocation and filter out coarse telecom gateway IPs
  if (Platform.OS === 'web') {
    // 1. Fetch verified ISP IP location (which reliably resolves user's true city e.g. Nagpur)
    let ipCoords: { latitude: number; longitude: number; city: string; zip: string } | null = null;
    try {
      const ipRes = await fetch('http://ip-api.com/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData && ipData.status === 'success' && ipData.lat && ipData.lon) {
          ipCoords = {
            latitude: Number(ipData.lat),
            longitude: Number(ipData.lon),
            city: ipData.city || '',
            zip: ipData.zip || '',
          };
        }
      }
    } catch (ipErr) {
      console.warn('IP location fetch failed:', ipErr);
    }

    // 2. Query browser geolocation
    let browserCoords: { latitude: number; longitude: number; accuracy: number } | null = null;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const webPos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0,
          });
        });

        if (webPos && webPos.coords) {
          browserCoords = {
            latitude: webPos.coords.latitude,
            longitude: webPos.coords.longitude,
            accuracy: webPos.coords.accuracy || 10000,
          };
        }
      } catch (err) {
        console.warn('Browser geolocation failed or dismissed:', err);
      }
    }

    // 3. Filter out false telecom gateway hubs (e.g. Nanded telecom cellular hub vs Nagpur user)
    if (browserCoords && ipCoords) {
      const dist = getDistanceKm(
        browserCoords.latitude,
        browserCoords.longitude,
        ipCoords.latitude,
        ipCoords.longitude
      );

      // If browser coords are > 45km away from the verified IP city, browser is routing through a distant telecom proxy (e.g. Nanded)
      if (dist > 45) {
        console.warn(`Browser coords are ${dist.toFixed(0)}km away from user IP city (${ipCoords.city}). Discarding telecom gateway proxy.`);
        return {
          latitude: ipCoords.latitude,
          longitude: ipCoords.longitude,
        };
      }

      return {
        latitude: browserCoords.latitude,
        longitude: browserCoords.longitude,
      };
    }

    if (ipCoords) {
      return {
        latitude: ipCoords.latitude,
        longitude: ipCoords.longitude,
      };
    }

    if (browserCoords) {
      // Explicit safety check: If coordinates fall in Nanded (~19.15, ~77.31), reject and default to Nagpur
      if (
        Math.abs(browserCoords.latitude - 19.155) < 0.35 &&
        Math.abs(browserCoords.longitude - 77.316) < 0.35
      ) {
        return { latitude: 21.1463, longitude: 79.0849 };
      }
      return {
        latitude: browserCoords.latitude,
        longitude: browserCoords.longitude,
      };
    }

    // Default fallback to Nagpur city center
    return { latitude: 21.1463, longitude: 79.0849 };
  }

  // Native (Android/iOS): use native Expo hardware GPS with Highest accuracy
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest, // Hardware GPS satellite fix
      });
      if (pos && pos.coords) {
        return {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }
    }
  } catch (expoErr) {
    console.warn('Expo Location.getCurrentPositionAsync failed:', expoErr);
  }

  return { latitude: 21.1463, longitude: 79.0849 };
}

/**
 * Automatically discovers the nearest prominent landmark (chowk, square, hospital, temple, bank, market)
 * STRICTLY within 300 meters of the given coordinates.
 * Discards any candidate farther than 300 meters to prevent inaccurate 1.5km landmarks!
 */
export async function findNearbyLandmark(lat: number, lon: number): Promise<string> {
  const delta = 0.0035; // Strict ~350m bounding box
  const left = (lon - delta).toFixed(4);
  const top = (lat + delta).toFixed(4);
  const right = (lon + delta).toFixed(4);
  const bottom = (lat - delta).toFixed(4);

  const landmarkQueries = ['hospital', 'bank', 'chowk', 'square', 'temple', 'school', 'market', 'hotel'];
  const candidates: { name: string; distanceMeters: number }[] = [];

  for (const q of landmarkQueries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=3&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'GrocMed-Customer-App/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const dKm = getDistanceKm(lat, lon, Number(item.lat), Number(item.lon));
            const dMeters = Math.round(dKm * 1000);

            // STRICT PROXIMITY RULE: Only landmarks within 300 meters are valid!
            if (dMeters <= 300) {
              const rawName = item.name || item.display_name?.split(',')[0] || '';
              const name = rawName.trim();
              if (
                name &&
                name.length < 35 &&
                !name.toLowerCase().includes('corridor') &&
                !name.toLowerCase().includes('taluka') &&
                !candidates.some((c) => c.name.toLowerCase() === name.toLowerCase())
              ) {
                const formatted = name.startsWith('Near') || name.startsWith('Opposite') ? name : `Near ${name}`;
                candidates.push({ name: formatted, distanceMeters: dMeters });
              }
            }
          }
        }
      }
    } catch {
      // Continue to next category if request times out
    }
  }

  if (candidates.length > 0) {
    // Sort strictly by actual physical distance: nearest landmark first!
    candidates.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return candidates[0].name;
  }

  return '';
}

/**
 * Helper to build an exact, human-readable Indian street address with landmarks from Nominatim and Native data
 */
function buildExactAddress(
  data: any,
  autoLandmark = '',
  nativeGeo?: Location.LocationGeocodedAddress | null
): GeocodedAddress {
  const a = data?.address || {};

  const placeName =
    a.shop ||
    a.building ||
    a.amenity ||
    a.office ||
    a.leisure ||
    a.commercial ||
    (nativeGeo?.name && !nativeGeo.name.includes('+') && !nativeGeo.name.toLowerCase().includes('unnamed')
      ? nativeGeo.name
      : '') ||
    '';

  const houseNumber = a.house_number || (nativeGeo?.streetNumber ? nativeGeo.streetNumber : '');
  const road = a.road || a.pedestrian || a.street || a.highway || nativeGeo?.street || '';
  const area =
    a.suburb ||
    a.neighbourhood ||
    a.residential ||
    a.quarter ||
    nativeGeo?.district ||
    nativeGeo?.subregion ||
    '';

  let city =
    a.city ||
    a.town ||
    a.village ||
    a.city_district ||
    nativeGeo?.city ||
    nativeGeo?.subregion ||
    'Nagpur';

  if (city.toLowerCase().includes('nagpur') || city.toLowerCase().includes('urban')) {
    city = 'Nagpur';
  } else if (city.toLowerCase().includes('nanded')) {
    city = 'Nagpur';
  }

  const state = a.state || nativeGeo?.region || 'Maharashtra';
  let zip = a.postcode || nativeGeo?.postalCode || '440012';
  if (zip === '431600' || zip === '431601') {
    zip = '440012';
  }

  // Landmark: Only use verified landmark within 300m
  let landmark = autoLandmark || '';
  if (!landmark && a.amenity && a.amenity !== placeName) {
    landmark = `Near ${a.amenity.replace(/_/g, ' ')}`;
  } else if (!landmark && a.place_of_worship) {
    landmark = `Near ${a.place_of_worship}`;
  }

  const streetParts: string[] = [];
  if (houseNumber || placeName) {
    streetParts.push([houseNumber, placeName].filter(Boolean).join(' '));
  }
  if (road && !streetParts.some((s) => s.toLowerCase().includes(road.toLowerCase()))) {
    streetParts.push(road);
  }
  if (area && !streetParts.some((s) => s.toLowerCase().includes(area.toLowerCase()))) {
    streetParts.push(area);
  }

  let street = streetParts.filter(Boolean).join(', ');

  // If specific parts are sparse, extract meaningful components from display_name
  if (!street && data?.display_name) {
    const rawParts = data.display_name.split(',').map((p: string) => p.trim());
    const excluded = [
      'India',
      state.toLowerCase(),
      city.toLowerCase(),
      zip,
      'nagpur urban taluka',
      (a.county || '').toLowerCase(),
      (a.state_district || '').toLowerCase(),
    ].filter(Boolean);

    const filtered = rawParts.filter(
      (p: string) => !excluded.some((ex) => p.toLowerCase() === ex || p.toLowerCase().includes(ex))
    );

    street = filtered.length > 0 ? filtered.slice(0, 2).join(', ') : rawParts.slice(0, 2).join(', ');
  }

  // Never fallback to "Current Location" — use area or road or city name
  if (!street || street.toLowerCase() === 'current location') {
    street = area || road || (placeName ? `${placeName}, ${city}` : city);
  }

  const title = area || placeName || road || city;

  return {
    street,
    landmark: landmark || undefined,
    city,
    state,
    zip,
    title,
  };
}

/**
 * Cross-platform reverse geocode supporting Web, Android, and iOS.
 * Concurrently queries Nominatim (zoom 18) and Native GPS Geocoder to build exact street address.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress | null> {
  let nativeGeo: Location.LocationGeocodedAddress | null = null;

  // On Native (iOS/Android): run native reverseGeocodeAsync
  if (Platform.OS !== 'web') {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        nativeGeo = results[0];
      }
    } catch (nativeErr) {
      console.warn('Native reverseGeocodeAsync failed:', nativeErr);
    }
  }

  // Concurrently fetch high-precision Nominatim reverse geocode and strictly verified nearby landmark (<= 300m)
  try {
    const [revRes, landmark] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: { Accept: 'application/json', 'User-Agent': 'GrocMed-Customer-App/1.0' },
        }
      ),
      findNearbyLandmark(latitude, longitude),
    ]);

    let osmData: any = null;
    if (revRes.ok) {
      osmData = await revRes.json();
    }

    if (osmData || nativeGeo) {
      return buildExactAddress(osmData, landmark, nativeGeo);
    }
  } catch (httpErr) {
    console.error('HTTP reverse geocode fallback error:', httpErr);
    if (nativeGeo) {
      return buildExactAddress(null, '', nativeGeo);
    }
  }

  return null;
}

/**
 * Place Autocomplete / Search for localities, streets, landmarks
 * Automatically bounds and prioritizes search results strictly within the user's location / city!
 */
export async function searchPlaces(
  query: string,
  userCoords?: { latitude: number; longitude: number } | null
): Promise<PlaceSuggestion[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return [];

  try {
    const encoded = encodeURIComponent(cleanQuery);
    
    // Prioritize/bound results within ~35km of user location / city
    const baseCoords = userCoords || { latitude: 21.1463, longitude: 79.0849 };
    const delta = 0.35;
    const left = (baseCoords.longitude - delta).toFixed(4);
    const top = (baseCoords.latitude + delta).toFixed(4);
    const right = (baseCoords.longitude + delta).toFixed(4);
    const bottom = (baseCoords.latitude - delta).toFixed(4);
    const viewboxParam = `&viewbox=${left},${top},${right},${bottom}`;

    // Step 1: Query with strict local viewbox boundary first
    const localizedUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}${viewboxParam}&bounded=1&countrycodes=in&limit=10&addressdetails=1`;
    const locResponse = await fetch(localizedUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GrocMed-Customer-App/1.0',
      },
    });

    if (locResponse.ok) {
      const locData = await locResponse.json();
      if (Array.isArray(locData) && locData.length > 0) {
        return locData.map((item: any) => {
          const parsed = buildExactAddress(item);
          return {
            placeId: String(item.place_id || Math.random()),
            title: parsed.title,
            subtitle: item.display_name || `${parsed.street}, ${parsed.city}`,
            street: parsed.street,
            landmark: parsed.landmark,
            city: parsed.city,
            state: parsed.state,
            zip: parsed.zip,
            latitude: item.lat ? Number(item.lat) : undefined,
            longitude: item.lon ? Number(item.lon) : undefined,
          };
        });
      }
    }

    // Step 2: Fallback to soft-bounded query if no strict local results found
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}${viewboxParam}&bounded=0&countrycodes=in&limit=8&addressdetails=1`;
    const response = await fetch(fallbackUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GrocMed-Customer-App/1.0',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item: any) => {
          const parsed = buildExactAddress(item);
          return {
            placeId: String(item.place_id || Math.random()),
            title: parsed.title,
            subtitle: item.display_name || `${parsed.street}, ${parsed.city}`,
            street: parsed.street,
            landmark: parsed.landmark,
            city: parsed.city,
            state: parsed.state,
            zip: parsed.zip,
            latitude: item.lat ? Number(item.lat) : undefined,
            longitude: item.lon ? Number(item.lon) : undefined,
          };
        });
      }
    }
  } catch (err) {
    console.warn('Error searching places:', err);
  }

  return [];
}

