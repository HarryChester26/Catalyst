"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [googleMapsStatus, setGoogleMapsStatus] = useState<string>("Checking...");
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    // Check if Google Maps is loaded
    if (typeof window !== 'undefined') {
      if (window.google?.maps) {
        setGoogleMapsStatus("✅ Google Maps loaded successfully");
      } else {
        setGoogleMapsStatus("❌ Google Maps not loaded");
      }
      
      // Check API key
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      setApiKey(key || "Not set");
    }
  }, []);

  const testGeocoding = async () => {
    if (!window.google?.maps) {
      alert("Google Maps not loaded");
      return;
    }

    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: "Melbourne, Australia" }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          alert(`Geocoding test successful: ${results[0].formatted_address}`);
        } else {
          alert(`Geocoding test failed: ${status}`);
        }
      });
    } catch (error) {
      alert(`Geocoding test error: ${error}`);
    }
  };

  const testDirections = async () => {
    if (!window.google?.maps) {
      alert("Google Maps not loaded");
      return;
    }

    try {
      const directionsService = new google.maps.DirectionsService();
      const request = {
        origin: "Melbourne, Australia",
        destination: "Sydney, Australia",
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          alert(`Directions test successful: ${result.routes[0].summary}`);
        } else {
          alert(`Directions test failed: ${status}`);
        }
      });
    } catch (error) {
      alert(`Directions test error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Google Maps Debug Page</h1>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Status</h2>
            <p><strong>Google Maps:</strong> {googleMapsStatus}</p>
            <p><strong>API Key:</strong> {apiKey}</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Test Functions</h2>
            <div className="space-x-4">
              <button
                onClick={testGeocoding}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Geocoding
              </button>
              <button
                onClick={testDirections}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Directions
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Setup Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-500">Google Cloud Console</a></li>
              <li>Create a new project or select existing one</li>
              <li>Enable "Maps JavaScript API"</li>
              <li>Create an API key</li>
              <li>Update your .env.local file with: <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
