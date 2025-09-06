"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Route, MapPin, Clock, Navigation, Bus } from "lucide-react";
import GoogleMap from "@/components/GoogleMap";
import QuickAddressInput from "@/components/QuickAddressInput";
import DateTimePicker from "@/components/DateTimePicker";
import RouteOptions from "@/components/RouteOptions";
import { GeocodeResult } from "@/lib/google-maps/geocoding";
import { RouteResult, RouteOptions as RouteOptionsType } from "@/lib/google-maps/directions";

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

export default function TripPlannerPage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("now");
  const [fromPlace, setFromPlace] = useState<GeocodeResult | null>(null);
  const [toPlace, setToPlace] = useState<GeocodeResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFromPlaceSelect = (place: GeocodeResult) => {
    setFromPlace(place);
    setFromLocation(place.formatted_address);
  };

  const handleToPlaceSelect = (place: GeocodeResult) => {
    setToPlace(place);
    setToLocation(place.formatted_address);
  };

  const getDepartureDateTime = (): Date | undefined => {
    const now = new Date();
    
    switch (departureTime) {
      case "now":
        return now;
      case "15min":
        return new Date(now.getTime() + 15 * 60 * 1000);
      case "30min":
        return new Date(now.getTime() + 30 * 60 * 1000);
      case "1hour":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "custom":
        return undefined;
      default:
        if (departureTime.includes('T')) {
          return new Date(departureTime);
        }
        return now;
    }
  };

  const handlePlanTrip = async () => {
    if (!fromPlace || !toPlace) {
      setError("Please select both origin and destination locations.");
      return;
    }

    setIsPlanning(true);
    setError(null);
    setRoutes([]);
    setSelectedRoute(null);

    try {
      const { DirectionsService } = await import("@/lib/google-maps/directions");
      const directionsService = new DirectionsService();
      
      const departureDateTime = getDepartureDateTime();
      
      const routeOptions: Partial<RouteOptionsType> = {
        departureTime: departureDateTime,
        travelMode: window.google?.maps?.TravelMode?.TRANSIT || 'TRANSIT' as any,
      };

      const calculatedRoutes = await directionsService.calculateMultipleRoutes(
        fromPlace.formatted_address,
        toPlace.formatted_address,
        routeOptions
      );

      setRoutes(calculatedRoutes);
      
      if (calculatedRoutes.length > 0) {
        setSelectedRoute(calculatedRoutes[0]);
      }
    } catch (error) {
      console.error("Error calculating routes:", error);
      setError(`Failed to calculate routes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleRouteSelect = (route: RouteResult) => {
    setSelectedRoute(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Public Transport Trip Planner</h1>
          <p className="text-gray-600">Plan your journey using buses, trains, trams, and other public transport</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5" />
                Plan Your Public Transport Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">From</label>
                  <QuickAddressInput
                    placeholder="Current location or address"
                    onPlaceSelect={handleFromPlaceSelect}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <QuickAddressInput
                    placeholder="Destination address"
                    onPlaceSelect={handleToPlaceSelect}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Departure Time</label>
                  <DateTimePicker
                    value={departureTime}
                    onChange={setDepartureTime}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button
                onClick={handlePlanTrip}
                disabled={!fromPlace || !toPlace || isPlanning}
                className="w-full"
              >
                {isPlanning ? "Finding public transport routes..." : "Find Public Transport Routes"}
              </Button>
            </CardContent>
          </Card>

          {routes.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Route Map
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-96">
                    <GoogleMap
                      selectedRoute={selectedRoute}
                      onRouteSelect={handleRouteSelect}
                      fromPlace={fromPlace}
                      toPlace={toPlace}
                    />
                  </div>
                </CardContent>
              </Card>

              <div>
                <RouteOptions
                  routes={routes}
                  onRouteSelect={handleRouteSelect}
                  selectedRoute={selectedRoute}
                />
              </div>
            </div>
          )}

          {routes.length === 0 && !isPlanning && (
            <Card>
              <CardContent className="p-8 text-center">
                <Navigation className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">Ready to Plan Your Public Transport Trip?</h3>
                <p className="text-gray-600 mb-4">
                  Enter your starting location and destination to find the best public transport routes.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    <span>Buses & Trains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Real-time schedules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    <span>Multiple route options</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
