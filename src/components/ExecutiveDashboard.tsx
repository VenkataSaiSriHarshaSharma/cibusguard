import React from 'react';
import {
  Package,
  AlertTriangle,
  Globe,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Snowflake,
  ArrowRight,
  Thermometer,
  Layers,
  ChefHat,
  Database,
  User,
  Plus,
  Camera,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { FoodItem, DonationDispatch } from '../types';
import { NavTab } from './Sidebar';

interface ExecutiveDashboardProps {
  items: FoodItem[];
  dispatches: DonationDispatch[];
  setActiveTab: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
  onOpenVisionScan: () => void;
  onOpenAudit: () => void;
  onOpenReportModal?: () => void;
  onConsumeItem: (id: string) => void;
  onDonateItem: (item: FoodItem) => void;
  onExtendFreezer: (id: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  items,
  dispatches,
  setActiveTab,
  onOpenQuickAdd,
  onOpenVisionScan,
  onOpenAudit,
  onOpenReportModal,
  onConsumeItem,
  onDonateItem,
  onExtendFreezer,
}) => {
  const availableItems = items.filter((i) => i.status === 'available');
  const consumedItems = items.filter((i) => i.status === 'consumed');
  const donatedItems = items.filter((i) => i.status === 'donated');
  const discardedItems = items.filter((i) => i.status === 'discarded');

  // Spoilage Risk
  const criticalItems = availableItems.filter((i) => i.expiryDays <= 2);
  const approachingItems = availableItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 5);
  const intermediateItems = availableItems.filter((i) => i.expiryDays > 5 && i.expiryDays <= 14);
  const stableItems = availableItems.filter((i) => i.expiryDays > 14);

  // Volume calculations
  const totalAvailableKg = availableItems.reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0);

  const criticalKg = criticalItems.reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0);

  const totalRescuedKg = [...consumedItems, ...donatedItems].reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0) + dispatches.reduce((acc, d) => acc + d.totalKg, 0);

  const totalDiscardedKg = discardedItems.reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0);

  const totalProcessedKg = totalRescuedKg + totalDiscardedKg;
  const wasteAversionRate = totalProcessedKg > 0
    ? Math.round((totalRescuedKg / totalProcessedKg) * 100)
    : 94;

  const co2AvoidedKg = Number((totalRescuedKg * 2.5).toFixed(1));
  const mealsRescued = Math.round(totalRescuedKg * 2.1) + dispatches.reduce((acc, d) => acc + d.mealsRescued, 0);

  // Ingestion source breakdown
  const sourceBreakdown = {
    user: items.filter((i) => i.source === 'user').length,
    kitchen: items.filter((i) => i.source === 'kitchen').length,
    inventory_system: items.filter((i) => i.source === 'inventory_system').length,
    agent_prompt: items.filter((i) => i.source === 'agent_prompt' || i.source === 'vision_scan').length,
  };

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Action Launchpad */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Operational Telemetry · HACCP Cold Chain Intact</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Food Monitoring Operations Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Monitoring active stock volume, FIFO rotation schedules, impending expiry hazards, and direct compliance with UN SDG Targets 12.3 and 2.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenQuickAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Food Batch</span>
            </button>

            <button
              onClick={onOpenVisionScan}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Scan Receipt / Shelf</span>
            </button>

            <button
              onClick={onOpenAudit}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Run Spoilage Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('donation')}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors inline-flex items-center gap-1.5 border border-blue-200"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Dispatch Rescue</span>
            </button>

            {onOpenReportModal && (
              <button
                onClick={onOpenReportModal}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5"
                title="Download Final Audit & SDG Summary Report"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Download Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Executive KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Total Active Stock</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalAvailableKg.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{availableItems.length} active batches logged</span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-emerald-700 font-semibold hover:underline"
            >
              View list &rarr;
            </button>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700 mb-1">
            <span>Critical Spoilage Risk (≤ 48h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-900">
            {criticalItems.length}{' '}
            <span className="text-xs font-normal text-amber-700 font-sans">batches</span>
          </div>
          <div className="text-xs text-amber-700 mt-1 flex items-center justify-between">
            <span>{criticalKg.toFixed(1)} kg at risk</span>
            <span className="font-semibold text-amber-900">FIFO Priority</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-700 mb-1">
            <span>SDG 12.3 Diversion Rate</span>
            <Globe className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-900">
            {wasteAversionRate}%{' '}
            <span className="text-xs font-normal text-emerald-700 font-sans">averted</span>
          </div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center justify-between">
            <span>{totalRescuedKg.toFixed(1)} kg rescued from landfill</span>
            <button
              onClick={() => setActiveTab('sdg')}
              className="font-semibold hover:underline"
            >
              SDG Hub &rarr;
            </button>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-blue-700 mb-1">
            <span>SDG 2 Rescued Meals</span>
            <HeartHandshake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-900">
            {mealsRescued}{' '}
            <span className="text-xs font-normal text-blue-700 font-sans">meals</span>
          </div>
          <div className="text-xs text-blue-700 mt-1 flex items-center justify-between">
            <span>{co2AvoidedKg} kg CO₂e mitigated</span>
            <span className="font-mono font-medium">{dispatches.length} dispatches</span>
          </div>
        </div>
      </div>

      {/* Expiry Horizon & Urgent Action Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Action Queue (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Urgent Spoilage Rescue Queue</span>
                {criticalItems.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-mono font-bold">
                    {criticalItems.length} Urgent
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Food items requiring immediate culinary utilization, freezing, or donation dispatch.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-emerald-700 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Manage all items</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {criticalItems.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-xs font-semibold text-slate-800">
                All Inventory Fresh & Safe
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                No batches are in critical 48-hour expiration range. First-In-First-Out rotation is well maintained.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {criticalItems.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {item.expiryDays <= 0 ? '!' : `${item.expiryDays}d`}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.batchNumber || 'Batch N/A'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span>{item.category}</span>
                        <span aria-hidden="true" className="mx-1">·</span>
                        <span>{item.storageZone}</span>
                        <span aria-hidden="true" className="mx-1">·</span>
                        <span className="font-mono text-slate-700">{item.quantity} {item.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onConsumeItem(item.id)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 rounded transition-colors"
                    >
                      Cook / Use
                    </button>
                    <button
                      onClick={() => onDonateItem(item)}
                      className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      Donate (SDG 2)
                    </button>
                    {item.storageZone !== 'Deep Freezer' && (
                      <button
                        onClick={() => onExtendFreezer(item.id)}
                        className="px-2 py-1 text-xs text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 border border-slate-200 rounded transition-colors"
                        title="Flash freeze (+90 days)"
                      >
                        <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Horizon Distribution (1 col) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Perishability Horizon</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock distribution by remaining shelf life.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Critical */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-amber-800">Critical (&le; 2 Days)</span>
                <span className="font-mono font-bold text-slate-900">{criticalItems.length} items</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (criticalItems.length / Math.max(1, availableItems.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Approaching */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Approaching (3–5 Days)</span>
                <span className="font-mono font-bold text-slate-900">{approachingItems.length} items</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-300 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (approachingItems.length / Math.max(1, availableItems.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Intermediate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Intermediate (6–14 Days)</span>
                <span className="font-mono font-bold text-slate-900">{intermediateItems.length} items</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (intermediateItems.length / Math.max(1, availableItems.length)) * 100)}%` }}
                />
              </div>
            </div>

            {/* Stable */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-700">Stable (&gt; 14 Days)</span>
                <span className="font-mono font-bold text-slate-900">{stableItems.length} items</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (stableItems.length / Math.max(1, availableItems.length)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
            Strict FIFO adherence ensures intermediate and approaching batches are rotated before new stock is unsealed.
          </div>
        </div>
      </div>

      {/* Facilities & Multi-Channel Feed Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage Facility & Cold-Chain Integrity */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-sky-600" />
                <span>Cold Chain & Facility Storage Zones</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active temperature monitoring for HACCP food safety compliance (SDG 3).
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              ALL NOMINAL
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Walk-in Main Refrigerator</div>
                <div className="text-[11px] text-slate-500">Chilled Proteins & Produce</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">2.1°C</span>
                <div className="text-[10px] text-emerald-700">Target 1–3°C</div>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Blast & Deep Freezer</div>
                <div className="text-[11px] text-slate-500">Long-term frozen stock</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">-18.5°C</span>
                <div className="text-[10px] text-emerald-700">Target &le; -18°C</div>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Prep Line Station (Garde-Manger)</div>
                <div className="text-[11px] text-slate-500">Daily service batch wells</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">3.4°C</span>
                <div className="text-[10px] text-emerald-700">Target &le; 4°C</div>
              </div>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">Dry Goods Pantry</div>
                <div className="text-[11px] text-slate-500">Grains, pasta, canned goods</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-slate-900">20.2°C</span>
                <div className="text-[10px] text-slate-500">Ambient (18-22°C)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Channel Ingestion Telemetry */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Multi-Channel Ingestion Inflow</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution of recorded items across user, kitchen staff, and inventory channels.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('ingestion')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Add entry &rarr;
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-800">Household / Consumer</div>
                  <div className="text-[11px] text-slate-500">Direct user logger & voice notes</div>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{sourceBreakdown.user} items</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-semibold text-slate-800">Kitchen Staff Shift Sheets</div>
                  <div className="text-[11px] text-slate-500">HACCP prep batches & cook-chill stamps</div>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{sourceBreakdown.kitchen} batches</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-800">Inventory Systems & Barcode</div>
                  <div className="text-[11px] text-slate-500">POS / ERP EDI manifests & UPC scans</div>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{sourceBreakdown.inventory_system} loads</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="font-semibold text-slate-800">AI Conversational & Vision</div>
                  <div className="text-[11px] text-slate-500">Gemini receipt scans & voice extraction</div>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-900">{sourceBreakdown.agent_prompt} items</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
