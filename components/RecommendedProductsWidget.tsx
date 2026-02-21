'use client';

interface RecommendedProduct {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface RecommendedProductsWidgetProps {
  products: RecommendedProduct[];
}

export function RecommendedProductsWidget({ products }: RecommendedProductsWidgetProps) {
  const totalPrice = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  if (products.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg border-2 border-cyan-200 p-4">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3 flex items-center gap-2">
        <span>💰</span>
        Rekomenduoti produktai
      </h3>
      <div className="space-y-2 text-sm mb-3">
        {products.map((product, idx) => (
          <div key={idx} className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-zinc-900">{product.name}</p>
              <p className="text-xs text-zinc-500">
                {product.quantity} vnt × {product.price.toFixed(2)} EUR
              </p>
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
        <span className="font-bold text-cyan-700 text-lg">{totalPrice.toFixed(2)} EUR</span>
      </div>
      <div className="mt-3 pt-3 border-t border-cyan-200">
        <p className="text-xs text-zinc-600">
          Šie produktai bus pridėti prie pasiūlymo
        </p>
      </div>
    </div>
  );
}
