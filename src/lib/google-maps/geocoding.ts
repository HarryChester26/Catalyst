// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface GeocodeResult {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export class GeocodingService {
  private geocoder: google.maps.Geocoder | null = null;

  constructor() {
    console.log("GeocodingService: Constructor called");
    this.initializeService();
  }

  private initializeService() {
    console.log("GeocodingService: Initializing service");
    if (typeof window !== 'undefined' && window.google?.maps) {
      console.log("GeocodingService: Google Maps found, creating Geocoder");
      this.geocoder = new google.maps.Geocoder();
    } else {
      console.log("GeocodingService: Google Maps not available");
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    console.log("GeocodingService: Geocoding address:", address);
    
    if (!this.geocoder || !address.trim()) {
      console.log("GeocodingService: No geocoder or empty address");
      return [];
    }

    return new Promise((resolve, reject) => {
      console.log("GeocodingService: Making geocoding request");
      
      // Add Victoria, Australia to the search query to constrain results
      const searchQuery = `${address}, Victoria, Australia`;
      
      this.geocoder!.geocode(
        { 
          address: searchQuery,
          componentRestrictions: {
            country: 'AU',
            administrativeArea: 'Victoria'
          }
        },
        (results, status) => {
          console.log("GeocodingService: Geocoding response:", { status, results });
          if (status === google.maps.GeocoderStatus.OK && results) {
            const geocodeResults: GeocodeResult[] = results.map(result => ({
              place_id: result.place_id,
              formatted_address: result.formatted_address,
              name: result.address_components[0]?.long_name || result.formatted_address,
              geometry: {
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
              },
            }));
            console.log("GeocodingService: Processed results:", geocodeResults);
            resolve(geocodeResults);
          } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            console.log("GeocodingService: No results found for address:", address);
            // Try without Victoria constraint as fallback
            this.geocoder!.geocode(
              { address },
              (fallbackResults, fallbackStatus) => {
                if (fallbackStatus === google.maps.GeocoderStatus.OK && fallbackResults) {
                  const fallbackGeocodeResults: GeocodeResult[] = fallbackResults.map(result => ({
                    place_id: result.place_id,
                    formatted_address: result.formatted_address,
                    name: result.address_components[0]?.long_name || result.formatted_address,
                    geometry: {
                      location: {
                        lat: result.geometry.location.lat(),
                        lng: result.geometry.location.lng(),
                      },
                    },
                  }));
                  resolve(fallbackGeocodeResults);
                } else {
                  resolve([]);
                }
              }
            );
          } else {
            console.error("GeocodingService: Geocoding failed:", status);
            reject(new Error(`Geocoding failed: ${status}`));
          }
        }
      );
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
    if (!this.geocoder) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            const geocodeResults: GeocodeResult[] = results.map(result => ({
              place_id: result.place_id,
              formatted_address: result.formatted_address,
              name: result.address_components[0]?.long_name || result.formatted_address,
              geometry: {
                location: {
                  lat: result.geometry.location.lat(),
                  lng: result.geometry.location.lng(),
                },
              },
            }));
            resolve(geocodeResults);
          } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        }
      );
    });
  }
}
