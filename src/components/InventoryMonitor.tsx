import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Snowflake,
  HeartHandshake,
  CheckCircle2,
  Trash2,
  Thermometer,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import { FoodItem, FoodCategory, StorageZone } from '../types';

interface InventoryMonitorProps {
  items: FoodItem[];
  onConsumeItem: (id: string) => void;
  onDonateItem: (item: FoodItem) => void;
  onExtendFreezer: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onOpenQuickAdd: () => void;
  onOpenAudit: () => void;
  initialZoneFilter?: string;
  onZoneFilterChange?: (zone: string) => void;
}

export const InventoryMonitor: React.FC<InventoryMonitorProps> = ({
  items,
  onConsumeItem,
  onDonateItem,
  onExtendFreezer,
  onDeleteItem,
  onUpdateQuantity,
  onOpenQuickAdd,
  onOpenAudit,
  initialZoneFilter = 'all',
  onZoneFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>(initialZoneFilter);
  const [selectedExpiryRisk, setSelectedExpiryRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'quantity'>('expiry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Sync when initialZoneFilter changes externally
  React.useEffect(() => {
    if (initialZoneFilter) {
      setSelectedZone(initialZoneFilter);
    }
  }, [initialZoneFilter]);

  // Active items (available)
  const availableItems = useMemo(
    () => items.filter((i) => i.status === 'available'),
    [items]
  );

  // Spoilage risk calculation
  const criticalItems = useMemo(
    () => availableItems.filter((i) => i.expiryDays <= 2),
    [availableItems]
  );

  const approachingItems = useMemo(
    () => availableItems.filter((i) => i.expiryDays > 2 && i.expiryDays <= 5),
    [availableItems]
  );

  // Impact metrics
  const totalWeightKg = useMemo(() => {
    return availableItems.reduce((acc, i) => {
      const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.4;
      return acc + kg;
    }, 0);
  }, [availableItems]);

  const totalCo2AtRisk = useMemo(() => {
    return criticalItems.reduce((acc, i) => acc + (i.sdgImpact?.co2AvoidableKg || 0), 0);
  }, [criticalItems]);

  // Filtering & Sorting
  const filteredItems = useMemo(() => {
    return availableItems
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || item.category === selectedCategory;

        const matchesZone =
          selectedZone === 'all' || item.storageZone === selectedZone;

        const matchesRisk =
          selectedExpiryRisk === 'all' ||
          (selectedExpiryRisk === 'critical' && item.expiryDays <= 2) ||
          (selectedExpiryRisk === 'approaching' && item.expiryDays > 2 && item.expiryDays <= 5) ||
          (selectedExpiryRisk === 'stable' && item.expiryDays > 5);

        return matchesSearch && matchesCategory && matchesZone && matchesRisk;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry') {
          return sortOrder === 'asc' ? a.expiryDays - b.expiryDays : b.expiryDays - a.expiryDays;
        }
        if (sortBy === 'quantity') {
          return sortOrder === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity;
        }
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      });
  }, [availableItems, searchQuery, selectedCategory, selectedZone, selectedExpiryRisk, sortBy, sortOrder]);

  const categories: FoodCategory[] = [
    'Produce',
    'Dairy & Eggs',
    'Meat & Seafood',
    'Bakery & Grains',
    'Prepared & Deli',
    'Pantry & Dry Goods',
    'Beverages',
    'Frozen',
  ];

  const storageZones: StorageZone[] = [
    'Walk-in Cooler',
    'Deep Freezer',
    'Dry Pantry',
    'Prep Line Station',
    'Ambient Display',
    'Cold Display',
  ];

  return (
    <div className="space-y-6">
      {/* KPI Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Active Food Stock</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {availableItems.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">items</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-mono tabular-nums font-semibold text-slate-700">
              {totalWeightKg.toFixed(1)} kg
            </span>{' '}
            total monitored volume
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700 mb-1">
            <span>Critical Expiry (≤ 48h)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-900">
            {criticalItems.length}{' '}
            <span className="text-xs font-normal text-amber-700 font-sans">batches</span>
          </div>
          <div className="text-xs text-amber-700 mt-1 flex items-center justify-between">
            <span>FIFO action required</span>
            <button
              onClick={() => setSelectedExpiryRisk('critical')}
              className="text-amber-800 font-semibold hover:underline"
            >
              Filter critical &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
            <span>Approaching Window (3–5d)</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {approachingItems.length}{' '}
            <span className="text-xs font-normal text-slate-500 font-sans">batches</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Prep schedule & rescue candidate pipeline
          </div>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-700 mb-1">
            <span>SDG 13 CO₂e at Risk</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-900">
            {totalCo2AtRisk.toFixed(1)}{' '}
            <span className="text-xs font-normal text-emerald-700 font-sans">kg CO₂e</span>
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Avertable by prompt consumption or donation
          </div>
        </div>
      </div>

      {/* Critical Expiry Alert Banner (if any) */}
      {criticalItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                SDG 12.3 Action Alert: {criticalItems.length} items reach expiration within 48 hours
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Top candidates for immediate kitchen prep special, freezer stabilization, or donation dispatch to local food banks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAudit}
              className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap"
            >
              Run Agent Audit
            </button>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, notes, or batch code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Quick Segmented Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedExpiryRisk('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedExpiryRisk === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({availableItems.length})
            </button>
            <button
              onClick={() => setSelectedExpiryRisk('critical')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedExpiryRisk === 'critical'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              Critical &le; 2d ({criticalItems.length})
            </button>
            <button
              onClick={() => setSelectedExpiryRisk('approaching')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedExpiryRisk === 'approaching'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approaching 3–5d ({approachingItems.length})
            </button>
            <button
              onClick={() => setSelectedExpiryRisk('stable')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedExpiryRisk === 'stable'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stable &gt; 5d
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'cards' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card View
            </button>
          </div>
        </div>

        {/* Category & Storage Zone Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Filter by:</span>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
          >
            <option value="all">All Storage Zones</option>
            {storageZones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort:</span>
            <button
              onClick={() => {
                if (sortBy === 'expiry') {
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('expiry');
                  setSortOrder('asc');
                }
              }}
              className={`px-2.5 py-1.5 border rounded-md flex items-center gap-1 ${
                sortBy === 'expiry'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              Expiry Date (FIFO)
              <ArrowUpDown className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                if (sortBy === 'quantity') {
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy('quantity');
                  setSortOrder('desc');
                }
              }}
              className={`px-2.5 py-1.5 border rounded-md flex items-center gap-1 ${
                sortBy === 'quantity'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-medium'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              Quantity
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No food items match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, category selection, or register a new batch.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
          >
            Log New Item
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Data Grid */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-3">Storage & Temp</th>
                  <th className="py-3 px-3 text-right">Quantity</th>
                  <th className="py-3 px-3">Expiry Date (FIFO)</th>
                  <th className="py-3 px-3">SDG Impact Value</th>
                  <th className="py-3 px-4 text-right">Direct Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isCritical = item.expiryDays <= 2;
                  const isApproaching = item.expiryDays > 2 && item.expiryDays <= 5;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCritical ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name & Category */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{item.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{item.batchNumber || 'Batch N/A'}</span>
                          {item.allergens && item.allergens.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-700">
                                Contains {item.allergens.join(', ')}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Storage & Temp */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{item.storageZone}</div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                          <Thermometer className="w-3 h-3 text-slate-400" />
                          <span>{item.temperatureZone}</span>
                        </div>
                      </td>

                      {/* Quantity with quick +/- */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-5 h-5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 min-w-14 text-center">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="w-5 h-5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Expiry countdown */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {isCritical ? (
                            <span className="font-mono font-bold text-amber-700">
                              {item.expiryDays <= 0
                                ? 'Expires Today'
                                : item.expiryDays === 1
                                ? '1 day left'
                                : '2 days left'}
                            </span>
                          ) : isApproaching ? (
                            <span className="font-mono font-medium text-slate-800">
                              {item.expiryDays} days remaining
                            </span>
                          ) : (
                            <span className="font-mono text-slate-600">
                              {item.expiryDays} days remaining
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Target: {item.expiryDate}
                        </div>
                      </td>

                      {/* SDG Impact */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-700">
                          <span className="font-mono tabular-nums font-semibold text-emerald-700">
                            {item.sdgImpact?.co2AvoidableKg || 0} kg CO₂e
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-mono tabular-nums">
                            {item.sdgImpact?.mealsRescued || 1} meals
                          </span>{' '}
                          potential (SDG 2)
                        </div>
                      </td>

                      {/* Direct Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onConsumeItem(item.id)}
                            title="Mark as consumed in recipe or service"
                            className="px-2 py-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Consume</span>
                          </button>

                          <button
                            onClick={() => onDonateItem(item)}
                            title="Dispatch surplus to food rescue shelter (SDG 2)"
                            className="px-2 py-1 text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
                            <span>Donate</span>
                          </button>

                          {item.storageZone !== 'Deep Freezer' && (
                            <button
                              onClick={() => onExtendFreezer(item.id)}
                              title="Transfer to freezer to extend shelf life (+90 days)"
                              className="px-2 py-1 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Freeze</span>
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Remove or log discard"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isCritical = item.expiryDays <= 2;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  isCritical
                    ? 'border-amber-300 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm leading-snug">
                      {item.name}
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.category} · {item.storageZone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        isCritical ? 'text-amber-700 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {item.expiryDays <= 0
                        ? 'Expires Today'
                        : `${item.expiryDays}d left`}
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.expiryDate}
                    </div>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                    {item.notes}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Stock: </span>
                    <span className="font-mono font-semibold text-slate-900">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div className="text-slate-500 font-mono">
                    {item.sdgImpact?.co2AvoidableKg}kg CO₂e
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => onConsumeItem(item.id)}
                    className="flex-1 py-1 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 rounded font-medium border border-slate-200"
                  >
                    Consume
                  </button>
                  <button
                    onClick={() => onDonateItem(item)}
                    className="flex-1 py-1 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-800 rounded font-medium border border-slate-200"
                  >
                    Donate
                  </button>
                  {item.storageZone !== 'Deep Freezer' && (
                    <button
                      onClick={() => onExtendFreezer(item.id)}
                      className="px-2 py-1 text-xs text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded font-medium border border-slate-200"
                      title="Freeze (+90 days)"
                    >
                      <Snowflake className="w-3.5 h-3.5 text-cyan-600" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
