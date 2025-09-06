export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  libraries: ['geometry'] as const,
  version: 'weekly' as const,
};

export const ROUTE_OPTIONS = {
  travelMode: 'DRIVING' as const,
  avoidTolls: false,
  avoidHighways: false,
  avoidFerries: false,
  optimizeWaypoints: false,
};
