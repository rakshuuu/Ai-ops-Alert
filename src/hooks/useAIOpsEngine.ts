import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Alert, Incident, ServiceInfo, AlertSeverity, AlertSource } from '../types';
import {
  ALL_SERVICES_NAMES,
  SERVICE_TIER_MAPPING,
  SERVICE_DEPENDENCIES,
  INITIAL_ALERTS,
  INITIAL_INCIDENTS,
  COMMON_SYMPTOMS
} from '../data/servicesData';

function getFormattedTime(): string {
  const d = new Date();
  return d.toTimeString().split(' ')[0];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useAIOpsEngine() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alertsToday, setAlertsToday] = useState<number>(617);
  const [acknowledgedCount, setAcknowledgedCount] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [tickSpeed, setTickSpeed] = useState<number>(3000); // 3 seconds standard
  const [dbIncidentActive, setDbIncidentActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [lastTickTime, setLastTickTime] = useState<string>(getFormattedTime());

  // Web Audio chime for alerts if sound enabled
  const playAlertSound = useCallback((type: 'normal' | 'critical') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'critical' ? 440 : 660, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext not allowed or unsupported
    }
  }, [soundEnabled]);

  // Compute Noise Reduction dynamically
  const noiseReductionPercent = useMemo(() => {
    const rawTotal = Math.max(alertsToday, 1);
    const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;
    // Each incident compresses ~8-12 alerts into 1 actionable ticket
    const alertsInIncidents = alerts.filter(a => a.correlated).length;
    const squashedCount = Math.max(0, alertsInIncidents - activeIncidentsCount);
    const basePct = 72;
    const computedPct = Math.min(94, Math.max(65, Math.round(basePct + (squashedCount / Math.max(rawTotal, 10)) * 15)));
    return computedPct;
  }, [alertsToday, incidents, alerts]);

  // Active incidents count
  const activeIncidentsCount = useMemo(() => {
    return incidents.filter(i => i.status !== 'Resolved').length;
  }, [incidents]);

  // Build service states
  const services = useMemo<ServiceInfo[]>(() => {
    // Map of active alerts by service
    const serviceAlertMap = new Map<string, Alert[]>();
    for (const a of alerts) {
      if (a.status !== 'Resolved') {
        const list = serviceAlertMap.get(a.service) || [];
        list.push(a);
        serviceAlertMap.set(a.service, list);
      }
    }

    // Active incidents root and affected services
    const criticalServices = new Set<string>();
    const degradedServices = new Set<string>();

    for (const inc of incidents) {
      if (inc.status !== 'Resolved') {
        criticalServices.add(inc.root);
        if (inc.affectedServices) {
          for (const aff of inc.affectedServices) {
            if (aff.service !== inc.root) {
              if (aff.role === 'direct_dependent') {
                degradedServices.add(aff.service);
              } else {
                degradedServices.add(aff.service);
              }
            }
          }
        }
      }
    }

    return ALL_SERVICES_NAMES.map(name => {
      const activeList = serviceAlertMap.get(name) || [];
      const hasCriticalAlert = activeList.some(a => a.severity === 'Critical');
      const hasHighAlert = activeList.some(a => a.severity === 'High');
      const isIncidentRoot = criticalServices.has(name);
      const isIncidentAffected = degradedServices.has(name);

      let health: 'Nominal' | 'Degraded' | 'Critical' = 'Nominal';
      let latency = getRandomInt(18, 48);
      let errorRate = Number((Math.random() * 0.1).toFixed(2));

      if (isIncidentRoot || hasCriticalAlert) {
        health = 'Critical';
        latency = getRandomInt(1200, 2400);
        errorRate = Number((4.5 + Math.random() * 4).toFixed(2));
      } else if (isIncidentAffected || hasHighAlert || activeList.length >= 2) {
        health = 'Degraded';
        latency = getRandomInt(280, 850);
        errorRate = Number((1.5 + Math.random() * 2.5).toFixed(2));
      } else if (activeList.length === 1) {
        latency = getRandomInt(65, 140);
        errorRate = Number((0.2 + Math.random() * 0.5).toFixed(2));
      }

      const deps = SERVICE_DEPENDENCIES[name] || [];
      // Calculate reverse dependents
      const dependents: string[] = [];
      for (const [k, v] of Object.entries(SERVICE_DEPENDENCIES)) {
        if (v.includes(name)) {
          dependents.push(k);
        }
      }

      return {
        name,
        tier: SERVICE_TIER_MAPPING[name] || 'Core Services',
        health,
        p95LatencyMs: latency,
        errorRate,
        dependencies: deps,
        dependents,
        activeAlertCount: activeList.length
      };
    });
  }, [alerts, incidents]);

  // Tick generator: simulate 1-3 background alerts arriving every tick
  const runTick = useCallback(() => {
    const count = getRandomInt(1, 3);
    const newAlerts: Alert[] = [];
    const nowTime = getFormattedTime();

    for (let i = 0; i < count; i++) {
      const svc = ALL_SERVICES_NAMES[getRandomInt(0, ALL_SERVICES_NAMES.length - 1)];
      const severities: AlertSeverity[] = ['Low', 'Low', 'Medium', 'Medium', 'High', 'Critical'];
      const sev = severities[getRandomInt(0, severities.length - 1)];
      const title = COMMON_SYMPTOMS[getRandomInt(0, COMMON_SYMPTOMS.length - 1)];
      const sources: AlertSource[] = ['Metrics', 'Logs', 'Uptime', 'Tracing'];
      const source = sources[getRandomInt(0, sources.length - 1)];

      newAlerts.push({
        id: `ALT-${getRandomInt(10000, 99999)}`,
        time: nowTime,
        timestamp: Date.now(),
        service: svc,
        severity: sev,
        title,
        source,
        incident_id: null,
        correlated: false,
        status: 'Open',
        metric: `telemetry.${svc.toLowerCase().replace(/\s+/g, '_')}.metric`,
        threshold: 'nominal baseline',
        observed: `${getRandomInt(75, 98)}%`
      });
    }

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 150));
    setAlertsToday(prev => prev + count);
    setLastTickTime(nowTime);
    playAlertSound('normal');
  }, [playAlertSound]);

  // Periodic interval
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (!isLive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(runTick, tickSpeed);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, tickSpeed, runTick]);

  // Trigger Database slowdown cascade (Matching the Flask prototype specification exactly)
  const triggerDatabaseIncident = useCallback(() => {
    const iid = `INC-${getRandomInt(205, 999)}`;
    const nowTime = getFormattedTime();

    const affectedSpecs: [string, AlertSeverity, string, AlertSource][] = [
      ["Primary Database", "Critical", "Query latency above SLO (>1,850ms)", "Metrics"],
      ["Read Replica", "High", "Replication lag increased (>14.2s)", "Metrics"],
      ["Auth Service", "High", "CPU utilization > 90%", "Metrics"],
      ["Billing Service", "High", "P95 latency elevated (>720ms)", "Tracing"],
      ["Order Service", "High", "Request timeout detected", "Uptime"],
      ["API Gateway", "High", "5xx error rate increased (6.4%)", "Logs"],
      ["Checkout Service", "Medium", "Checkout latency elevated (>1.4s)", "Tracing"],
      ["Profile Service", "Medium", "Database calls slowed", "Tracing"],
      ["Notification Service", "Medium", "Queue processing delayed", "Logs"],
      ["Reporting Service", "Low", "Query duration above baseline", "Metrics"],
      ["Status Page", "Medium", "Customer-facing availability warning", "Uptime"]
    ];

    const incidentAlerts: Alert[] = affectedSpecs.map(([svc, sev, title, source]) => ({
      id: `ALT-${getRandomInt(10000, 99999)}`,
      time: nowTime,
      timestamp: Date.now(),
      service: svc,
      severity: sev,
      title,
      source,
      incident_id: iid,
      correlated: true,
      status: 'Open',
      metric: `cascade.${svc.toLowerCase().replace(/\s+/g, '_')}`,
      threshold: 'SLO breached',
      observed: 'Anomalous'
    }));

    const newIncident: Incident = {
      id: iid,
      title: "Database slowdown — cascading service impact",
      root: "Primary Database",
      severity: "Critical",
      services: 11,
      alerts: 11,
      confidence: 96,
      first_seen: nowTime,
      status: "Investigating",
      summary: "11 related alerts correlated by dependency graph and time window. Likely root cause: Primary Database.",
      hypothesis: "Connection pool exhaustion on Primary Database created cascading socket timeouts across dependent checkout, auth, and order flows.",
      affectedServices: affectedSpecs.map(([svc, sev, title]) => ({
        service: svc,
        role: svc === 'Primary Database' ? 'root_cause' : (['Read Replica', 'Auth Service', 'Billing Service', 'Order Service'].includes(svc) ? 'direct_dependent' : 'downstream_cascade'),
        alertCount: 1,
        primaryAlert: title,
        latencyMs: svc === 'Primary Database' ? 1850 : getRandomInt(250, 950),
        errorRatePercent: svc === 'Primary Database' ? 5.8 : Number((1.2 + Math.random() * 4).toFixed(1))
      })),
      cascadeTimeline: [
        { timeOffset: "T+00:00", service: "Primary Database", event: "Query latency jumped above 1,850ms SLO threshold", severity: "Critical" },
        { timeOffset: "T+00:15", service: "Read Replica", event: "Replication lag breached 14s barrier", severity: "High" },
        { timeOffset: "T+00:30", service: "Auth Service", event: "Session validation pool thread contention; CPU 91%", severity: "High" },
        { timeOffset: "T+00:45", service: "Billing Service", event: "P95 payment transaction latency degraded to 720ms", severity: "High" },
        { timeOffset: "T+01:00", service: "Order Service", event: "Upstream database connection timed out after 5,000ms", severity: "High" },
        { timeOffset: "T+01:15", service: "API Gateway", event: "Ingress 504 Gateway Timeout rate jumped to 6.4%", severity: "High" },
        { timeOffset: "T+01:30", service: "Checkout Service", event: "Checkout funnel degraded at payment intent step", severity: "Medium" },
        { timeOffset: "T+01:45", service: "Profile Service", event: "Read fallback cache hydrations failing", severity: "Medium" },
        { timeOffset: "T+02:00", service: "Notification Service", event: "SMS & email transactional queue delay", severity: "Medium" },
        { timeOffset: "T+02:15", service: "Status Page", event: "Automated public canary detected service degradation", severity: "Medium" }
      ]
    };

    setAlerts(prev => [...incidentAlerts, ...prev].slice(0, 160));
    setIncidents(prev => [newIncident, ...prev]);
    setAlertsToday(prev => prev + affectedSpecs.length);
    setDbIncidentActive(true);
    playAlertSound('critical');
    return iid;
  }, [playAlertSound]);

  // Trigger Kafka Broker cascade (bonus scenario)
  const triggerKafkaIncident = useCallback(() => {
    const iid = `INC-${getRandomInt(300, 999)}`;
    const nowTime = getFormattedTime();

    const affectedSpecs: [string, AlertSeverity, string, AlertSource][] = [
      ["Kafka Broker", "Critical", "Partition leader rebalance storm & lag", "Metrics"],
      ["Worker Pool", "High", "Consumer group rebalance timeout", "Logs"],
      ["Event Bus", "High", "Buffer queue saturation > 95%", "Metrics"],
      ["Notification Service", "Medium", "Outbox message dispatch backlog", "Tracing"],
      ["Analytics Service", "Medium", "Stream ingestion lag > 15m", "Metrics"],
      ["Background Jobs", "Low", "Scheduled job delay threshold", "Logs"]
    ];

    const incidentAlerts: Alert[] = affectedSpecs.map(([svc, sev, title, source]) => ({
      id: `ALT-${getRandomInt(10000, 99999)}`,
      time: nowTime,
      timestamp: Date.now(),
      service: svc,
      severity: sev,
      title,
      source,
      incident_id: iid,
      correlated: true,
      status: 'Open',
      metric: `kafka.${svc.toLowerCase().replace(/\s+/g, '_')}`,
      threshold: 'Partition limit',
      observed: 'Stalled'
    }));

    const newIncident: Incident = {
      id: iid,
      title: "Kafka broker partition storm & consumer lag",
      root: "Kafka Broker",
      severity: "Critical",
      services: 6,
      alerts: 6,
      confidence: 91,
      first_seen: nowTime,
      status: "Investigating",
      summary: "Kafka broker partition rebalance triggered consumer lag across worker pool, notification pipeline, and analytics.",
      hypothesis: "Zookeeper heartbeat jitter forced repeated partition leader elections, temporarily blocking consumer groups from committing offsets.",
      affectedServices: affectedSpecs.map(([svc, sev, title]) => ({
        service: svc,
        role: svc === 'Kafka Broker' ? 'root_cause' : (['Worker Pool', 'Event Bus'].includes(svc) ? 'direct_dependent' : 'downstream_cascade'),
        alertCount: 1,
        primaryAlert: title,
        latencyMs: svc === 'Kafka Broker' ? 950 : getRandomInt(190, 600),
        errorRatePercent: svc === 'Kafka Broker' ? 4.2 : Number((0.8 + Math.random() * 2).toFixed(1))
      })),
      cascadeTimeline: [
        { timeOffset: "T+00:00", service: "Kafka Broker", event: "Broker partition leader rebalance storm triggered", severity: "Critical" },
        { timeOffset: "T+00:20", service: "Worker Pool", event: "Consumer thread pool blocked during rebalance lock", severity: "High" },
        { timeOffset: "T+00:40", service: "Event Bus", event: "Ingress topic buffer queue reached 95% capacity", severity: "High" },
        { timeOffset: "T+01:10", service: "Notification Service", event: "Dispatch worker stalled waiting for message poll", severity: "Medium" },
        { timeOffset: "T+01:30", service: "Analytics Service", event: "Clickstream ingest lag breached 15-minute threshold", severity: "Medium" }
      ]
    };

    setAlerts(prev => [...incidentAlerts, ...prev].slice(0, 160));
    setIncidents(prev => [newIncident, ...prev]);
    setAlertsToday(prev => prev + affectedSpecs.length);
    playAlertSound('critical');
    return iid;
  }, [playAlertSound]);

  // Manual custom alert injection
  const injectCustomAlert = useCallback((service: string, severity: AlertSeverity, title: string, source: AlertSource) => {
    const newAlert: Alert = {
      id: `ALT-${getRandomInt(10000, 99999)}`,
      time: getFormattedTime(),
      timestamp: Date.now(),
      service,
      severity,
      title,
      source,
      incident_id: null,
      correlated: false,
      status: 'Open',
      metric: 'user.injected.test',
      threshold: 'manual test threshold',
      observed: 'Tripped'
    };
    setAlerts(prev => [newAlert, ...prev]);
    setAlertsToday(prev => prev + 1);
    playAlertSound('normal');
  }, [playAlertSound]);

  // Acknowledge single alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Acknowledged' } : a));
    setAcknowledgedCount(prev => prev + 1);
  }, []);

  // Acknowledge all alerts for an incident
  const acknowledgeIncidentAlerts = useCallback((incidentId: string) => {
    let count = 0;
    setAlerts(prev => prev.map(a => {
      if (a.incident_id === incidentId && a.status === 'Open') {
        count++;
        return { ...a, status: 'Acknowledged' };
      }
      return a;
    }));
    setIncidents(prev => prev.map(i => i.id === incidentId && i.status === 'Investigating' ? { ...i, status: 'Monitoring' } : i));
    setAcknowledgedCount(prev => prev + count);
  }, []);

  // Resolve incident
  const resolveIncident = useCallback((incidentId: string) => {
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'Resolved' } : i));
    setAlerts(prev => prev.map(a => a.incident_id === incidentId ? { ...a, status: 'Resolved' } : a));
    if (incidentId.startsWith('INC-204') || incidentId.includes('database')) {
      setDbIncidentActive(false);
    }
  }, []);

  // Bulk acknowledge all noise alerts
  const bulkAcknowledgeNoise = useCallback(() => {
    let count = 0;
    setAlerts(prev => prev.map(a => {
      if (!a.correlated && a.status === 'Open') {
        count++;
        return { ...a, status: 'Acknowledged' };
      }
      return a;
    }));
    setAcknowledgedCount(prev => prev + count);
  }, []);

  // Reset to initial baseline
  const resetDemo = useCallback(() => {
    setAlerts(INITIAL_ALERTS);
    setIncidents(INITIAL_INCIDENTS);
    setAlertsToday(617);
    setAcknowledgedCount(0);
    setDbIncidentActive(true);
  }, []);

  return {
    alerts,
    incidents,
    services,
    alertsToday,
    noiseReductionPercent,
    activeIncidentsCount,
    acknowledgedCount,
    isLive,
    setIsLive,
    tickSpeed,
    setTickSpeed,
    lastTickTime,
    dbIncidentActive,
    soundEnabled,
    setSoundEnabled,
    triggerDatabaseIncident,
    triggerKafkaIncident,
    injectCustomAlert,
    acknowledgeAlert,
    acknowledgeIncidentAlerts,
    resolveIncident,
    bulkAcknowledgeNoise,
    resetDemo,
    runManualTick: runTick
  };
}
