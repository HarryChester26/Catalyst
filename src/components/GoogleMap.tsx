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
            strokeWeight: 4,
            strokeOpacity: 0.8
          },
          markerOptions: {
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#1976D2" stroke="white" stroke-width="2"/>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="white"/>
                  <circle cx="12" cy="9" r="3" fill="#1976D2"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }
          }
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
      // Calculate route using the directions service
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
          if (route) {
            // Create a mock DirectionsResult for display
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
                  })),
                })),
                overview_polyline: selectedRoute.overview_polyline.points,
                summary: selectedRoute.summary,
                warnings: selectedRoute.warnings,
                waypoint_order: selectedRoute.waypoint_order,
              }],
              request: {} as google.maps.DirectionsRequest,
              geocoded_waypoints: [],
            };

            directionsRenderer.current!.setDirections(directionsResult);
          }
        }).catch((error) => {
          console.error('Error calculating route for map:', error);
        });
      }
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
