export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertSource = 'Metrics' | 'Logs' | 'Uptime' | 'Tracing';
export type AlertStatus = 'Open' | 'Acknowledged' | 'Resolved';

export interface Alert {
  id: string;
  time: string;
  timestamp: number;
  service: string;
  severity: AlertSeverity;
  title: string;
  source: AlertSource;
  incident_id: string | null;
  correlated: boolean;
  status: AlertStatus;
  metric?: string;
  threshold?: string;
  observed?: string;
}

export type IncidentStatus = 'Investigating' | 'Monitoring' | 'Resolved';

export interface AffectedServiceDetail {
  service: string;
  role: 'root_cause' | 'direct_dependent' | 'downstream_cascade';
  alertCount: number;
  primaryAlert: string;
  latencyMs: number;
  errorRatePercent: number;
}

export interface Incident {
  id: string;
  title: string;
  root: string;
  severity: AlertSeverity;
  services: number;
  alerts: number;
  confidence: number;
  first_seen: string;
  status: IncidentStatus;
  summary: string;
  hypothesis?: string;
  affectedServices?: AffectedServiceDetail[];
  cascadeTimeline?: {
    timeOffset: string;
    service: string;
    event: string;
    severity: AlertSeverity;
  }[];
}

export type ServiceTier = 
  | 'Data & Storage'
  | 'Edge & Ingress'
  | 'Core Services'
  | 'Commerce & Business'
  | 'Content & Search'
  | 'Async & Infrastructure'
  | 'Observability Platform';

export type ServiceHealth = 'Nominal' | 'Degraded' | 'Critical';

export interface ServiceInfo {
  name: string;
  tier: ServiceTier;
  health: ServiceHealth;
  p95LatencyMs: number;
  errorRate: number;
  dependencies: string[];
  dependents: string[];
  activeAlertCount: number;
}
