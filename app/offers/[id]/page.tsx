'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOfferStore } from '@/lib/store/offer-store';
import { Category, ProductWithCategory } from '@/lib/types';
import { CategorySidebar } from '@/components/CategorySidebar';
import { ProductCatalog } from '@/components/ProductCatalog';
import { OfferCart } from '@/components/OfferCart';
import { CustomItemModal } from '@/components/CustomItemModal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function OfferEditPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const {
    offerNo,
    formData,
    items,
    discountPercent,
    ignitisDiscountEur,
    applyDiscountAfterVat,
    addItem,
    addCustomItem,
    loadOffer,
  } = useOfferStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [showServicesOnly, setShowServicesOnly] = useState(false);
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes, offerRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch(`/api/offers/${params.id}`),
      ]);

      const categoriesResult = await categoriesRes.json();
      const productsResult = await productsRes.json();
      const offerResult = await offerRes.json();

      if (categoriesResult.ok) {
        setCategories(categoriesResult.data);
      }

      if (productsResult.ok) {
        setProducts(productsResult.data);
      }

      if (offerResult.ok) {
        const offer = offerResult.data;
        loadOffer({
          id: offer.id,
          offerNo: offer.offer_no,
          formData: {
            client_name: offer.client_name,
            client_birth_date: offer.client_birth_date || '',
            client_address: offer.client_address || '',
            client_email: offer.client_email || '',
            client_phone: offer.client_phone || '',
            project_manager_name: offer.project_manager_name,
            payment_reference: offer.payment_reference || '',
            warranty_years: offer.warranty_years || 5,
            notes: offer.notes || '',
          },
          items: offer.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            name: item.name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            category_id: item.category_id,
            vat_rate: item.vat_rate,
            hide_qty: item.hide_qty,
            is_custom: item.is_custom,
            sort_order: item.category?.sort_order || 999,
          })),
          discountPercent: offer.discount_percent || 0,
          ignitisDiscountEur: offer.ignitis_discount_eur || 0,
          applyDiscountAfterVat: offer.apply_discount_after_vat,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Klaida kraunant duomenis', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = (
    product: any,
    quantity: number,
    customPrice?: number
  ) => {
    addItem(product, quantity, customPrice);
    showToast('Produktas pridėtas į pasiūlymą', 'success');
  };

  const handleAddCustomItem = (
    name: string,
    unitPrice: number,
    quantity: number,
    category: any
  ) => {
    addCustomItem(name, unitPrice, quantity, category);
    showToast('Pasirinktinė eilutė pridėta', 'success');
  };

  const handleQuickExportAll = async () => {
    if (!formData.client_name || items.length === 0) {
      showToast('Užpildykite pasiūlymą prieš eksportavimą', 'error');
      return;
    }

    showToast('Generuojami dokumentai...', 'info');

    const offerData = {
      offer: {
        offer_no: offerNo,
        client_name: formData.client_name,
        client_address: formData.client_address,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        project_manager_name: formData.project_manager_name,
        notes: formData.notes,
        discount_percent: discountPercent,
        ignitis_discount_eur: ignitisDiscountEur,
        apply_discount_after_vat: applyDiscountAfterVat,
        created_at: new Date().toISOString(),
        items,
      },
      categories,
      totals: useOfferStore.getState().totals,
    };

    try {
      const pdfResponse = await fetch('/api/offers/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });

      if (pdfResponse.ok) {
        const pdfBlob = await pdfResponse.blob();
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfUrl;
        pdfLink.download = `Pasiulymas_${offerNo}.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        window.URL.revokeObjectURL(pdfUrl);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const contractResponse = await fetch('/api/offers/export/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerData),
      });

      if (contractResponse.ok) {
        const contractBlob = await contractResponse.blob();
        const contractUrl = window.URL.createObjectURL(contractBlob);
        const contractLink = document.createElement('a');
        contractLink.href = contractUrl;
        contractLink.download = `Sutartis_${offerNo}.docx`;
        document.body.appendChild(contractLink);
        contractLink.click();
        document.body.removeChild(contractLink);
        window.URL.revokeObjectURL(contractUrl);
      }

      showToast('Dokumentai sugeneruoti!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showToast('Klaida generuojant dokumentus', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.client_name || !formData.project_manager_name || !formData.payment_reference) {
      showToast('Užpildykite privalomas laukelius (vardas, vadovas, mokėjimo nr.)', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('Pridėkite bent vieną produktą', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/offers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          items,
          discountPercent,
          ignitisDiscountEur,
          applyDiscountAfterVat,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        showToast('Pasiūlymas sėkmingai atnaujintas', 'success');
      } else {
        showToast(result.message || 'Nepavyko atnaujinti pasiūlymo', 'error');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      showToast('Nepavyko atnaujinti pasiūlymo', 'error');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-950 to-blue-900 border-b border-blue-800">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-white hover:bg-blue-800"
          >
            ← Grįžti į sąrašą
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Redaguoti pasiūlymą
            </h1>
            <p className="text-sm text-cyan-300">Nr. {offerNo}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleQuickExportAll}
            disabled={isSaving || items.length === 0}
            className="bg-cyan-500 text-white hover:bg-cyan-600 border-0"
          >
            📥 Eksportuoti viską
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saugoma...' : 'Išsaugoti'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CategorySidebar
          categories={categories}
          selectedCategorySlug={selectedCategorySlug}
          onCategorySelect={setSelectedCategorySlug}
          showServicesOnly={showServicesOnly}
          onToggleServicesOnly={() => setShowServicesOnly(!showServicesOnly)}
          showInternalOnly={showInternalOnly}
          onToggleInternalOnly={() => setShowInternalOnly(!showInternalOnly)}
          onAddCustomItem={() => setIsCustomModalOpen(true)}
        />

        <ProductCatalog
          products={products}
          selectedCategorySlug={selectedCategorySlug}
          showServicesOnly={showServicesOnly}
          showInternalOnly={showInternalOnly}
          onAddProduct={handleAddProduct}
        />

        <OfferCart categories={categories} />

        <CustomItemModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          categories={categories}
          onAdd={handleAddCustomItem}
        />
      </div>
    </div>
  );
}
