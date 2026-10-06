import React from 'react';
import { Menu, Camera, Plus, BellRing, Sparkles, ChevronRight, Leaf, FileText } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopHeaderProps {
  activeTab: NavTab;
  onOpenQuickAdd: () => void;
  onOpenVisionScan: () => void;
  onToggleMobileSidebar: () => void;
  onOpenReportModal: () => void;
  criticalCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onOpenQuickAdd,
  onOpenVisionScan,
  onToggleMobileSidebar,
  onOpenReportModal,
  criticalCount,
}) => {
  const tabTitles: Record<NavTab, string> = {
    dashboard: 'Operations Dashboard',
    inventory: 'Inventory Monitor',
    ingestion: 'Ingestion Channels',
    sdg: 'SDG Compliance Hub',
    donation: 'Rescue & Donations',
    agent: 'AI Agent Hub',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left: Mobile hamburger & Contextual Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500 hidden sm:inline">CibusGuard</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
          <span className="font-bold text-slate-900 tracking-tight text-sm">
            {tabTitles[activeTab]}
          </span>
          {criticalCount > 0 && activeTab === 'inventory' && (
            <span className="ml-1.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 rounded">
              {criticalCount} Urgent
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          title="Download Final Summary & SDG Audit Report"
        >
          <FileText className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Summary Report</span>
        </button>

        <button
          onClick={onOpenVisionScan}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-slate-600" />
          <span>Scan Receipt / Shelf</span>
        </button>

        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Food Item</span>
        </button>
      </div>
    </header>
  );
};
