'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Offer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/calculations';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Juodraštis',
  sent: 'Išsiųstas',
  accepted: 'Priimtas',
  rejected: 'Atmestas',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function OffersListPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [offers, searchQuery, statusFilter, sortBy, sortOrder]);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      const result = await response.json();
      
      if (result.ok) {
        setOffers(result.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...offers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(offer =>
        offer.offer_no.toLowerCase().includes(query) ||
        offer.client_name.toLowerCase().includes(query) ||
        offer.project_manager_name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'client':
          comparison = a.client_name.localeCompare(b.client_name);
          break;
        case 'amount':
          // Note: We don't have amount in Offer model, so sort by date for now
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOffers(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-zinc-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Visi Pasiūlymai</h1>
              <p className="text-sm text-cyan-300 mt-1">
                {filteredOffers.length} iš {offers.length} pasiūlymų
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-blue-800">
                  ← Dashboard
                </Button>
              </Link>
              <Link href="/new-offer">
                <Button variant="secondary" className="bg-cyan-500 text-white hover:bg-cyan-600 border-0">
                  + Naujas pasiūlymas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <Input
                type="text"
                placeholder="Ieškoti pagal klientą, pasiūlymo nr., vadovą..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">Visos būsenos</option>
                <option value="draft">Juodraščiai</option>
                <option value="sent">Išsiųsti</option>
                <option value="accepted">Priimti</option>
                <option value="rejected">Atmesti</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="date">Data</option>
                <option value="client">Klientas</option>
                <option value="amount">Suma</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-zinc-300 rounded-lg text-sm hover:bg-zinc-50 transition-colors"
                title={sortOrder === 'asc' ? 'Didėjančia tvarka' : 'Mažėjančia tvarka'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Pasiūlymo Nr.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Klientas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Projekto vadovas
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Būsena
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Data
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                  Veiksmai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOffers.map((offer) => (
                <tr
                  key={offer.id}
                  className="hover:bg-zinc-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-zinc-900">
                      {offer.offer_no}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {offer.client_name}
                      </p>
                      {offer.client_email && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {offer.client_email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-zinc-600">
                      {offer.project_manager_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[offer.status]
                      }`}
                    >
                      {STATUS_LABELS[offer.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-zinc-600">
                        {new Date(offer.created_at).toLocaleDateString('lt-LT')}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(offer.created_at).toLocaleTimeString('lt-LT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/offers/${offer.id}`}>
                      <Button variant="ghost" size="sm" className="text-cyan-600 hover:bg-cyan-50">
                        Peržiūrėti →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOffers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm mb-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Pasiūlymų nerasta pagal pasirinktus filtrus'
                  : 'Pasiūlymų nerasta'
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/new-offer">
                  <Button variant="primary">
                    Sukurti pirmą pasiūlymą
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
