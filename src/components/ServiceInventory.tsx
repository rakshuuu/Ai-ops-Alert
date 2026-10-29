import React, { useState, useMemo } from 'react';
import { ServiceInfo, ServiceTier, ServiceHealth } from '../types';
import { Search, Server, CheckCircle2, AlertTriangle, AlertCircle, ArrowUpRight } from 'lucide-react';

interface ServiceInventoryProps {
  services: ServiceInfo[];
  onSelectService: (serviceName: string) => void;
}

export const ServiceInventory: React.FC<ServiceInventoryProps> = ({
  services,
  onSelectService
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [healthFilter, setHealthFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const tiers: { id: string; label: string; count: number }[] = useMemo(() => {
    const list = [
      { id: 'All', label: 'All Services', count: services.length },
      { id: 'Data & Storage', label: 'Data & Storage', count: services.filter(s => s.tier === 'Data & Storage').length },
      { id: 'Edge & Ingress', label: 'Edge & Ingress', count: services.filter(s => s.tier === 'Edge & Ingress').length },
      { id: 'Core Services', label: 'Core Services', count: services.filter(s => s.tier === 'Core Services').length },
      { id: 'Commerce & Business', label: 'Commerce', count: services.filter(s => s.tier === 'Commerce & Business').length },
      { id: 'Content & Search', label: 'Content & Search', count: services.filter(s => s.tier === 'Content & Search').length },
      { id: 'Async & Infrastructure', label: 'Async & Infra', count: services.filter(s => s.tier === 'Async & Infrastructure').length },
      { id: 'Observability Platform', label: 'Observability', count: services.filter(s => s.tier === 'Observability Platform').length }
    ];
    return list;
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter(svc => {
      if (selectedTier !== 'All' && svc.tier !== selectedTier) return false;
      if (healthFilter === 'Healthy' && svc.health !== 'Nominal') return false;
      if (healthFilter === 'Impacted' && svc.health === 'Nominal') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!svc.name.toLowerCase().includes(q) && !svc.tier.toLowerCase().includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [services, selectedTier, healthFilter, searchQuery]);

  return (
    <div className="bg-[#111828] border border-[#22304d] rounded-xl p-5 flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1d2942]">
        <div>
          <h2 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span>Service Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono">
              70 MONITORED MICROSERVICES
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Topology registry across infrastructure, data stores, API gateways, and asynchronous workers
          </p>
        </div>

        {/* Search & Health Filter */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 70 microservices..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#141e33] border border-[#26375a] text-slate-200 placeholder:text-slate-500 rounded-md pl-8 pr-3 py-1.5 text-xs w-48 sm:w-60 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={healthFilter}
            onChange={e => setHealthFilter(e.target.value)}
            className="bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Health States</option>
            <option value="Impacted">Degraded / Critical Only</option>
            <option value="Healthy">Healthy (Nominal) Only</option>
          </select>
        </div>
      </div>

      {/* Tier Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-[#17223b] text-xs">
        {tiers.map(tier => {
          const isActive = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#223152] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#152037]'
              }`}
            >
              <span>{tier.label}</span>
              <span className="font-mono text-[10px] text-slate-400">({tier.count})</span>
            </button>
          );
        })}
      </div>

      {/* Services Grid (All 70 services) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 mt-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No services match the selected filter.
          </div>
        ) : (
          filteredServices.map(svc => {
            const isCritical = svc.health === 'Critical';
            const isDegraded = svc.health === 'Degraded';

            return (
              <div
                key={svc.name}
                onClick={() => onSelectService(svc.name)}
                className={`p-3 rounded-lg border transition-all cursor-pointer group flex flex-col justify-between ${
                  isCritical
                    ? 'bg-red-950/30 border-red-800/80 hover:border-red-500'
                    : isDegraded
                    ? 'bg-amber-950/20 border-amber-800/60 hover:border-amber-500'
                    : 'bg-[#121a2c] border-[#1f2b45] hover:border-[#334670]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        isCritical
                          ? 'bg-red-400 ring-2 ring-red-400/30'
                          : isDegraded
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`} />
                      <span className="font-display font-bold text-xs text-white truncate group-hover:text-indigo-300 transition-colors">
                        {svc.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {svc.tier}
                    </div>
                  </div>

                  {svc.activeAlertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-800/60 shrink-0">
                      {svc.activeAlertCount} {svc.activeAlertCount === 1 ? 'alert' : 'alerts'}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-[#1a253e] flex items-center justify-between text-[10px] font-mono tabular-nums text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>
                      P95: <strong className={svc.p95LatencyMs > 500 ? 'text-red-400' : 'text-slate-300'}>{svc.p95LatencyMs}ms</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Err: <strong className={svc.errorRate > 2 ? 'text-red-400' : 'text-slate-300'}>{svc.errorRate}%</strong>
                    </span>
                  </div>

                  <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1d2942] flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono">
          Showing {filteredServices.length} of {services.length} services
        </span>
        <span className="text-slate-500">
          Click any service to view its dependent connections and active alerts
        </span>
      </div>

    </div>
  );
};
