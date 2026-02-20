import {
  LineTotals,
  TotalsCalculation,
  OfferItemInput,
  GroupedOfferItems,
  Category,
} from '../types';

/**
 * Calculate line totals for a single offer item
 */
export function calculateLineTotals(item: OfferItemInput): LineTotals {
  const lineNet = item.unit_price * item.quantity;
  const lineVat = lineNet * item.vat_rate;
  const lineTotal = lineNet + lineVat;

  return {
    lineNet: Math.round(lineNet * 100) / 100,
    lineVat: Math.round(lineVat * 100) / 100,
    lineTotal: Math.round(lineTotal * 100) / 100,
  };
}

/**
 * Calculate offer totals with discounts
 */
export function calculateOfferTotals(
  items: OfferItemInput[],
  discountPercent: number = 0,
  ignitisDiscountEur: number = 0,
  applyDiscountAfterVat: boolean = true
): TotalsCalculation {
  // Calculate subtotal (sum of line nets)
  const subtotal = items.reduce((sum, item) => {
    const lineTotals = calculateLineTotals(item);
    return sum + lineTotals.lineNet;
  }, 0);

  // Calculate VAT (21% default, but we use item-level rates)
  const vat = items.reduce((sum, item) => {
    const lineTotals = calculateLineTotals(item);
    return sum + lineTotals.lineVat;
  }, 0);

  // Total before discounts
  const total = subtotal + vat;

  let discountAmount = 0;
  let finalTotal = 0;

  if (applyDiscountAfterVat) {
    // Apply discount to total (after VAT)
    discountAmount = (total * discountPercent) / 100;
    finalTotal = total - discountAmount - ignitisDiscountEur;
  } else {
    // Apply discount to subtotal (before VAT)
    const subtotalDiscount = (subtotal * discountPercent) / 100;
    const discountedSubtotal = subtotal - subtotalDiscount;
    const vatAfterDiscount = discountedSubtotal * 0.21; // Recalculate VAT on discounted subtotal
    discountAmount = subtotalDiscount;
    finalTotal = discountedSubtotal + vatAfterDiscount - ignitisDiscountEur;
  }

  // Ensure final total is never negative
  finalTotal = Math.max(0, finalTotal);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    ignitisDiscountAmount: Math.round(ignitisDiscountEur * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,
  };
}

/**
 * Group items by category and sort by category sort_order
 */
export function groupItemsByCategory(
  items: OfferItemInput[],
  categories: Category[]
): GroupedOfferItems[] {
  // Create a map of category_id to category
  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => categoryMap.set(cat.id, cat));

  // Group items by category_id
  const grouped = new Map<string, OfferItemInput[]>();
  
  items.forEach((item) => {
    const categoryId = item.category_id;
    if (!grouped.has(categoryId)) {
      grouped.set(categoryId, []);
    }
    grouped.get(categoryId)!.push(item);
  });

  // Convert to array and sort by category sort_order
  const result: GroupedOfferItems[] = [];
  
  grouped.forEach((items, categoryId) => {
    const category = categoryMap.get(categoryId);
    if (category) {
      // Sort items within category by sort_order, then by name
      const sortedItems = [...items].sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });

      result.push({
        category,
        items: sortedItems,
      });
    }
  });

  // Sort groups by category sort_order
  result.sort((a, b) => a.category.sort_order - b.category.sort_order);

  return result;
}

/**
 * Generate a new offer number
 * Format: YYYY-NNN (e.g., 2026-001)
 */
export function generateOfferNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999) + 1;
  const paddedNumber = random.toString().padStart(3, '0');
  return `${year}-${paddedNumber}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('lt-LT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number for display
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('lt-LT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
