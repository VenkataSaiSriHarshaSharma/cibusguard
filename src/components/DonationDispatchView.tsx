import React, { useState } from 'react';
import {
  HeartHandshake,
  Truck,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
  FileText,
  Printer,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { FoodItem, DonationDispatch } from '../types';

interface DonationDispatchViewProps {
  items: FoodItem[];
  dispatches: DonationDispatch[];
  onCreateDispatch: (dispatch: DonationDispatch) => void;
  preselectedItem?: FoodItem | null;
}

export const DonationDispatchView: React.FC<DonationDispatchViewProps> = ({
  items,
  dispatches,
  onCreateDispatch,
  preselectedItem,
}) => {
  // Items eligible for donation (approaching expiry or available)
  const availableItems = items.filter((i) => i.status === 'available');
  const urgentCandidates = availableItems.filter((i) => i.expiryDays <= 3);

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(
    preselectedItem ? [preselectedItem.id] : urgentCandidates.map((i) => i.id)
  );

  const [partner, setPartner] = useState<string>('Metropolitan Food Bank & Shelter');
  const [partnerType, setPartnerType] = useState<
    'Food Bank' | 'Soup Kitchen' | 'Community Pantry' | 'Youth Shelter'
  >('Food Bank');
  const [transportMethod, setTransportMethod] = useState<string>('Refrigerated Van Pickup');
  const [lastCreatedTicket, setLastCreatedTicket] = useState<DonationDispatch | null>(null);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedItems = availableItems.filter((i) => selectedItemIds.includes(i.id));

  const totalKg = selectedItems.reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0);

  const mealsRescued = Math.max(1, Math.round(totalKg * 2.1));
  const co2DivertedKg = Number((totalKg * 2.5).toFixed(1));

  const handleDispatch = () => {
    if (selectedItems.length === 0) return;

    const newDispatch: DonationDispatch = {
      id: `disp-${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      recipientPartner: partner,
      partnerType,
      items: selectedItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
      })),
      totalKg: Number(totalKg.toFixed(1)),
      mealsRescued,
      co2DivertedKg,
      status: 'Pending Pickup',
      trackingCode: `SDG-RESCUE-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onCreateDispatch(newDispatch);
    setLastCreatedTicket(newDispatch);
    setSelectedItemIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Food Rescue & Donation Dispatcher (SDG 2 · Zero Hunger)
              </h2>
              <p className="text-xs text-slate-500">
                Match wholesome surplus foods approaching expiry with certified local food banks and hunger relief charities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs">
              <span className="text-slate-400">Total Rescued to Date: </span>
              <span className="font-mono font-bold text-slate-900">
                {dispatches.reduce((acc, d) => acc + d.totalKg, 0).toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Ticket Receipt (if just dispatched) */}
      {lastCreatedTicket && (
        <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Food Rescue Manifest #{lastCreatedTicket.trackingCode} Created!
                </h3>
                <span className="text-[11px] text-emerald-800">
                  Dispatched to {lastCreatedTicket.recipientPartner} · Chain-of-Custody logged
                </span>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 text-xs font-medium text-emerald-900 bg-white border border-emerald-300 rounded hover:bg-emerald-50 transition-colors inline-flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">Net Food Weight</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {lastCreatedTicket.totalKg} kg
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">SDG 2 Rescued Meals</span>
              <span className="font-mono font-bold text-blue-700 text-sm">
                {lastCreatedTicket.mealsRescued} meals
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">SDG 13 CO₂e Diverted</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {lastCreatedTicket.co2DivertedKg} kg CO₂e
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-emerald-200">
              <span className="text-slate-400 block text-[10px]">Dispatch Status</span>
              <span className="font-mono font-semibold text-amber-700 text-sm">
                {lastCreatedTicket.status}
              </span>
            </div>
          </div>

          <button
            onClick={() => setLastCreatedTicket(null)}
            className="text-xs text-emerald-800 hover:underline"
          >
            Dismiss ticket &rarr;
          </button>
        </div>
      )}

      {/* Main Dispatch Creation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Eligible items selector */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Select Surplus Items for Donation ({selectedItems.length} selected)
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedItemIds(urgentCandidates.map((i) => i.id))}
                className="text-blue-600 hover:underline"
              >
                Select All Urgent (&le;3d)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setSelectedItemIds([])}
                className="text-slate-500 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          {availableItems.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No food items currently available in inventory.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto border border-slate-200 rounded-md">
              {availableItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const isUrgent = item.expiryDays <= 2;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`p-3 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          <span>{item.name}</span>
                          {isUrgent && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                              Expires in {item.expiryDays}d
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.category} · {item.storageZone}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-900">
                        {item.quantity} {item.unit}
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        ~{item.sdgImpact?.mealsRescued || 1} meals
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Logistics & Destination Config */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Rescue Partner Logistics</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Recipient Organization
              </label>
              <select
                value={partner}
                onChange={(e) => {
                  setPartner(e.target.value);
                  if (e.target.value.includes('Pantry')) setPartnerType('Community Pantry');
                  else if (e.target.value.includes('Soup')) setPartnerType('Soup Kitchen');
                  else if (e.target.value.includes('Youth')) setPartnerType('Youth Shelter');
                  else setPartnerType('Food Bank');
                }}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md bg-white text-slate-800"
              >
                <option value="Metropolitan Food Bank & Shelter">
                  Metropolitan Food Bank & Shelter (Cold-chain enabled)
                </option>
                <option value="Hope Community Pantry">
                  Hope Community Pantry (Fresh produce & grains)
                </option>
                <option value="Second Harvest Soup Kitchen">
                  Second Harvest Soup Kitchen (Cooked meals & batch prep)
                </option>
                <option value="Community Youth & Family Shelter">
                  Community Youth & Family Shelter (Ready-to-eat)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Transport / Custody Method
              </label>
              <select
                value={transportMethod}
                onChange={(e) => setTransportMethod(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-200 rounded-md bg-white text-slate-800"
              >
                <option value="Refrigerated Van Pickup">Refrigerated Van Scheduled Pickup</option>
                <option value="Donor Direct Drop-Off">Direct Drop-Off by Kitchen Team</option>
                <option value="Volunteer Courier Network">Volunteer Rapid Bike/Car Courier</option>
              </select>
            </div>

            {/* Impact Calculation Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Manifest Impact Summary
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Net Surplus Weight:</span>
                <span className="font-mono font-bold text-slate-900">{totalKg.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">SDG 2 Rescued Meals:</span>
                <span className="font-mono font-bold text-blue-700">{mealsRescued} portions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">SDG 13 CO₂e Averted:</span>
                <span className="font-mono font-bold text-emerald-700">{co2DivertedKg} kg CO₂e</span>
              </div>
            </div>

            <button
              onClick={handleDispatch}
              disabled={selectedItems.length === 0}
              className="w-full py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Issue Rescue Dispatch Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatches History Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Historical Donation Dispatches ({dispatches.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Tracking Code</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Partner Shelter</th>
                <th className="py-2.5 px-3 text-right">Volume</th>
                <th className="py-2.5 px-3 text-right">Meals (SDG 2)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispatches.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                    {d.trackingCode}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{d.timestamp}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-900">{d.recipientPartner}</div>
                    <div className="text-[11px] text-slate-400">{d.partnerType}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    {d.totalKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-blue-700">
                    {d.mealsRescued}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
