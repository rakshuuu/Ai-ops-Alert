import React, { useState, useMemo } from 'react';
import { Alert, AlertSeverity, AlertSource } from '../types';
import { Search, Filter, Check, ExternalLink, Download, Layers } from 'lucide-react';

interface AlertStreamProps {
  alerts: Alert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onSelectAlert: (alert: Alert) => void;
  onSelectIncidentId: (incidentId: string) => void;
  onBulkAckNoise: () => void;
}

export const AlertStream: React.FC<AlertStreamProps> = ({
  alerts,
  onAcknowledgeAlert,
  onSelectAlert,
  onSelectIncidentId,
  onBulkAckNoise
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All'); // 'All' | 'Correlated' | 'Noise'
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (severityFilter !== 'All' && alert.severity !== severityFilter) return false;
      if (sourceFilter !== 'All' && alert.source !== sourceFilter) return false;
      if (groupFilter === 'Correlated' && !alert.correlated) return false;
      if (groupFilter === 'Noise' && alert.correlated) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesService = alert.service.toLowerCase().includes(q);
        const matchesTitle = alert.title.toLowerCase().includes(q);
        const matchesId = alert.id.toLowerCase().includes(q);
        const matchesIncident = alert.incident_id?.toLowerCase().includes(q);
        if (!matchesService && !matchesTitle && !matchesId && !matchesIncident) {
          return false;
        }
      }

      return true;
    });
  }, [alerts, severityFilter, sourceFilter, groupFilter, searchQuery]);

  // Export filtered alerts as JSON or CSV
  const exportAlerts = (format: 'json' | 'csv') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(filteredAlerts, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signalops_alerts_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = ['ID', 'Time', 'Severity', 'Service', 'Title', 'Source', 'Incident', 'Status'];
      const rows = filteredAlerts.map(a => [
        a.id, a.time, a.severity, a.service, `"${a.title.replace(/"/g, '""')}"`, a.source, a.incident_id || 'None', a.status
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signalops_alerts_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-[#111828] border border-[#22304d] rounded-xl p-5 flex flex-col">
      
      {/* Panel Heading & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1d2942]">
        <div>
          <h2 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2">
            <span>Live Alert Stream</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
              REAL-TIME TELEMETRY
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming telemetry across metrics, logs, synthetic uptime checks, and distributed traces
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service, alert, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#141e33] border border-[#26375a] text-slate-200 placeholder:text-slate-500 rounded-md pl-8 pr-3 py-1.5 text-xs w-48 sm:w-56 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Sources</option>
            <option value="Metrics">Metrics</option>
            <option value="Logs">Logs</option>
            <option value="Uptime">Uptime</option>
            <option value="Tracing">Tracing</option>
          </select>

          {/* Grouping Filter */}
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="bg-[#141e33] border border-[#26375a] text-slate-200 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Groups</option>
            <option value="Correlated">Correlated Incidents Only</option>
            <option value="Noise">Uncorrelated Noise Only</option>
          </select>

          {/* Bulk Ack Noise */}
          <button
            onClick={onBulkAckNoise}
            className="px-2.5 py-1.5 bg-[#17233c] hover:bg-[#203154] text-slate-300 border border-[#2a3c63] rounded-md transition-colors font-medium"
            title="Acknowledge all uncorrelated background noise"
          >
            Ack Noise
          </button>

          {/* Export button */}
          <button
            onClick={() => exportAlerts('csv')}
            className="p-1.5 bg-[#141e33] border border-[#26375a] text-slate-400 hover:text-white rounded-md transition-colors"
            title="Export filtered alerts as CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alert Table */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1c2842] text-slate-400 text-[11px] font-mono tracking-wider uppercase">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Service</th>
              <th className="py-2.5 px-3">Alert / Symptom</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">Correlation Group</th>
              <th className="py-2.5 px-3 text-right">Status / Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17223b]">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                  No alerts match your current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.slice(0, 50).map(alert => {
                const isCorrelated = alert.correlated;
                const isAck = alert.status === 'Acknowledged';
                const isResolved = alert.status === 'Resolved';

                return (
                  <tr
                    key={alert.id}
                    className="hover:bg-[#141e33] transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                      {alert.time}
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        alert.severity === 'Critical'
                          ? 'text-red-400'
                          : alert.severity === 'High'
                          ? 'text-amber-400'
                          : alert.severity === 'Medium'
                          ? 'text-yellow-400'
                          : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          alert.severity === 'Critical'
                            ? 'bg-red-400'
                            : alert.severity === 'High'
                            ? 'bg-amber-400'
                            : alert.severity === 'Medium'
                            ? 'bg-yellow-400'
                            : 'bg-slate-400'
                        }`} />
                        {alert.severity}
                      </span>
                    </td>

                    {/* Service */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span 
                        onClick={() => onSelectAlert(alert)}
                        className="font-medium text-slate-200 hover:text-indigo-300 cursor-pointer transition-colors"
                      >
                        {alert.service}
                      </span>
                    </td>

                    {/* Alert Title */}
                    <td className="py-2.5 px-3">
                      <div 
                        onClick={() => onSelectAlert(alert)}
                        className="cursor-pointer"
                      >
                        <span className="text-slate-100 font-medium hover:text-indigo-300 transition-colors">
                          {alert.title}
                        </span>
                        {alert.observed && (
                          <span className="ml-2 font-mono text-[10px] text-slate-400">
                            ({alert.observed})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-slate-400 font-mono text-[11px]">
                        {alert.source}
                      </span>
                    </td>

                    {/* Incident / Group */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {isCorrelated && alert.incident_id ? (
                        <button
                          onClick={() => onSelectIncidentId(alert.incident_id!)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-mono text-[11px] hover:bg-indigo-900/80 transition-colors"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{alert.incident_id}</span>
                        </button>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Uncorrelated Noise
                        </span>
                      )}
                    </td>

                    {/* Status / Action */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      {isResolved ? (
                        <span className="text-emerald-400 text-xs font-medium">
                          Resolved
                        </span>
                      ) : isAck ? (
                        <span className="text-slate-400 text-xs font-mono">
                          Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 bg-[#1a253d] hover:bg-[#233355] text-slate-300 hover:text-white rounded border border-[#2b3c61] text-xs transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-[#1d2942]">
        <span className="font-mono">
          Showing {Math.min(filteredAlerts.length, 50)} of {filteredAlerts.length} filtered alerts ({alerts.length} in buffer)
        </span>
        <span className="text-slate-500">
          Auto-evaluating correlation window every 3 seconds
        </span>
      </div>

    </div>
  );
};
