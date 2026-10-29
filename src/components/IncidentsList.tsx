import React from 'react';
import { Incident } from '../types';
import { AlertCircle, CheckCircle2, ChevronRight, Check } from 'lucide-react';

interface IncidentsListProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onAcknowledgeIncident: (incidentId: string) => void;
  onResolveIncident: (incidentId: string) => void;
}

export const IncidentsList: React.FC<IncidentsListProps> = ({
  incidents,
  onSelectIncident,
  onAcknowledgeIncident,
  onResolveIncident
}) => {
  return (
    <div className="bg-[#111828] border border-[#22304d] rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#1d2942]">
        <div>
          <h2 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span>Correlated Incidents</span>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-medium">
              DEPENDENCY AWARE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grouped root-cause candidates instead of individual raw symptom alerts
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {incidents.filter(i => i.status !== 'Resolved').length} active
        </span>
      </div>

      <div className="divide-y divide-[#1b263e] overflow-y-auto flex-1 pr-1 mt-2 -mr-1">
        {incidents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-80" />
            <p className="font-medium text-slate-200">All systems nominal</p>
            <p className="mt-1 text-slate-500">No active correlated incidents detected</p>
          </div>
        ) : (
          incidents.map(incident => {
            const isResolved = incident.status === 'Resolved';
            const isInvestigating = incident.status === 'Investigating';

            return (
              <div
                key={incident.id}
                className={`py-4 transition-colors group ${
                  isResolved ? 'opacity-60' : 'hover:bg-[#141e33] -mx-2 px-2 rounded-lg'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-indigo-400">
                        {incident.id}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        First seen {incident.first_seen}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className={`font-semibold ${
                        incident.severity === 'Critical'
                          ? 'text-red-400'
                          : incident.severity === 'High'
                          ? 'text-amber-400'
                          : 'text-yellow-400'
                      }`}>
                        {incident.severity}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300">
                        {incident.services} services ({incident.alerts} raw alerts)
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectIncident(incident)}
                      className="font-display font-semibold text-sm text-slate-100 hover:text-indigo-300 cursor-pointer mt-1.5 transition-colors line-clamp-1"
                    >
                      {incident.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {incident.summary}
                    </p>

                    {/* Root cause candidate bar */}
                    <div className="mt-2.5 flex items-center gap-3 text-xs flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-300 bg-[#162238] px-2.5 py-1 rounded border border-[#233556]">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="text-slate-400 text-[11px]">Suspected Root:</span>
                        <span className="font-semibold text-slate-200">{incident.root}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <span>Confidence:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {incident.confidence}%
                        </span>
                      </div>

                      <div className="text-[11px]">
                        <span className={`font-medium ${
                          isResolved
                            ? 'text-emerald-400'
                            : isInvestigating
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}>
                          ● {incident.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#1c2944] hover:bg-[#25375c] border border-[#2b3c61] rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {!isResolved && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAcknowledgeIncident(incident.id)}
                          title="Acknowledge all correlated alerts"
                          className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-[#1b2742] rounded transition-colors whitespace-nowrap"
                        >
                          Ack All
                        </button>
                        <button
                          onClick={() => onResolveIncident(incident.id)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 rounded transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1d2942] text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="text-indigo-400 font-bold">✦ Correlation Engine</span>
          <span>reduces raw alerts using topological dependency graph & time window</span>
        </span>
      </div>
    </div>
  );
};
