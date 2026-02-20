'use client';

import React from 'react';
import { OfferFormData } from '@/lib/types';
import { Input, TextArea } from './ui/Input';

interface OfferInfoFormProps {
  formData: OfferFormData;
  onUpdate: (data: Partial<OfferFormData>) => void;
}

export function OfferInfoForm({ formData, onUpdate }: OfferInfoFormProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide mb-2">
        Kliento informacija
      </h3>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-700">Kliento vardas *</label>
        <input
          value={formData.client_name}
          onChange={(e) => onUpdate({ client_name: e.target.value })}
          placeholder="Įveskite kliento vardą"
          className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-700">Gimimo data</label>
        <input
          type="date"
          value={formData.client_birth_date}
          onChange={(e) => onUpdate({ client_birth_date: e.target.value })}
          className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-700">Adresas *</label>
        <input
          value={formData.client_address}
          onChange={(e) => onUpdate({ client_address: e.target.value })}
          placeholder="Įveskite adresą"
          className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">El. paštas</label>
          <input
            type="email"
            value={formData.client_email}
            onChange={(e) => onUpdate({ client_email: e.target.value })}
            placeholder="el.pastas@..."
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">Telefonas</label>
          <input
            type="tel"
            value={formData.client_phone}
            onChange={(e) => onUpdate({ client_phone: e.target.value })}
            placeholder="+370..."
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-700">Projekto vadovas *</label>
        <input
          value={formData.project_manager_name}
          onChange={(e) => onUpdate({ project_manager_name: e.target.value })}
          placeholder="Įveskite vadovo vardą"
          className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">Mokėjimo nr. *</label>
          <input
            value={formData.payment_reference}
            onChange={(e) => onUpdate({ payment_reference: e.target.value })}
            placeholder="pvz. 2026-001"
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700">Garantija (metai)</label>
          <input
            type="number"
            value={formData.warranty_years}
            onChange={(e) => onUpdate({ warranty_years: parseInt(e.target.value) || 5 })}
            min="1"
            max="10"
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-zinc-700">Pastabos</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Papildomos pastabos..."
          rows={2}
          className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
    </div>
  );
}
