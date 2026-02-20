'use client';

import React, { useState } from 'react';
import { ProductWithCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/calculations';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ProductAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithCategory;
  onAdd: (quantity: number, customPrice?: number) => void;
}

export function ProductAddModal({
  isOpen,
  onClose,
  product,
  onAdd,
}: ProductAddModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [customPrice, setCustomPrice] = useState<string>(product.unit_price.toString());
  const [useCustomPrice, setUseCustomPrice] = useState(false);

  const handleAdd = () => {
    const finalPrice = useCustomPrice ? parseFloat(customPrice) : undefined;
    onAdd(quantity, finalPrice);
    
    setQuantity(1);
    setCustomPrice(product.unit_price.toString());
    setUseCustomPrice(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pridėti produktą" size="md">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-zinc-900">{product.name}</h3>
          {product.sku && (
            <p className="text-sm text-zinc-500 mt-1">SKU: {product.sku}</p>
          )}
          <p className="text-sm text-zinc-600 mt-2">
            Bazinė kaina: {formatCurrency(product.unit_price)}
          </p>
        </div>

        <Input
          type="number"
          label="Kiekis"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
          min="1"
          step="1"
          onKeyDown={handleKeyDown}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomPrice}
              onChange={(e) => setUseCustomPrice(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span>Naudoti pasirinktinę kainą</span>
          </label>

          {useCustomPrice && (
            <Input
              type="number"
              label="Pasirinktinė kaina (EUR)"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              min="0"
              step="0.01"
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <div className="text-sm text-zinc-600">
            Suma: <span className="font-semibold text-zinc-900">
              {formatCurrency((useCustomPrice ? parseFloat(customPrice) : product.unit_price) * quantity)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Atšaukti
            </Button>
            <Button variant="primary" onClick={handleAdd}>
              Pridėti
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
