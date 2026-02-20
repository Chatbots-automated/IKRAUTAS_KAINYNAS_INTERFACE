'use client';

import React from 'react';
import { TotalsCalculation } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/calculations';
import { Input } from './ui/Input';

interface TotalsCardProps {
  totals: TotalsCalculation;
  discountPercent: number;
  ignitisDiscountEur: number;
  applyDiscountAfterVat: boolean;
  onSetDiscountPercent: (percent: number) => void;
  onSetIgnitisDiscountEur: (amount: number) => void;
  onToggleDiscountMode: () => void;
}

export function TotalsCard({
  totals,
  discountPercent,
  ignitisDiscountEur,
  applyDiscountAfterVat,
  onSetDiscountPercent,
  onSetIgnitisDiscountEur,
  onToggleDiscountMode,
}: TotalsCardProps) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-3 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
        Sumos
      </h3>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-zinc-600">Suma be PVM:</span>
          <span className="font-medium text-zinc-900">
            {formatCurrency(totals.subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-600">PVM (21%):</span>
          <span className="font-medium text-zinc-900">
            {formatCurrency(totals.vat)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
          <span className="font-medium text-zinc-700">Suma su PVM:</span>
          <span className="font-semibold text-zinc-900">
            {formatCurrency(totals.total)}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-200 space-y-2">
        <h4 className="text-sm font-semibold text-zinc-900">Nuolaidos</h4>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">Nuolaida (%)</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => onSetDiscountPercent(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.1"
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            checked={applyDiscountAfterVat}
            onChange={onToggleDiscountMode}
            className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <span>Taikyti nuolaidą po PVM</span>
        </label>

        {discountPercent > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Nuolaidos suma:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(totals.discountAmount)}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">Ignitis nuolaida (EUR)</label>
          <input
            type="number"
            value={ignitisDiscountEur}
            onChange={(e) => onSetIgnitisDiscountEur(parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {ignitisDiscountEur > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-600">Ignitis nuolaida:</span>
            <span className="font-medium text-red-600">
              -{formatCurrency(ignitisDiscountEur)}
            </span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t-2 border-zinc-900">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-zinc-900">
            Galutinė suma:
          </span>
          <span className="text-lg font-bold text-zinc-900">
            {formatCurrency(totals.finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
