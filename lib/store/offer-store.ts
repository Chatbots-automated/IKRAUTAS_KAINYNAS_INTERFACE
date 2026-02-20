import { create } from 'zustand';
import {
  OfferItemInput,
  OfferFormData,
  TotalsCalculation,
  ProductWithCategory,
  Category,
} from '../types';
import { calculateOfferTotals, generateOfferNumber } from '../utils/calculations';

interface OfferStore {
  // Offer metadata
  offerId: string | null;
  offerNo: string;
  
  // Form data
  formData: OfferFormData;
  
  // Items in the offer
  items: OfferItemInput[];
  
  // Discounts
  discountPercent: number;
  ignitisDiscountEur: number;
  applyDiscountAfterVat: boolean;
  
  // Totals (calculated)
  totals: TotalsCalculation;
  
  // Actions
  setOfferId: (id: string | null) => void;
  setOfferNo: (offerNo: string) => void;
  updateFormData: (data: Partial<OfferFormData>) => void;
  
  addItem: (product: ProductWithCategory, quantity?: number, customPrice?: number) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<OfferItemInput>) => void;
  
  addCustomItem: (name: string, unitPrice: number, quantity: number, category: Category) => void;
  
  setDiscountPercent: (percent: number) => void;
  setIgnitisDiscountEur: (amount: number) => void;
  toggleDiscountMode: () => void;
  
  calculateTotals: () => void;
  
  resetOffer: () => void;
  loadOffer: (offer: {
    id: string;
    offerNo: string;
    formData: OfferFormData;
    items: OfferItemInput[];
    discountPercent: number;
    ignitisDiscountEur: number;
    applyDiscountAfterVat: boolean;
  }) => void;
}

const initialFormData: OfferFormData = {
  client_name: '',
  client_birth_date: '',
  client_address: '',
  client_email: '',
  client_phone: '',
  project_manager_name: '',
  payment_reference: '',
  warranty_years: 5,
  notes: '',
};

const initialTotals: TotalsCalculation = {
  subtotal: 0,
  vat: 0,
  total: 0,
  discountAmount: 0,
  ignitisDiscountAmount: 0,
  finalTotal: 0,
};

export const useOfferStore = create<OfferStore>((set, get) => ({
  offerId: null,
  offerNo: generateOfferNumber(),
  formData: initialFormData,
  items: [],
  discountPercent: 0,
  ignitisDiscountEur: 0,
  applyDiscountAfterVat: true,
  totals: initialTotals,

  setOfferId: (id) => set({ offerId: id }),
  
  setOfferNo: (offerNo) => set({ offerNo }),

  updateFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  addItem: (product, quantity = 1, customPrice) => {
    const newItem: OfferItemInput = {
      id: `item-${Date.now()}-${Math.random()}`,
      product_id: product.id,
      name: product.name,
      unit_price: customPrice ?? product.unit_price,
      quantity,
      category_id: product.category_id,
      vat_rate: product.vat_rate,
      hide_qty: false,
      is_custom: false,
      sort_order: product.category?.sort_order ?? 999,
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
    
    get().calculateTotals();
  },

  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
    
    get().calculateTotals();
  },

  updateItem: (itemId, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
    
    get().calculateTotals();
  },

  addCustomItem: (name, unitPrice, quantity, category) => {
    const newItem: OfferItemInput = {
      id: `custom-${Date.now()}-${Math.random()}`,
      product_id: undefined,
      name,
      unit_price: unitPrice,
      quantity,
      category_id: category.id,
      vat_rate: 0.21,
      hide_qty: false,
      is_custom: true,
      sort_order: category.sort_order,
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
    
    get().calculateTotals();
  },

  setDiscountPercent: (percent) => {
    set({ discountPercent: Math.max(0, Math.min(100, percent)) });
    get().calculateTotals();
  },

  setIgnitisDiscountEur: (amount) => {
    set({ ignitisDiscountEur: Math.max(0, amount) });
    get().calculateTotals();
  },

  toggleDiscountMode: () => {
    set((state) => ({
      applyDiscountAfterVat: !state.applyDiscountAfterVat,
    }));
    get().calculateTotals();
  },

  calculateTotals: () => {
    const state = get();
    const totals = calculateOfferTotals(
      state.items,
      state.discountPercent,
      state.ignitisDiscountEur,
      state.applyDiscountAfterVat
    );
    set({ totals });
  },

  resetOffer: () => {
    set({
      offerId: null,
      offerNo: generateOfferNumber(),
      formData: {
        client_name: '',
        client_birth_date: '',
        client_address: '',
        client_email: '',
        client_phone: '',
        project_manager_name: '',
        payment_reference: '',
        warranty_years: 5,
        notes: '',
      },
      items: [],
      discountPercent: 0,
      ignitisDiscountEur: 0,
      applyDiscountAfterVat: true,
      totals: initialTotals,
    });
  },

  loadOffer: (offer) => {
    set({
      offerId: offer.id,
      offerNo: offer.offerNo,
      formData: offer.formData,
      items: offer.items,
      discountPercent: offer.discountPercent,
      ignitisDiscountEur: offer.ignitisDiscountEur,
      applyDiscountAfterVat: offer.applyDiscountAfterVat,
    });
    get().calculateTotals();
  },
}));
