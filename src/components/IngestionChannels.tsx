import React, { useState } from 'react';
import {
  User,
  ChefHat,
  Database,
  Bot,
  Plus,
  Mic,
  MicOff,
  Check,
  Upload,
  Barcode,
  Sparkles,
  ArrowRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { FoodItem, FoodCategory, StorageZone } from '../types';
import { calculateDateOffset } from '../data/initialData';

interface IngestionChannelsProps {
  onAddItems: (items: FoodItem[]) => void;
  onClose?: () => void;
}

export const IngestionChannels: React.FC<IngestionChannelsProps> = ({ onAddItems, onClose }) => {
  const [activeChannel, setActiveChannel] = useState<'user' | 'kitchen' | 'inventory_system' | 'ai_prompt'>('user');

  // Channel 1: User / Consumer State
  const [userName, setUserName] = useState('');
  const [userCategory, setUserCategory] = useState<FoodCategory>('Produce');
  const [userQuantity, setUserQuantity] = useState<number>(1);
  const [userUnit, setUserUnit] = useState<string>('kg');
  const [userStorage, setUserStorage] = useState<StorageZone>('Walk-in Cooler');
  const [userDays, setUserDays] = useState<number>(5);
  const [userNotes, setUserNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Channel 2: Kitchen Staff State
  const [kitchenDishName, setKitchenDishName] = useState('');
  const [kitchenCategory, setKitchenCategory] = useState<FoodCategory>('Prepared & Deli');
  const [kitchenBatchSize, setKitchenBatchSize] = useState<number>(10);
  const [kitchenBatchUnit, setKitchenBatchUnit] = useState<string>('portions');
  const [kitchenStation, setKitchenStation] = useState<StorageZone>('Prep Line Station');
  const [kitchenCookTemp, setKitchenCookTemp] = useState<number>(75);
  const [kitchenExpiryDays, setKitchenExpiryDays] = useState<number>(3);
  const [kitchenCookInitials, setKitchenCookInitials] = useState('CK');
  const [kitchenAllergens, setKitchenAllergens] = useState<string[]>(['Gluten']);
  const [kitchenHaccpChecked, setKitchenHaccpChecked] = useState(true);

  // Channel 3: Inventory System State
  const [barcodeInput, setBarcodeInput] = useState('');
  const [manifestText, setManifestText] = useState('');
  const [selectedPresetManifest, setSelectedPresetManifest] = useState('');

  // Channel 4: AI Agent Freeform Ingestion State
  const [aiTextPrompt, setAiTextPrompt] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<FoodItem[] | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Success Feedback
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  function triggerSuccess(msg: string) {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
      if (onClose) onClose();
    }, 1800);
  }

  // Handle User Input Submission
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    const newItem: FoodItem = {
      id: `food-user-${Date.now()}`,
      name: userName.trim(),
      category: userCategory,
      quantity: Number(userQuantity) || 1,
      unit: userUnit,
      storageZone: userStorage,
      temperatureZone: userStorage === 'Walk-in Cooler' ? 'Chilled (2-4°C)' : userStorage === 'Deep Freezer' ? 'Frozen (-18°C)' : 'Ambient (18-22°C)',
      expiryDays: Number(userDays) || 5,
      expiryDate: calculateDateOffset(Number(userDays) || 5),
      dateLogged: new Date().toISOString().split('T')[0],
      allergens: [],
      fifoPriority: userDays <= 2 ? 'Urgent' : userDays <= 4 ? 'High' : 'Normal',
      notes: userNotes || 'Consumer logged item',
      source: 'user',
      status: 'available',
      sdgImpact: {
        co2AvoidableKg: Number(((userQuantity || 1) * 2.2).toFixed(1)),
        waterSavedLiters: Math.round((userQuantity || 1) * 350),
        mealsRescued: Math.max(1, Math.round((userQuantity || 1) * 2)),
      },
    };

    onAddItems([newItem]);
    setUserName('');
    setUserNotes('');
    triggerSuccess(`Successfully recorded "${newItem.name}" into inventory.`);
  };

  // Handle Kitchen Staff Batch Submission
  const handleKitchenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitchenDishName.trim()) return;

    const newItem: FoodItem = {
      id: `food-prep-${Date.now()}`,
      name: kitchenDishName.trim(),
      category: kitchenCategory,
      quantity: Number(kitchenBatchSize) || 1,
      unit: kitchenBatchUnit,
      storageZone: kitchenStation,
      temperatureZone: 'Chilled (2-4°C) - HACCP Cook-Chill Verified',
      expiryDays: Number(kitchenExpiryDays) || 3,
      expiryDate: calculateDateOffset(Number(kitchenExpiryDays) || 3),
      dateLogged: new Date().toISOString().split('T')[0],
      batchNumber: `PREP-${Date.now().toString().slice(-4)}`,
      allergens: kitchenAllergens,
      fifoPriority: kitchenExpiryDays <= 2 ? 'Urgent' : 'High',
      notes: `Cooked by [${kitchenCookInitials}] at ${kitchenCookTemp}°C. Rapidly chilled within 90 min window per HACCP guidelines.`,
      source: 'kitchen',
      status: 'available',
      sdgImpact: {
        co2AvoidableKg: Number(((kitchenBatchSize || 1) * 1.8).toFixed(1)),
        waterSavedLiters: Math.round((kitchenBatchSize || 1) * 280),
        mealsRescued: Math.max(1, Math.round(kitchenBatchSize || 1)),
      },
    };

    onAddItems([newItem]);
    setKitchenDishName('');
    triggerSuccess(`Kitchen batch "${newItem.name}" logged with HACCP FIFO compliance.`);
  };

  // Preset Manifests for Inventory Systems
  const PRESET_MANIFESTS = [
    {
      title: 'Farmers Market Fresh Inbound (Produce & Eggs)',
      data: `Organic Heirloom Carrots, Produce, 18, kg, Walk-in Cooler, 7, Farm Direct
Pasture Raised Eggs, Dairy & Eggs, 30, cartons, Cold Display, 14, Farm Direct
Baby Arugula Mix, Produce, 6, kg, Walk-in Cooler, 3, Local Harvest
Red Butterhead Lettuce, Produce, 12, heads, Walk-in Cooler, 4, Local Harvest`,
    },
    {
      title: 'Wholesale Bakery & Dairy Delivery',
      data: `French Brioche Loaves, Bakery & Grains, 16, pieces, Ambient Display, 3, Daily Bake
Organic Heavy Cream 36%, Dairy & Eggs, 12, liters, Cold Display, 8, Valley Dairy
Gouda Cheese Wheels, Dairy & Eggs, 8, kg, Walk-in Cooler, 30, Valley Dairy
Ciabatta Rolls, Bakery & Grains, 40, pieces, Ambient Display, 2, Daily Bake`,
    },
    {
      title: 'Protein & Cold Chain Logistics Delivery',
      data: `Fresh Halibut Fillets, Meat & Seafood, 10, kg, Walk-in Cooler, 3, Pacific Catch
Grass-Fed Ground Beef, Meat & Seafood, 20, kg, Walk-in Cooler, 4, Ranch Co
Smoked Turkey Breast, Prepared & Deli, 12, kg, Walk-in Cooler, 9, Artisan Deli`,
    },
  ];

  const handleApplyPresetManifest = (data: string) => {
    setManifestText(data);
  };

  // Handle Inventory System CSV Import
  const handleManifestImport = () => {
    if (!manifestText.trim()) return;

    const lines = manifestText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedItems: FoodItem[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 4) {
        const name = parts[0];
        const category = (parts[1] as FoodCategory) || 'Produce';
        const qty = parseFloat(parts[2]) || 1;
        const unit = parts[3] || 'units';
        const zone = (parts[4] as StorageZone) || 'Walk-in Cooler';
        const expDays = parseInt(parts[5] || '5', 10);
        const note = parts[6] || 'Imported via Inventory EDI Manifest';

        parsedItems.push({
          id: `food-edi-${Date.now()}-${index}`,
          name,
          category,
          quantity: qty,
          unit,
          storageZone: zone,
          temperatureZone: zone === 'Deep Freezer' ? 'Frozen (-18°C)' : zone === 'Dry Pantry' ? 'Ambient (18-22°C)' : 'Chilled (2-4°C)',
          expiryDays: expDays,
          expiryDate: calculateDateOffset(expDays),
          dateLogged: new Date().toISOString().split('T')[0],
          batchNumber: `EDI-${Math.floor(1000 + Math.random() * 9000)}`,
          allergens: [],
          fifoPriority: expDays <= 2 ? 'Urgent' : expDays <= 4 ? 'High' : 'Normal',
          notes: note,
          source: 'inventory_system',
          status: 'available',
          sdgImpact: {
            co2AvoidableKg: Number((qty * 2.0).toFixed(1)),
            waterSavedLiters: Math.round(qty * 320),
            mealsRescued: Math.max(1, Math.round(qty * 2)),
          },
        });
      }
    });

    if (parsedItems.length > 0) {
      onAddItems(parsedItems);
      setManifestText('');
      triggerSuccess(`Successfully synchronized ${parsedItems.length} items from inventory manifest.`);
    }
  };

  // Barcode Lookup Simulator
  const handleBarcodeLookup = () => {
    if (!barcodeInput.trim()) return;
    const barcodePresets: Record<string, Partial<FoodItem>> = {
      '012345678905': {
        name: 'Organic Whole Milk 1 Gallon',
        category: 'Dairy & Eggs',
        quantity: 4,
        unit: 'bottles',
        storageZone: 'Cold Display',
        expiryDays: 5,
        allergens: ['Dairy'],
      },
      '078901234567': {
        name: 'Atlantic Salmon Portion Pack',
        category: 'Meat & Seafood',
        quantity: 8,
        unit: 'packs',
        storageZone: 'Walk-in Cooler',
        expiryDays: 3,
        allergens: ['Fish'],
      },
      '045678901234': {
        name: 'Ripe Roma Tomatoes (Crate)',
        category: 'Produce',
        quantity: 10,
        unit: 'kg',
        storageZone: 'Walk-in Cooler',
        expiryDays: 4,
        allergens: [],
      },
    };

    const found = barcodePresets[barcodeInput.trim()] || {
      name: `Scanned Item (UPC: ${barcodeInput.trim()})`,
      category: 'Pantry & Dry Goods',
      quantity: 5,
      unit: 'packs',
      storageZone: 'Dry Pantry',
      expiryDays: 30,
      allergens: [],
    };

    const newItem: FoodItem = {
      id: `food-barcode-${Date.now()}`,
      name: found.name || 'Scanned Food',
      category: found.category || 'Produce',
      quantity: found.quantity || 1,
      unit: found.unit || 'units',
      storageZone: found.storageZone || 'Walk-in Cooler',
      temperatureZone: 'Monitored Storage',
      expiryDays: found.expiryDays || 5,
      expiryDate: calculateDateOffset(found.expiryDays || 5),
      dateLogged: new Date().toISOString().split('T')[0],
      batchNumber: `BAR-${barcodeInput.trim().slice(-4)}`,
      allergens: found.allergens || [],
      fifoPriority: (found.expiryDays || 5) <= 2 ? 'Urgent' : 'Normal',
      notes: `Scanned barcode UPC: ${barcodeInput.trim()}`,
      source: 'inventory_system',
      status: 'available',
      sdgImpact: {
        co2AvoidableKg: 8.5,
        waterSavedLiters: 1200,
        mealsRescued: 10,
      },
    };

    onAddItems([newItem]);
    setBarcodeInput('');
    triggerSuccess(`Registered scanned item "${newItem.name}".`);
  };

  // Channel 4: AI Agent Parser
  const handleAiParse = async () => {
    if (!aiTextPrompt.trim()) return;
    setIsAiParsing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/agent/parse-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiTextPrompt,
          source: 'agent_prompt',
        }),
      });

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setParsedPreview(data.items);
      } else {
        throw new Error('Could not parse items');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Failed to parse text');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleCommitAiParsed = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    onAddItems(parsedPreview);
    setParsedPreview(null);
    setAiTextPrompt('');
    triggerSuccess(`Committed ${parsedPreview.length} AI-extracted food items to active inventory.`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">
      {/* Header and Ingestion Channel Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Multi-Channel Food Ingestion Engine
            </h2>
            <p className="text-xs text-slate-500">
              Direct recording from household users, kitchen prep staff, barcode/EDI systems, or AI conversational parsing.
            </p>
          </div>
          {feedbackMessage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{feedbackMessage}</span>
            </div>
          )}
        </div>

        {/* Segmented Channel Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveChannel('user')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-colors ${
              activeChannel === 'user'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. User / Household</span>
          </button>

          <button
            onClick={() => setActiveChannel('kitchen')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-colors ${
              activeChannel === 'kitchen'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ChefHat className="w-4 h-4 text-amber-600" />
            <span>2. Kitchen Staff (HACCP)</span>
          </button>

          <button
            onClick={() => setActiveChannel('inventory_system')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-colors ${
              activeChannel === 'inventory_system'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>3. Inventory & Barcode</span>
          </button>

          <button
            onClick={() => setActiveChannel('ai_prompt')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-colors ${
              activeChannel === 'ai_prompt'
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>4. AI Agent Dictation</span>
          </button>
        </div>
      </div>

      {/* Channel 1: User / Consumer Form */}
      {activeChannel === 'user' && (
        <form onSubmit={handleUserSubmit} className="space-y-4 pt-1">
          <div className="bg-slate-50 border border-slate-200/80 rounded-md p-3 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Household Channel:</strong> Designed for consumers and individuals logging freshly purchased groceries, leftovers, or pantry items.
            </span>
            <button
              type="button"
              onClick={() => {
                setIsRecording(!isRecording);
                if (!isRecording) {
                  setUserName('Fresh Organic Gala Apples');
                  setUserCategory('Produce');
                  setUserQuantity(2.5);
                  setUserUnit('kg');
                  setUserDays(6);
                  setUserNotes('Bought at farmers market. Crisp.');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
                isRecording
                  ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isRecording ? 'Listening...' : 'Voice Dictation'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Food Item Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sourdough Loaf, Whole Milk, Chicken Breasts"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={userCategory}
                onChange={(e) => setUserCategory(e.target.value as FoodCategory)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white"
              >
                <option value="Produce">Produce (Fruits & Veggies)</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Bakery & Grains">Bakery & Grains</option>
                <option value="Prepared & Deli">Prepared & Deli</option>
                <option value="Pantry & Dry Goods">Pantry & Dry Goods</option>
                <option value="Beverages">Beverages</option>
                <option value="Frozen">Frozen Goods</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={userQuantity}
                  onChange={(e) => setUserQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div className="w-24">
                <label className="block font-medium text-slate-700 mb-1">Unit</label>
                <select
                  value={userUnit}
                  onChange={(e) => setUserUnit(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-md text-xs bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lbs">lbs</option>
                  <option value="liters">liters</option>
                  <option value="pieces">pieces</option>
                  <option value="packs">packs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Storage Zone</label>
              <select
                value={userStorage}
                onChange={(e) => setUserStorage(e.target.value as StorageZone)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white"
              >
                <option value="Walk-in Cooler">Refrigerator (Chilled)</option>
                <option value="Deep Freezer">Freezer</option>
                <option value="Dry Pantry">Pantry Shelf</option>
                <option value="Ambient Display">Countertop</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Estimated Shelf Life ({userDays} days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={userDays}
                  onChange={(e) => setUserDays(parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <span className="font-mono font-medium text-slate-800 w-12 text-right">
                  {userDays}d
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Calculated Expiry: {calculateDateOffset(userDays)}
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Storage Notes / Tips</label>
              <input
                type="text"
                placeholder="e.g. Keep airtight, wash before eating"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Item to Inventory</span>
            </button>
          </div>
        </form>
      )}

      {/* Channel 2: Kitchen Staff Form */}
      {activeChannel === 'kitchen' && (
        <form onSubmit={handleKitchenSubmit} className="space-y-4 pt-1">
          <div className="bg-amber-50/70 border border-amber-200 rounded-md p-3 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <strong>Commercial Kitchen & Culinary Shift Mode:</strong> Enforces culinary FIFO rotation, HACCP cook-chill safety stamps, allergen declarations, and portion accountability.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Prepped Dish / Batch Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Braised Beef Stew, Prepped Caesar Sauce"
                value={kitchenDishName}
                onChange={(e) => setKitchenDishName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium text-slate-700 mb-1">Batch Yield / Size</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={kitchenBatchSize}
                  onChange={(e) => setKitchenBatchSize(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
                />
              </div>
              <div className="w-24">
                <label className="block font-medium text-slate-700 mb-1">Unit</label>
                <select
                  value={kitchenBatchUnit}
                  onChange={(e) => setKitchenBatchUnit(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-200 rounded-md text-xs bg-white"
                >
                  <option value="portions">portions</option>
                  <option value="trays">trays</option>
                  <option value="liters">liters</option>
                  <option value="kg">kg</option>
                  <option value="pans">pans</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Line Prep Station</label>
              <select
                value={kitchenStation}
                onChange={(e) => setKitchenStation(e.target.value as StorageZone)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white"
              >
                <option value="Prep Line Station">Prep Line Station (Hot/Cold Well)</option>
                <option value="Walk-in Cooler">Walk-in Main Refrigerator</option>
                <option value="Cold Display">Garde-Manger Counter Display</option>
                <option value="Deep Freezer">Blast Freezer / Walk-in Freezer</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Internal Finish Cook Temp (°C)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={kitchenCookTemp}
                onChange={(e) => setKitchenCookTemp(parseFloat(e.target.value) || 75)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono"
              />
              <span className="text-[10px] text-slate-500">
                &ge; 74°C standard food safety pasteurization
              </span>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Safe Prep Shelf Life ({kitchenExpiryDays} days)
              </label>
              <select
                value={kitchenExpiryDays}
                onChange={(e) => setKitchenExpiryDays(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs bg-white"
              >
                <option value={1}>1 Day (Immediate Service Only)</option>
                <option value={2}>2 Days (Cook-Chill Day 2)</option>
                <option value={3}>3 Days (Commercial Standard)</option>
                <option value={4}>4 Days (Sous-vide / Sealed)</option>
                <option value={7}>7 Days (Pickled / Cured / Acidified)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Cook Initials & Stamp</label>
              <input
                type="text"
                maxLength={4}
                value={kitchenCookInitials}
                onChange={(e) => setKitchenCookInitials(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={kitchenHaccpChecked}
                onChange={(e) => setKitchenHaccpChecked(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-slate-700">
                HACCP 2-Stage Cooling Protocol Verified (&lt; 21°C in 2h, &lt; 4°C in 4h)
              </span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Log Culinary Batch with FIFO Label</span>
            </button>
          </div>
        </form>
      )}

      {/* Channel 3: Inventory Systems Form */}
      {activeChannel === 'inventory_system' && (
        <div className="space-y-5 pt-1 text-xs">
          <div className="bg-blue-50/70 border border-blue-200 rounded-md p-3 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>POS, ERP & Warehouse EDI Sync:</strong> Synchronize wholesale pallets, barcode scanner feeds, and CSV/JSON electronic manifests.
            </div>
          </div>

          {/* Barcode scanner simulator */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <label className="block font-semibold text-slate-800 mb-1">
              Barcode / RFID Scanner Feed
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Scan or type UPC/EAN (e.g. 012345678905, 078901234567, 045678901234)"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeLookup();
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-xs font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleBarcodeLookup}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
              >
                Lookup & Log
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
              <span>Try test barcodes:</span>
              <button
                type="button"
                onClick={() => setBarcodeInput('012345678905')}
                className="font-mono text-blue-600 hover:underline"
              >
                012345678905 (Whole Milk)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setBarcodeInput('078901234567')}
                className="font-mono text-blue-600 hover:underline"
              >
                078901234567 (Salmon)
              </button>
            </div>
          </div>

          {/* EDI Manifest Presets & Paste Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800">
                Bulk EDI Manifest Paste (Name, Category, Qty, Unit, Storage, ExpiryDays, Note)
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Load sample:</span>
                {PRESET_MANIFESTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPresetManifest(preset.data)}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-medium"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={4}
              placeholder="Paste comma-delimited manifest lines here..."
              value={manifestText}
              onChange={(e) => setManifestText(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-md text-xs font-mono"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 text-[11px]">
                Supports automated ingestion from standard ERP inventory exports.
              </span>
              <button
                type="button"
                onClick={handleManifestImport}
                disabled={!manifestText.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-40"
              >
                Import Manifest to Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Channel 4: AI Conversational Dictation */}
      {activeChannel === 'ai_prompt' && (
        <div className="space-y-4 pt-1 text-xs">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-md p-3 text-emerald-900">
            <strong>Autonomous AI Parsing Engine (Gemini 3.8 Flash):</strong> Speaks or pastes messy natural speech, kitchen shift notes, or handwritten invoice text. The AI calculates shelf lives, assigns proper storage zones, estimates carbon impact, and prepares structured inventory records.
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">
              Conversational Voice / Shift Text Note
            </label>
            <textarea
              rows={3}
              placeholder='e.g. "We just received 15 kg of wild salmon in the walk-in fridge expiring in 3 days, 20 liters of whole milk in cold display, and kitchen staff finished 10 trays of vegetable lasagna in prep station."'
              value={aiTextPrompt}
              onChange={(e) => setAiTextPrompt(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-md text-xs focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Quick prompts:</span>
                <button
                  type="button"
                  onClick={() =>
                    setAiTextPrompt(
                      'Received 12kg of ripe mangoes in ambient display expiring in 4 days, 30 cartons organic eggs in cold display, and 8kg beef tenderloin in walk-in cooler expiring in 3 days.'
                    )
                  }
                  className="text-emerald-700 hover:underline"
                >
                  "Fresh shipment load"
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() =>
                    setAiTextPrompt(
                      'Kitchen prepped 15 liters of tomato basil soup in prep line station expiring in 3 days, and 25 portions grilled chicken breast in cold storage.'
                    )
                  }
                  className="text-emerald-700 hover:underline"
                >
                  "Prep shift turnover"
                </button>
              </div>

              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiParsing || !aiTextPrompt.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiParsing ? 'Analyzing with Gemini...' : 'Extract & Parse Items'}</span>
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Extracted Items ({parsedPreview.length}) — Review & Commit
                </span>
                <button
                  type="button"
                  onClick={handleCommitAiParsed}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors"
                >
                  Commit All to Inventory
                </button>
              </div>

              <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-md overflow-hidden">
                {parsedPreview.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.category} · {item.storageZone} · {item.temperatureZone}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-900">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="text-[11px] text-amber-700 font-mono">
                        Expires in {item.expiryDays}d ({item.expiryDate})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
