'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';
import { useOfferStore } from '@/lib/store/offer-store';
import { Category } from '@/lib/types';
import { DocumentPreviewModal } from './DocumentPreviewModal';

type ExportType = 'excel' | 'contract' | 'pp-act';

interface ExportButtonsProps {
  categories: Category[];
}

export function ExportButtons({ categories }: ExportButtonsProps) {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState<ExportType | null>(null);
  const [previewType, setPreviewType] = useState<ExportType | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  
  const {
    offerNo,
    formData,
    items,
    discountPercent,
    ignitisDiscountEur,
    applyDiscountAfterVat,
    totals,
    offerId,
  } = useOfferStore();

  const handleExport = async (type: ExportType) => {
    if (!formData.client_name || items.length === 0) {
      showToast('Užpildykite pasiūlymą prieš eksportavimą', 'error');
      return;
    }

    setIsExporting(type);

    try {
      let endpoint = '';
      let filename = '';
      let successMessage = '';

      switch (type) {
        case 'excel':
          endpoint = '/api/offers/export/excel';
          filename = `SAMATA_${offerNo}.xlsx`;
          successMessage = 'SAMATA sugeneruota';
          break;
        case 'contract':
          endpoint = '/api/offers/export/contract';
          filename = `Sutartis_${offerNo}.docx`;
          successMessage = 'Sutartis sugeneruota';
          break;
        case 'pp-act':
          endpoint = '/api/offers/export/pp-act';
          filename = `PP_Aktas_${offerNo}.docx`;
          successMessage = 'PP aktas sugeneruotas';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer: {
            offer_no: offerNo,
            client_name: formData.client_name,
            client_birth_date: formData.client_birth_date,
            client_address: formData.client_address,
            client_email: formData.client_email,
            client_phone: formData.client_phone,
            project_manager_name: formData.project_manager_name,
            payment_reference: formData.payment_reference,
            warranty_years: formData.warranty_years,
            notes: formData.notes,
            discount_percent: discountPercent,
            ignitis_discount_eur: ignitisDiscountEur,
            apply_discount_after_vat: applyDiscountAfterVat,
            created_at: new Date().toISOString(),
            items,
          },
          categories,
          totals,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(successMessage, 'success');
    } catch (error) {
      showToast('Klaida generuojant dokumentą', 'error');
      console.error('Export error:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportAll = async () => {
    if (!formData.client_name || items.length === 0) {
      showToast('Užpildykite pasiūlymą prieš eksportavimą', 'error');
      return;
    }

    showToast('Generuojami visi dokumentai...', 'info');

    // Export Excel SAMATA first
    await handleExport('excel');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then export Contract
    await handleExport('contract');
  };

  return (
    <>
      <div className="space-y-3 pt-4 border-t border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wide">
          Eksportavimas
        </h3>

        <Button
          variant="primary"
          size="sm"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
          onClick={handleExportAll}
          disabled={isExporting !== null}
        >
          {isExporting ? 'Generuojama...' : '📥 Visi dokumentai'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
          onClick={() => {
            setEmailAddress(formData.client_email || '');
            setShowEmailModal(true);
          }}
          disabled={isExporting !== null || !offerId}
        >
          📧 Siųsti el. paštu
        </Button>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setPreviewType('excel')}
              disabled={isExporting !== null}
            >
              👁️ SAMATA
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleExport('excel')}
              disabled={isExporting !== null}
            >
              ⬇️ SAMATA
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setPreviewType('contract')}
              disabled={isExporting !== null}
            >
              👁️ Sutartis
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleExport('contract')}
              disabled={isExporting !== null}
            >
              ⬇️ Sutartis
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setPreviewType('pp-act')}
              disabled={isExporting !== null}
            >
              👁️ PP aktas
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleExport('pp-act')}
              disabled={isExporting !== null}
            >
              ⬇️ PP
            </Button>
          </div>
        </div>
      </div>
      
      <DocumentPreviewModal
        isOpen={previewType !== null}
        onClose={() => setPreviewType(null)}
        documentType={previewType || 'excel'}
        categories={categories}
        onExport={() => previewType && handleExport(previewType)}
      />

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Siųsti pasiūlymą el. paštu"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Pasiūlymas bus išsiųstas su visais dokumentais (SAMATA, Sutartis, PP Aktas).
          </p>
          
          <Input
            type="email"
            label="El. pašto adresas"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            placeholder="klientas@example.com"
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Demo režimas:</strong> El. laiškas bus simuliuotas. Pasiūlymo būsena bus pakeista į "Išsiųstas".
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowEmailModal(false)}
              className="flex-1"
              disabled={isSendingEmail}
            >
              Atšaukti
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!emailAddress || !offerId) {
                  showToast('Įveskite el. pašto adresą', 'error');
                  return;
                }

                setIsSendingEmail(true);
                try {
                  const response = await fetch('/api/offers/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      offerId: offerId,
                      recipientEmail: emailAddress,
                      includeAttachments: true,
                    }),
                  });

                  const result = await response.json();

                  if (result.ok) {
                    showToast('El. laiškas išsiųstas klientui!', 'success');
                    setShowEmailModal(false);
                    
                    // Reload page to show updated status
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  } else {
                    showToast(result.message || 'Klaida', 'error');
                  }
                } catch (error) {
                  console.error('Error sending email:', error);
                  showToast('Nepavyko išsiųsti', 'error');
                } finally {
                  setIsSendingEmail(false);
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSendingEmail || !emailAddress}
            >
              {isSendingEmail ? '⏳ Siunčiama...' : '📧 Siųsti'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
