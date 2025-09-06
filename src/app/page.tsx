"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Train, AlertCircle, Route, User, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: Train,
      title: "Real-time Occupancy",
      description: "Track tram occupancy levels in real-time to plan your journey better",
      href: "/disruptions"
    },
    {
      icon: AlertCircle,
      title: "Service Disruptions",
      description: "Report and view current service disruptions affecting your route",
      href: "/disruptions"
    },
    {
      icon: Route,
      title: "Smart Trip Planner",
      description: "Plan your journey with AI-powered recommendations and real-time data",
      href: "/trip-planner"
    },
    {
      icon: User,
      title: "Personal Profile",
      description: "Track your usage, earn points, and access personalized features",
      href: "/profile"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart PT
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent public transport companion. Get real-time updates, 
            plan smarter trips, and help improve the transit experience for everyone.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/trip-planner">
              <Button size="lg" className="flex items-center gap-2">
                Plan Your Trip
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/disruptions">
              <Button variant="outline" size="lg">
                View Disruptions
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} href={feature.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Making Transit Smarter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Trips Planned</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">1K+</div>
              <div className="text-gray-600">Disruptions Reported</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Commute?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of commuters who are making public transport smarter and more efficient.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
