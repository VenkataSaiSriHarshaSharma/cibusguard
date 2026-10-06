import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Globe,
  HeartHandshake,
  Bot,
  Thermometer,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Leaf,
  Plus,
  AlertTriangle,
  Flame,
  FileText,
} from 'lucide-react';
import { StorageZone } from '../types';

export type NavTab = 'dashboard' | 'inventory' | 'ingestion' | 'sdg' | 'donation' | 'agent';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  criticalCount: number;
  totalItemsCount: number;
  wasteAversionRate: number;
  onOpenQuickAdd: () => void;
  onOpenAudit: () => void;
  onOpenReportModal?: () => void;
  selectedZoneFilter: string;
  setSelectedZoneFilter: (zone: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalCount,
  totalItemsCount,
  wasteAversionRate,
  onOpenQuickAdd,
  onOpenAudit,
  onOpenReportModal,
  selectedZoneFilter,
  setSelectedZoneFilter,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Operations Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Inventory Monitor',
      icon: Package,
      badge: criticalCount > 0 ? `${criticalCount} urgent` : `${totalItemsCount}`,
      badgeColor: criticalCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'ingestion' as NavTab,
      label: 'Ingestion Channels',
      icon: Layers,
      subtext: 'User · Kitchen · EDI · AI',
      badge: '4 in',
    },
    {
      id: 'sdg' as NavTab,
      label: 'SDG Compliance Hub',
      icon: Globe,
      badge: 'UN 12.3',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'donation' as NavTab,
      label: 'Rescue & Donations',
      icon: HeartHandshake,
      badge: 'SDG 2',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'agent' as NavTab,
      label: 'AI Agent Hub',
      icon: Bot,
      badge: 'Gemini',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
  ];

  const storageZonesList: Array<{ name: StorageZone; temp: string; isCold: boolean }> = [
    { name: 'Walk-in Cooler', temp: '2.1°C', isCold: true },
    { name: 'Cold Display', temp: '2.8°C', isCold: true },
    { name: 'Deep Freezer', temp: '-18.5°C', isCold: true },
    { name: 'Prep Line Station', temp: '3.4°C', isCold: true },
    { name: 'Dry Pantry', temp: '20.2°C', isCold: false },
    { name: 'Ambient Display', temp: '19.5°C', isCold: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
            <Leaf className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
              CibusGuard
            </h1>
            <span className="text-[10px] font-medium text-slate-500 block leading-none">
              Food Monitoring Agent
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${
                        isActive
                          ? 'bg-slate-800 text-emerald-300'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Storage Zones Status */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
            <span>Storage Zones (HACCP)</span>
            <span className="text-[9px] text-emerald-600 font-normal">Live</span>
          </div>
          <div className="space-y-1">
            {storageZonesList.map((zone) => {
              const isSelected = selectedZoneFilter === zone.name;

              return (
                <button
                  key={zone.name}
                  onClick={() => {
                    if (selectedZoneFilter === zone.name) {
                      setSelectedZoneFilter('all');
                    } else {
                      setSelectedZoneFilter(zone.name);
                      setActiveTab('inventory');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] rounded-md transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{zone.name}</span>
                  <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                    {zone.temp}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SDG 12.3 Compliance Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">UN SDG 12.3 Target</span>
            <span className="font-mono font-bold text-emerald-700">{wasteAversionRate}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, wasteAversionRate)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Target to halve food waste by 2030. Spoilage diversion currently on track.
          </p>
        </div>
      </div>

      {/* Quick Launchpad in Bottom Sidebar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <button
          onClick={onOpenQuickAdd}
          className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Food Item</span>
        </button>

        <button
          onClick={onOpenAudit}
          className="w-full py-1.5 px-3 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Run AI Spoilage Audit</span>
        </button>

        {onOpenReportModal && (
          <button
            onClick={onOpenReportModal}
            className="w-full py-1.5 px-3 text-[11px] font-medium text-slate-700 hover:text-slate-900 hover:bg-white border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            title="Download Final Summary & SDG Audit Report"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>Download Summary Report</span>
          </button>
        )}
      </div>
    </aside>
  );
};
