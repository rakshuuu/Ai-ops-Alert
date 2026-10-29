import React, { useState } from 'react';
import { ALL_SERVICES_NAMES, COMMON_SYMPTOMS } from '../data/servicesData';
import { AlertSeverity, AlertSource } from '../types';
import { X, PlusCircle } from 'lucide-react';

interface InjectAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (service: string, severity: AlertSeverity, title: string, source: AlertSource) => void;
}

export const InjectAlertModal: React.FC<InjectAlertModalProps> = ({
  isOpen,
  onClose,
  onInject
}) => {
  if (!isOpen) return null;

  const [service, setService] = useState<string>(ALL_SERVICES_NAMES[0]);
  const [severity, setSeverity] = useState<AlertSeverity>('High');
  const [source, setSource] = useState<AlertSource>('Metrics');
  const [title, setTitle] = useState<string>(COMMON_SYMPTOMS[0]);
  const [customTitle, setCustomTitle] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = customTitle.trim() || title;
    onInject(service, severity, finalTitle, source);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#0f172a] border border-[#26375a] rounded-xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 bg-[#131d33] border-b border-[#213150] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-indigo-400" />
            <span className="font-display font-bold text-sm text-white">
              Inject Custom Alert
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Target Microservice (70 available)
            </label>
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {ALL_SERVICES_NAMES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as AlertSeverity)}
                className="w-full bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Telemetry Source
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value as AlertSource)}
                className="w-full bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Metrics">Metrics</option>
                <option value="Logs">Logs</option>
                <option value="Uptime">Uptime</option>
                <option value="Tracing">Tracing</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Select Preset Symptom
            </label>
            <select
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setCustomTitle('');
              }}
              className="w-full bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            >
              {COMMON_SYMPTOMS.map((sym, idx) => (
                <option key={idx} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Or Custom Symptom Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Socket pool memory exhausted"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              className="w-full bg-[#141e33] border border-[#26375a] text-slate-200 placeholder:text-slate-500 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1e2c47]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-300 hover:text-white bg-[#1a253c] rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
            >
              Inject Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
