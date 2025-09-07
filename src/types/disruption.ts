// Database types for disruption reports
export interface DatabaseDisruptionReport {
  id: string;
  created_at: string;
  route_number: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  disruption: 'delay' | 'cancellation' | 'service_change' | 'track_work' | 'other';
  user_id: string;
  inspector: boolean; // New field to track if inspector is nearby
}

// Extended disruption report with user information
export interface DisruptionReportWithUser extends DatabaseDisruptionReport {
  reported_by: string;
  reported_by_email?: string;
  confirmations?: number;
  status?: 'active' | 'resolved';
  time_ago?: string;
}

// Form data types
export interface DisruptionFormData {
  route: string;
  location: string;
  type: string;
  severity: string;
  description: string;
  inspector: boolean; // New field for inspector checkbox
}

// API request/response types
export interface SubmitDisruptionRequest {
  route_number: string;
  location: string;
  severity: string;
  description: string;
  disruption: string;
  user_id: string;
  inspector: boolean; // New field for inspector state
}

export interface SubmitDisruptionResponse {
  message: string;
  data: DatabaseDisruptionReport;
}

export interface FetchDisruptionsResponse {
  disruptions: DisruptionReportWithUser[];
  total: number;
}

export interface ConfirmDisruptionRequest {
  disruption_id: string;
  user_id: string;
  severity?: string;
  description?: string;
}

// UI component types
export interface DisruptionCardProps {
  disruption: DisruptionReportWithUser;
  onConfirm?: (disruptionId: string) => void;
  showConfirmButton?: boolean;
}

export interface DisruptionFormProps {
  onSubmit: (data: DisruptionFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
  success?: boolean;
  successMessage?: string;
}

// Utility types
export type DisruptionType = 'delay' | 'cancellation' | 'service_change' | 'track_work' | 'other';
export type DisruptionSeverity = 'low' | 'medium' | 'high';
export type DisruptionStatus = 'active' | 'resolved';

// Constants
export const DISRUPTION_TYPES: { value: DisruptionType; label: string; icon: string }[] = [
  { value: 'delay', label: 'Delay', icon: '⏰' },
  { value: 'cancellation', label: 'Service Cancellation', icon: '❌' },
  { value: 'service_change', label: 'Service Change', icon: '🔄' },
  { value: 'track_work', label: 'Track Work', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '⚠️' }
];

export const DISRUPTION_SEVERITIES: { value: DisruptionSeverity; label: string; icon: string; color: string }[] = [
  { value: 'low', label: 'Low Impact', icon: '🟢', color: 'green' },
  { value: 'medium', label: 'Medium Impact', icon: '🟡', color: 'yellow' },
  { value: 'high', label: 'High Impact', icon: '🔴', color: 'red' }
];
