'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/calculations';

interface Analytics {
  offersThisMonth: number;
  offersLastMonth: number;
  totalRevenue: number;
  conversionRate: number;
  topProducts: Array<{ name: string; count: number; revenue: number }>;
  recentActivity: Array<{
    id: string;
    offer_no: string;
    client_name: string;
    status: string;
    created_at: string;
    updated_at: string;
  }>;
  statusCounts: {
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
  };
  totalOffers: number;
}

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

export default function HomePage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (result.ok) {
        setAnalytics(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
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

  const offersGrowth = analytics && analytics.offersLastMonth > 0
    ? ((analytics.offersThisMonth - analytics.offersLastMonth) / analytics.offersLastMonth) * 100
    : 0;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-12 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Įkrautas Pasiūlymų Sistema</h1>
              <p className="text-sm text-cyan-300 mt-2">
                Apžvalga ir statistika
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/templates">
                <Button variant="ghost" size="lg" className="text-white hover:bg-blue-800">
                  📝 Šablonai
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="secondary" size="lg" className="bg-cyan-500 text-white hover:bg-cyan-600 border-0">
                  📦 Produktai
                </Button>
              </Link>
              <Link href="/new-offer">
                <Button variant="primary" size="lg">
                  + Naujas pasiūlymas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Offers This Month */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Pasiūlymai šį mėnesį</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2">
                  {analytics?.offersThisMonth || 0}
                </p>
                {offersGrowth !== 0 && (
                  <p className={`text-xs mt-2 ${offersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {offersGrowth > 0 ? '↑' : '↓'} {Math.abs(offersGrowth).toFixed(1)}% nuo praėjusio
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Pajamos (priimti)</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  {analytics?.statusCounts.accepted || 0} priimtų pasiūlymų
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Konversijos rodiklis</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2">
                  {analytics?.conversionRate.toFixed(1) || 0}%
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Išsiųstų → Priimtų
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          {/* Total Offers */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-600">Viso pasiūlymų</p>
                <p className="text-3xl font-bold text-zinc-900 mt-2">
                  {analytics?.totalOffers || 0}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Visos būsenos
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Būsenos pasiskirstymas</h2>
            <div className="space-y-3">
              {analytics && Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'draft' ? 'bg-zinc-400' :
                      status === 'sent' ? 'bg-blue-500' :
                      status === 'accepted' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-zinc-600">{STATUS_LABELS[status]}</span>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Populiariausi produktai</h2>
            <div className="space-y-3">
              {analytics?.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {product.count} vnt.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-cyan-600">
                    {formatCurrency(product.revenue)}
                  </span>
                </div>
              ))}
              {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Nėra duomenų
                </p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Naujausia veikla</h2>
            <div className="space-y-3">
              {analytics?.recentActivity.map((activity) => (
                <Link href={`/offers/${activity.id}`} key={activity.id}>
                  <div className="flex items-start justify-between hover:bg-zinc-50 -mx-2 px-2 py-2 rounded transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {activity.offer_no}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">
                        {activity.client_name}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {new Date(activity.created_at).toLocaleDateString('lt-LT')}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${STATUS_COLORS[activity.status]}`}>
                      {STATUS_LABELS[activity.status]}
                    </span>
                  </div>
                </Link>
              ))}
              {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Nėra veiklos
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action: View All Offers */}
        <div className="mt-8 text-center">
          <Link href="/offers">
            <Button variant="secondary" size="lg" className="border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50">
              Peržiūrėti visus pasiūlymus →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
