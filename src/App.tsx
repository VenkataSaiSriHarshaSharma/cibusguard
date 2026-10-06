import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InventoryMonitor } from './components/InventoryMonitor';
import { IngestionChannels } from './components/IngestionChannels';
import { SdgComplianceHub } from './components/SdgComplianceHub';
import { DonationDispatchView } from './components/DonationDispatchView';
import { AiAgentHub } from './components/AiAgentHub';
import { VisionScanModal } from './components/VisionScanModal';
import { FoodItem, DonationDispatch } from './types';
import { INITIAL_FOOD_ITEMS, INITIAL_DISPATCHES, calculateDateOffset } from './data/initialData';
import { Check, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');

  const [items, setItems] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem('cibusguard_items');
      return saved ? JSON.parse(saved) : INITIAL_FOOD_ITEMS;
    } catch {
      return INITIAL_FOOD_ITEMS;
    }
  });

  const [dispatches, setDispatches] = useState<DonationDispatch[]>(() => {
    try {
      const saved = localStorage.getItem('cibusguard_dispatches');
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [isVisionScanOpen, setIsVisionScanOpen] = useState(false);
  const [preselectedDonationItem, setPreselectedDonationItem] = useState<FoodItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('cibusguard_items', JSON.stringify(items));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem('cibusguard_dispatches', JSON.stringify(dispatches));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [dispatches]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  // Add items
  const handleAddItems = (newItems: FoodItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
    showNotification(`Added ${newItems.length} item${newItems.length > 1 ? 's' : ''} to monitored food stock.`);
  };

  // Mark item as consumed
  const handleConsumeItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'consumed' } : item))
    );
    showNotification('Item marked as consumed. Spoilage avoided for SDG 12.3.');
  };

  // Launch donation flow for item
  const handleDonateItem = (item: FoodItem) => {
    setPreselectedDonationItem(item);
    setActiveTab('donation');
  };

  // Extend shelf life by freezing
  const handleExtendFreezer = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newExpDays = item.expiryDays + 90;
          return {
            ...item,
            storageZone: 'Deep Freezer',
            temperatureZone: 'Frozen (-18°C)',
            expiryDays: newExpDays,
            expiryDate: calculateDateOffset(newExpDays),
            fifoPriority: 'Normal',
            notes: `${item.notes || ''} [Flash frozen on ${new Date().toLocaleDateString()} to halt enzymatic degradation]`,
          };
        }
        return item;
      })
    );
    showNotification('Transferred to Deep Freezer. Shelf life extended by 90 days.');
  };

  // Extend freezer by item name (from Agent hub)
  const handleExtendFreezerByName = (itemName: string) => {
    const target = items.find((i) => i.name.toLowerCase().includes(itemName.toLowerCase()) && i.status === 'available');
    if (target) {
      handleExtendFreezer(target.id);
    }
  };

  // Delete / Discard item
  const handleDeleteItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'discarded' } : item))
    );
    showNotification('Item marked as discarded in audit logs.', 'info');
  };

  // Adjust item quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0.1, Number((item.quantity + delta).toFixed(1)));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Create new Donation Dispatch
  const handleCreateDispatch = (newDispatch: DonationDispatch) => {
    setDispatches((prev) => [newDispatch, ...prev]);

    // Mark matched items as donated
    const itemNames = newDispatch.items.map((i) => i.name);
    setItems((prev) =>
      prev.map((item) =>
        itemNames.includes(item.name) && item.status === 'available'
          ? { ...item, status: 'donated' }
          : item
      )
    );

    showNotification(`Rescue Manifest #${newDispatch.trackingCode} dispatched to ${newDispatch.recipientPartner}.`);
  };

  const availableItems = items.filter((i) => i.status === 'available');
  const criticalCount = availableItems.filter((i) => i.expiryDays <= 2).length;

  const totalRescuedKg = items.filter((i) => i.status === 'consumed' || i.status === 'donated').reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0) + dispatches.reduce((acc, d) => acc + d.totalKg, 0);

  const totalDiscardedKg = items.filter((i) => i.status === 'discarded').reduce((acc, i) => {
    const kg = i.unit === 'kg' ? i.quantity : i.unit === 'g' ? i.quantity / 1000 : i.quantity * 0.45;
    return acc + kg;
  }, 0);

  const totalProcessedKg = totalRescuedKg + totalDiscardedKg;
  const wasteAversionRate = totalProcessedKg > 0 ? Math.round((totalRescuedKg / totalProcessedKg) * 100) : 94;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden md:flex shrink-0 sticky top-0 h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          criticalCount={criticalCount}
          totalItemsCount={availableItems.length}
          wasteAversionRate={wasteAversionRate}
          onOpenQuickAdd={() => setActiveTab('ingestion')}
          onOpenAudit={() => setActiveTab('agent')}
          selectedZoneFilter={selectedZoneFilter}
          setSelectedZoneFilter={setSelectedZoneFilter}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-sm text-slate-900">Menu</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
                criticalCount={criticalCount}
                totalItemsCount={availableItems.length}
                wasteAversionRate={wasteAversionRate}
                onOpenQuickAdd={() => {
                  setActiveTab('ingestion');
                  setIsMobileSidebarOpen(false);
                }}
                onOpenAudit={() => {
                  setActiveTab('agent');
                  setIsMobileSidebarOpen(false);
                }}
                selectedZoneFilter={selectedZoneFilter}
                setSelectedZoneFilter={(zone) => {
                  setSelectedZoneFilter(zone);
                  setIsMobileSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeTab={activeTab}
          onOpenQuickAdd={() => setActiveTab('ingestion')}
          onOpenVisionScan={() => setIsVisionScanOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          criticalCount={criticalCount}
        />

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs rounded-lg shadow-lg border border-slate-700 animate-slide-up">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tab Pages */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboard
              items={items}
              dispatches={dispatches}
              setActiveTab={setActiveTab}
              onOpenQuickAdd={() => setActiveTab('ingestion')}
              onOpenVisionScan={() => setIsVisionScanOpen(true)}
              onOpenAudit={() => setActiveTab('agent')}
              onConsumeItem={handleConsumeItem}
              onDonateItem={handleDonateItem}
              onExtendFreezer={handleExtendFreezer}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryMonitor
              items={items}
              onConsumeItem={handleConsumeItem}
              onDonateItem={handleDonateItem}
              onExtendFreezer={handleExtendFreezer}
              onDeleteItem={handleDeleteItem}
              onUpdateQuantity={handleUpdateQuantity}
              onOpenQuickAdd={() => setActiveTab('ingestion')}
              onOpenAudit={() => setActiveTab('agent')}
              initialZoneFilter={selectedZoneFilter}
              onZoneFilterChange={setSelectedZoneFilter}
            />
          )}

          {activeTab === 'ingestion' && (
            <IngestionChannels
              onAddItems={handleAddItems}
              onClose={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'sdg' && (
            <SdgComplianceHub items={items} dispatches={dispatches} />
          )}

          {activeTab === 'donation' && (
            <DonationDispatchView
              items={items}
              dispatches={dispatches}
              onCreateDispatch={handleCreateDispatch}
              preselectedItem={preselectedDonationItem}
            />
          )}

          {activeTab === 'agent' && (
            <AiAgentHub
              items={items}
              onDonateCandidate={(name) => {
                const target = items.find((i) => i.name.toLowerCase().includes(name.toLowerCase()));
                if (target) handleDonateItem(target);
              }}
              onExtendFreezerByName={handleExtendFreezerByName}
            />
          )}
        </main>

        {/* Quiet Footing */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div>
              <span>CibusGuard Food Monitoring Agent</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>UN SDG Target 12.3 & SDG 2 Framework</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('sdg')}
                className="hover:text-slate-900 transition-colors"
              >
                SDG Targets
              </button>
              <button
                onClick={() => setActiveTab('donation')}
                className="hover:text-slate-900 transition-colors"
              >
                Rescue Network
              </button>
              <button
                onClick={() => setActiveTab('agent')}
                className="hover:text-slate-900 transition-colors"
              >
                AI Copilot
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Vision Scanner Modal */}
      <VisionScanModal
        isOpen={isVisionScanOpen}
        onClose={() => setIsVisionScanOpen(false)}
        onAddItems={handleAddItems}
      />
    </div>
  );
}
