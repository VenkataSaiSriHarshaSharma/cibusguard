import React from 'react';
import { ShieldCheck, Plus, Camera, BellRing, Leaf } from 'lucide-react';

interface NavbarProps {
  activeTab: 'inventory' | 'ingestion' | 'sdg' | 'donation' | 'agent';
  setActiveTab: (tab: 'inventory' | 'ingestion' | 'sdg' | 'donation' | 'agent') => void;
  onOpenQuickAdd: () => void;
  onOpenVisionScan: () => void;
  criticalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenVisionScan,
  criticalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            <Leaf className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
              CibusGuard
            </span>
            <span className="text-[11px] font-medium text-slate-500 block leading-none">
              Food Monitoring Agent · SDG 12.3 & 2
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'inventory'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Inventory Monitor
            {criticalCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-mono font-medium">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ingestion'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Ingestion Channels
          </button>

          <button
            onClick={() => setActiveTab('sdg')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'sdg'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            SDG Compliance
          </button>

          <button
            onClick={() => setActiveTab('donation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'donation'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Rescue & Donation
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'agent'
                ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            AI Agent Hub
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVisionScan}
            title="Scan Receipt, Shelf, or Invoice"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>Scan Receipt / Shelf</span>
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Food Item</span>
          </button>
        </div>
      </div>
    </header>
  );
};
