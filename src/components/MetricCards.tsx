import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { ServiceInfo } from '../types';

interface MetricCardsProps {
  alertsToday: number;
  noiseReductionPercent: number;
  activeIncidentsCount: number;
  services: ServiceInfo[];
  onOpenIncidents: () => void;
  onOpenServices: () => void;
  onOpenAlerts: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  alertsToday,
  noiseReductionPercent,
  activeIncidentsCount,
  services,
  onOpenIncidents,
  onOpenServices,
  onOpenAlerts
}) => {
  const criticalCount = services.filter(s => s.health === 'Critical').length;
  const degradedCount = services.filter(s => s.health === 'Degraded').length;
  const nominalCount = services.filter(s => s.health === 'Nominal').length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Raw alerts today */}
      <article 
        onClick={onOpenAlerts}
        className="cursor-pointer bg-[#111828] hover:bg-[#141d30] border border-[#22304d] rounded-xl p-4 transition-all hover:border-[#334670] group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium text-slate-300">Raw alerts today</span>
          <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        
        <div className="my-2">
          <div className="font-display font-extrabold text-3xl tracking-tight text-white font-mono tabular-nums">
            {alertsToday.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold flex items-center">
              ↗ Live
            </span>
            <span>synthetic telemetry stream</span>
          </div>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="h-6 w-full mt-2 pt-1">
          <svg className="w-full h-full stroke-blue-400 fill-none" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path
              d="M0,15 Q10,18 20,12 T40,14 T60,8 T80,10 T100,5"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </article>

      {/* Metric 2: Noise reduced */}
      <article className="bg-[#111828] border border-[#22304d] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium text-slate-300">Alert noise reduced</span>
          <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2">
          <div className="font-display font-extrabold text-3xl tracking-tight text-white font-mono tabular-nums flex items-baseline gap-1">
            <span>{noiseReductionPercent}</span>
            <span className="text-lg text-emerald-400 font-normal">%</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">↓ Fewer on-call pages</span>
            <span>via correlation</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#1b2742] h-1.5 rounded-full overflow-hidden mt-3">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${noiseReductionPercent}%` }}
          />
        </div>
      </article>

      {/* Metric 3: Active incidents */}
      <article 
        onClick={onOpenIncidents}
        className="cursor-pointer bg-[#111828] hover:bg-[#141d30] border border-[#22304d] rounded-xl p-4 transition-all hover:border-[#334670] group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium text-slate-300">Active incidents</span>
          <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2">
          <div className="font-display font-extrabold text-3xl tracking-tight text-white font-mono tabular-nums">
            {activeIncidentsCount}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-amber-400 font-semibold">Correlated root-causes</span>
            <span>grouped</span>
          </div>
        </div>

        {/* Mini status indicator bars */}
        <div className="flex items-center gap-1.5 mt-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-sm ${
                idx < activeIncidentsCount
                  ? idx === 0
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                  : 'bg-[#1e2a44]'
              }`}
            />
          ))}
        </div>
      </article>

      {/* Metric 4: Services monitored */}
      <article 
        onClick={onOpenServices}
        className="cursor-pointer bg-[#111828] hover:bg-[#141d30] border border-[#22304d] rounded-xl p-4 transition-all hover:border-[#334670] group flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium text-slate-300">Services monitored</span>
          <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </span>
        </div>

        <div className="my-2">
          <div className="font-display font-extrabold text-3xl tracking-tight text-white font-mono tabular-nums flex items-baseline gap-2">
            <span>70</span>
            <span className="text-xs text-slate-400 font-sans font-normal">
              {nominalCount} healthy
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="text-red-400 font-semibold">{criticalCount} Critical</span>
            )}
            {degradedCount > 0 && (
              <span className="text-amber-400 font-semibold">{degradedCount} Degraded</span>
            )}
            {criticalCount === 0 && degradedCount === 0 && (
              <span className="text-emerald-400 font-semibold">100% Nominal</span>
            )}
          </div>
        </div>

        {/* Microservice dots preview (10 dots sampling) */}
        <div className="flex items-center gap-1 mt-3 overflow-hidden">
          {services.slice(0, 16).map((svc, i) => (
            <span
              key={i}
              title={`${svc.name} (${svc.health})`}
              className={`w-2 h-2 rounded-full shrink-0 ${
                svc.health === 'Critical'
                  ? 'bg-red-500 ring-2 ring-red-500/30'
                  : svc.health === 'Degraded'
                  ? 'bg-amber-400'
                  : 'bg-emerald-500/80'
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-500 font-mono pl-1">+54</span>
        </div>
      </article>

    </section>
  );
};
