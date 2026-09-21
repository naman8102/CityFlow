/**
 * Geocoding & Landmark Spatial Directory
 * Provides reliable landmark lookups and spatial boundary indexing
 */

export const URBAN_NODES = {
  'ram-manohar-lohia-hospital': {
    name: 'Dr. Ram Manohar Lohia Trauma Center',
    lat: 28.6289,
    lng: 77.2065,
    type: 'HOSPITAL',
    zone: 'Central West'
  },
  'connaught-place-center': {
    name: 'Connaught Place Central Radial Hub',
    lat: 28.6328,
    lng: 77.2197,
    type: 'COMMERCIAL',
    zone: 'Central Core'
  },
  'new-delhi-railway-station': {
    name: 'New Delhi Railway Station (Ajmeri Gate)',
    lat: 28.6448,
    lng: 77.2167,
    type: 'TRANSIT_HUB',
    zone: 'North Central'
  },
  'aiims-trauma-center': {
    name: 'AIIMS Apex Trauma Center',
    lat: 28.5684,
    lng: 77.2066,
    type: 'HOSPITAL',
    zone: 'South'
  },
  'okhla-freight-terminal': {
    name: 'Okhla Phase III Logistics Terminal',
    lat: 28.5355,
    lng: 77.2728,
    type: 'LOGISTICS',
    zone: 'South East'
  },
  'azadpur-mandi': {
    name: 'Azadpur Wholesale Mandi Terminal',
    lat: 28.7108,
    lng: 77.1785,
    type: 'LOGISTICS',
    zone: 'North'
  },
  'barakhamba-junction': {
    name: 'Barakhamba - Tolstoy Intersection',
    lat: 28.6280,
    lng: 77.2240,
    type: 'SIGNAL_INTERSECTION',
    zone: 'Central Core'
  },
  'india-gate-circle': {
    name: 'India Gate Hexagonal Roundabout',
    lat: 28.6129,
    lng: 77.2295,
    type: 'ARTERIAL_JUNCTION',
    zone: 'Central'
  }
};

export class GeocodingService {
  static resolveLocation(query) {
    if (!query) return URBAN_NODES['connaught-place-center'];
    const normalized = String(query).toLowerCase().trim();

    for (const [key, node] of Object.entries(URBAN_NODES)) {
      if (normalized.includes(key) || normalized.includes(node.name.toLowerCase())) {
        return node;
      }
    }

    // Default to central hub if unknown query
    return {
      name: query,
      lat: 28.6328,
      lng: 77.2197,
      type: 'CUSTOM',
      zone: 'Metropolitan Grid'
    };
  }

  static getLandmarks() {
    return Object.values(URBAN_NODES);
  }
}
