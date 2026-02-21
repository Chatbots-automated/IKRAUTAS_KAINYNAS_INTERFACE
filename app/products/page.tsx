'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Category, ProductWithCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/calculations';

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    unit_price: '',
    category_id: '',
    vat_rate: '0.21',
    is_service: false,
    is_internal_only: false,
    // Solar-specific fields
    power_output: '',
    efficiency_percent: '',
    dimensions: '',
    weight_kg: '',
    warranty_years: '',
    technology_type: '',
    brand: '',
    certifications: '',
    max_input_voltage: '',
    mppt_channels: '',
    installation_type: '',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      const productsResult = await productsRes.json();
      const categoriesResult = await categoriesRes.json();

      if (productsResult.ok) setProducts(productsResult.data);
      if (categoriesResult.ok) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Klaida kraunant duomenis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: ProductWithCategory) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku || '',
        name: product.name,
        unit_price: product.unit_price.toString(),
        category_id: product.category_id,
        vat_rate: product.vat_rate.toString(),
        is_service: product.is_service,
        is_internal_only: product.is_internal_only,
        // Solar fields
        power_output: product.power_output || '',
        efficiency_percent: product.efficiency_percent?.toString() || '',
        dimensions: product.dimensions || '',
        weight_kg: product.weight_kg?.toString() || '',
        warranty_years: product.warranty_years?.toString() || '',
        technology_type: product.technology_type || '',
        brand: product.brand || '',
        certifications: product.certifications || '',
        max_input_voltage: product.max_input_voltage || '',
        mppt_channels: product.mppt_channels?.toString() || '',
        installation_type: product.installation_type || '',
        description: product.description || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: '',
        name: '',
        unit_price: '',
        category_id: categories[0]?.id || '',
        vat_rate: '0.21',
        is_service: false,
        is_internal_only: false,
        power_output: '',
        efficiency_percent: '',
        dimensions: '',
        weight_kg: '',
        warranty_years: '',
        technology_type: '',
        brand: '',
        certifications: '',
        max_input_voltage: '',
        mppt_channels: '',
        installation_type: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.unit_price || !formData.category_id) {
      showToast('Užpildykite visus laukus', 'error');
      return;
    }

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: formData.sku || null,
          name: formData.name,
          unit_price: parseFloat(formData.unit_price),
          category_id: formData.category_id,
          vat_rate: parseFloat(formData.vat_rate),
          is_service: formData.is_service,
          is_internal_only: formData.is_internal_only,
          collapse_into_materials: false,
          // Solar fields (optional)
          power_output: formData.power_output || null,
          efficiency_percent: formData.efficiency_percent ? parseFloat(formData.efficiency_percent) : null,
          dimensions: formData.dimensions || null,
          weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
          warranty_years: formData.warranty_years ? parseInt(formData.warranty_years) : null,
          technology_type: formData.technology_type || null,
          brand: formData.brand || null,
          certifications: formData.certifications || null,
          max_input_voltage: formData.max_input_voltage || null,
          mppt_channels: formData.mppt_channels ? parseInt(formData.mppt_channels) : null,
          installation_type: formData.installation_type || null,
          description: formData.description || null,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        showToast(
          editingProduct ? 'Produktas atnaujintas' : 'Produktas sukurtas',
          'success'
        );
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast(result.message || 'Klaida', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Nepavyko išsaugoti produkto', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį produktą?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.ok) {
        showToast('Produktas ištrintas', 'success');
        fetchData();
      } else {
        showToast(result.message || 'Klaida trinant', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Nepavyko ištrinti produkto', 'error');
    }
  };

  // Check if selected category is solar-related
  const selectedCategory = categories.find(c => c.id === formData.category_id);
  const isSolarCategory = selectedCategory && ['solar-panels', 'inverters', 'mounting'].includes(selectedCategory.slug);

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
      <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white py-8 px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Produktų Katalogas</h1>
              <p className="text-sm text-cyan-300 mt-1">
                Valdykite produktų katalogą
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="ghost" size="md" className="text-white hover:bg-blue-800">
                  ← Grįžti
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => handleOpenModal()} className="bg-cyan-500 text-white hover:bg-cyan-600 border-0">
                + Naujas produktas
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-lg shadow-sm border border-zinc-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase">
                  Pavadinimas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase">
                  Kategorija
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase">
                  Galia
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-600 uppercase">
                  Gamintojas
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-600 uppercase">
                  Kaina
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-600 uppercase">
                  Veiksmai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-zinc-900">{product.name}</div>
                    {product.sku && (
                      <div className="text-xs text-zinc-500 mt-0.5">SKU: {product.sku}</div>
                    )}
                    {product.technology_type && (
                      <div className="text-xs text-cyan-600 mt-0.5">{product.technology_type}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4">
                    {product.power_output ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        ⚡ {product.power_output}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-900">
                    {product.brand || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-zinc-900">
                    {formatCurrency(product.unit_price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(product)}
                      >
                        Redaguoti
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Ištrinti
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm mb-4">Produktų nerasta</p>
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Pridėti pirmą produktą
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Redaguoti produktą' : 'Naujas produktas'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="SKU (neprivaloma)"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="PROD-001"
          />

          <Input
            label="Pavadinimas *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Produkto pavadinimas"
          />

          <Input
            type="number"
            label="Kaina (EUR) *"
            value={formData.unit_price}
            onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
            placeholder="0.00"
            step="0.01"
          />

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Kategorija *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="PVM tarifas"
            value={formData.vat_rate}
            onChange={(e) => setFormData({ ...formData, vat_rate: e.target.value })}
            placeholder="0.21"
            step="0.01"
            helperText="Pvz.: 0.21 = 21%"
          />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_service}
                onChange={(e) => setFormData({ ...formData, is_service: e.target.checked })}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span>Tai paslauga</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_internal_only}
                onChange={(e) => setFormData({ ...formData, is_internal_only: e.target.checked })}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span>Tik vidinis</span>
            </label>
          </div>

          {/* Solar-specific fields - only show if category is solar-related */}
          {isSolarCategory && (
            <div className="pt-4 border-t border-zinc-200 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <span>☀️</span>
                Saulės elektrinės duomenys
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Galia"
                  value={formData.power_output}
                  onChange={(e) => setFormData({ ...formData, power_output: e.target.value })}
                  placeholder="450 W arba 10 kW"
                />

                <Input
                  label="Gamintoj as (Brand)"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="JA Solar, Huawei"
                />

                <Input
                  type="number"
                  label="Efektyvumas (%)"
                  value={formData.efficiency_percent}
                  onChange={(e) => setFormData({ ...formData, efficiency_percent: e.target.value })}
                  placeholder="21.5"
                  step="0.1"
                />

                <Input
                  type="number"
                  label="Garantija (metai)"
                  value={formData.warranty_years}
                  onChange={(e) => setFormData({ ...formData, warranty_years: e.target.value })}
                  placeholder="25"
                />

                <Input
                  label="Technologija"
                  value={formData.technology_type}
                  onChange={(e) => setFormData({ ...formData, technology_type: e.target.value })}
                  placeholder="Monocrystalline"
                />

                <Input
                  label="Montavimo tipas"
                  value={formData.installation_type}
                  onChange={(e) => setFormData({ ...formData, installation_type: e.target.value })}
                  placeholder="Roof-mounted"
                />

                <Input
                  label="Matmenys"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="1722x1134x30 mm"
                />

                <Input
                  type="number"
                  label="Svoris (kg)"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  placeholder="22.5"
                  step="0.1"
                />
              </div>

              {/* Inverter-specific fields */}
              {selectedCategory?.slug === 'inverters' && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Max įėjimo įtampa"
                    value={formData.max_input_voltage}
                    onChange={(e) => setFormData({ ...formData, max_input_voltage: e.target.value })}
                    placeholder="1100 V"
                  />

                  <Input
                    type="number"
                    label="MPPT kanalai"
                    value={formData.mppt_channels}
                    onChange={(e) => setFormData({ ...formData, mppt_channels: e.target.value })}
                    placeholder="2"
                  />
                </div>
              )}

              <Input
                label="Sertifikatai"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="CE, IEC 61215, IEC 61730"
              />

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Aprašymas
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalus produkto aprašymas..."
                  rows={3}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-zinc-200">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
              Atšaukti
            </Button>
            <Button variant="primary" onClick={handleSave} className="flex-1">
              {editingProduct ? 'Atnaujinti' : 'Sukurti'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
