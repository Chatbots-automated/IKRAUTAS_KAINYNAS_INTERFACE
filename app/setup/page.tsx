'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SetupPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        message: `Klaida: ${String(error)}`,
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm border border-zinc-200 p-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Supabase Setup
        </h1>
        <p className="text-zinc-600 mb-8">
          Populate your database with initial categories and products
        </p>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              Before You Start
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Ensure your Supabase instance is running</li>
              <li>✓ Migration should be applied (see SUPABASE_SETUP.md)</li>
              <li>✓ Environment variables are configured in .env.local</li>
            </ul>
          </div>

          <div className="border border-zinc-200 rounded-lg p-6">
            <h3 className="font-semibold text-zinc-900 mb-2">
              Step 1: Apply Migration
            </h3>
            <p className="text-sm text-zinc-600 mb-3">
              Run this command in your terminal, or execute the SQL manually:
            </p>
            <code className="block bg-zinc-100 px-4 py-2 rounded text-sm">
              supabase db push
            </code>
          </div>

          <div className="border border-zinc-200 rounded-lg p-6">
            <h3 className="font-semibold text-zinc-900 mb-2">
              Step 2: Seed Database
            </h3>
            <p className="text-sm text-zinc-600 mb-4">
              This will insert 5 categories and 24 products into your database.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full"
            >
              {isSeeding ? 'Seeding Database...' : 'Seed Database'}
            </Button>

            {result && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  result.ok
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    result.ok ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {result.ok ? '✓ Success!' : '✗ Error'}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    result.ok ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
                </p>
              </div>
            )}
          </div>

          {result?.ok && (
            <div className="border border-green-200 rounded-lg p-6 bg-green-50">
              <h3 className="font-semibold text-green-900 mb-2">
                Setup Complete! 🎉
              </h3>
              <p className="text-sm text-green-800 mb-4">
                Your database is ready. You can now start using the application.
              </p>
              <Link href="/new-offer">
                <Button variant="primary" size="lg" className="w-full">
                  Create Your First Offer
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200">
            <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
