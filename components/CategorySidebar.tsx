'use client';

import React from 'react';
import { Category } from '@/lib/types';
import { Button } from './ui/Button';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategorySlug: string | null;
  onCategorySelect: (slug: string | null) => void;
  showServicesOnly: boolean;
  onToggleServicesOnly: () => void;
  showInternalOnly: boolean;
  onToggleInternalOnly: () => void;
  onAddCustomItem: () => void;
}

export function CategorySidebar({
  categories,
  selectedCategorySlug,
  onCategorySelect,
  showServicesOnly,
  onToggleServicesOnly,
  showInternalOnly,
  onToggleInternalOnly,
  onAddCustomItem,
}: CategorySidebarProps) {
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="w-64 bg-white border-r border-zinc-200 flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-200">
        <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
          Kategorijos
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategorySlug === null
              ? 'bg-blue-900 text-white'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          Visos kategorijos
        </button>

        {sortedCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.slug)}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategorySlug === category.slug
                ? 'bg-blue-900 text-white'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-200 space-y-3">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showServicesOnly}
              onChange={onToggleServicesOnly}
              className="rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500"
            />
            <span>Rodyti tik paslaugas</span>
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showInternalOnly}
              onChange={onToggleInternalOnly}
              className="rounded border-zinc-300 text-cyan-500 focus:ring-cyan-500"
            />
            <span>Rodyti tik vidinius</span>
          </label>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onAddCustomItem}
          className="w-full border border-cyan-500 text-cyan-700 hover:bg-cyan-50"
        >
          + Pridėti savo eilutę
        </Button>
      </div>
    </div>
  );
}
