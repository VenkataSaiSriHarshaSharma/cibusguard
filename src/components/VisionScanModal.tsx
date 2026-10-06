import React, { useState } from 'react';
import { Camera, X, Upload, Check, AlertCircle, Sparkles, FileText, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../types';

interface VisionScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: FoodItem[]) => void;
}

export const VisionScanModal: React.FC<VisionScanModalProps> = ({ isOpen, onClose, onAddItems }) => {
  const [selectedScanType, setSelectedScanType] = useState<'receipt' | 'shelf' | 'invoice'>('receipt');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedItems, setScannedItems] = useState<FoodItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset mock base64/SVG images for seamless sandbox testing
  const PRESET_SCANS = {
    receipt: {
      name: 'Supermarket Grocery Receipt',
      description: 'Standard receipt listing fresh milk, sourdough bread, organic spinach, and Greek yogurt.',
      // Simple lightweight SVG data URI representation
      previewUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23f8fafc"/><text x="20" y="40" font-family="monospace" font-size="14" font-weight="bold" fill="%230f172a">GREEN GROCER RECEIPT</text><line x1="20" y1="50" x2="280" y2="50" stroke="%23cbd5e1" stroke-width="1"/><text x="20" y="80" font-family="monospace" font-size="11" fill="%23334155">WHOLE MILK 1L (2x)   $5.50</text><text x="20" y="110" font-family="monospace" font-size="11" fill="%23334155">ORGANIC SPINACH 500G  $3.99</text><text x="20" y="140" font-family="monospace" font-size="11" fill="%23334155">ARTISAN CIABATTA 2EA  $6.00</text><text x="20" y="170" font-family="monospace" font-size="11" fill="%23334155">GREEK YOGURT 1KG      $4.80</text><text x="20" y="200" font-family="monospace" font-size="11" fill="%23334155">ROMA TOMATOES 1.5KG   $4.20</text><line x1="20" y1="230" x2="280" y2="230" stroke="%23cbd5e1" stroke-width="1"/><text x="20" y="260" font-family="monospace" font-size="12" font-weight="bold" fill="%230f172a">TOTAL ITEMS: 5</text><text x="20" y="320" font-family="monospace" font-size="10" fill="%2364748b">REUSE BAGS / ZERO FOOD WASTE</text></svg>',
    },
    shelf: {
      name: 'Commercial Refrigerator Shelf',
      description: 'Kitchen walk-in cooler shelf with vacuum-sealed salmon, prepped greens, and heavy cream containers.',
      previewUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23e2e8f0"/><rect x="20" y="40" width="260" height="80" fill="%2338bdf8" rx="8"/><text x="35" y="85" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23082f49">ATLANTIC SALMON 10KG (EXP 3D)</text><rect x="20" y="150" width="260" height="80" fill="%234ade80" rx="8"/><text x="35" y="195" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23064e3b">PREPPED CAESAR GREENS 4KG</text><rect x="20" y="260" width="260" height="80" fill="%23fde047" rx="8"/><text x="35" y="305" font-family="sans-serif" font-size="12" font-weight="bold" fill="%23713f12">PASTEURIZED CREAM 8 LITERS</text></svg>',
    },
    invoice: {
      name: 'Supplier Delivery Packing Slip',
      description: 'Formal food service distributor invoice with lot numbers and quantities.',
      previewUri: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23ffffff"/><text x="20" y="40" font-family="sans-serif" font-size="13" font-weight="bold" fill="%231e293b">INVOICE: #FD-89410</text><text x="20" y="65" font-family="sans-serif" font-size="10" fill="%2364748b">SYSCO FRESH DISTRIBUTION</text><line x1="20" y1="80" x2="280" y2="80" stroke="%23e2e8f0"/><text x="20" y="110" font-family="monospace" font-size="11" fill="%231e293b">ITEM 1: Grass-Fed Butter 10kg</text><text x="20" y="140" font-family="monospace" font-size="11" fill="%231e293b">ITEM 2: Extra Virgin Olive Oil 15L</text><text x="20" y="170" font-family="monospace" font-size="11" fill="%231e293b">ITEM 3: Fresh Basil Bunches 2kg</text><text x="20" y="200" font-family="monospace" font-size="11" fill="%231e293b">ITEM 4: Crushed Tomato Cans 24pk</text></svg>',
    },
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (key: 'receipt' | 'shelf' | 'invoice') => {
    setSelectedScanType(key);
    setImagePreview(PRESET_SCANS[key].previewUri);
  };

  const handleRunScan = async () => {
    const currentImg = imagePreview || PRESET_SCANS[selectedScanType].previewUri;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/agent/vision-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImg,
          mimeType: currentImg.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/jpeg',
          scanType: selectedScanType,
        }),
      });

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        setScannedItems(data.items);
      } else {
        throw new Error(data.error || 'Vision analysis could not detect items');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Vision scan failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitScanned = () => {
    if (!scannedItems || scannedItems.length === 0) return;
    onAddItems(scannedItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Optical Receipt & Shelf Scanner
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Gemini 3.8 Flash Vision to transcribe food items, quantities, and dates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Type Picker & Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Choose Sample Preset or Upload Photo
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelectPreset('receipt')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                selectedScanType === 'receipt' && imagePreview === PRESET_SCANS.receipt.previewUri
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grocery Receipt</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Milk, greens, bread items
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset('shelf')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                selectedScanType === 'shelf' && imagePreview === PRESET_SCANS.shelf.previewUri
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Cooler Shelf</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Salmon, caesar greens, cream
              </div>
            </button>

            <button
              onClick={() => handleSelectPreset('invoice')}
              className={`p-3 rounded-lg border text-left text-xs transition-colors ${
                selectedScanType === 'invoice' && imagePreview === PRESET_SCANS.invoice.previewUri
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                <span>Delivery Slip</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Wholesale butter, oil, basil
              </div>
            </button>
          </div>
        </div>

        {/* Custom Upload or Preview Area */}
        <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-center relative">
          {imagePreview ? (
            <div className="flex flex-col items-center">
              <div className="max-h-48 overflow-hidden rounded border border-slate-200 shadow-xs mb-3">
                <img
                  src={imagePreview}
                  alt="Scan target preview"
                  className="max-h-48 object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImagePreview(null)}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Clear Image
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Upload image of receipt, fridge shelf, or barcode slip
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PNG, JPG, or SVG up to 10MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-md text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Results Preview */}
        {scannedItems && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Extracted {scannedItems.length} Items</span>
              <span className="text-emerald-700 font-normal">Ready to add to inventory</span>
            </div>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white">
              {scannedItems.map((item, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {item.category} · {item.storageZone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold text-slate-800">
                      {item.quantity} {item.unit}
                    </span>
                    <div className="text-[10px] text-amber-700 font-mono">
                      {item.expiryDays}d shelf life
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>

          {scannedItems ? (
            <button
              onClick={handleCommitScanned}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Commit Items to Inventory</span>
            </button>
          ) : (
            <button
              onClick={handleRunScan}
              disabled={isProcessing}
              className="px-4 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Analyzing Image...' : 'Process Image with AI'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
