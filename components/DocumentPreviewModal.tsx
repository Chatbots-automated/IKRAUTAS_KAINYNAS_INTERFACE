'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useOfferStore } from '@/lib/store/offer-store';
import { Category } from '@/lib/types';
import { formatCurrency, groupItemsByCategory } from '@/lib/utils/calculations';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: 'excel' | 'contract' | 'pp-act';
  categories: Category[];
  onExport: () => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentType,
  categories,
  onExport,
}: DocumentPreviewModalProps) {
  const { offerNo, formData, items, totals, discountPercent, ignitisDiscountEur } = useOfferStore();
  
  const getTitle = () => {
    switch (documentType) {
      case 'excel':
        return 'SAMATOS peržiūra (Excel)';
      case 'contract':
        return 'Sutarties peržiūra (DOCX)';
      case 'pp-act':
        return 'PP akto peržiūra (DOCX)';
      default:
        return 'Dokumento peržiūra';
    }
  };
  
  const groupedItems = groupItemsByCategory(items, categories);
  const currentDate = new Date().toLocaleDateString('lt-LT');
  const advancePayment = totals.finalTotal * 0.5;
  const finalPayment = totals.finalTotal * 0.5;
  
  const hasDynamicPowerController = items.some(item => 
    item.name.toLowerCase().includes('dinaminio galios valdiklio') ||
    item.name.toLowerCase().includes('dgv') ||
    item.name.toLowerCase().includes('power controller')
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="xl">
      <div className="max-h-[70vh] overflow-y-auto p-6 bg-white">
        {/* SAMATA Preview */}
        {documentType === 'excel' && (
          <div className="space-y-4 font-sans text-sm">
            {/* Header */}
            <div className="border-b pb-4">
              <h2 className="text-lg font-bold">UAB ĮKRAUTAS</h2>
              <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                <div>
                  <p>Ozo g. 3-5</p>
                  <p>LT-08200 Vilnius</p>
                  <p>Įmonės kodas: 305604922</p>
                  <p>PVM mok.kodas: LT100013332910</p>
                </div>
                <div>
                  <p>Ats.sąskaita: LT687044090100753403</p>
                  <p>SEB Bankas AB</p>
                  <p>el. paštas: info@ikrautas.lt</p>
                  <p>Tel.: +37064700009</p>
                </div>
              </div>
            </div>
            
            {/* Offer info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><span className="font-bold">Pasiūlymas Nr.:</span> {offerNo}</p>
                <p><span className="font-bold">PIRKĖJAS:</span> {formData.client_name}</p>
                <p><span className="font-bold">PROJEKTAS:</span> {formData.client_address}</p>
                <p><span className="font-bold">Pasiūlymą paruošė:</span> {formData.project_manager_name}</p>
                {formData.notes && <p><span className="font-bold">Pastabos:</span> {formData.notes}</p>}
              </div>
              <div>
                <p><span className="font-bold">Data:</span> {currentDate}</p>
                <p><span className="font-bold">Projektų vadovas:</span> {formData.project_manager_name}</p>
                <p><span className="font-bold">Vykdytojas:</span> {formData.project_manager_name}</p>
                <p><span className="font-bold">Kliento el. paštas:</span> {formData.client_email}</p>
                <p><span className="font-bold">Mokėjimo nr.:</span> <span className="text-blue-600">{formData.payment_reference}</span></p>
                <p><span className="font-bold">Kliento tel. nr.:</span> {formData.client_phone}</p>
                {formData.client_birth_date && <p><span className="font-bold">Kliento gimimo data:</span> {formData.client_birth_date}</p>}
              </div>
            </div>
            
            {/* Products table */}
            <table className="w-full border-collapse border border-gray-300 text-xs mt-6">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-center font-bold">Eil. Nr.</th>
                  <th className="border border-gray-300 p-2 text-center font-bold">Kodas</th>
                  <th className="border border-gray-300 p-2 text-left font-bold">Aprašymas</th>
                  <th className="border border-gray-300 p-2 text-right font-bold">Kaina, EUR</th>
                  <th className="border border-gray-300 p-2 text-center font-bold">Kiekis, vnt.</th>
                  <th className="border border-gray-300 p-2 text-right font-bold">Suma, EUR<br/>(be PVM)</th>
                  <th className="border border-gray-300 p-2 text-right font-bold">Suma, EUR<br/>(su PVM)</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let itemNumber = 1;
                  return groupedItems.map((group, gIdx) => (
                    <React.Fragment key={gIdx}>
                      <tr className="bg-gray-200">
                        <td colSpan={7} className="border border-gray-300 p-2 font-bold">{group.category.name}</td>
                      </tr>
                      {group.items.map((item) => {
                        const lineTotal = item.unit_price * item.quantity;
                        const lineTotalWithVat = lineTotal * (1 + item.vat_rate);
                        const currentItemNum = itemNumber++;
                        
                        return (
                          <tr key={item.id}>
                            <td className="border border-gray-300 p-2 text-center">{currentItemNum}</td>
                            <td className="border border-gray-300 p-2">{item.product_id || '-'}</td>
                            <td className="border border-gray-300 p-2">{item.name}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="border border-gray-300 p-2 text-center">{item.hide_qty ? '-' : item.quantity}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(lineTotal)}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(lineTotalWithVat)}</td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
            </table>
            
            {/* Totals */}
            <div className="mt-6 space-y-2 text-right">
              <p><span className="font-normal">EUR be PVM:</span> <span className="font-bold">{formatCurrency(totals.subtotal)}</span></p>
              <p><span className="font-normal">PVM 21%:</span> <span className="font-bold">{formatCurrency(totals.vat)}</span></p>
              <p className="text-base"><span className="font-bold">EUR su PVM:</span> <span className="font-bold">{formatCurrency(totals.total)}</span></p>
              {totals.discountAmount > 0 && (
                <p className="text-red-600"><span className="font-normal">Nuolaida ({discountPercent}%):</span> <span className="font-bold">-{formatCurrency(totals.discountAmount)}</span></p>
              )}
              {totals.ignitisDiscountAmount > 0 && (
                <p className="text-red-600"><span className="font-normal">Ignitis nuolaida:</span> <span className="font-bold">-{formatCurrency(totals.ignitisDiscountAmount)}</span></p>
              )}
              <p className="text-lg border-t-2 border-black pt-2"><span className="font-bold">GALUTINĖ SUMA:</span> <span className="font-bold">{formatCurrency(totals.finalTotal)}</span></p>
              <p className="text-xs italic text-gray-600">(+pasirinktos stotelės ar įrangos kaina)</p>
            </div>
          </div>
        )}
        
        {/* CONTRACT Preview */}
        {documentType === 'contract' && (
          <div className="space-y-4 font-arial text-sm">
            <div className="text-center">
              <p className="font-bold text-base">UAB Įkrautas</p>
              <p className="font-bold">Elektromobilių įkrovimo stotelių pardavimo ir įrengimo sutartis Nr. {offerNo}, Data: {currentDate}</p>
            </div>
            
            <div className="text-xs space-y-1">
              <p><span className="font-bold">Klientas:</span> {formData.client_name}{formData.client_birth_date && `, ${formData.client_birth_date}`}{formData.client_email && `, ${formData.client_email}`}{formData.client_phone && `, ${formData.client_phone}`}{formData.client_address && `, ${formData.client_address}`}</p>
              <p><span className="font-bold">Rangovas:</span> <span className="font-bold">UAB Įkrautas</span>, 305604922, LT100013332910, Ozo g. 3, LT-08200 Vilnius, el. paštas: info@ikrautas.lt, +37064700009, Banko A/S LT687044090100753403, SEB Bankas</p>
            </div>
            
            <div className="mt-4">
              <p className="font-bold mb-2">1. Elektromobilių įkrovimo stotelės (-ių) montavimas ir rangos darbų sąmata:</p>
              
              <table className="w-full border-collapse border border-gray-300 text-xs mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Pavadinimas</th>
                    <th className="border border-gray-300 p-2 text-center">Kiekis</th>
                    <th className="border border-gray-300 p-2 text-right">Vnt. kaina</th>
                    <th className="border border-gray-300 p-2 text-right">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems.map((group) => (
                    <React.Fragment key={group.category.id}>
                      <tr className="bg-gray-200">
                        <td colSpan={4} className="border border-gray-300 p-2 font-bold">{group.category.name}</td>
                      </tr>
                      {group.items.map((item) => (
                        <tr key={item.id}>
                          <td className="border border-gray-300 p-2">{item.name}</td>
                          <td className="border border-gray-300 p-2 text-center">{item.hide_qty ? '-' : item.quantity}</td>
                          <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price)}</td>
                          <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price * item.quantity)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <p className="font-bold mb-2">2. Atsiskaitymo tvarka:</p>
              <p className="ml-4 mb-2">Už perduotas Prekes ir atliktus Darbus Klientas Rangovui įsipareigoja sumokėti Kainą, lygią <span className="font-bold">{formatCurrency(totals.finalTotal)}</span> EUR (su PVM).</p>
              <ol className="ml-8 space-y-1 list-decimal">
                <li>50% Kainos, t.y. <span className="font-bold">{formatCurrency(advancePayment)}</span> EUR, per 5 kalendorines dienas nuo Sutarties pasirašymo dienos (avansinis mokėjimas). <span className="font-bold">Atliekant avansinį mokėjimą būtina nurodyti mokėjimo numerį: <span className="text-blue-600">{formData.payment_reference}</span></span></li>
                <li>50% Kainos, t.y. <span className="font-bold">{formatCurrency(finalPayment)}</span> EUR, sumokama per 7 kalendorines dienas nuo Rangovo Atliktų darbų priėmimo - perdavimo akto pasirašymo datos (pagal Rangovo išrašytą PVM sąskaitą-faktūrą).</li>
              </ol>
            </div>
            
            <div className="mt-4">
              <p className="font-bold mb-2">3. Darbų atlikimo terminai ir kita svarbi informacija:</p>
              <ol className="ml-8 space-y-2 list-decimal">
                <li>
                  <span className="font-bold">Garantija (išimtys sutarties bendrojoje dalyje 8.6. punkte)</span>
                  <ol className="ml-4 mt-1 space-y-1 list-decimal">
                    <li>Stotelei – <span className="text-blue-600 font-bold">{formData.warranty_years || 5}</span> metų;</li>
                    <li>Atliktiems darbams – 2 metai;</li>
                    <li>Sumontuotoms medžiagom – 2 metai;</li>
                  </ol>
                </li>
                <li>Rangovas įsipareigoja atlikti Elektromobilių įkrovimo stotelės (toliau – Stotelė) įrengimo darbus per 8 savaites nuo Sutarties įsigaliojimo dienos.</li>
                <li>Prekės pristatomos ir Darbai atliekami Statybos aikštelėje, esančioje: <span className="text-blue-600">{formData.client_address}</span></li>
              </ol>
            </div>
            
            <div className="mt-4">
              <p className="font-bold mb-2">4. Sutarties sąlygos:</p>
              <p className="ml-4 mb-1">Sutarties bendrąsias sąlygas rasite paspaudę ant šios nuorodos: <a href="https://ikrautas.lt/wp-content/uploads/2024/09/Ikrovimo-irangos-pardavimo-ir-irengimo-salygos_Bendroji-dalis.pdf" className="text-blue-600 underline" target="_blank">NUORODA</a></p>
              <ol className="ml-8 list-decimal">
                <li>Šalys pasirašydamos sutinka su sutarties sąlygomis ir duomenų tvarkymu;</li>
              </ol>
            </div>
            
            <div className="mt-8 border-t pt-4">
              <h4 className="text-center font-bold mb-4">Sutarties Šalys</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="font-bold mb-2">Klientas</p>
                  <p>{formData.client_name}</p>
                  <p className="mt-8">___________________</p>
                  <p className="text-xs">(parašas)</p>
                </div>
                <div>
                  <p className="font-bold mb-2">Rangovas</p>
                  <p>UAB „Įkrautas"</p>
                  <p>Projektų vadovas {formData.project_manager_name}</p>
                  <p className="mt-4">___________________</p>
                  <p className="text-xs">(parašas)</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* PP ACT Preview */}
        {documentType === 'pp-act' && (
          <div className="space-y-4 font-calibri text-sm">
            <h3 className="text-center font-bold text-base">MONTAVIMO/ĮRENGIMO DARBŲ PERDAVIMO-PRIĖMIMO AKTAS</h3>
            <h3 className="text-center font-bold">{currentDate}</h3>
            
            <table className="w-full border-collapse border border-gray-800 mt-4">
              <tr>
                <td className="border border-gray-800 p-3 w-1/2"><strong>Užsakovas (paslaugų rezultatus priima):</strong></td>
                <td className="border border-gray-800 p-3 w-1/2"><strong>Vykdytojas (paslaugų rezultatus perduoda):</strong></td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3"><span className="text-blue-600">{formData.client_name}</span></td>
                <td className="border border-gray-800 p-3">
                  UAB „Įkrautas" pardavimų vadovas<br/>
                  <span className="text-blue-600">{formData.project_manager_name}</span>
                </td>
              </tr>
            </table>
            
            <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-2 text-left">Pavadinimas</th>
                  <th className="border border-gray-300 p-2 text-center">Kiekis</th>
                  <th className="border border-gray-300 p-2 text-right">Vnt. kaina</th>
                  <th className="border border-gray-300 p-2 text-right">Suma</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((group) => (
                  <React.Fragment key={group.category.id}>
                    <tr className="bg-gray-200">
                      <td colSpan={4} className="border border-gray-300 p-2 font-bold">{group.category.name}</td>
                    </tr>
                    {group.items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 p-2">{item.name}</td>
                        <td className="border border-gray-300 p-2 text-center">{item.hide_qty ? '-' : item.quantity}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unit_price * item.quantity)}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            <p className="mt-4"><strong>Paslaugų suteikimo adresas:</strong> <em className="text-blue-600">{formData.client_address}</em></p>
            
            {hasDynamicPowerController && (
              <p>Įrengta elektromobilių įkrovimo stotelė su prieiga (-omis) ir įsigytais priedais ar papildoma įranga (įskaitant dinaminio galios (apkrovos) valdymo skaitiklį) užtikrina dinaminio galios valdymo funkcijos veikimą</p>
            )}
            
            <ol className="space-y-2 list-decimal ml-6 text-justify">
              {!hasDynamicPowerController && (
                <li>Įrengta elektromobilių įkrovimo stotelė su prieiga (-omis).</li>
              )}
              <li>Vykdytojas patvirtina, kad elektromobilių įkrovimo stotelė su prieiga (-omis) įrengta pagal gamintojo instrukciją ir vadovaujantis Elektros įrenginių įrengimo bendrosiomis taisyklėmis, patvirtintomis <a href="https://www.e-tar.lt/portal/lt/legalAct/TAR.6AF8895BD875/asr" className="text-blue-600 underline">Lietuvos Respublikos energetikos ministro 2012 m. vasario 3 d. įsakymu Nr. 1-22</a> reikalavimais.</li>
              {hasDynamicPowerController && (
                <li>Elektromobilio įkrovimo stotelės įrengimo metu stotelės galia buvo apribota iki 11kW.</li>
              )}
              <li>Vykdytojas perduoda Užsakovui darbus, o Užsakovas šiuos darbus priima. Užsakovas neturi Vykdytojui pretenzijų dėl atliktų darbų kokybės.</li>
              <li>Šis aktas sudarytas dviem egzemplioriais, kurie abu turi vienodą teisinę galią. Vienas pateikiamas Užsakovui, kitas lieka Vykdytojui.</li>
              <li>Jei Užsakovas be motyvuotos pretenzijos ilgiau kaip penkias darbo dienas nepasirašo šio akto, tuomet prekės ir darbai laikomi perduotais Užsakovui vienašališkai be Užsakovo pastabų.</li>
            </ol>
            
            <table className="w-full border-collapse border border-gray-800 mt-8">
              <tr>
                <td className="border border-gray-800 p-3 w-1/2"><strong>Vykdytojas:</strong></td>
                <td className="border border-gray-800 p-3 w-1/2"><strong>Užsakovas:</strong></td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3">
                  <br/><br/>
                  ________________<br/>
                  Parašas
                </td>
                <td className="border border-gray-800 p-3">
                  <br/><br/>
                  ________________<br/>
                  Parašas
                </td>
              </tr>
              <tr>
                <td className="border border-gray-800 p-3">
                  <br/>
                  ___<span className="text-blue-600 underline">{formData.project_manager_name}</span>___<br/>
                  Vardas, pavardė
                </td>
                <td className="border border-gray-800 p-3">
                  <br/>
                  ___<span className="text-blue-600 underline">{formData.client_name}</span>___<br/>
                  Vardas, pavardė
                </td>
              </tr>
            </table>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-3 mt-6 p-4 bg-gray-50 border-t">
        <Button variant="secondary" onClick={onClose}>
          Uždaryti
        </Button>
        <Button variant="primary" onClick={() => { onExport(); onClose(); }}>
          Atsisiųsti dokumentą
        </Button>
      </div>
    </Modal>
  );
}
