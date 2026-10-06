export type FoodCategory =
  | 'Produce'
  | 'Dairy & Eggs'
  | 'Meat & Seafood'
  | 'Bakery & Grains'
  | 'Prepared & Deli'
  | 'Pantry & Dry Goods'
  | 'Beverages'
  | 'Frozen';

export type StorageZone =
  | 'Walk-in Cooler'
  | 'Deep Freezer'
  | 'Dry Pantry'
  | 'Prep Line Station'
  | 'Ambient Display'
  | 'Cold Display';

export type IngestionSource =
  | 'user'
  | 'kitchen'
  | 'inventory_system'
  | 'vision_scan'
  | 'agent_prompt';

export type ItemStatus = 'available' | 'consumed' | 'donated' | 'discarded';

export interface SdgImpact {
  co2AvoidableKg: number;
  waterSavedLiters: number;
  mealsRescued: number;
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  storageZone: StorageZone;
  temperatureZone: string;
  expiryDays: number;
  expiryDate: string; // YYYY-MM-DD
  dateLogged: string; // YYYY-MM-DD
  batchNumber?: string;
  allergens: string[];
  fifoPriority: 'Urgent' | 'High' | 'Normal';
  notes?: string;
  source: IngestionSource;
  status: ItemStatus;
  sdgImpact: SdgImpact;
  costEstimate?: number;
}

export interface DonationDispatch {
  id: string;
  timestamp: string;
  recipientPartner: string;
  partnerType: 'Food Bank' | 'Soup Kitchen' | 'Community Pantry' | 'Youth Shelter';
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
  }>;
  totalKg: number;
  mealsRescued: number;
  co2DivertedKg: number;
  status: 'Dispatched' | 'Delivered' | 'Pending Pickup';
  trackingCode: string;
}

export interface PreservationTechnique {
  itemName: string;
  technique: string;
  extendedShelfLife: string;
}

export interface DonationCandidate {
  itemName: string;
  quantity: string;
  recommendedShelterType: string;
}

export interface AgentAudit {
  summary: string;
  urgentActionItems: string[];
  preservationStrategies: PreservationTechnique[];
  donationCandidates: DonationCandidate[];
  sdgImpactSummary: {
    totalCo2AtRiskKg: number;
    mealsRescuable: number;
    wasteAversionScore: string;
  };
}

export interface ZeroWasteRecipe {
  recipeName: string;
  prepTime: string;
  servings: number;
  ingredientsUsed: string[];
  instructions: string[];
  sdgBenefit: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'add' | 'consume' | 'donate' | 'freeze' | 'discard' | 'quantity' | 'audit';
  description: string;
  impactNote?: string;
}

