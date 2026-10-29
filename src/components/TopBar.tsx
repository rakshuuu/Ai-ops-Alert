import React, { useState } from 'react';
import { Play, Pause, AlertOctagon, Zap, Plus, Volume2, VolumeX, RotateCcw } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLive: boolean;
  onToggleLive: () => void;
  tickSpeed: number;
  onChangeTickSpeed: (speed: number) => void;
  onSimulateDbIncident: () => void;
  onSimulateKafkaIncident: () => void;
  onOpenInjectModal: () => void;
  onResetDemo: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeIncidentsCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  isLive,
  onToggleLive,
  tickSpeed,
  onChangeTickSpeed,
  onSimulateDbIncident,
  onSimulateKafkaIncident,
  onOpenInjectModal,
  onResetDemo,
  soundEnabled,
  onToggleSound,
  activeIncidentsCount
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'incidents', label: 'Incidents', count: activeIncidentsCount },
    { id: 'alerts', label: 'Alert Stream' },
    { id: 'map', label: 'Dependency Map' },
    { id: 'services', label: 'Services (70)' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-[#1f2b45] px-4 lg:px-8 py-3">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-display font-extrabold text-white text-base shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-base tracking-tight text-white whitespace-nowrap">
              SignalOps
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              AIOps Intelligence
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0 bg-[#121b30] p-1 rounded-lg border border-[#223150]">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#212f4f] text-white shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#18243e]'
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded font-semibold ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Simulation Controls & Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live Status indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#132038] border border-[#233558] text-xs text-slate-300">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-slate-500'}`} />
            <span className="font-mono text-[11px] font-medium hidden lg:inline">
              {isLive ? 'LIVE FEED' : 'PAUSED'}
            </span>
            <button
              onClick={onToggleLive}
              title={isLive ? 'Pause simulation feed' : 'Resume simulation feed'}
              className="ml-1 text-slate-400 hover:text-white transition-colors"
            >
              {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Speed Selector */}
          <div className="hidden sm:flex items-center bg-[#132038] border border-[#233558] rounded-md text-[11px] font-mono text-slate-400">
            <button
              onClick={() => onChangeTickSpeed(5000)}
              className={`px-2 py-1 rounded-l-md transition-colors ${tickSpeed === 5000 ? 'bg-[#223356] text-white' : 'hover:text-slate-200'}`}
              title="Slow (5s per tick)"
            >
              5s
            </button>
            <button
              onClick={() => onChangeTickSpeed(3000)}
              className={`px-2 py-1 transition-colors ${tickSpeed === 3000 ? 'bg-[#223356] text-white' : 'hover:text-slate-200'}`}
              title="Normal (3s per tick)"
            >
              3s
            </button>
            <button
              onClick={() => onChangeTickSpeed(1200)}
              className={`px-2 py-1 rounded-r-md transition-colors ${tickSpeed === 1200 ? 'bg-[#223356] text-white' : 'hover:text-slate-200'}`}
              title="Fast (1.2s per tick)"
            >
              1s
            </button>
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute alert chime' : 'Enable alert sound'}
            className="p-1.5 rounded-md bg-[#132038] border border-[#233558] text-slate-400 hover:text-white transition-colors hidden sm:block"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            title="Reset simulation data"
            className="p-1.5 rounded-md bg-[#132038] border border-[#233558] text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Incident Simulation Trigger Dropdown / Primary CTA */}
          <div className="relative">
            <div className="flex rounded-md shadow-md shadow-indigo-600/20">
              <button
                onClick={onSimulateDbIncident}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-l-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Simulate DB Incident</span>
              </button>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-2 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-r-md border-l border-indigo-500/40 text-xs transition-colors"
                title="More simulation scenarios"
              >
                ▾
              </button>
            </div>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-50"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-[#141e35] border border-[#26375c] rounded-lg shadow-2xl p-1 z-50 text-xs">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 tracking-wider">
                    SIMULATION SCENARIOS
                  </div>
                  <button
                    onClick={() => {
                      onSimulateDbIncident();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1d2b4a] text-slate-200 flex items-center justify-between"
                  >
                    <span>Database Slowdown Cascade</span>
                    <span className="text-[10px] text-amber-400 font-mono">11 alerts</span>
                  </button>
                  <button
                    onClick={() => {
                      onSimulateKafkaIncident();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1d2b4a] text-slate-200 flex items-center justify-between"
                  >
                    <span>Kafka Partition Storm</span>
                    <span className="text-[10px] text-indigo-400 font-mono">6 alerts</span>
                  </button>
                  <div className="my-1 border-t border-[#233558]" />
                  <button
                    onClick={() => {
                      onOpenInjectModal();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-[#1d2b4a] text-slate-200 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inject Custom Alert...</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto pt-2.5 mt-2 border-t border-[#1a253d]">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#212f4f] text-white' : 'text-slate-400'
              }`}
            >
              {item.label}
              {item.count !== undefined && item.count > 0 && ` (${item.count})`}
            </button>
          );
        })}
      </div>
    </header>
  );
};
