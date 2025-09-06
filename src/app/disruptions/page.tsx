"use client";

import { MdTram } from "react-icons/md";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin, Clock, Users, Plus, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface Disruption {
  id: string;
  route: string;
  location: string;
  type: string;
  severity: string;
  description: string;
  reportedBy: string;
  reportedByEmail?: string;
  timeAgo: string;
  confirmations: number;
  status: string;
  createdAt?: string;
}

interface ReportFormData {
  route: string;
  location: string;
  type: string;
  severity: string;
  description: string;
}

export default function DisruptionsPage() {
  const { user, isAuthenticated } = useUser();
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState<ReportFormData>({
    route: "",
    location: "",
    type: "",
    severity: "",
    description: ""
  });

  // Convert disruptions to state so we can update the UI
  const [disruptions, setDisruptions] = useState<Disruption[]>([
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
  ]);

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
      case "cancellation": return "❌";
      default: return <MdTram size={34} color='purple' />;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      if (!isAuthenticated) {
        throw new Error("You must be signed in to report disruptions");
      }

      // Validate form data
      if (!formData.route || !formData.location || !formData.type || !formData.severity || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      // Check if there's already a disruption for the same route and location
      setDisruptions(prevDisruptions => {
        const existingDisruptionIndex = prevDisruptions.findIndex(
          disruption =>
            disruption.route.toLowerCase() === formData.route.toLowerCase() &&
            disruption.location.toLowerCase() === formData.location.toLowerCase() &&
            disruption.status === "active"
        );

        if (existingDisruptionIndex !== -1) {
          // Update existing disruption - increase confirmations
          const updatedDisruptions = [...prevDisruptions];
          const existingDisruption = updatedDisruptions[existingDisruptionIndex];

          updatedDisruptions[existingDisruptionIndex] = {
            ...existingDisruption,
            confirmations: existingDisruption.confirmations + 1,
            // Update severity if the new report has higher severity
            severity: getHigherSeverity(existingDisruption.severity, formData.severity),
            // Update description if the new one is more detailed (longer)
            description: formData.description.length > existingDisruption.description.length
              ? formData.description
              : existingDisruption.description,
            timeAgo: "Just now" // Update timestamp to show recent activity
          };

          console.log("Updated existing disruption with new confirmation:", updatedDisruptions[existingDisruptionIndex]);
          setSuccessMessage("✅ Confirmation added to existing disruption!");
          return updatedDisruptions;
        } else {
          // Create new disruption report
          const newDisruption: Disruption = {
            id: Date.now().toString(),
            route: formData.route,
            location: formData.location,
            type: formData.type,
            severity: formData.severity,
            description: formData.description,
            reportedBy: user?.email?.split('@')[0] || "Anonymous",
            reportedByEmail: user?.email,
            timeAgo: "Just now",
            confirmations: 1, // Start with 1 confirmation (the reporter)
            status: "active",
            createdAt: new Date().toISOString()
          };

          console.log("New disruption report:", newDisruption);
          setSuccessMessage("✅ New disruption report submitted successfully!");
          return [newDisruption, ...prevDisruptions]; // Add to the top of the list
        }
      });

      setSubmitSuccess(true);
      setFormData({
        route: "",
        location: "",
        type: "",
        severity: "",
        description: ""
      });

      // Hide form after 2 seconds
      setTimeout(() => {
        setShowReportForm(false);
        setSubmitSuccess(false);
        setSuccessMessage("");
      }, 2000);

    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ReportFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to determine higher severity
  const getHigherSeverity = (current: string, newSeverity: string): string => {
    const severityLevels = { low: 1, medium: 2, high: 3 };
    const currentLevel = severityLevels[current as keyof typeof severityLevels] || 1;
    const newLevel = severityLevels[newSeverity as keyof typeof severityLevels] || 1;

    return newLevel > currentLevel ? newSeverity : current;
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
              {!showReportForm ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">
                    Help other passengers by reporting service disruptions instantly
                  </p>
                  {!isAuthenticated && (
                    <p className="text-sm text-amber-600 mb-4">
                      You need to be signed in to report disruptions
                    </p>
                  )}
                  <Button
                    onClick={() => setShowReportForm(true)}
                    disabled={!isAuthenticated}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white border-2 border-black rounded-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    Report Disruption
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Report New Disruption</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReportForm(false);
                        setSubmitError("");
                        setSubmitSuccess(false);
                        setSuccessMessage("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {submitSuccess && (
                    <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                      {successMessage}
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Route Number *
                        </label>
                        <Input
                          placeholder="e.g., 86, 19, 96"
                          value={formData.route}
                          onChange={(e) => handleInputChange("route", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location *
                        </label>
                        <Input
                          placeholder="e.g., Bourke St / Swanston St"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Disruption Type *
                        </label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                          <SelectTrigger className="transition-all duration-300 hover:scale-105 focus:scale-110 focus:shadow-lg focus:shadow-blue-200 focus:z-50 relative">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="z-[100] shadow-2xl border-2 border-blue-200 bg-white [&[data-state=open]]:animate-none [&[data-state=open]]:transform-none [&[data-state=open]]:opacity-100 [&[data-state=closed]]:animate-none [&[data-state=closed]]:transform-none [&[data-state=closed]]:opacity-0">
                            <SelectItem
                              value="delay"
                              className="hover:bg-blue-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">⏰</span>
                                <span>Delay</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="cancellation"
                              className="hover:bg-red-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">❌</span>
                                <span>Service Cancellation</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="service_change"
                              className="hover:bg-yellow-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🔄</span>
                                <span>Service Change</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="track_work"
                              className="hover:bg-orange-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🔧</span>
                                <span>Track Work</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="other"
                              className="hover:bg-gray-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">⚠️</span>
                                <span>Other</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Severity *
                        </label>
                        <Select value={formData.severity} onValueChange={(value) => handleInputChange("severity", value)}>
                          <SelectTrigger className="transition-all duration-300 hover:scale-105 focus:scale-110 focus:shadow-lg focus:shadow-red-200 focus:z-50 relative">
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent className="z-[100] shadow-2xl border-2 border-red-200 bg-white [&[data-state=open]]:animate-none [&[data-state=open]]:transform-none [&[data-state=open]]:opacity-100 [&[data-state=closed]]:animate-none [&[data-state=closed]]:transform-none [&[data-state=closed]]:opacity-0">
                            <SelectItem
                              value="low"
                              className="hover:bg-green-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🟢</span>
                                <span>Low Impact</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="medium"
                              className="hover:bg-yellow-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🟡</span>
                                <span>Medium Impact</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="high"
                              className="hover:bg-red-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">🔴</span>
                                <span>High Impact</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Describe the disruption in detail..."
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Reporting as:</span>
                      <span className="font-medium">{user?.email}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-black hover:bg-gray-800 text-white border-2 border-black rounded-lg font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReportForm(false);
                          setSubmitError("");
                          setSubmitSuccess(false);
                          setSuccessMessage("");
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-2 border-gray-300 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
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
                    className={`border-l-4 ${disruption.severity === "high" ? "border-l-red-500" :
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
