// Database types matching Supabase schema

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at?: string;
}

export interface Product {
  id: string;
  sku?: string | null;
  name: string;
  unit_price: number;
  category_id: string;
  vat_rate: number;
  is_service: boolean;
  is_internal_only: boolean;
  collapse_into_materials: boolean;
  created_at: string;
  updated_at: string;
  // Solar-specific fields
  power_output?: string | null; // e.g., "10 kW", "450 W"
  efficiency_percent?: number | null; // e.g., 21.5
  dimensions?: string | null; // e.g., "1722x1134x30 mm"
  weight_kg?: number | null; // e.g., 22.5
  warranty_years?: number | null; // e.g., 25
  technology_type?: string | null; // e.g., "Monocrystalline", "String inverter"
  brand?: string | null; // e.g., "JA Solar", "Huawei"
  certifications?: string | null; // e.g., "CE, IEC 61215"
  max_input_voltage?: string | null; // For inverters, e.g., "1100 V"
  mppt_channels?: number | null; // For inverters, e.g., 2
  installation_type?: string | null; // e.g., "Roof-mounted"
  datasheet_url?: string | null; // Link to datasheet
  description?: string | null; // Detailed description
}

export interface Offer {
  id: string;
  offer_no: string;
  client_name: string;
  client_birth_date?: string | null;
  client_address?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  project_manager_name: string;
  payment_reference?: string | null;
  warranty_years?: number | null;
  notes?: string | null;
  discount_percent?: number | null;
  ignitis_discount_eur?: number | null;
  apply_discount_after_vat: boolean;
  created_by?: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OfferItem {
  id: string;
  offer_id: string;
  product_id?: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  category_id: string;
  vat_rate: number;
  hide_qty: boolean;
  is_custom: boolean;
  sort_order: number;
  created_at: string;
}

// Extended types with relations for frontend use
export interface ProductWithCategory extends Product {
  category?: Category;
}

export interface OfferItemWithCategory extends OfferItem {
  category?: Category;
}

export interface OfferWithItems extends Offer {
  items: OfferItemWithCategory[];
}

// Form data types
export interface OfferFormData {
  client_name: string;
  client_birth_date: string;
  client_address: string;
  client_email: string;
  client_phone: string;
  project_manager_name: string;
  payment_reference: string;
  warranty_years: number;
  notes: string;
}

// Calculation types
export interface LineTotals {
  lineNet: number;
  lineVat: number;
  lineTotal: number;
}

export interface TotalsCalculation {
  subtotal: number;
  vat: number;
  total: number;
  discountAmount: number;
  ignitisDiscountAmount: number;
  finalTotal: number;
}

// UI State types
export interface OfferItemInput {
  id: string;
  product_id?: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  category_id: string;
  vat_rate: number;
  hide_qty: boolean;
  is_custom: boolean;
  sort_order: number;
}

export interface GroupedOfferItems {
  category: Category;
  items: OfferItemInput[];
}

// Export types
export type ExportType = 'pdf' | 'contract' | 'pp-act' | 'materials';

export interface ExportResponse {
  ok: boolean;
  url?: string;
  message: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  type: 'contract' | 'pp_act_dynamic' | 'pp_act_standard' | 'samata';
  content: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}
