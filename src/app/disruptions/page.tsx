"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MapPin, Clock, Users, Plus } from "lucide-react";

interface Disruption {
  id: string;
  route: string;
  location: string;
  type: string;
  severity: string;
  description: string;
  reportedBy: string;
  timeAgo: string;
  confirmations: number;
  status: string;
}

export default function DisruptionsPage() {
  const [showReportForm, setShowReportForm] = useState(false);

  const disruptions: Disruption[] = [
    {
      id: "1",
      route: "86",
      location: "Bourke St / Swanston St",
      type: "delay",
      severity: "high",
      description: "Tram stuck behind broken down car, significant delays expected",
      reportedBy: "Sarah M.",
      timeAgo: "5 min ago",
      confirmations: 12,
      status: "active"
    },
    {
      id: "2",
      route: "19",
      location: "Elizabeth St / Flinders St",
      type: "service_change",
      severity: "medium",
      description: "Route 19 experiencing minor delays due to roadworks",
      reportedBy: "Mike T.",
      timeAgo: "15 min ago",
      confirmations: 8,
      status: "active"
    },
    {
      id: "3",
      route: "96",
      location: "St Kilda Beach",
      type: "cancellation",
      severity: "high",
      description: "Service suspended due to track maintenance",
      reportedBy: "PTV Official",
      timeAgo: "1 hour ago",
      confirmations: 25,
      status: "resolved"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "outline";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high": return "High Impact";
      case "medium": return "Medium Impact";
      case "low": return "Low Impact";
      default: return "Unknown";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "delay": return "⏰";
      case "service_change": return "��";
      case "cancellation": return "❌";
      default: return "⚠️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Disruptions</h1>
          <p className="text-gray-600">Real-time updates on public transport disruptions</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Report a Disruption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  Help other passengers by reporting service disruptions instantly
                </p>
                <Button 
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
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
                {disruptions.map((disruption) => (
                  <Card 
                    key={disruption.id} 
                    className={`border-l-4 ${
                      disruption.severity === "high" ? "border-l-red-500" : 
                      disruption.severity === "medium" ? "border-l-yellow-500" : 
                      "border-l-green-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getTypeIcon(disruption.type)}</div>
                          <div>
                            <h4 className="font-medium">Route {disruption.route}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {disruption.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(disruption.severity)}>
                            {getSeverityLabel(disruption.severity)}
                          </Badge>
                          <Badge variant={disruption.status === "active" ? "destructive" : "secondary"}>
                            {disruption.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="mb-3">{disruption.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {disruption.timeAgo}
                          </span>
                          <span>by {disruption.reportedBy}</span>
                        </div>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {disruption.confirmations}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
