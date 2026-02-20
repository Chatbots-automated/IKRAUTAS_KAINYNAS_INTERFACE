'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ProductWithCategory } from '@/lib/types';
import { filterProducts } from '@/lib/utils/search';
import { formatCurrency } from '@/lib/utils/calculations';
import { Input } from './ui/Input';
import { ProductAddModal } from './ProductAddModal';

interface ProductCatalogProps {
  products: ProductWithCategory[];
  selectedCategorySlug: string | null;
  showServicesOnly: boolean;
  showInternalOnly: boolean;
  onAddProduct: (product: ProductWithCategory, quantity: number, customPrice?: number) => void;
}

export function ProductCatalog({
  products,
  selectedCategorySlug,
  showServicesOnly,
  showInternalOnly,
  onAddProduct,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return filterProducts(products, {
      query: debouncedQuery,
      categorySlug: selectedCategorySlug,
      servicesOnly: showServicesOnly,
      internalOnly: showInternalOnly,
    });
  }, [products, debouncedQuery, selectedCategorySlug, showServicesOnly, showInternalOnly]);

  const handleQuickAdd = (product: ProductWithCategory) => {
    onAddProduct(product, 1);
  };

  const handleOpenModal = (product: ProductWithCategory) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleModalAdd = (quantity: number, customPrice?: number) => {
    if (selectedProduct) {
      onAddProduct(selectedProduct, quantity, customPrice);
      setIsModalOpen(false);
      setSelectedProduct(null);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !isModalOpen) {
        e.preventDefault();
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isModalOpen]);

  return (
    <div className="flex-1 bg-zinc-50 flex flex-col h-screen">
      <div className="p-4 bg-white border-b border-zinc-200">
        <Input
          id="product-search"
          type="text"
          placeholder="Ieškoti produkto ar SKU... (paspauskite /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-zinc-500 text-sm">
                {searchQuery || selectedCategorySlug || showServicesOnly || showInternalOnly
                  ? 'Produktų nerasta'
                  : 'Prašome pasirinkti kategoriją'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                      Pavadinimas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                      Kaina
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                      Veiksmai
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-zinc-50 transition-colors cursor-pointer"
                      onClick={() => handleOpenModal(product)}
                    >
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {product.sku || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900">
                            {product.name}
                          </span>
                          {product.is_service && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Paslauga
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-zinc-900">
                        {formatCurrency(product.unit_price)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(product);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                          title="Greitas pridėjimas"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductAddModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onAdd={handleModalAdd}
        />
      )}
    </div>
  );
}
