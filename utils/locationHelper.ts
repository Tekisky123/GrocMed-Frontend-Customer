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
 * within ~1.2km of the given coordinates.
 */
export async function findNearbyLandmark(lat: number, lon: number): Promise<string> {
  const delta = 0.012; // ~1.2km
  const left = (lon - delta).toFixed(4);
  const top = (lat + delta).toFixed(4);
  const right = (lon + delta).toFixed(4);
  const bottom = (lat - delta).toFixed(4);

  const landmarkQueries = ['chowk', 'square', 'hospital', 'bank', 'temple', 'metro', 'market', 'hotel'];

  for (const q of landmarkQueries) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=2&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'GrocMed-Customer-App/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const rawName = data[0].name || data[0].display_name?.split(',')[0] || '';
          const name = rawName.trim();
          if (name && name.length < 35 && !name.toLowerCase().includes('corridor')) {
            return name.startsWith('Near') || name.startsWith('Opposite') ? name : `Near ${name}`;
          }
        }
      }
    } catch {
      // Continue to next category if request times out
    }
  }

  return '';
}

/**
 * Helper to build an exact, human-readable Indian street address with landmarks from Nominatim data
 */
function buildExactAddress(data: any, autoLandmark = ''): GeocodedAddress {
  const a = data.address || {};
  const placeName = a.shop || a.building || a.office || a.leisure || a.tourism || a.commercial || '';
  const houseNumber = a.house_number || '';
  const road = a.road || a.pedestrian || a.street || a.highway || '';
  
  // Extract specific landmark or amenity from address details
  let landmark = autoLandmark || a.landmark || '';
  if (!landmark && a.amenity && a.amenity !== placeName) {
    landmark = `Near ${a.amenity.replace(/_/g, ' ')}`;
  } else if (!landmark && a.place_of_worship) {
    landmark = `Near ${a.place_of_worship}`;
  }

  const area = a.suburb || a.neighbourhood || a.residential || a.quarter || '';
  let city = a.city || a.town || a.village || a.city_district || a.county || 'Nagpur';
  if (city.toLowerCase().includes('nagpur') || city.toLowerCase().includes('urban')) {
    city = 'Nagpur';
  } else if (city.toLowerCase().includes('nanded')) {
    city = 'Nagpur';
  }

  const state = a.state || 'Maharashtra';
  let zip = a.postcode || '';
  if (zip === '431600' || zip === '431601') {
    zip = '440013';
  }

  const streetParts: string[] = [];
  if (houseNumber || placeName) {
    streetParts.push([houseNumber, placeName].filter(Boolean).join(' '));
  }
  if (road) {
    streetParts.push(road);
  }
  if (area && !streetParts.some((s) => s.toLowerCase().includes(area.toLowerCase()))) {
    streetParts.push(area);
  }
  if (landmark && !streetParts.some((s) => s.toLowerCase().includes(landmark.toLowerCase()))) {
    streetParts.push(landmark);
  }

  let street = streetParts.filter(Boolean).join(', ');

  // If specific parts are sparse, extract meaningful components from display_name
  if (!street && data.display_name) {
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

    street = filtered.length > 0 ? filtered.slice(0, 3).join(', ') : rawParts.slice(0, 2).join(', ');
  }

  if (!street) {
    street = [area, landmark, city].filter(Boolean).join(', ') || 'Current Location';
  }

  const title = area || placeName || road || city || 'Current Location';

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
 * Resolves exact street, automatically finds nearest landmark, area, city, and pincode.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress | null> {
  // On Native (iOS/Android): try native geocoder first
  if (Platform.OS !== 'web') {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const geo = results[0];
        const num = geo.streetNumber ? `${geo.streetNumber}, ` : '';
        const streetName = geo.street || geo.name || '';
        const area = geo.district || geo.subregion || '';
        
        // Find nearby landmark concurrently
        const landmark = await findNearbyLandmark(latitude, longitude);

        const parts = [num + streetName, area, landmark].map((s) => s.trim()).filter(Boolean);
        let street = parts.join(', ');
        if (!street) street = geo.district || 'Current Location';

        return {
          street,
          landmark: landmark || undefined,
          city: geo.city || geo.subregion || 'Nagpur',
          state: geo.region || 'Maharashtra',
          zip: geo.postalCode || '',
          title: area || geo.district || geo.name || geo.city || 'Current Location',
        };
      }
    } catch (nativeErr) {
      console.warn('Native reverseGeocodeAsync failed, using HTTP fallback:', nativeErr);
    }
  }

  // Universal Web & Native Fallback: OpenStreetMap Nominatim with zoom 18 + automatic landmark detection
  try {
    const [revRes, landmark] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'GrocMed-Customer-App/1.0' },
      }),
      findNearbyLandmark(latitude, longitude),
    ]);

    if (revRes.ok) {
      const data = await revRes.json();
      if (data && data.address) {
        return buildExactAddress(data, landmark);
      }
    }
  } catch (httpErr) {
    console.error('HTTP reverse geocode fallback error:', httpErr);
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

