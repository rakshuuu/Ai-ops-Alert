import React, { useState, useEffect } from 'react';
import { useAIOpsEngine } from './hooks/useAIOpsEngine';
import { TopBar } from './components/TopBar';
import { MetricCards } from './components/MetricCards';
import { IncidentsList } from './components/IncidentsList';
import { DependencyMap } from './components/DependencyMap';
import { AlertStream } from './components/AlertStream';
import { ServiceInventory } from './components/ServiceInventory';
import { IncidentModal } from './components/IncidentModal';
import { AlertDetailModal } from './components/AlertDetailModal';
import { InjectAlertModal } from './components/InjectAlertModal';
import { Incident, Alert } from './types';
import { Check, Info, AlertCircle, X } from 'lucide-react';

export default function App() {
  const {
    alerts,
    incidents,
    services,
    alertsToday,
    noiseReductionPercent,
    activeIncidentsCount,
    isLive,
    setIsLive,
    tickSpeed,
    setTickSpeed,
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
    resetDemo
  } = useAIOpsEngine();

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isInjectModalOpen, setIsInjectModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3800);
  };

  // Handlers with feedback
  const handleSimulateDb = () => {
    const iid = triggerDatabaseIncident();
    showToast(`Simulated Database Slowdown: 11 related alerts grouped into ${iid}`, 'warn');
  };

  const handleSimulateKafka = () => {
    const iid = triggerKafkaIncident();
    showToast(`Simulated Kafka Partition Storm: 6 related alerts grouped into ${iid}`, 'warn');
  };

  const handleResolveIncident = (incidentId: string) => {
    resolveIncident(incidentId);
    showToast(`Incident ${incidentId} resolved. All correlated service latencies restored to nominal.`, 'success');
  };

  const handleAckAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    showToast(`Alert ${alertId} acknowledged`, 'info');
  };

  const handleAckIncidentAll = (incidentId: string) => {
    acknowledgeIncidentAlerts(incidentId);
    showToast(`All open alerts for ${incidentId} acknowledged`, 'info');
  };

  const handleBulkAckNoise = () => {
    bulkAcknowledgeNoise();
    showToast(`Acknowledged all uncorrelated noise alerts`, 'info');
  };

  // Keyboard shortcut: Space toggles live simulation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'SELECT') {
        e.preventDefault();
        setIsLive(prev => !prev);
        showToast(isLive ? 'Simulation paused' : 'Simulation resumed', 'info');
      }
      if (e.code === 'Escape') {
        setSelectedIncident(null);
        setSelectedAlert(null);
        setIsInjectModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLive, setIsLive]);

  return (
    <div className="min-h-screen bg-[#080d1a] text-[#eaf0ff] flex flex-col font-sans">
      
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isLive={isLive}
        onToggleLive={() => setIsLive(!isLive)}
        tickSpeed={tickSpeed}
        onChangeTickSpeed={setTickSpeed}
        onSimulateDbIncident={handleSimulateDb}
        onSimulateKafkaIncident={handleSimulateKafka}
        onOpenInjectModal={() => setIsInjectModalOpen(true)}
        onResetDemo={() => {
          resetDemo();
          showToast('Simulation state reset to baseline', 'info');
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 lg:p-8 space-y-6">
        
        {/* KPI Strip */}
        <MetricCards
          alertsToday={alertsToday}
          noiseReductionPercent={noiseReductionPercent}
          activeIncidentsCount={activeIncidentsCount}
          services={services}
          onOpenIncidents={() => setActiveTab('incidents')}
          onOpenServices={() => setActiveTab('services')}
          onOpenAlerts={() => setActiveTab('alerts')}
        />

        {/* View Switcher Routing */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Split Grid: Left = Incidents List, Right = Service Dependency Cascade Map */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6 xl:col-span-5 h-[560px]">
                <IncidentsList
                  incidents={incidents}
                  onSelectIncident={setSelectedIncident}
                  onAcknowledgeIncident={handleAckIncidentAll}
                  onResolveIncident={handleResolveIncident}
                />
              </div>

              <div className="lg:col-span-6 xl:col-span-7 h-[560px]">
                <DependencyMap
                  services={services}
                  onSelectService={name => {
                    // Navigate to service inventory or show details
                    setActiveTab('services');
                  }}
                  onSimulateDbIncident={handleSimulateDb}
                  isDbActive={dbIncidentActive}
                />
              </div>
            </div>

            {/* Alert Stream */}
            <AlertStream
              alerts={alerts}
              onAcknowledgeAlert={handleAckAlert}
              onSelectAlert={setSelectedAlert}
              onSelectIncidentId={id => {
                const inc = incidents.find(i => i.id === id);
                if (inc) setSelectedIncident(inc);
              }}
              onBulkAckNoise={handleBulkAckNoise}
            />

            {/* 70 Microservices Inventory */}
            <ServiceInventory
              services={services}
              onSelectService={name => {
                const foundAlert = alerts.find(a => a.service === name);
                if (foundAlert) setSelectedAlert(foundAlert);
              }}
            />
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 min-h-[600px]">
              <IncidentsList
                incidents={incidents}
                onSelectIncident={setSelectedIncident}
                onAcknowledgeIncident={handleAckIncidentAll}
                onResolveIncident={handleResolveIncident}
              />
            </div>
            <div className="lg:col-span-7 min-h-[600px]">
              <DependencyMap
                services={services}
                onSelectService={name => setActiveTab('services')}
                onSimulateDbIncident={handleSimulateDb}
                isDbActive={dbIncidentActive}
              />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <AlertStream
            alerts={alerts}
            onAcknowledgeAlert={handleAckAlert}
            onSelectAlert={setSelectedAlert}
            onSelectIncidentId={id => {
              const inc = incidents.find(i => i.id === id);
              if (inc) setSelectedIncident(inc);
            }}
            onBulkAckNoise={handleBulkAckNoise}
          />
        )}

        {activeTab === 'map' && (
          <div className="h-[740px]">
            <DependencyMap
              services={services}
              onSelectService={name => setActiveTab('services')}
              onSimulateDbIncident={handleSimulateDb}
              isDbActive={dbIncidentActive}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <ServiceInventory
            services={services}
            onSelectService={name => {
              const alert = alerts.find(a => a.service === name);
              if (alert) setSelectedAlert(alert);
            }}
          />
        )}

      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#18233b] py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1720px] mx-auto w-full">
        <div>
          <span>SignalOps Alert Intelligence Platform</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>70 Monitored Microservices</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Real-time Topological Correlation</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <span>Space to Pause/Resume</span>
          <span>·</span>
          <span>Esc to Close Dialogs</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      <IncidentModal
        incident={selectedIncident}
        alerts={alerts}
        onClose={() => setSelectedIncident(null)}
        onAcknowledgeAlert={handleAckAlert}
        onAcknowledgeAll={handleAckIncidentAll}
        onResolveIncident={handleResolveIncident}
        onSelectService={name => {
          setActiveTab('services');
        }}
      />

      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAckAlert}
        onSelectIncidentId={id => {
          const inc = incidents.find(i => i.id === id);
          if (inc) setSelectedIncident(inc);
        }}
        onSelectService={name => {
          setActiveTab('services');
        }}
      />

      <InjectAlertModal
        isOpen={isInjectModalOpen}
        onClose={() => setIsInjectModalOpen(false)}
        onInject={(svc, sev, title, src) => {
          injectCustomAlert(svc, sev, title, src);
          showToast(`Injected alert on ${svc}: ${title}`, 'info');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-[#141f38] border border-[#273a61] shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
