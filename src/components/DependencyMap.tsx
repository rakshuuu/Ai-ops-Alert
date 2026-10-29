import React, { useState } from 'react';
import { Database, ShieldAlert, Cpu, ArrowDown, Activity, RefreshCw } from 'lucide-react';
import { ServiceInfo } from '../types';

interface DependencyMapProps {
  services: ServiceInfo[];
  onSelectService: (serviceName: string) => void;
  onSimulateDbIncident: () => void;
  isDbActive: boolean;
}

interface CascadeNode {
  name: string;
  role: 'root' | 'tier1' | 'tier2' | 'tier3';
  symptom: string;
  metric: string;
  defaultLatency: number;
}

export const DependencyMap: React.FC<DependencyMapProps> = ({
  services,
  onSelectService,
  onSimulateDbIncident,
  isDbActive
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('Primary Database');

  const cascadeNodes: CascadeNode[] = [
    { name: 'Primary Database', role: 'root', symptom: 'Query latency > SLO (1,850ms)', metric: '1,850ms · 4.8% err', defaultLatency: 1850 },
    
    // Tier 1 direct dependents
    { name: 'Read Replica', role: 'tier1', symptom: 'Replication lag > 14s', metric: '420ms · 1.2% err', defaultLatency: 420 },
    { name: 'Orders Database', role: 'tier1', symptom: 'Connection pool 98% full', metric: '890ms · 5.2% err', defaultLatency: 890 },
    { name: 'Auth Service', role: 'tier1', symptom: 'CPU utilization > 90%', metric: '310ms · 3.5% err', defaultLatency: 310 },
    { name: 'Billing Service', role: 'tier1', symptom: 'P95 latency elevated', metric: '720ms · 4.1% err', defaultLatency: 720 },
    { name: 'Order Service', role: 'tier1', symptom: 'Request timeout on lock', metric: '1,200ms · 7.9% err', defaultLatency: 1200 },
    
    // Tier 2 cascade
    { name: 'API Gateway', role: 'tier2', symptom: '5xx error rate elevated', metric: '650ms · 6.4% err', defaultLatency: 650 },
    { name: 'Checkout Service', role: 'tier2', symptom: 'Funnel stall at payment', metric: '1,420ms · 8.1% err', defaultLatency: 1420 },
    { name: 'Profile Service', role: 'tier2', symptom: 'Hydration cache miss', metric: '380ms · 2.0% err', defaultLatency: 380 },

    // Tier 3 downstream
    { name: 'Notification Service', role: 'tier3', symptom: 'Dispatch queue backlog', metric: '290ms · 1.5% err', defaultLatency: 290 },
    { name: 'Reporting Service', role: 'tier3', symptom: 'Hourly query breach', metric: '450ms · 1.0% err', defaultLatency: 450 },
    { name: 'Status Page', role: 'tier3', symptom: 'Synthetic probe warn', metric: '180ms · 0.9% err', defaultLatency: 180 }
  ];

  const currentNodeInfo = services.find(s => s.name === selectedNode);

  return (
    <div className="bg-[#111828] border border-[#22304d] rounded-xl p-5 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#1d2942]">
        <div>
          <h2 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span>Service Dependency Map</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-mono font-medium">
              11 AFFECTED SERVICES
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Topological blast radius: propagation of database latency across service tiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDbActive && (
            <button
              onClick={onSimulateDbIncident}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium bg-[#162238] px-2.5 py-1 rounded border border-[#233556] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Slowdown Cascade</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Cascade Interactive Canvas */}
      <div className="my-4 flex-1 flex flex-col justify-between overflow-y-auto min-h-[380px] p-2 bg-[#0c1322] rounded-lg border border-[#1b263e]">
        
        {/* Tier 0: Root Cause Node */}
        <div className="flex flex-col items-center">
          <div className="text-[10px] font-mono tracking-wider text-red-400 uppercase font-semibold mb-1">
            Suspected Root Cause (T+00:00)
          </div>
          
          <div
            onClick={() => {
              setSelectedNode('Primary Database');
              onSelectService('Primary Database');
            }}
            className={`cursor-pointer relative p-3 rounded-lg border transition-all text-center w-64 ${
              selectedNode === 'Primary Database'
                ? 'bg-red-950/60 border-red-500 ring-2 ring-red-500/30'
                : 'bg-[#1a1728] border-red-900/60 hover:border-red-500'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Database className="w-4 h-4 text-red-400" />
              <span className="font-display font-bold text-sm text-white">
                Primary Database
              </span>
            </div>
            <div className="text-[11px] text-red-300 mt-1 font-medium">
              Query latency above SLO (&gt;1,850ms)
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              SLO Target: &lt;250ms · Measured: 1,850ms
            </div>

            {/* Pulsing ring indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>

          {/* Connector Down */}
          <div className="flex items-center justify-center text-slate-600 my-1">
            <ArrowDown className="w-4 h-4 text-red-400/80" />
          </div>
        </div>

        {/* Tier 1: Direct Dependents */}
        <div>
          <div className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-semibold text-center mb-1">
            Tier 1: Direct Database Clients (T+00:30)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {cascadeNodes.filter(n => n.role === 'tier1').map(node => (
              <div
                key={node.name}
                onClick={() => {
                  setSelectedNode(node.name);
                  onSelectService(node.name);
                }}
                className={`cursor-pointer p-2 rounded-md border text-center transition-all ${
                  selectedNode === node.name
                    ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-[#131b2e] border-[#253350] hover:border-amber-500/60'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 truncate">
                  {node.name}
                </div>
                <div className="text-[10px] text-amber-300 truncate mt-0.5">
                  {node.symptom}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {node.metric}
                </div>
              </div>
            ))}
          </div>

          {/* Connector Down */}
          <div className="flex items-center justify-center text-slate-600 my-1">
            <ArrowDown className="w-4 h-4 text-amber-400/80" />
          </div>
        </div>

        {/* Tier 2: Edge & User Facing Services */}
        <div>
          <div className="text-[10px] font-mono tracking-wider text-orange-400 uppercase font-semibold text-center mb-1">
            Tier 2: Ingress & Core Workflows (T+01:15)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {cascadeNodes.filter(n => n.role === 'tier2').map(node => (
              <div
                key={node.name}
                onClick={() => {
                  setSelectedNode(node.name);
                  onSelectService(node.name);
                }}
                className={`cursor-pointer p-2 rounded-md border text-center transition-all ${
                  selectedNode === node.name
                    ? 'bg-orange-950/50 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-[#131b2e] border-[#253350] hover:border-orange-500/60'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 truncate">
                  {node.name}
                </div>
                <div className="text-[10px] text-orange-300 truncate mt-0.5">
                  {node.symptom}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {node.metric}
                </div>
              </div>
            ))}
          </div>

          {/* Connector Down */}
          <div className="flex items-center justify-center text-slate-600 my-1">
            <ArrowDown className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Tier 3: Downstream & Customer Impact */}
        <div>
          <div className="text-[10px] font-mono tracking-wider text-slate-400 uppercase font-semibold text-center mb-1">
            Tier 3: Async & Public Health Canary (T+02:15)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {cascadeNodes.filter(n => n.role === 'tier3').map(node => (
              <div
                key={node.name}
                onClick={() => {
                  setSelectedNode(node.name);
                  onSelectService(node.name);
                }}
                className={`cursor-pointer p-2 rounded-md border text-center transition-all ${
                  selectedNode === node.name
                    ? 'bg-[#1e2a44] border-indigo-400'
                    : 'bg-[#131b2e] border-[#253350] hover:border-slate-400'
                }`}
              >
                <div className="font-semibold text-xs text-slate-200 truncate">
                  {node.name}
                </div>
                <div className="text-[10px] text-slate-300 truncate mt-0.5">
                  {node.symptom}
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {node.metric}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Selected Node Inspector Drawer */}
      {currentNodeInfo && (
        <div className="p-3 bg-[#131c30] rounded-lg border border-[#233556] text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                currentNodeInfo.health === 'Critical'
                  ? 'bg-red-400 shadow-[0_0_8px_#f87171]'
                  : currentNodeInfo.health === 'Degraded'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`} />
              <span className="font-display font-bold text-white">
                {currentNodeInfo.name}
              </span>
              <span className="text-[11px] text-slate-400">· {currentNodeInfo.tier}</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-300">
                P95 Latency: <strong className={currentNodeInfo.p95LatencyMs > 500 ? 'text-red-400' : 'text-slate-200'}>{currentNodeInfo.p95LatencyMs}ms</strong>
              </span>
              <span className="text-slate-300">
                Error Rate: <strong className={currentNodeInfo.errorRate > 2 ? 'text-red-400' : 'text-slate-200'}>{currentNodeInfo.errorRate}%</strong>
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-[#1f2d48] flex items-center justify-between text-[11px] text-slate-400">
            <div>
              <span>Upstream: </span>
              <span className="text-slate-300">
                {currentNodeInfo.dependencies.length > 0 ? currentNodeInfo.dependencies.join(', ') : 'None (Base Infrastructure)'}
              </span>
            </div>
            <div>
              <span>Downstream Dependents: </span>
              <span className="text-slate-300">
                {currentNodeInfo.dependents.length > 0 ? `${currentNodeInfo.dependents.length} services` : 'Leaf node'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Suspected Root Cause</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Cascading Affected Service</span>
          </span>
          <span className="flex items-center gap-1.5">
            <i className="w-2.5 h-2.5 rounded-full bg-[#354870] inline-block" />
            <span>Topological Dependency</span>
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Propagation velocity: ~15s per hop
        </span>
      </div>

    </div>
  );
};
