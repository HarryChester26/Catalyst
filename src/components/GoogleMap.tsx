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
  inspectorMarkers?: google.maps.Marker[];
}

export default function GoogleMap({ onRouteSelect, selectedRoute, fromPlace, toPlace, inspectorMarkers = [] }: GoogleMapProps) {
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
      // Dùng trực tiếp DirectionsService của Google Maps để lấy DirectionsResult
      if (window.google?.maps) {
        const directionsService = new window.google.maps.DirectionsService();
        const routeOptions: RouteOptions = {
          origin: fromPlace.formatted_address,
          destination: toPlace.formatted_address,
          travelMode: window.google.maps.TravelMode.TRANSIT,
          transitOptions: {
            modes: [window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.TRAIN, window.google.maps.TransitMode.TRAM, window.google.maps.TransitMode.SUBWAY],
            routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
          }
        };
        directionsService.route(routeOptions as google.maps.DirectionsRequest, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.current!.setDirections(result);
            // Fit bounds
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(fromPlace.geometry.location.lat, fromPlace.geometry.location.lng));
            bounds.extend(new window.google.maps.LatLng(toPlace.geometry.location.lat, toPlace.geometry.location.lng));
            mapInstance.current!.fitBounds(bounds);
          } else {
            console.error('Directions API error:', status);
          }
        });
      }
    } else if (!selectedRoute && directionsRenderer.current) {
      directionsRenderer.current.setDirections({ 
        routes: [],
        request: {} as google.maps.DirectionsRequest,
        geocoded_waypoints: []
      } as google.maps.DirectionsResult);
    }
  }, [selectedRoute, fromPlace, toPlace]);

  // Handle inspector markers
  useEffect(() => {
    if (mapInstance.current && inspectorMarkers.length > 0) {
      inspectorMarkers.forEach(marker => {
        marker.setMap(mapInstance.current);
      });
    }
  }, [inspectorMarkers]);

  return (
    <div className="w-full h-full">
      <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />
    </div>
  );
}

export { GeocodingService, DirectionsService };
export type { GeocodeResult, RouteResult, RouteOptions };
