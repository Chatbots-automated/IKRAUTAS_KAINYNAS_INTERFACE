'use client';

import React, { useState } from 'react';
import { Category } from '@/lib/types';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (name: string, unitPrice: number, quantity: number, category: Category) => void;
}

export function CustomItemModal({
  isOpen,
  onClose,
  categories,
  onAdd,
}: CustomItemModalProps) {
  const [name, setName] = useState('');
  const [unitPrice, setUnitPrice] = useState('0');
  const [quantity, setQuantity] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');

  const handleAdd = () => {
    const category = categories.find((cat) => cat.id === selectedCategoryId);
    if (!category || !name.trim()) return;

    onAdd(name.trim(), parseFloat(unitPrice), quantity, category);
    
    setName('');
    setUnitPrice('0');
    setQuantity(1);
    setSelectedCategoryId(categories[0]?.id || '');
    onClose();
  };

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pridėti pasirinktinę eilutę" size="md">
      <div className="space-y-4">
        <Input
          label="Pavadinimas"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Įveskite pavadinimą"
        />

        <Input
          type="number"
          label="Vieneto kaina (EUR)"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          min="0"
          step="0.01"
        />

        <Input
          type="number"
          label="Kiekis"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
          min="1"
          step="1"
        />

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">
            Kategorija
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          >
            {sortedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-4 border-t border-zinc-200">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Atšaukti
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex-1"
          >
            Pridėti
          </Button>
        </div>
      </div>
    </Modal>
  );
}
