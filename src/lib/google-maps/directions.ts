// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface RouteResult {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  duration_in_traffic?: {
    text: string;
    value: number;
  };
  legs: Array<{
    distance: {
      text: string;
      value: number;
    };
    duration: {
      text: string;
      value: number;
    };
    duration_in_traffic?: {
      text: string;
      value: number;
    };
    start_address: string;
    end_address: string;
    departure_time?: {
      text: string;
      value: number;
    };
    arrival_time?: {
      text: string;
      value: number;
    };
    steps: Array<{
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      html_instructions: string;
      travel_mode: string;
      departure_time?: {
        text: string;
        value: number;
      };
      arrival_time?: {
        text: string;
        value: number;
      };
      transit_details?: {
        line: {
          name: string;
          short_name: string;
          color: string;
          text_color: string;
        };
        departure_stop: {
          name: string;
          location: {
            lat: number;
            lng: number;
          };
        };
        arrival_stop: {
          name: string;
          location: {
            lat: number;
            lng: number;
          };
        };
        departure_time: {
          text: string;
          value: number;
        };
        arrival_time: {
          text: string;
          value: number;
        };
        headsign: string;
        num_stops: number;
      };
    }>;
  }>;
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

export interface RouteOptions {
  origin: string | google.maps.LatLng;
  destination: string | google.maps.LatLng;
  waypoints?: google.maps.DirectionsWaypoint[];
  travelMode?: google.maps.TravelMode;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
  optimizeWaypoints?: boolean;
  departureTime?: Date;
  arrivalTime?: Date;
  transitOptions?: google.maps.TransitOptions;
}

export class DirectionsService {
  private directionsService: google.maps.DirectionsService | null = null;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    if (typeof window !== 'undefined' && window.google?.maps) {
      this.directionsService = new google.maps.DirectionsService();
    }
  }

  async calculateRoute(options: RouteOptions): Promise<RouteResult | null> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    const request: google.maps.DirectionsRequest = {
      origin: options.origin,
      destination: options.destination,
      travelMode: options.travelMode || google.maps.TravelMode.TRANSIT,
      avoidTolls: options.avoidTolls || false,
      avoidHighways: options.avoidHighways || false,
      avoidFerries: options.avoidFerries || false,
      optimizeWaypoints: options.optimizeWaypoints || false,
      transitOptions: options.departureTime ? {
        departureTime: options.departureTime,
        modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM, google.maps.TransitMode.SUBWAY],
        routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
      } : {
        modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM, google.maps.TransitMode.SUBWAY],
        routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
      },
    };

    if (options.waypoints && options.waypoints.length > 0) {
      request.waypoints = options.waypoints;
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          const routeResult: RouteResult = {
            distance: {
              text: leg.distance?.text || '',
              value: leg.distance?.value || 0,
            },
            duration: {
              text: leg.duration?.text || '',
              value: leg.duration?.value || 0,
            },
            duration_in_traffic: leg.duration_in_traffic ? {
              text: leg.duration_in_traffic.text,
              value: leg.duration_in_traffic.value,
            } : undefined,
            legs: route.legs.map(leg => ({
              distance: {
                text: leg.distance?.text || '',
                value: leg.distance?.value || 0,
              },
              duration: {
                text: leg.duration?.text || '',
                value: leg.duration?.value || 0,
              },
              duration_in_traffic: leg.duration_in_traffic ? {
                text: leg.duration_in_traffic.text,
                value: leg.duration_in_traffic.value,
              } : undefined,
              start_address: leg.start_address,
              end_address: leg.end_address,
              departure_time: leg.departure_time ? {
                text: leg.departure_time.text,
                value: leg.departure_time.value.getTime(),
              } : undefined,
              arrival_time: leg.arrival_time ? {
                text: leg.arrival_time.text,
                value: leg.arrival_time.value.getTime(),
              } : undefined,
              steps: leg.steps.map(step => ({
                distance: {
                  text: step.distance?.text || '',
                  value: step.distance?.value || 0,
                },
                duration: {
                  text: step.duration?.text || '',
                  value: step.duration?.value || 0,
                },
                html_instructions: step.instructions || '',
                travel_mode: step.travel_mode,
                departure_time: step.transit?.departure_time ? {
                  text: step.transit.departure_time.text,
                  value: step.transit.departure_time.value.getTime(),
                } : undefined,
                arrival_time: step.transit?.arrival_time ? {
                  text: step.transit.arrival_time.text,
                  value: step.transit.arrival_time.value.getTime(),
                } : undefined,
                transit_details: step.transit ? {
                  line: {
                    name: step.transit.line?.name || '',
                    short_name: step.transit.line?.short_name || '',
                    color: step.transit.line?.color || '#1976D2',
                    text_color: step.transit.line?.text_color || '#FFFFFF',
                  },
                  departure_stop: {
                    name: step.transit.departure_stop?.name || '',
                    location: {
                      lat: step.transit.departure_stop?.location?.lat() || 0,
                      lng: step.transit.departure_stop?.location?.lng() || 0,
                    },
                  },
                  arrival_stop: {
                    name: step.transit.arrival_stop?.name || '',
                    location: {
                      lat: step.transit.arrival_stop?.location?.lat() || 0,
                      lng: step.transit.arrival_stop?.location?.lng() || 0,
                    },
                  },
                  departure_time: {
                    text: step.transit.departure_time?.text || '',
                    value: step.transit.departure_time?.value || 0,
                  },
                  arrival_time: {
                    text: step.transit.arrival_time?.text || '',
                    value: step.transit.arrival_time?.value || 0,
                  },
                  headsign: step.transit.headsign || '',
                  num_stops: step.transit.num_stops || 0,
                } : undefined,
              })),
            })),
            overview_polyline: route.overview_polyline?.points || '',
            summary: route.summary || '',
            warnings: route.warnings || [],
            waypoint_order: route.waypoint_order || [],
          };
          
          resolve(routeResult);
        } else {
          reject(new Error(`Directions API error: ${status}`));
        }
      });
    });
  }

  async calculateMultipleRoutes(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng,
    options: Partial<RouteOptions> = {}
  ): Promise<RouteResult[]> {
    // Calculate different route variations with different preferences to match Google Maps recommendations
    const routeOptions = [
      { 
        ...options, 
        avoidTolls: false, 
        avoidHighways: false,
        transitOptions: {
          modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM, google.maps.TransitMode.SUBWAY],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        }
      },
      { 
        ...options, 
        avoidTolls: false, 
        avoidHighways: false,
        transitOptions: {
          modes: [google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM, google.maps.TransitMode.SUBWAY],
          routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
        }
      },
      { 
        ...options, 
        avoidTolls: false, 
        avoidHighways: false,
        transitOptions: {
          modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAM],
          routingPreference: google.maps.TransitRoutePreference.LESS_WALKING
        }
      },
    ];

    const routes: RouteResult[] = [];
    const seenRoutes = new Set<string>();
    
    for (const option of routeOptions) {
      try {
        const route = await this.calculateRoute({
          origin,
          destination,
          ...option,
        });
        if (route) {
          // Create a unique identifier for the route to avoid duplicates
          const routeId = `${route.summary}-${route.duration.value}-${route.distance.value}`;
          if (!seenRoutes.has(routeId)) {
            seenRoutes.add(routeId);
            routes.push(route);
          }
        }
      } catch (error) {
        console.warn('Failed to calculate route:', error);
      }
    }

    // Sort routes by duration (fastest first)
    return routes.sort((a, b) => a.duration.value - b.duration.value);
  }
}
