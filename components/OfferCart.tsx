'use client';

import React from 'react';
import { useOfferStore } from '@/lib/store/offer-store';
import { Category } from '@/lib/types';
import { groupItemsByCategory } from '@/lib/utils/calculations';
import { OfferInfoForm } from './OfferInfoForm';
import { OfferItemsGroup } from './OfferItemsGroup';
import { TotalsCard } from './TotalsCard';
import { ExportButtons } from './ExportButtons';

interface OfferCartProps {
  categories: Category[];
}

export function OfferCart({ categories }: OfferCartProps) {
  const {
    offerNo,
    formData,
    items,
    discountPercent,
    ignitisDiscountEur,
    applyDiscountAfterVat,
    totals,
    updateFormData,
    updateItem,
    removeItem,
    setDiscountPercent,
    setIgnitisDiscountEur,
    toggleDiscountMode,
  } = useOfferStore();

  const groupedItems = groupItemsByCategory(items, categories);

  return (
    <div className="w-96 bg-white border-l border-zinc-200 flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex-shrink-0">
        <h2 className="text-lg font-bold text-zinc-900">Pasiūlymas</h2>
        <p className="text-sm text-zinc-600 mt-1">Nr. {offerNo}</p>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 space-y-4 pb-24">
          <OfferInfoForm formData={formData} onUpdate={updateFormData} />

          <div className="pt-4 border-t border-zinc-200">
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide mb-3">
              Produktai ({items.length})
            </h3>

            {items.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-sm">
                Pasiūlymas tuščias. Pridėkite produktų iš katalogo.
              </div>
            ) : (
              <div className="space-y-3">
                {groupedItems.map((group) => (
                  <OfferItemsGroup
                    key={group.category.id}
                    category={group.category}
                    items={group.items}
                    onUpdateItem={updateItem}
                    onRemoveItem={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <>
              <TotalsCard
                totals={totals}
                discountPercent={discountPercent}
                ignitisDiscountEur={ignitisDiscountEur}
                applyDiscountAfterVat={applyDiscountAfterVat}
                onSetDiscountPercent={setDiscountPercent}
                onSetIgnitisDiscountEur={setIgnitisDiscountEur}
                onToggleDiscountMode={toggleDiscountMode}
              />

              <ExportButtons categories={categories} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
