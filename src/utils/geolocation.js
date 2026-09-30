// Hyper-local GPS & Suburb Detection Utility for Unavukadai
// Tailored for South Chennai: Perungalathur, Vandalur & Mannivakkam

export const SUBURB_CENTERS = [
  {
    id: 'perungalathur',
    name: 'Perungalathur',
    locality: 'GST Road & Peerkankaranai',
    area: 'Perungalathur Hub',
    lat: 12.9056,
    lng: 80.0832,
    isSuburban: true
  },
  {
    id: 'vandalur',
    name: 'Vandalur',
    locality: 'Zoo Junction & Crescent Campus',
    area: 'Vandalur City',
    lat: 12.8893,
    lng: 80.0815,
    isSuburban: true
  },
  {
    id: 'mannivakkam',
    name: 'Mannivakkam',
    locality: 'Mannivakkam Junction & Mudichur Rd',
    area: 'Mannivakkam',
    lat: 12.8941,
    lng: 80.0526,
    isSuburban: true
  },
  {
    id: 'kilambakkam',
    name: 'Kilambakkam',
    locality: 'KCBT Bus Terminus & GST Road',
    area: 'Kilambakkam Hub',
    lat: 12.8688,
    lng: 80.0768,
    isSuburban: true
  },
  {
    id: 'otteri',
    name: 'Otteri',
    locality: 'Otteri Junction & Vandalur Extension',
    area: 'Otteri Hub',
    lat: 12.8790,
    lng: 80.0900,
    isSuburban: true
  },
  {
    id: 'chn',
    name: 'Chennai Central',
    locality: 'T. Nagar, Chennai',
    area: 'Central Chennai',
    lat: 13.0827,
    lng: 80.2707,
    isSuburban: false
  }
];

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Find closest operational suburb hub from coordinates
export function findNearestSuburb(lat, lng) {
  let closest = SUBURB_CENTERS[0];
  let minDistance = Infinity;

  for (const center of SUBURB_CENTERS) {
    const dist = calculateDistanceKm(lat, lng, center.lat, center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = { ...center, distanceKm: dist };
    }
  }

  return closest;
}

// Reverse geocode using OpenStreetMap Nominatim with fast timeout
export async function reverseGeocodeOSM(lat, lng) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Unavukadai-Food-Delivery'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
      const locality = addr.suburb || addr.town || addr.village || addr.city_district || addr.city || '';
      
      const parts = [road, locality].filter(Boolean);
      return {
        road,
        locality,
        displayName: parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(', ')
      };
    }
  } catch {
    clearTimeout(timeoutId);
    // Network timeout or blocked, fallback cleanly
  }
  return null;
}

// Detect user's current GPS location & match nearest suburb
export async function detectUserLocation() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nearestSuburb = findNearestSuburb(latitude, longitude);

        // Attempt reverse geocoding for precise street name
        let street = '';
        let formattedAddress = `${nearestSuburb.locality}, Chennai`;

        try {
          const osmResult = await reverseGeocodeOSM(latitude, longitude);
          if (osmResult && osmResult.displayName) {
            street = osmResult.road || '';
            formattedAddress = `${osmResult.displayName}, Chennai`;
          }
        } catch {
          // use suburb default
        }

        resolve({
          success: true,
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          suburb: nearestSuburb,
          street: street || `${nearestSuburb.name} Main Road`,
          formattedAddress,
          isSuburbanMatch: nearestSuburb.distanceKm <= 20
        });
      },
      (error) => {
        let msg = 'Failed to detect location';
        if (error.code === 1) msg = 'Location permission denied. Please allow location access in your browser.';
        else if (error.code === 2) msg = 'Location unavailable. Please check your device GPS.';
        else if (error.code === 3) msg = 'Location request timed out. Please try again.';
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

// Calculate dynamic delivery fee based on user location distance (km) and cart total
export function calculateDeliveryFee(distanceKm, itemTotal = 0) {
  if (itemTotal === 0) return 0;
  // Free delivery for orders >= ₹500
  if (itemTotal >= 500) return 0;

  const dist = Math.max(0.2, Number(distanceKm) || 1.5);
  // Tiered calculation:
  // <= 1.5 km: ₹20 (hyperlocal within neighborhood)
  // 1.5 to 3.5 km: ₹28 (standard suburban trip)
  // 3.5 to 6.0 km: ₹38 (cross-suburb trip)
  // > 6.0 km: ₹38 + ₹8 per extra km
  if (dist <= 1.5) return 20;
  if (dist <= 3.5) return 28;
  if (dist <= 6.0) return 38;
  return Math.round(38 + (dist - 6.0) * 8);
}

// Get user-friendly breakdown of delivery fee
export function getDeliveryFeeBreakdown(distanceKm, itemTotal = 0) {
  if (itemTotal === 0) return { fee: 0, text: 'No items in cart' };
  if (itemTotal >= 500) return { fee: 0, text: 'FREE (Order above ₹500)' };

  const dist = Math.max(0.2, Number(distanceKm) || 1.5);
  const fee = calculateDeliveryFee(dist, itemTotal);
  if (dist <= 1.5) return { fee, text: 'Hyperlocal base (≤1.5 km)' };
  if (dist <= 3.5) return { fee, text: 'Standard zone (1.5-3.5 km)' };
  if (dist <= 6.0) return { fee, text: 'Extended suburban zone (3.5-6 km)' };
  return { fee, text: `${dist.toFixed(1)} km (₹38 base + ₹8/km)` };
}

// Map restaurant to coordinates
export function getRestaurantCoordinates(restaurantId, region) {
  const REGION_MAP = {
    'perungalathur': [12.9056, 80.0832],
    'vandalur': [12.8893, 80.0815],
    'mannivakkam': [12.8941, 80.0526],
    'kilambakkam': [12.8688, 80.0768],
    'otteri': [12.8790, 80.0900],
    'chn': [13.0827, 80.2707]
  };

  const regKey = (region || '').toLowerCase();
  for (const [key, coords] of Object.entries(REGION_MAP)) {
    if (regKey.includes(key)) return coords;
  }
  return [12.9056, 80.0832]; // Default to Perungalathur GST Road hub
}
