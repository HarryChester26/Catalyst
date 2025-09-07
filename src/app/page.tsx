"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Check } from 'lucide-react';
import GoogleMap from '@/components/GoogleMap';
import { useState, useEffect } from 'react';
import { DisruptionReportWithUser } from '@/types/disruption';
import { createInspectorMarkers } from '@/lib/inspector-utils';

export default function HomePage() {
  const [inspectorMarkers, setInspectorMarkers] = useState<google.maps.Marker[]>([]);

  // Fetch disruptions with inspector data
  useEffect(() => {
    const fetchInspectorReports = async () => {
      try {
        const response = await fetch('/api/disruptions');
        if (response.ok) {
          const data = await response.json();
          const disruptions: DisruptionReportWithUser[] = data.disruptions || [];
          
          // Create inspector markers from disruptions
          if (window.google?.maps) {
            const markers = createInspectorMarkers(disruptions);
            setInspectorMarkers(markers);
          }
        }
      } catch (error) {
        console.error('Error fetching inspector reports:', error);
      }
    };

    // Wait for Google Maps to load
    const checkGoogleMaps = () => {
      if (window.google?.maps) {
        fetchInspectorReports();
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

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
        </div>

        {/* CTA Section with Melbourne Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Text content */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Commute?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of commuters who are making public transport smarter and more efficient across Melbourne's extensive network.
            </p>
            
            {/* Benefits List */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">AI-powered trip planning with real-time updates</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Live disruption alerts and alternative routes</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Interactive maps with Melbourne's full transport network</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Community-driven disruption reporting</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">24/7 AI assistant for instant help</span>
              </div>
            </div>

            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Today
              </Button>
            </Link>
          </div>
          
          {/* Right side - Google Map */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-2xl h-[500px] rounded-2xl shadow-2xl overflow-hidden border-4 border-white">
              <GoogleMap inspectorMarkers={inspectorMarkers} />
            </div>
          </div>
        </div>

        {/* From the Founder Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mt-16 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left side - Team Photos */}
              <div className="flex flex-col items-center space-y-6">
                {/* Founder - Top */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <img 
                      src="https://scontent.fmel18-1.fna.fbcdn.net/v/t39.30808-6/480739130_1181732696931822_3010294435432537403_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=i_V7D-W4aXwQ7kNvwGYmSg2&_nc_oc=AdnLhPJQXqurL-AUtJak-T1NKgvyFFrV_fNLpcbaU47wwWaCEsVBxpIAwxU7fAr4W5o&_nc_zt=23&_nc_ht=scontent.fmel18-1.fna&_nc_gid=BFrnBw1gkc0oMBNw12powA&oh=00_Afa4I2XzJJbCzgGBwBO9LCCDbXZ9QZ0ekTiZopdcdWdTGg&oe=68C2C552"
                      alt="Smart PT Founder"
                      className="w-48 h-48 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Founder</h4>
                </div>

                {/* Co-founders - Bottom */}
                <div className="flex gap-8 items-center">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <img 
                        src="https://instagram.fhan3-4.fna.fbcdn.net/v/t1.15752-9/543316526_750697641466266_1574407384576770719_n.jpg?stp=dst-jpg_p480x480_tt6&_nc_cat=104&ccb=1-7&_nc_sid=0024fc&_nc_ohc=3Nmp6AWnJCwQ7kNvwHMzYC0&_nc_oc=AdmaaDzVNpfnGbf5QXl8L2dq-VILVdkN9Y0WcXnGDBisTzRE-eJljolMcIJoc_MEcWGc3FGkCOSg0O68EdXfMzWT&_nc_zt=23&_nc_ht=instagram.fhan3-4.fna&oh=03_Q7cD3QEbtCxdbhTPH9qE6tSmT9smnQbGrhIn1AtdSSb_qWbF9w&oe=68E4785E"
                        alt="Smart PT Co-Founder 1"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                      />
                    </div>
                    <h4 className="text-xs font-semibold">Co-Founder</h4>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <img 
                        src="https://scontent.fhan4-3.fna.fbcdn.net/v/t1.15752-9/541532378_808148234997012_1777521350726403300_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=100&ccb=1-7&_nc_sid=0024fc&_nc_ohc=3WzzQ2I7UmQQ7kNvwGJxqRF&_nc_oc=AdmaP2SW0cLFdnfPKlCxRz9g6dLRZGXUWkhER1SbcADMWlJ-nxYHrOkHltQHsZM5smrzDjzNovuJXh9VDeb9Bs81&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.fhan4-3.fna&oh=03_Q7cD3QEbks45_c7zssrwVIobdNgq87xOOTqFHEJpVSXyQGSl6Q&oe=68E472D0"
                        alt="Smart PT Co-Founder 2"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                      />
                    </div>
                    <h4 className="text-xs font-semibold">Co-Founder</h4>
                  </div>
                </div>
              </div>
              
              {/* Right side - Founder Message */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">From the founder and co-founder</h3>
                <div className="space-y-4 text-lg leading-relaxed">
                  <p>
                    Hey there! We've spent years navigating Melbourne's public transport system, 
                    experiencing the same frustrations you face daily - missed connections, unexpected delays, 
                    and the constant uncertainty of "will the Tram actually show up?"
                  </p>
                  <p>
                    That's why we created Smart PT. 
                    We wanted to build something that would make public transport actually work for people, 
                    not against them.
                  </p>
                  <p>
                    Since launching, <strong>over 10,000 commuters</strong> across Melbourne have joined our platform, 
                    and many of them now enjoy stress-free commutes with real-time updates, 
                    AI-powered route optimization, and a community that helps each other navigate disruptions.
                  </p>
                  <p className="text-blue-100">
                    Hope you enjoy using the website,<br />
                    <span className="font-semibold">The Smart PT Team</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Making Transit Smarter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Bot className="text-6xl text-green-600" />
              </div>
              <div className="text-gray-600">AI Assistant</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
