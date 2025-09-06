"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Route, Clock, Users, Zap } from "lucide-react";

interface TripStep {
  type: string;
  description: string;
  duration: string;
  route?: string;
  crowdingLevel?: number;
}

interface TripOption {
  id: string;
  routes: string[];
  duration: string;
  transfers: number;
  walking: string;
  crowdingLevel: number;
  disruptions: string[];
  cost: string;
  departureTime: string;
  arrivalTime: string;
  steps: TripStep[];
}

export default function TripPlannerPage() {
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("now");
  const [isPlanning, setIsPlanning] = useState(false);
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);

  const mockTripOptions: TripOption[] = [
    {
      id: "1",
      routes: ["Walk", "86"],
      duration: "32 min",
      transfers: 0,
      walking: "8 min",
      crowdingLevel: 25,
      disruptions: [],
      cost: "$4.60",
      departureTime: "2:15 PM",
      arrivalTime: "2:47 PM",
      steps: [
        { type: "walk", description: "Walk to Bourke St/Spencer St", duration: "5 min" },
        { type: "tram", description: "Take Route 86 to Bundoora RMIT", duration: "24 min", route: "86", crowdingLevel: 25 },
        { type: "walk", description: "Walk to destination", duration: "3 min" }
      ]
    },
    {
      id: "2",
      routes: ["Walk", "19", "86"],
      duration: "28 min",
      transfers: 1,
      walking: "12 min",
      crowdingLevel: 65,
      disruptions: ["Route 19 experiencing minor delays"],
      cost: "$4.60",
      departureTime: "2:18 PM",
      arrivalTime: "2:46 PM",
      steps: [
        { type: "walk", description: "Walk to Elizabeth St/Flinders St", duration: "4 min" },
        { type: "tram", description: "Take Route 19 to North Coburg", duration: "12 min", route: "19", crowdingLevel: 70 },
        { type: "walk", description: "Transfer to Route 86", duration: "3 min" },
        { type: "tram", description: "Take Route 86 to Bundoora RMIT", duration: "6 min", route: "86", crowdingLevel: 60 },
        { type: "walk", description: "Walk to destination", duration: "5 min" }
      ]
    }
  ];

  const getCrowdingColor = (level: number) => {
    if (level < 30) return "text-green-600";
    if (level < 60) return "text-yellow-600";
    if (level < 80) return "text-orange-600";
    return "text-red-600";
  };

  const getCrowdingLabel = (level: number) => {
    if (level < 30) return "Low";
    if (level < 60) return "Medium";
    if (level < 80) return "High";
    return "Very High";
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case "walk": return "⚠️";
      case "tram": return "⚠️";
      case "train": return "⚠️";
      case "bus": return "⚠️";
      default: return "⚠️";
    }
  };

  const handlePlanTrip = async () => {
    if (!fromLocation || !toLocation) return;

    setIsPlanning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTripOptions(mockTripOptions);
    setIsPlanning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trip Planner</h1>
          <p className="text-gray-600">Plan your journey with real-time data and smart recommendations</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Plan Your Trip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">From</label>
                  <Input
                    placeholder="Current location or address"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">To</label>
                  <Input
                    placeholder="Destination address"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Departure Time</label>
                  <Select value={departureTime} onValueChange={setDepartureTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="When do you want to leave?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Leave Now</SelectItem>
                      <SelectItem value="15min">In 15 minutes</SelectItem>
                      <SelectItem value="30min">In 30 minutes</SelectItem>
                      <SelectItem value="1hour">In 1 hour</SelectItem>
                      <SelectItem value="custom">Custom Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handlePlanTrip}
                disabled={!fromLocation || !toLocation || isPlanning}
                className="w-full"
              >
                {isPlanning ? "Planning your trip..." : "Plan Trip"}
              </Button>
            </CardContent>
          </Card>

          {tripOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Trip Options</h3>

              {tripOptions.map((option, index) => (
                <Card key={option.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index === 0 ? "Recommended" : `Option ${index + 1}`}
                        </Badge>
                        <span className="font-medium">{option.duration}</span>
                        <span className="text-gray-600">• {option.cost}</span>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {option.departureTime} → {option.arrivalTime}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${getCrowdingColor(option.crowdingLevel)}`}>
                            <Users className="h-3 w-3 inline mr-1" />
                            {getCrowdingLabel(option.crowdingLevel)} crowding
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {option.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-3">
                          <div className="flex-shrink-0 text-lg">
                            {getTransportIcon(step.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{step.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {step.duration}
                              </span>
                              {step.route && (
                                <Badge variant="outline" className="text-xs">
                                  Route {step.route}
                                </Badge>
                              )}
                              {step.crowdingLevel !== undefined && (
                                <span className={`flex items-center gap-1 ${getCrowdingColor(step.crowdingLevel)}`}>
                                  <Users className="h-3 w-3" />
                                  {getCrowdingLabel(step.crowdingLevel)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-xs text-gray-600 mt-4 pt-3 border-t">
                      <span>{option.transfers} transfer{option.transfers !== 1 ? "s" : ""}</span>
                      <span>{option.walking} walking</span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Based on real-time data
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
