import React from 'react';
import { Alert } from '../types';
import { X, Activity, Server, Clock, Layers } from 'lucide-react';

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (alertId: string) => void;
  onSelectIncidentId: (incidentId: string) => void;
  onSelectService: (serviceName: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onSelectIncidentId,
  onSelectService
}) => {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] border border-[#26375a] rounded-xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-[#131d33] border-b border-[#213150] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-300">
              {alert.id}
            </span>
            <span className={`text-xs font-semibold ${
              alert.severity === 'Critical' ? 'text-red-400' : alert.severity === 'High' ? 'text-amber-400' : 'text-slate-300'
            }`}>
              ● {alert.severity}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Alert Title
            </div>
            <div className="font-display font-bold text-base text-white mt-0.5">
              {alert.title}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-[#0b1220] p-3 rounded-lg border border-[#1d2b45]">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Service</div>
              <button
                onClick={() => {
                  onSelectService(alert.service);
                  onClose();
                }}
                className="font-bold text-slate-200 hover:text-indigo-300 transition-colors mt-0.5 text-left"
              >
                {alert.service}
              </button>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono">Source</div>
              <div className="font-medium text-slate-300 mt-0.5">{alert.source}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono">Timestamp</div>
              <div className="font-mono text-slate-300 mt-0.5">{alert.time}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-500 font-mono">Correlation Status</div>
              <div className="mt-0.5">
                {alert.correlated && alert.incident_id ? (
                  <button
                    onClick={() => {
                      onSelectIncidentId(alert.incident_id!);
                      onClose();
                    }}
                    className="font-mono text-indigo-400 hover:underline"
                  >
                    Grouped in {alert.incident_id}
                  </button>
                ) : (
                  <span className="text-slate-400">Uncorrelated Noise</span>
                )}
              </div>
            </div>
          </div>

          {/* Metric Telemetry Breakdown */}
          <div className="p-3 bg-[#0b1220] rounded-lg border border-[#1d2b45] space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Metric Key:</span>
              <span className="text-slate-300">{alert.metric || 'system.utilization.gauge'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Threshold Breached:</span>
              <span className="text-red-300">{alert.threshold || 'SLO limit'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Observed Value:</span>
              <span className="text-amber-300 font-bold">{alert.observed || 'Anomalous spike'}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-[#131d33] border-t border-[#213150] flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Status: <strong className="text-slate-200">{alert.status}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#1a253c] rounded"
            >
              Close
            </button>
            {alert.status === 'Open' && (
              <button
                onClick={() => {
                  onAcknowledge(alert.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
              >
                Acknowledge Alert
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
