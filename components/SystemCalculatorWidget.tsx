'use client';

interface SystemCalculation {
  systemSizeKw: number;
  panelsNeeded: number;
  annualKwh: number;
  totalCost: number;
  annualSavings: number;
  paybackYears: number;
  profit25Years: number;
}

interface SystemCalculatorWidgetProps {
  calculation: SystemCalculation;
}

export function SystemCalculatorWidget({ calculation }: SystemCalculatorWidgetProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200 p-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
        <span>🔆</span>
        Sistemos kalkuliacija
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-600">Metinis suvartojimas:</span>
          <span className="font-semibold text-zinc-900">{calculation.annualKwh} kWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Sistemos dydis:</span>
          <span className="font-semibold text-amber-700">{calculation.systemSizeKw} kW</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Modulių reikia:</span>
          <span className="font-semibold text-zinc-900">~{calculation.panelsNeeded} vnt (450W)</span>
        </div>
        <div className="h-px bg-amber-200 my-2"></div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Investicija:</span>
          <span className="font-bold text-zinc-900">{calculation.totalCost.toLocaleString()} EUR</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Metinis taupymas:</span>
          <span className="font-semibold text-green-600">~{calculation.annualSavings} EUR</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">Atsiperkamumas:</span>
          <span className="font-semibold text-cyan-600">{calculation.paybackYears} metai</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600">25 metų pelnas:</span>
          <span className="font-bold text-green-700">+{calculation.profit25Years.toLocaleString()} EUR</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-amber-200">
        <p className="text-xs text-zinc-600 italic">
          *Skaičiavimai apytiksliai, pagal ~1200 kWh/kW/metai ir 0.15 EUR/kWh
        </p>
      </div>
    </div>
  );
}
