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
import { SummaryReportModal } from './components/SummaryReportModal';
import { FoodItem, DonationDispatch, AgentAudit, ActivityLogItem } from './types';
import { INITIAL_FOOD_ITEMS, INITIAL_DISPATCHES, calculateDateOffset } from './data/initialData';
import { Check, Info, X } from 'lucide-react';

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'act-1',
    timestamp: '2026-10-04 14:30',
    type: 'donate',
    description: 'Dispatched 28.5 kg surplus vegetable soup and breads to Metropolitan Food Bank',
    impactNote: 'Rescued 62 nutritious meals (SDG 2)',
  },
  {
    id: 'act-2',
    timestamp: '2026-10-05 08:15',
    type: 'add',
    description: 'Recorded batch PREP-992 (Roasted Vegetable Lasagna, 6 trays) via Kitchen Staff channel',
    impactNote: 'HACCP 2-stage cooling verified',
  },
  {
    id: 'act-3',
    timestamp: '2026-10-05 11:15',
    type: 'donate',
    description: 'Dispatched 21.0 kg Greek yogurt and Gala apples to Hope Community Pantry',
    impactNote: 'Rescued 46 nutritious meals (SDG 2)',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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

  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('cibusguard_activity_log');
      return saved ? JSON.parse(saved) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  });

  const [latestAudit, setLatestAudit] = useState<AgentAudit | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem('cibusguard_activity_log', JSON.stringify(activityLog));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [activityLog]);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const getNowTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add items
  const handleAddItems = (newItems: FoodItem[]) => {
    setItems((prev) => [...newItems, ...prev]);

    // Log operational activity
    const itemNames = newItems.map((i) => i.name).slice(0, 3).join(', ');
    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
      type: 'add',
      description: `Ingested ${newItems.length} item(s): ${itemNames}${newItems.length > 3 ? '...' : ''} via ${newItems[0]?.source || 'user'} channel`,
      impactNote: `Added to monitored stock (SDG 12.3)`,
    };
    setActivityLog((prev) => [logEntry, ...prev]);

    showNotification(`Added ${newItems.length} item${newItems.length > 1 ? 's' : ''} to monitored food stock.`);
  };

  // Mark item as consumed
  const handleConsumeItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'consumed' } : item))
    );

    if (target) {
      const logEntry: ActivityLogItem = {
        id: `act-${Date.now()}`,
        timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
        type: 'consume',
        description: `Consumed ${target.quantity} ${target.unit} of ${target.name} in kitchen meal prep`,
        impactNote: `+${target.sdgImpact?.co2AvoidableKg || 2.5}kg CO₂e landfill waste avoided`,
      };
      setActivityLog((prev) => [logEntry, ...prev]);
    }

    showNotification('Item marked as consumed. Spoilage avoided for SDG 12.3.');
  };

  // Launch donation flow for item
  const handleDonateItem = (item: FoodItem) => {
    setPreselectedDonationItem(item);
    setActiveTab('donation');
  };

  // Extend shelf life by freezing
  const handleExtendFreezer = (id: string) => {
    let targetName = 'Food item';
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          targetName = item.name;
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

    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
      type: 'freeze',
      description: `Transferred ${targetName} to Deep Freezer (-18°C) extending shelf life by +90 days`,
      impactNote: 'Spoilage prevented via temperature control (SDG 3 & 12.3)',
    };
    setActivityLog((prev) => [logEntry, ...prev]);

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
    const target = items.find((i) => i.id === id);
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'discarded' } : item))
    );

    if (target) {
      const logEntry: ActivityLogItem = {
        id: `act-${Date.now()}`,
        timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
        type: 'discard',
        description: `Logged discard of ${target.name} (${target.quantity} ${target.unit}) for waste audit log`,
        impactNote: 'Loss recorded in SDG 12.3 audit metrics',
      };
      setActivityLog((prev) => [logEntry, ...prev]);
    }

    showNotification('Item marked as discarded in audit logs.', 'info');
  };

  // Adjust item quantity
  const handleUpdateQuantity = (id: string, delta: number) => {
    let updatedName = '';
    let finalQty = 1;
    let unitStr = '';

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          updatedName = item.name;
          unitStr = item.unit;
          finalQty = Math.max(0.1, Number((item.quantity + delta).toFixed(1)));
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );

    if (updatedName) {
      const logEntry: ActivityLogItem = {
        id: `act-${Date.now()}`,
        timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
        type: 'quantity',
        description: `Adjusted inventory quantity for ${updatedName} to ${finalQty} ${unitStr}`,
      };
      setActivityLog((prev) => [logEntry, ...prev]);
    }
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

    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
      type: 'donate',
      description: `Dispatched ${newDispatch.totalKg} kg (${newDispatch.mealsRescued} meals) to ${newDispatch.recipientPartner}`,
      impactNote: `Rescue Manifest #${newDispatch.trackingCode} (SDG 2 & 13)`,
    };
    setActivityLog((prev) => [logEntry, ...prev]);

    showNotification(`Rescue Manifest #${newDispatch.trackingCode} dispatched to ${newDispatch.recipientPartner}.`);
  };

  // Handle AI Audit completion
  const handleAuditComplete = (audit: AgentAudit) => {
    setLatestAudit(audit);
    const logEntry: ActivityLogItem = {
      id: `act-${Date.now()}`,
      timestamp: `${new Date().toLocaleDateString()} ${getNowTimestamp()}`,
      type: 'audit',
      description: 'Completed comprehensive AI inventory audit and spoilage hazard assessment',
      impactNote: `Generated actionable SDG 12.3 directives`,
    };
    setActivityLog((prev) => [logEntry, ...prev]);
    showNotification('AI Inventory Audit synchronized with live compliance report.');
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
          onOpenReportModal={() => setIsReportModalOpen(true)}
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
                onOpenReportModal={() => {
                  setIsReportModalOpen(true);
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
          onOpenReportModal={() => setIsReportModalOpen(true)}
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
              onOpenReportModal={() => setIsReportModalOpen(true)}
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
              latestAudit={latestAudit}
              onAuditComplete={handleAuditComplete}
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
                onClick={() => setIsReportModalOpen(true)}
                className="hover:text-slate-900 transition-colors font-medium text-emerald-700"
              >
                Download Audit Report
              </button>
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

      {/* Summary Report & SDG Audit Modal (Fully Reactive to all operations) */}
      <SummaryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        items={items}
        dispatches={dispatches}
        activityLog={activityLog}
        latestAudit={latestAudit}
      />
    </div>
  );
}
