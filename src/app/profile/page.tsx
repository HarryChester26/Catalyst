"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, LogIn, UserPlus, Award, MapPin, Clock, Settings } from "lucide-react";

interface Activity {
  type: string;
  description: string;
  time: string;
}

interface UserData {
  name: string;
  email: string;
  points: number;
  level: string;
  nextLevelPoints: number;
  totalTrips: number;
  reportsSubmitted: number;
  favoriteRoutes: string[];
  recentActivity: Activity[];
}

export default function ProfilePage() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const userData: UserData = {
    name: "John Doe",
    email: "john.doe@example.com",
    points: 1250,
    level: "Explorer",
    nextLevelPoints: 250,
    totalTrips: 45,
    reportsSubmitted: 12,
    favoriteRoutes: ["86", "19", "96"],
    recentActivity: [
      { type: "trip", description: "Trip from Flinders St to St Kilda", time: "2 hours ago" },
      { type: "report", description: "Reported delay on Route 86", time: "1 day ago" },
      { type: "trip", description: "Trip from CBD to Carlton", time: "2 days ago" }
    ]
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Explorer": return "text-blue-600";
      case "Navigator": return "text-purple-600";
      case "Expert": return "text-gold-600";
      default: return "text-gray-600";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "trip": return "⚠️";
      case "report": return "⚠️";
      case "achievement": return "⚠️";
      default: return "⚠️";
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
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
                  <p className="text-gray-600 mb-4">
                    Sign in to access your personalized dashboard and earn points for helping the community.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setIsSignedIn(true)}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Your personalized transit dashboard</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{userData.name}</h3>
                  <p className="text-gray-600">{userData.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={getLevelColor(userData.level)}>
                      <Award className="h-3 w-3 mr-1" />
                      {userData.level}
                    </Badge>
                    <span className="text-sm text-gray-600">{userData.points} points</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Points Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Level: Navigator</span>
                  <span className="text-sm text-gray-600">{userData.nextLevelPoints} points to go</span>
                </div>
                <Progress value={80} className="h-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Explorer</span>
                  <span>Navigator</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{userData.totalTrips}</div>
                <div className="text-sm text-gray-600">Total Trips</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{userData.reportsSubmitted}</div>
                <div className="text-sm text-gray-600">Reports Submitted</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{userData.points}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Favorite Routes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {userData.favoriteRoutes.map((route) => (
                  <Badge key={route} variant="outline" className="px-3 py-1">
                    Route {route}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
