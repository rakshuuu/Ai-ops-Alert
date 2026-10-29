import React from 'react';
import { Incident, Alert } from '../types';
import { X, CheckCircle, AlertTriangle, Layers, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface IncidentModalProps {
  incident: Incident | null;
  alerts: Alert[];
  onClose: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onAcknowledgeAll: (incidentId: string) => void;
  onResolveIncident: (incidentId: string) => void;
  onSelectService: (serviceName: string) => void;
}

export const IncidentModal: React.FC<IncidentModalProps> = ({
  incident,
  alerts,
  onClose,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  onResolveIncident,
  onSelectService
}) => {
  if (!incident) return null;

  const correlatedAlerts = alerts.filter(a => a.incident_id === incident.id);
  const isResolved = incident.status === 'Resolved';
  const openAlertsCount = correlatedAlerts.filter(a => a.status === 'Open').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] border border-[#26375a] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#131d33] border-b border-[#213150] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                {incident.id}
              </span>
              <span className={`font-semibold ${
                incident.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {incident.severity} Incident
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono text-[11px]">
                First seen {incident.first_seen}
              </span>
              <span className="text-slate-500">·</span>
              <span className={`text-[11px] font-medium ${
                isResolved ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                ● {incident.status}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-white mt-1.5">
              {incident.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1f2d48] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          
          {/* Root Cause Hypothesis Banner */}
          <div className="p-4 rounded-lg bg-[#141e33] border border-[#243557] flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-white">Suspected Root Cause:</span>
                <button
                  onClick={() => {
                    onSelectService(incident.root);
                    onClose();
                  }}
                  className="font-bold text-indigo-400 hover:underline cursor-pointer"
                >
                  {incident.root}
                </button>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {incident.hypothesis || incident.summary}
              </p>
            </div>

            <div className="shrink-0 bg-[#0c1322] px-3.5 py-2 rounded border border-[#1f2d48] text-center">
              <div className="text-[10px] text-slate-400 uppercase font-mono">
                Correlation Confidence
              </div>
              <div className="font-display font-bold text-xl text-emerald-400 font-mono mt-0.5">
                {incident.confidence}%
              </div>
            </div>
          </div>

          {/* Cascade Progression Timeline */}
          {incident.cascadeTimeline && incident.cascadeTimeline.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm text-white mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Cascade Propagation Sequence</span>
              </h3>
              <div className="space-y-1.5 bg-[#0b1220] p-3 rounded-lg border border-[#1d2b45]">
                {incident.cascadeTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs py-1 border-b border-[#141f33] last:border-0">
                    <span className="font-mono text-[11px] text-indigo-400 font-bold shrink-0 w-16">
                      {step.timeOffset}
                    </span>
                    <button
                      onClick={() => {
                        onSelectService(step.service);
                        onClose();
                      }}
                      className="font-semibold text-slate-200 hover:text-indigo-300 transition-colors shrink-0 w-36 text-left truncate"
                    >
                      {step.service}
                    </button>
                    <span className="text-slate-400 flex-1 truncate">
                      {step.event}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold shrink-0 ${
                      step.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {step.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Correlated Alerts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Correlated Alerts ({correlatedAlerts.length})</span>
              </h3>

              {!isResolved && openAlertsCount > 0 && (
                <button
                  onClick={() => onAcknowledgeAll(incident.id)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#1a2742] hover:bg-[#233558] border border-[#2b3c61] rounded transition-colors"
                >
                  Acknowledge All ({openAlertsCount})
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#1d2b45] bg-[#0c1322]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#19253d] text-slate-400 font-mono text-[11px]">
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Service</th>
                    <th className="p-2.5">Symptom Title</th>
                    <th className="p-2.5">Source</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#152035]">
                  {correlatedAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-[#121c30]">
                      <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                        {alert.time}
                      </td>
                      <td className="p-2.5">
                        <span className={`font-semibold ${
                          alert.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-slate-200">
                        {alert.service}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {alert.title}
                      </td>
                      <td className="p-2.5 text-slate-400 font-mono text-[11px]">
                        {alert.source}
                      </td>
                      <td className="p-2.5 text-right">
                        {alert.status === 'Resolved' ? (
                          <span className="text-emerald-400 font-medium">Resolved</span>
                        ) : alert.status === 'Acknowledged' ? (
                          <span className="text-slate-400 font-mono">Acked</span>
                        ) : (
                          <button
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            className="px-2 py-0.5 text-[11px] bg-[#1a263e] hover:bg-[#233454] text-slate-300 rounded border border-[#273757]"
                          >
                            Ack
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#131d33] border-t border-[#213150] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            AIOps noise reduction ratio: <strong className="text-emerald-400 font-mono">11 alerts → 1 actionable incident</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#1a253c] hover:bg-[#22314d] rounded-md transition-colors"
            >
              Close
            </button>

            {!isResolved ? (
              <button
                onClick={() => {
                  onResolveIncident(incident.id);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-700/20"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Resolve Incident</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 px-3 py-1.5 bg-emerald-950/60 rounded border border-emerald-800/60">
                <CheckCircle className="w-4 h-4" />
                <span>Incident Resolved</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
