'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center mx-auto">
              <span className="text-5xl">⚡</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            UAB Įkrautas
          </h1>
          <p className="text-xl text-cyan-300">
            Pasirinkite modulį
          </p>
        </div>

        {/* Module Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Solar Plants Module */}
          <Link href="/solar-plants">
            <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-400">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-8 text-center">
                <span className="text-7xl mb-4 block">☀️</span>
                <h2 className="text-2xl font-bold text-white">
                  Saulės Elektrinės
                </h2>
              </div>
              <div className="p-6 bg-white">
                <p className="text-zinc-600 text-center mb-4">
                  AI padedamas konsultavimas ir pasiūlymų sudarymas
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-cyan-600 font-medium">
                  <span>🤖 AI Asistentas</span>
                  <span>•</span>
                  <span>Greitas</span>
                  <span>•</span>
                  <span>Patogus</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Charging Stations Module */}
          <Link href="/charging-stations">
            <div className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-400">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-center">
                <span className="text-7xl mb-4 block">🔌</span>
                <h2 className="text-2xl font-bold text-white">
                  Įkrovimo Stotelės
                </h2>
              </div>
              <div className="p-6 bg-white">
                <p className="text-zinc-600 text-center mb-4">
                  Tradicinis pasiūlymų valdymas ir statistika
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-cyan-600 font-medium">
                  <span>📊 Dashboard</span>
                  <span>•</span>
                  <span>Produktai</span>
                  <span>•</span>
                  <span>Šablonai</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Access Links */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link href="/offers" className="text-cyan-300 hover:text-cyan-200 transition-colors">
              Visi pasiūlymai
            </Link>
            <span className="text-cyan-600">•</span>
            <Link href="/products" className="text-cyan-300 hover:text-cyan-200 transition-colors">
              Produktų katalogas
            </Link>
            <span className="text-cyan-600">•</span>
            <Link href="/templates" className="text-cyan-300 hover:text-cyan-200 transition-colors">
              Dokumentų šablonai
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
