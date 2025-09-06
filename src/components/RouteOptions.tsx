"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouteResult } from '@/lib/google-maps/directions';
import { Clock, MapPin, Bus, Train, Tram, Subway, Route, Footprints, ArrowRight } from 'lucide-react';

interface RouteOptionsProps {
  routes: RouteResult[];
  onRouteSelect: (route: RouteResult) => void;
  selectedRoute?: RouteResult | null;
}

export default function RouteOptions({ routes, onRouteSelect, selectedRoute }: RouteOptionsProps) {
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);

  const getRouteType = (route: RouteResult, index: number) => {
    if (index === 0) return { label: 'Fastest', color: 'bg-green-100 text-green-800' };
    if (route.summary.toLowerCase().includes('fewer transfers')) return { label: 'Fewer Transfers', color: 'bg-blue-100 text-blue-800' };
    if (route.summary.toLowerCase().includes('walking')) return { label: 'Less Walking', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Alternative', color: 'bg-gray-100 text-gray-800' };
  };

  const formatDuration = (duration: { text: string; value: number }) => {
    return duration.text;
  };

  const formatDistance = (distance: { text: string; value: number }) => {
    return distance.text;
  };

  const formatTime = (time: { text: string; value: number }) => {
    return time.text;
  };

  const getTransportIcon = (travelMode: string) => {
    switch (travelMode.toLowerCase()) {
      case 'transit':
      case 'bus':
        return <Bus className="h-4 w-4" />;
      case 'train':
        return <Train className="h-4 w-4" />;
      case 'tram':
        return <Tram className="h-4 w-4" />;
      case 'subway':
        return <Subway className="h-4 w-4" />;
      case 'walking':
        return <Footprints className="h-4 w-4" />;
      default:
        return <Bus className="h-4 w-4" />;
    }
  };

  const getTransportColor = (travelMode: string) => {
    switch (travelMode.toLowerCase()) {
      case 'transit':
      case 'bus':
        return 'text-blue-600';
      case 'train':
        return 'text-green-600';
      case 'tram':
        return 'text-orange-600';
      case 'subway':
        return 'text-purple-600';
      case 'walking':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const countTransfers = (steps: any[]) => {
    let transfers = 0;
    let currentMode = '';
    
    steps.forEach(step => {
      if (step.travel_mode === 'TRANSIT' && currentMode !== 'TRANSIT') {
        if (currentMode !== '') transfers++;
        currentMode = 'TRANSIT';
      } else if (step.travel_mode === 'WALKING') {
        currentMode = 'WALKING';
      }
    });
    
    return transfers;
  };

  const toggleExpanded = (routeIndex: number) => {
    setExpandedRoute(expandedRoute === routeIndex.toString() ? null : routeIndex.toString());
  };

  if (routes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Route className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No public transport routes found. Please check your locations and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Public Transport Routes</h3>
      
      {routes.map((route, index) => {
        const routeType = getRouteType(route, index);
        const isSelected = selectedRoute === route;
        const isExpanded = expandedRoute === index.toString();
        const transfers = countTransfers(route.legs[0]?.steps || []);
        const departureTime = route.legs[0]?.departure_time;
        const arrivalTime = route.legs[0]?.arrival_time;
        
        return (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onRouteSelect(route)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={routeType.color}>
                    {routeType.label}
                  </Badge>
                  <span className="font-medium text-lg">
                    {formatDuration(route.duration)}
                  </span>
                  <span className="text-gray-600">
                    {formatDistance(route.distance)}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {transfers} transfer{transfers !== 1 ? 's' : ''}
                  </p>
                  {route.duration_in_traffic && (
                    <p className="text-xs text-orange-600">
                      +{formatDuration(route.duration_in_traffic)} in traffic
                    </p>
                  )}
                </div>
              </div>

              {/* Timing Information */}
              {departureTime && arrivalTime && (
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Depart: {formatTime(departureTime)}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Arrive: {formatTime(arrivalTime)}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{route.legs[0]?.start_address}</span>
                </div>
                <div className="flex-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <Bus className="h-4 w-4" />
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{route.legs[0]?.end_address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(index);
                  }}
                >
                  {isExpanded ? 'Hide' : 'Show'} Details
                </Button>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>Real-time schedules</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">Route Steps</h4>
                  <div className="space-y-3">
                    {route.legs[0]?.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {stepIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`${getTransportColor(step.travel_mode)}`}>
                              {getTransportIcon(step.travel_mode)}
                            </div>
                            <span className="font-medium">
                              {step.travel_mode === 'TRANSIT' ? 'Public Transport' : step.travel_mode}
                            </span>
                            {step.transit_details && (
                              <Badge variant="outline" className="text-xs">
                                {step.transit_details.line.name}
                              </Badge>
                            )}
                          </div>
                          
                          {step.transit_details && (
                            <div className="text-xs text-gray-600 mb-1">
                              <div className="flex items-center gap-2">
                                <span>From: {step.transit_details.departure_stop.name}</span>
                                <ArrowRight className="h-3 w-3" />
                                <span>To: {step.transit_details.arrival_stop.name}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span>Depart: {formatTime(step.transit_details.departure_time)}</span>
                                <span>Arrive: {formatTime(step.transit_details.arrival_time)}</span>
                                <span>{step.transit_details.num_stops} stops</span>
                              </div>
                            </div>
                          )}
                          
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: step.html_instructions 
                            }}
                            className="text-gray-700 mb-1"
                          />
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatDistance(step.distance)}</span>
                            <span>{formatDuration(step.duration)}</span>
                            {step.departure_time && (
                              <span>Depart: {formatTime(step.departure_time)}</span>
                            )}
                            {step.arrival_time && (
                              <span>Arrive: {formatTime(step.arrival_time)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
