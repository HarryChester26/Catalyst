"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG } from '@/lib/google-maps/config';
import { GeocodingService, GeocodeResult } from '@/lib/google-maps/geocoding';
import { DirectionsService, RouteResult, RouteOptions } from '@/lib/google-maps/directions';

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  onRouteSelect?: (route: RouteResult) => void;
  selectedRoute?: RouteResult | null;
  fromPlace?: GeocodeResult | null;
  toPlace?: GeocodeResult | null;
}

export default function GoogleMap({ onRouteSelect, selectedRoute, fromPlace, toPlace }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [geocodingService, setGeocodingService] = useState<GeocodingService | null>(null);
  const [directionsService, setDirectionsService] = useState<DirectionsService | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          initializeMap();
          return;
        }

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.apiKey,
          version: GOOGLE_MAPS_CONFIG.version,
          libraries: [...GOOGLE_MAPS_CONFIG.libraries],
        });

        await loader.load();
        initializeMap();
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const initializeMap = () => {
      if (mapRef.current && window.google?.maps) {
        // Default to Melbourne for public transport
        const defaultCenter = { lat: -37.8136, lng: 144.9631 };
        
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "transit.station",
              elementType: "labels",
              stylers: [{ visibility: "on" }]
            }
          ]
        });

        directionsRenderer.current = new google.maps.DirectionsRenderer({
          draggable: false,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#1976D2',
            strokeWeight: 5,
            strokeOpacity: 0.9
          },
          markerOptions: {
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#1976D2" stroke="white" stroke-width="2"/>
                  <circle cx="10" cy="10" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(20, 20),
              anchor: new google.maps.Point(10, 10)
            }
          },
          suppressInfoWindows: false,
          preserveViewport: false
        });
        directionsRenderer.current.setMap(mapInstance.current);

        setGeocodingService(new GeocodingService());
        setDirectionsService(new DirectionsService());
        setIsLoaded(true);
      }
    };

    loadGoogleMaps();
  }, []);

  // Update map center when places are selected
  useEffect(() => {
    if (fromPlace && toPlace && mapInstance.current) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(fromPlace.geometry.location.lat, fromPlace.geometry.location.lng));
      bounds.extend(new google.maps.LatLng(toPlace.geometry.location.lat, toPlace.geometry.location.lng));
      
      mapInstance.current.fitBounds(bounds);
      mapInstance.current.setZoom(Math.min(mapInstance.current.getZoom() || 12, 14));
    }
  }, [fromPlace, toPlace]);

  // Display the selected route on the map
  useEffect(() => {
    if (selectedRoute && directionsRenderer.current && mapInstance.current && fromPlace && toPlace) {
      // Calculate route using the directions service to get the actual route for display
      if (directionsService) {
        const routeOptions: RouteOptions = {
          origin: fromPlace.formatted_address,
          destination: toPlace.formatted_address,
          travelMode: google.maps.TravelMode.TRANSIT,
          transitOptions: {
            modes: [google.maps.TransitMode.BUS, google.maps.TransitMode.TRAIN, google.maps.TransitMode.TRAM, google.maps.TransitMode.SUBWAY],
            routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
          }
        };

        directionsService.calculateRoute(routeOptions).then((route) => {
          if (route && directionsRenderer.current) {
            // Create a proper DirectionsResult for display
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(new google.maps.LatLng(fromPlace.geometry.location.lat, fromPlace.geometry.location.lng));
            bounds.extend(new google.maps.LatLng(toPlace.geometry.location.lat, toPlace.geometry.location.lng));

            const directionsResult: google.maps.DirectionsResult = {
              routes: [{
                legs: route.legs.map(leg => ({
                  distance: leg.distance,
                  duration: leg.duration,
                  duration_in_traffic: leg.duration_in_traffic,
                  start_address: leg.start_address,
                  end_address: leg.end_address,
                  start_location: new google.maps.LatLng(fromPlace.geometry.location.lat, fromPlace.geometry.location.lng),
                  end_location: new google.maps.LatLng(toPlace.geometry.location.lat, toPlace.geometry.location.lng),
                  steps: leg.steps.map(step => ({
                    distance: step.distance,
                    duration: step.duration,
                    instructions: step.html_instructions,
                    travel_mode: step.travel_mode as google.maps.TravelMode,
                    start_location: new google.maps.LatLng(0, 0),
                    end_location: new google.maps.LatLng(0, 0),
                    encoded_lat_lngs: [],
                    end_point: new google.maps.LatLng(0, 0),
                    lat_lngs: [],
                    maneuver: '',
                    start_point: new google.maps.LatLng(0, 0),
                    transit: step.transit_details ? {
                      line: {
                        name: step.transit_details.line.name,
                        short_name: step.transit_details.line.short_name,
                        color: step.transit_details.line.color,
                        text_color: step.transit_details.line.text_color,
                      },
                      departure_stop: {
                        name: step.transit_details.departure_stop.name,
                        location: new google.maps.LatLng(
                          step.transit_details.departure_stop.location.lat,
                          step.transit_details.departure_stop.location.lng
                        ),
                      },
                      arrival_stop: {
                        name: step.transit_details.arrival_stop.name,
                        location: new google.maps.LatLng(
                          step.transit_details.arrival_stop.location.lat,
                          step.transit_details.arrival_stop.location.lng
                        ),
                      },
                      departure_time: step.transit_details.departure_time,
                      arrival_time: step.transit_details.arrival_time,
                      headsign: step.transit_details.headsign,
                      num_stops: step.transit_details.num_stops,
                    } : undefined,
                  })),
                  traffic_speed_entry: [],
                  via_waypoints: [],
                } as google.maps.DirectionsLeg)),
                overview_polyline: selectedRoute.overview_polyline.points,
                summary: selectedRoute.summary,
                warnings: selectedRoute.warnings,
                waypoint_order: selectedRoute.waypoint_order,
                bounds: bounds,
                copyrights: 'Google',
                overview_path: [],
              }],
              request: {} as google.maps.DirectionsRequest,
              geocoded_waypoints: [],
            };

            // Set the directions on the renderer to display the route
            directionsRenderer.current.setDirections(directionsResult);
            
            // Fit the map to show the entire route
            if (mapInstance.current) {
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(new google.maps.LatLng(fromPlace.geometry.location.lat, fromPlace.geometry.location.lng));
              bounds.extend(new google.maps.LatLng(toPlace.geometry.location.lat, toPlace.geometry.location.lng));
              mapInstance.current.fitBounds(bounds);
            }
          }
        }).catch((error) => {
          console.error('Error calculating route for map:', error);
        });
      }
    } else if (!selectedRoute && directionsRenderer.current) {
      // Clear the route when no route is selected
      directionsRenderer.current.setDirections({ 
        routes: [],
        request: {} as google.maps.DirectionsRequest,
        geocoded_waypoints: []
      } as google.maps.DirectionsResult);
    }
  }, [selectedRoute, fromPlace, toPlace, directionsService]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
    </div>
  );
}

export { GeocodingService, DirectionsService };
export type { GeocodeResult, RouteResult, RouteOptions };
