import { DisruptionReportWithUser } from '@/types/disruption';

/**
 * Create inspector markers from disruption reports
 */
export function createInspectorMarkers(disruptions: DisruptionReportWithUser[]): google.maps.Marker[] {
  const markers: google.maps.Marker[] = [];
  
  disruptions.forEach(disruption => {
    if (disruption.inspector) {
      // For now, we'll use a default location since we don't have exact coordinates
      // In a real implementation, you'd geocode the location to get coordinates
      const defaultLocation = { lat: -37.8136, lng: 144.9631 }; // Melbourne center
      
      const marker = new google.maps.Marker({
        position: defaultLocation,
        map: null, // Will be set when added to map
        title: `Inspector Report: ${disruption.route_number} - ${disruption.location}`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#DC2626" stroke="white" stroke-width="2"/>
              <path d="M12 6v6l4 2" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12)
        },
        animation: google.maps.Animation.BOUNCE
      });
      
      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-red-600 mb-2">🚨 Inspector Report</h3>
            <p><strong>Route:</strong> ${disruption.route_number}</p>
            <p><strong>Location:</strong> ${disruption.location}</p>
            <p><strong>Type:</strong> ${disruption.disruption}</p>
            <p><strong>Severity:</strong> ${disruption.severity}</p>
            <p><strong>Description:</strong> ${disruption.description}</p>
            <p class="text-sm text-gray-500 mt-2">Reported ${new Date(disruption.created_at).toLocaleString()}</p>
          </div>
        `
      });
      
      marker.addListener('click', () => {
        infoWindow.open(marker.getMap(), marker);
      });
      
      markers.push(marker);
    }
  });
  
  return markers;
}

/**
 * Geocode a location string to get coordinates
 * This is a placeholder - in a real implementation, you'd use the GeocodingService
 */
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  // For now, return a default location
  // In a real implementation, you'd call the Google Geocoding API
  return { lat: -37.8136, lng: 144.9631 };
}
