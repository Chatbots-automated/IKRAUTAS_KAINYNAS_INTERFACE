'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SolarVariables {
  clientName?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  roofType?: string;
  roofArea?: string;
  monthlyConsumption?: string;
  desiredPower?: string;
  budget?: string;
  installationDate?: string;
  warranty_years?: string;
  notes?: string;
}

interface RecommendedProduct {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export default function SolarPlantsPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Sveiki. Padėsiu parinkti saulės elektrinę klientui. Pradėkite nuo kliento kontaktų - vardas, adresas, telefonas?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [variables, setVariables] = useState<SolarVariables>({});
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate system specs
  const calculateSystem = () => {
    if (!variables.monthlyConsumption) return null;

    const monthlyKwh = parseFloat(variables.monthlyConsumption.replace(/[^0-9.]/g, ''));
    if (isNaN(monthlyKwh)) return null;

    const annualKwh = monthlyKwh * 12;
    const systemSizeKw = Math.ceil((annualKwh / 1200) * 10) / 10; // ~1200 kWh per kW per year in Lithuania
    const panelWattage = 450; // Typical panel
    const panelsNeeded = Math.ceil((systemSizeKw * 1000) / panelWattage);
    
    // Cost estimates (EUR per kW)
    const costPerKw = 1200; // ~1200 EUR/kW installed
    const totalCost = Math.round(systemSizeKw * costPerKw);
    
    // Savings (assume 0.15 EUR/kWh)
    const electricityPrice = 0.15;
    const annualSavings = Math.round(annualKwh * electricityPrice);
    const paybackYears = Math.round((totalCost / annualSavings) * 10) / 10;
    const profit25Years = Math.round((annualSavings * 25) - totalCost);

    return {
      systemSizeKw,
      panelsNeeded,
      annualKwh,
      totalCost,
      annualSavings,
      paybackYears,
      profit25Years,
    };
  };

  const systemCalc = calculateSystem();

