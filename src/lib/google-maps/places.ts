import { GOOGLE_MAPS_CONFIG } from './config';

export interface PlaceResult {
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

export class PlacesService {
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(
        document.createElement('div')
      );
    }
  }

  async getPlacePredictions(input: string): Promise<PlaceResult[]> {
    if (!this.autocompleteService || !input.trim()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input,
          types: ['establishment', 'geocode'],
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const results: PlaceResult[] = predictions.map(prediction => ({
              place_id: prediction.place_id,
              formatted_address: prediction.description,
              name: prediction.structured_formatting.main_text,
              geometry: {
                location: {
                  lat: 0, // Will be filled by getPlaceDetails
                  lng: 0,
                },
              },
            }));
            resolve(results);
          } else {
            reject(new Error(`Places API error: ${status}`));
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
    if (!this.placesService) {
      return null;
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: ['place_id', 'formatted_address', 'name', 'geometry'],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            const result: PlaceResult = {
              place_id: place.place_id!,
              formatted_address: place.formatted_address!,
              name: place.name!,
              geometry: {
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng(),
                },
              },
            };
            resolve(result);
          } else {
            reject(new Error(`Place details error: ${status}`));
          }
        }
      );
    });
  }
}
