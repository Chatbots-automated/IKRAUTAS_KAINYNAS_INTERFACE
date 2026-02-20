'use client';

import React from 'react';
import { OfferItemInput, Category } from '@/lib/types';
import { formatCurrency, calculateLineTotals } from '@/lib/utils/calculations';
import { Button } from './ui/Button';

interface OfferItemsGroupProps {
  category: Category;
  items: OfferItemInput[];
  onUpdateItem: (itemId: string, updates: Partial<OfferItemInput>) => void;
  onRemoveItem: (itemId: string) => void;
}

export function OfferItemsGroup({
  category,
  items,
  onUpdateItem,
  onRemoveItem,
}: OfferItemsGroupProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-3">
      <h4 className="text-xs font-semibold text-zinc-900 mb-2 px-3 py-1.5 bg-zinc-100 rounded-lg">
        {category.name}
      </h4>

      <div className="space-y-1.5">
        {items.map((item) => {
          const lineTotals = calculateLineTotals(item);

          return (
            <div
              key={item.id}
              className="p-2 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h5 className="text-xs font-medium text-zinc-900 truncate">
                      {item.name}
                    </h5>
                    {item.is_custom && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Pasirinktinis
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">
                        Kiekis
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            quantity: Math.max(0.01, parseFloat(e.target.value) || 1),
                          })
                        }
                        className="w-full px-1.5 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        min="0.01"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">
                        Vnt. kaina
                      </label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          onUpdateItem(item.id, {
                            unit_price: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full px-1.5 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-500 mb-0.5">
                        Suma
                      </label>
                      <div className="px-1.5 py-1 text-xs font-medium text-zinc-900 bg-zinc-50 rounded">
                        {formatCurrency(lineTotals.lineTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px] text-zinc-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.hide_qty}
                        onChange={(e) =>
                          onUpdateItem(item.id, { hide_qty: e.target.checked })
                        }
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-3 h-3"
                      />
                      <span>Slėpti kiekį</span>
                    </label>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:bg-red-50"
                  title="Pašalinti"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
