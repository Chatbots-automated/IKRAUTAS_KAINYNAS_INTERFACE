import { ProductWithCategory } from '../types';

/**
 * Simple fuzzy search implementation
 * Searches in product name and SKU
 */
export function fuzzySearch(
  query: string,
  products: ProductWithCategory[]
): ProductWithCategory[] {
  if (!query || query.trim() === '') {
    return products;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);

  return products.filter((product) => {
    const searchText = [
      product.name.toLowerCase(),
      product.sku?.toLowerCase() || '',
    ].join(' ');

    // Check if all words in the query appear in the search text
    return words.every((word) => searchText.includes(word));
  });
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Filter products by category
 */
export function filterByCategory(
  products: ProductWithCategory[],
  categorySlug: string | null
): ProductWithCategory[] {
  if (!categorySlug) {
    return products;
  }

  return products.filter((product) => product.category?.slug === categorySlug);
}

/**
 * Filter products by service flag
 */
export function filterByService(
  products: ProductWithCategory[],
  servicesOnly: boolean
): ProductWithCategory[] {
  if (!servicesOnly) {
    return products;
  }

  return products.filter((product) => product.is_service);
}

/**
 * Filter products by internal flag
 */
export function filterByInternal(
  products: ProductWithCategory[],
  internalOnly: boolean
): ProductWithCategory[] {
  if (!internalOnly) {
    return products;
  }

  return products.filter((product) => product.is_internal_only);
}

/**
 * Combined filter function
 */
export function filterProducts(
  products: ProductWithCategory[],
  filters: {
    query?: string;
    categorySlug?: string | null;
    servicesOnly?: boolean;
    internalOnly?: boolean;
  }
): ProductWithCategory[] {
  let filtered = products;

  if (filters.categorySlug) {
    filtered = filterByCategory(filtered, filters.categorySlug);
  }

  if (filters.servicesOnly) {
    filtered = filterByService(filtered, filters.servicesOnly);
  }

  if (filters.internalOnly) {
    filtered = filterByInternal(filtered, filters.internalOnly);
  }

  if (filters.query) {
    filtered = fuzzySearch(filters.query, filtered);
  }

  return filtered;
}
