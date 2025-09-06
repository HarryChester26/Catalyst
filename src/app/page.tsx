"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Train, AlertCircle, MapPin, Route, User, LogIn, Users, Clock, Zap, RefreshCw } from 'lucide-react';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState('occupancy');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [departureTime, setDepartureTime] = useState('now');
  const [isPlanning, setIsPlanning] = useState(false);
  const [tripOptions, setTripOptions] = useState<any[]>([]);

  // Mock data for occupancy
  const mockTramData = [
    {
      id: '001',
      route: '1',
      destination: 'East Coburg',
      occupancy: 25,
      nextStops: ['Flinders St', 'Melbourne Central', 'Carlton'],
      estimatedArrival: '3 min',
      lastUpdated: '2 min ago',
      userReports: 12
    },
    {
      id: '002',
      route: '3',
      destination: 'Melbourne University',
      occupancy: 80,
      nextStops: ['Collins St', 'Spring St', 'Parliament'],
      estimatedArrival: '5 min',
      lastUpdated: '1 min ago',
      userReports: 8
    },
    {
      id: '003',
      route: '5',
      destination: 'Malvern',
      occupancy: 45,
      nextStops: ['Bourke St', 'Richmond', 'South Yarra'],
      estimatedArrival: '7 min',
      lastUpdated: '3 min ago',
      userReports: 15
    },
    {
      id: '004',
      route: '96',
      destination: 'St Kilda Beach',
      occupancy: 15,
      nextStops: ['Spencer St', 'South Melbourne', 'Albert Park'],
      estimatedArrival: '4 min',
      lastUpdated: '1 min ago',
      userReports: 6
    }
  ];

  // Mock trip options
  const mockTripOptions = [
    {
      id: '1',
      routes: ['Walk', '86'],
      duration: '32 min',
      transfers: 0,
      walking: '8 min',
      crowdingLevel: 25,
      disruptions: [],
      cost: '$4.60',
      departureTime: '2:15 PM',
      arrivalTime: '2:47 PM',
      steps: [
        { type: 'walk', description: 'Walk to Bourke St/Spencer St', duration: '5 min' },
        { type: 'tram', description: 'Take Route 86 to Bundoora RMIT', duration: '24 min', route: '86', crowdingLevel: 25 },
        { type: 'walk', description: 'Walk to destination', duration: '3 min' }
      ]
    },
    {
      id: '2',
      routes: ['Walk', '19', '86'],
      duration: '28 min',
      transfers: 1,
      walking: '12 min',
      crowdingLevel: 65,
      disruptions: ['Route 19 experiencing minor delays'],
      cost: '$4.60',
      departureTime: '2:18 PM',
      arrivalTime: '2:46 PM',
      steps: [
        { type: 'walk', description: 'Walk to Elizabeth St/Flinders St', duration: '4 min' },
        { type: 'tram', description: 'Take Route 19 to North Coburg', duration: '12 min', route: '19', crowdingLevel: 70 },
        { type: 'walk', description: 'Transfer to Route 86', duration: '3 min' },
        { type: 'tram', description: 'Take Route 86 to Bundoora RMIT', duration: '6 min', route: '86', crowdingLevel: 60 },
        { type: 'walk', description: 'Walk to destination', duration: '5 min' }
      ]
    }
  ];

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy < 30) return 'bg-green-500';
    if (occupancy < 60) return 'bg-yellow-500';
    if (occupancy < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getOccupancyLabel = (occupancy: number) => {
    if (occupancy < 30) return 'Low';
    if (occupancy < 60) return 'Medium';
    if (occupancy < 80) return 'High';
    return 'Very High';
  };

  const getOccupancyBadgeVariant = (occupancy: number): "default" | "secondary" | "destructive" | "outline" => {
    if (occupancy < 30) return 'default';
    if (occupancy < 60) return 'secondary';
    if (occupancy < 80) return 'outline';
    return 'destructive';
  };

  const getCrowdingColor = (level: number) => {
    if (level < 30) return 'text-green-600';
    if (level < 60) return 'text-yellow-600';
    if (level < 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCrowdingLabel = (level: number) => {
    if (level < 30) return 'Low';
    if (level < 60) return 'Medium';
    if (level < 80) return 'High';
    return 'Very High';
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'walk': return '���';
      case 'tram': return '���';
      case 'train': return '���';
      case 'bus': return '���';
      default: return '���';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">PTV Smart Transit</h1>
              <p className="text-muted-foreground">
                Real-time occupancy tracking and smart transit assistance
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/signin">
                <Button variant="outline" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="occupancy" className="flex items-center gap-2">
              <Train className="h-4 w-4" />
              <span className="hidden sm:inline">Occupancy</span>
            </TabsTrigger>
            <TabsTrigger value="disruptions" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Disruptions</span>
            </TabsTrigger>
            <TabsTrigger value="stops" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Stop Demand</span>
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Trip Planner</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Occupancy Tab */}
          <TabsContent value="occupancy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  Real-time Tram Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by stop name..."
                      className="w-full"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      <SelectItem value="1">Route 1</SelectItem>
                      <SelectItem value="3">Route 3</SelectItem>
                      <SelectItem value="5">Route 5</SelectItem>
                      <SelectItem value="96">Route 96</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {mockTramData.map((tram) => (
                <Card key={tram.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                          Route {tram.route}
                        </Badge>
                        <div>
                          <p className="font-medium">{tram.destination}</p>
                          <p className="text-sm text-muted-foreground">Arrives in {tram.estimatedArrival}</p>
                        </div>
                      </div>
                      <Badge variant={getOccupancyBadgeVariant(tram.occupancy)}>
                        {getOccupancyLabel(tram.occupancy)}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Occupancy
                        </span>
                        <span className="text-sm">{Math.round(tram.occupancy)}%</span>
                      </div>
                      <Progress value={tram.occupancy} className="h-2" />
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Next stops:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tram.nextStops.slice(0, 3).map((stop, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {stop}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {tram.lastUpdated}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {tram.userReports} user reports
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Disruptions Tab */}
          <TabsContent value="disruptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Report Service Disruption
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    Help other passengers by reporting service disruptions instantly
                  </p>
                  <Button className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Report Disruption
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Disruptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">⏰</div>
                          <div>
                            <h4 className="font-medium">Route 86</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Bourke St / Swanston St
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive">active</Badge>
                      </div>
                      <p className="mb-3">Tram stuck behind broken down car, significant delays expected</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            5 min ago
                          </span>
                          <span>by Sarah M.</span>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          12
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stop Demand Tab */}
          <TabsContent value="stops" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Stop Demand Predictor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input placeholder="Search stops..." />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      <SelectItem value="1">Route 1</SelectItem>
                      <SelectItem value="3">Route 3</SelectItem>
                      <SelectItem value="5">Route 5</SelectItem>
                      <SelectItem value="96">Route 96</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Flinders Street Station</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">1</Badge>
                        <Badge variant="outline" className="text-xs">3</Badge>
                        <Badge variant="outline" className="text-xs">5</Badge>
                        <Badge variant="outline" className="text-xs">6</Badge>
                        <Badge variant="outline" className="text-xs">16</Badge>
                        <Badge variant="outline" className="text-xs">+3</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">Very High</Badge>
                      <p className="text-sm text-muted-foreground mt-1">85% busy</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Current Demand</span>
                      <span className="text-sm font-medium text-red-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">15 min</p>
                      <p className="text-sm font-medium text-red-600">90%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">30 min</p>
                      <p className="text-sm font-medium text-orange-600">75%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">60 min</p>
                      <p className="text-sm font-medium text-yellow-600">60%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        156 check-ins
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last: 2 min ago
                      </span>
                    </div>
                    <Button size="sm" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Check In (+5 pts)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trip Planner Tab */}
          <TabsContent value="planner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Smart Trip Planner
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
                  {isPlanning ? 'Planning your trip...' : 'Plan Trip'}
                </Button>
              </CardContent>
            </Card>

            {/* Trip Options */}
            {tripOptions.length > 0 && (
              <div className="space-y-4">
                <h3>Trip Options</h3>

                {tripOptions.map((option, index) => (
                  <Card key={option.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={index === 0 ? 'default' : 'secondary'}>
                            {index === 0 ? 'Recommended' : `Option ${index + 1}`}
                          </Badge>
                          <span className="font-medium">{option.duration}</span>
                          <span className="text-muted-foreground">• {option.cost}</span>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
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
                        {option.steps.map((step: any, stepIndex: number) => (
                          <div key={stepIndex} className="flex items-center gap-3">
                            <div className="flex-shrink-0 text-lg">
                              {getTransportIcon(step.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{step.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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

                      <div className="flex items-center gap-6 text-xs text-muted-foreground mt-4 pt-3 border-t">
                        <span>{option.transfers} transfer{option.transfers !== 1 ? 's' : ''}</span>
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Welcome to Smart PT</h3>
                  <p className="text-muted-foreground mb-4">
                    Sign in to access your personalized dashboard and earn points for helping the community.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button variant="outline">
                      Sign Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
