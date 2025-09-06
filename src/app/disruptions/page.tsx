"use client";

import { MdTram } from "react-icons/md";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin, Clock, Users, Plus, X, RefreshCw } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { 
  DisruptionReportWithUser, 
  DisruptionFormData, 
  DISRUPTION_TYPES, 
  DISRUPTION_SEVERITIES 
} from "@/types/disruption";

// Legacy interface for backward compatibility - will be removed
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

export default function DisruptionsPage() {
  const { user, isAuthenticated } = useUser();
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState<DisruptionFormData>({
    route: "",
    location: "",
    type: "",
    severity: "",
    description: ""
  });
  const [inspectorNear, setInspectorNear] = useState(false);
  const [inspectorReports, setInspectorReports] = useState<Set<string>>(new Set());

  // Database disruptions state
  const [disruptions, setDisruptions] = useState<DisruptionReportWithUser[]>([]);

  // Fetch disruptions from database
  const fetchDisruptions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching disruptions from API...');
      
      const response = await fetch('/api/disruptions');
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch disruptions (${response.status})`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      // Group disruptions by route and location to show confirmations
      const groupedDisruptions = data.disruptions.reduce((acc: any, disruption: DisruptionReportWithUser) => {
        const key = `${disruption.route_number}-${disruption.location}`;
        
        if (!acc[key]) {
          acc[key] = {
            ...disruption,
            confirmations: 1,
            status: 'active'
          };
        } else {
          acc[key].confirmations += 1;
          // Update to higher severity if needed
          const severityLevels = { low: 1, medium: 2, high: 3 };
          const currentLevel = severityLevels[acc[key].severity as keyof typeof severityLevels] || 1;
          const newLevel = severityLevels[disruption.severity as keyof typeof severityLevels] || 1;
          
          if (newLevel > currentLevel) {
            acc[key].severity = disruption.severity;
          }
          
          // Update description if longer
          if (disruption.description.length > acc[key].description.length) {
            acc[key].description = disruption.description;
          }
        }
        
        return acc;
      }, {});
      
      const processedDisruptions = Object.values(groupedDisruptions).map((disruption: any) => ({
        ...disruption,
        time_ago: getTimeAgo(disruption.created_at)
      }));
      
      setDisruptions(processedDisruptions);
    } catch (error) {
      console.error('Error fetching disruptions:', error);
      setDisruptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Check database status and load disruptions on component mount
  useEffect(() => {
    checkDatabaseStatus();
    loadInspectorReports();
  }, []);

  // Load inspector reports from localStorage
  const loadInspectorReports = () => {
    try {
      const stored = localStorage.getItem('inspectorReports');
      if (stored) {
        setInspectorReports(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Error loading inspector reports:', error);
    }
  };

  // Save inspector reports to localStorage
  const saveInspectorReports = (reports: Set<string>) => {
    try {
      localStorage.setItem('inspectorReports', JSON.stringify(Array.from(reports)));
    } catch (error) {
      console.error('Error saving inspector reports:', error);
    }
  };

  // Suppress ResizeObserver warnings
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed with undelivered notifications')) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Check if database is set up properly
  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/disruptions/status');
      const status = await response.json();
      
      console.log('Database status:', status);
      
      if (status.status === 'ready') {
        console.log('Database is ready, fetching disruptions...');
        await fetchDisruptions();
      } else {
        console.log('Database not ready, showing empty state');
        setDisruptions([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDisruptions([]);
      setIsLoading(false);
    }
  };

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
      if (!isAuthenticated || !user?.id) {
        throw new Error("You must be signed in to report disruptions");
      }

      // Validate form data
      if (!formData.route || !formData.location || !formData.type || !formData.severity || !formData.description) {
        throw new Error("Please fill in all required fields");
      }

      // Submit to database API
      const response = await fetch('/api/disruptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route_number: formData.route,
            location: formData.location,
            severity: formData.severity,
            description: formData.description,
          disruption: formData.type,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit disruption report');
      }

      setSubmitSuccess(true);
      setSuccessMessage("✅ Disruption report submitted successfully!");
      
      // If inspector was nearby, mark this report
      if (inspectorNear) {
        const reportKey = `${formData.route}-${formData.location}-${Date.now()}`;
        const newInspectorReports = new Set(inspectorReports);
        newInspectorReports.add(reportKey);
        setInspectorReports(newInspectorReports);
        saveInspectorReports(newInspectorReports);
      }
      
      // Reset form
      setFormData({
        route: "",
        location: "",
        type: "",
        severity: "",
        description: ""
      });
      setInspectorNear(false);

      // Refresh disruptions list
      await fetchDisruptions();

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

  const handleInputChange = (field: keyof DisruptionFormData, value: string) => {
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

  // Check if a disruption should be highlighted as inspector report
  const isInspectorReport = (disruption: any): boolean => {
    // Check if this disruption matches any inspector report
    const reportKey = `${disruption.route_number}-${disruption.location}`;
    return Array.from(inspectorReports).some(key => key.startsWith(reportKey));
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

                  {inspectorNear && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">⚠️ Inspector Alert:</span>
                      <span>This report will be flagged as having an inspector nearby for priority handling.</span>
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
                            {DISRUPTION_TYPES.map((type) => (
                              <SelectItem
                                key={type.value}
                                value={type.value}
                                className="hover:bg-blue-50 hover:scale-105 transition-all duration-200 cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{type.icon}</span>
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
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
                            {DISRUPTION_SEVERITIES.map((severity) => (
                              <SelectItem
                                key={severity.value}
                                value={severity.value}
                                className={`hover:bg-${severity.color}-50 hover:scale-105 transition-all duration-200 cursor-pointer`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{severity.icon}</span>
                                  <span>{severity.label}</span>
                                </div>
                              </SelectItem>
                            ))}
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

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inspectorNear"
                        checked={inspectorNear}
                        onChange={(e) => setInspectorNear(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inspectorNear" className="text-sm font-medium text-gray-700">
                        Inspector is nearby
                      </label>
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
              <div className="flex items-center justify-between">
                <CardTitle>Current Disruptions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDisruptions}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading disruptions...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Database disruptions */}
                  {disruptions.map((disruption) => (
                    <Card
                      key={disruption.id}
                      className={`border-l-4 ${isInspectorReport(disruption) ? "border-l-red-600 bg-red-50" :
                        disruption.severity === "high" ? "border-l-red-500" :
                        disruption.severity === "medium" ? "border-l-yellow-500" :
                          "border-l-green-500"
                        }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getTypeIcon(disruption.disruption)}</div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">Route {disruption.route_number}</h4>
                                {isInspectorReport(disruption) && (
                                  <div className="flex items-center gap-1 text-red-600">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-xs font-medium">Inspector Nearby</span>
                                  </div>
                                )}
                              </div>
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
                              {disruption.time_ago}
                            </span>
                            <span>by {disruption.reported_by}</span>
                          </div>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {disruption.confirmations}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {disruptions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No disruptions reported yet.</p>
                      <p className="text-sm">Be the first to report a disruption!</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