  // Calculate total price from recommended products
  const totalPrice = recommendedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    console.log('🚀 [CLIENT] Sending message:', userMessage.content);
    console.log('📊 [CLIENT] Current variables:', variables);
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('📤 [CLIENT] Calling API...');
      const response = await fetch('/api/claude/solar-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentVariables: variables,
        }),
      });

      console.log('📥 [CLIENT] API response status:', response.status);
      const result = await response.json();
      console.log('📦 [CLIENT] API result:', result);

      if (result.ok) {
        console.log('✅ [CLIENT] Success!');
        console.log('💬 [CLIENT] Message:', result.message);
        console.log('🔢 [CLIENT] New variables:', result.variables);
        console.log('📦 [CLIENT] Recommended products:', result.recommendedProducts);
        
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.message },
        ]);

        if (result.variables) {
          console.log('📝 [CLIENT] Updating variables...');
          setVariables((prev) => {
            const updated = { ...prev, ...result.variables };
            console.log('🔄 [CLIENT] Variables after update:', updated);
            return updated;
          });
        }

        if (result.recommendedProducts && result.recommendedProducts.length > 0) {
          console.log('🛒 [CLIENT] Adding recommended products...');
          setRecommendedProducts((prev) => {
            // Merge new products (avoid duplicates by name)
            const existing = new Map(prev.map(p => [p.name, p]));
            result.recommendedProducts.forEach((p: RecommendedProduct) => {
              existing.set(p.name, p);
            });
            return Array.from(existing.values());
          });
        }
      } else {
        console.error('❌ [CLIENT] API returned error:', result);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Atsiprašau, įvyko klaida. Bandykite dar kartą.' },
        ]);
      }
    } catch (error) {
      console.error('❌ [CLIENT] Fatal error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ryšio klaida. Patikrinkite interneto jungtį.' },
      ]);
    } finally {
      setIsLoading(false);
      console.log('🏁 [CLIENT] Request complete');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCreateOffer = async () => {
    if (!variables.clientName) {
      alert('Trūksta kliento vardo. Prašome užpildyti bent minimalius duomenis.');
      return;
    }

    console.log('🚀 [CREATE OFFER] Starting...');
    console.log('📋 [CREATE OFFER] Variables:', variables);
    
    setIsCreatingOffer(true);

    try {
      // Generate offer number
      const offerNo = `SAULES-${Date.now().toString().slice(-8)}`;

      // Create offer with collected variables
      const offerData = {
        offerNo: offerNo,
        formData: {
          client_name: variables.clientName || '',
          client_address: variables.clientAddress || null,
          client_phone: variables.clientPhone || null,
          client_email: variables.clientEmail || null,
          client_birth_date: null,
          project_manager_name: 'AI Asistentas',
          payment_reference: null,
          warranty_years: variables.warranty_years ? parseInt(variables.warranty_years) : 10,
          notes: variables.notes || `Stogo tipas: ${variables.roofType || '-'}\nStogo plotas: ${variables.roofArea || '-'}\nMėnesinis suvartojimas: ${variables.monthlyConsumption || '-'}\nNorima galia: ${variables.desiredPower || '-'}\nBiudžetas: ${variables.budget || '-'}`,
        },
        items: [], // Empty for now, user will add products manually
        discountPercent: null,
        ignitisDiscountEur: null,
        applyDiscountAfterVat: true,
        totals: {
          subtotal: 0,
          vat: 0,
          total: 0,
        },
      };

      console.log('📤 [CREATE OFFER] Creating offer with data:', offerData);

      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });

      const result = await response.json();
      console.log('📥 [CREATE OFFER] Response:', result);

      if (result.ok && result.data) {
        console.log('✅ [CREATE OFFER] Offer created:', result.data.id);
        console.log('🔀 [CREATE OFFER] Redirecting to offer page...');
        
        // Redirect to the new offer page
        router.push(`/offers/${result.data.id}`);
      } else {
        console.error('❌ [CREATE OFFER] Failed:', result);
        alert('Nepavyko sukurti pasiūlymo: ' + (result.message || 'Nežinoma klaida'));
      }
    } catch (error) {
      console.error('❌ [CREATE OFFER] Error:', error);
      alert('Klaida kuriant pasiūlymą. Patikrinkite konsole.');
    } finally {
      setIsCreatingOffer(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-6 px-4 sm:px-6 lg:px-8 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-cyan-300 hover:text-cyan-200 text-sm">
              ← Grįžti
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>☀️</span>
                Saulės Elektrinės
              </h1>
              <p className="text-xs text-cyan-300 mt-1">
                AI asistuojamas konsultavimas
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setMessages([
                {
                  role: 'assistant',
                  content: 'Sveiki. Padėsiu parinkti saulės elektrinę klientui. Pradėkite nuo kliento kontaktų - vardas, adresas, telefonas?',
                },
              ]);
              setVariables({});
              setRecommendedProducts([]);
            }}
            className="bg-cyan-500 text-white hover:bg-cyan-600 border-0"
          >
            🔄 Pradėti iš naujo
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Left */}
        <div className="flex-1 flex flex-col bg-white border-r border-zinc-200">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-zinc-100 text-zinc-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-cyan-600">🤖 Įkrautas AI</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div>
                    <span className="text-sm text-zinc-600">Galvoju...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-200 bg-zinc-50">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Rašykite žinutę..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-cyan-500 hover:bg-cyan-600"
              >
                Siųsti
              </Button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Enter - siųsti • Shift+Enter - nauja eilutė
            </p>
          </div>
        </div>

        {/* Variables & Calculator Panel - Right */}
        <div className="w-[28rem] bg-zinc-50 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-1">
              Surinkti duomenys
            </h2>
            <p className="text-xs text-zinc-500">
              AI užpildo šiuos laukus pokalbio metu
            </p>
          </div>

          <div className="space-y-4">
            {/* Client Info */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Kliento informacija</h3>
              <div className="space-y-2">
                <VariableField label="Vardas, pavardė" value={variables.clientName} />
                <VariableField label="Adresas" value={variables.clientAddress} />
                <VariableField label="Telefonas" value={variables.clientPhone} />
                <VariableField label="El. paštas" value={variables.clientEmail} />
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Techniniai duomenys</h3>
              <div className="space-y-2">
                <VariableField label="Stogo tipas" value={variables.roofType} />
                <VariableField label="Stogo plotas" value={variables.roofArea} />
                <VariableField label="Mėnesinis suvartojimas" value={variables.monthlyConsumption} />
                <VariableField label="Norima galia" value={variables.desiredPower} />
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg border border-zinc-200 p-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-3">Projekto informacija</h3>
              <div className="space-y-2">
                <VariableField label="Biudžetas" value={variables.budget} />
                <VariableField label="Montavimo data" value={variables.installationDate} />
                <VariableField label="Pastabos" value={variables.notes} multiline />
              </div>
            </div>

            {/* System Calculator */}
            {systemCalc && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 p-4">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                  <span>🔆</span>
                  Sistemos kalkuliacija
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Metinis suvartojimas:</span>
                    <span className="font-semibold text-zinc-900">{systemCalc.annualKwh} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Sistemos dydis:</span>
                    <span className="font-semibold text-amber-700">{systemCalc.systemSizeKw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Modulių reikia:</span>
                    <span className="font-semibold text-zinc-900">~{systemCalc.panelsNeeded} vnt (450W)</span>
                  </div>
                  <div className="h-px bg-amber-200 my-2"></div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Investicija:</span>
                    <span className="font-bold text-zinc-900">{systemCalc.totalCost.toLocaleString()} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Metinės taupymas:</span>
                    <span className="font-semibold text-green-600">~{systemCalc.annualSavings} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Atsiperkamumas:</span>
                    <span className="font-semibold text-cyan-600">{systemCalc.paybackYears} metai</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">25 metų pelnas:</span>
                    <span className="font-bold text-green-700">+{systemCalc.profit25Years.toLocaleString()} EUR</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Products Price */}
            {recommendedProducts.length > 0 && (
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200 p-4">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                  <span>💰</span>
                  Rekomenduoti produktai
                </h3>
                <div className="space-y-2 text-sm mb-3">
                  {recommendedProducts.map((product, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-zinc-900">{product.name}</p>
                        <p className="text-xs text-zinc-500">{product.quantity} vnt × {product.price.toFixed(2)} EUR</p>
                      </div>
                      <span className="font-semibold text-cyan-700">
                        {(product.price * product.quantity).toFixed(2)} EUR
                      </span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-cyan-200 my-3"></div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-zinc-900">Viso:</span>
                  <span className="font-bold text-cyan-700">{totalPrice.toFixed(2)} EUR</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full bg-cyan-500 hover:bg-cyan-600"
                disabled={!variables.clientName || isCreatingOffer}
                onClick={handleCreateOffer}
              >
                {isCreatingOffer ? '⏳ Kuriama...' : '💾 Kurti pasiūlymą'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setVariables({});
                  setRecommendedProducts([]);
                }}
                disabled={isCreatingOffer}
              >
                Išvalyti duomenis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariableField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-zinc-600 block mb-1">
        {label}
      </label>
      {multiline ? (
        <div
          className={`text-sm rounded border px-3 py-2 min-h-[60px] ${
            value
              ? 'bg-cyan-50 border-cyan-200 text-zinc-900'
              : 'bg-zinc-50 border-zinc-200 text-zinc-400'
          }`}
        >
          {value || 'Dar nenurodyta'}
        </div>
      ) : (
        <div
          className={`text-sm rounded border px-3 py-2 ${
            value
              ? 'bg-cyan-50 border-cyan-200 text-zinc-900 font-medium'
              : 'bg-zinc-50 border-zinc-200 text-zinc-400'
          }`}
        >
          {value || 'Dar nenurodyta'}
        </div>
      )}
    </div>
  );
}
