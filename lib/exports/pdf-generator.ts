import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OfferWithItems } from '../types';
import { formatCurrency, groupItemsByCategory } from '../utils/calculations';

export async function generateOfferPDF(
  offer: OfferWithItems,
  categories: any[],
  totals: any
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Company header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('UAB ĮKRAUTAS', 14, yPosition);
  yPosition += 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ozo g. 3-5', 14, yPosition);
  doc.text('Ats.sąskaita: LT687044090100753403', pageWidth / 2, yPosition);
  yPosition += 4;
  
  doc.text('LT-08200 Vilnius', 14, yPosition);
  doc.text('SEB Bankas AB', pageWidth / 2, yPosition);
  yPosition += 4;
  
  doc.text('Įmonės kodas: 305604922', 14, yPosition);
  doc.text('el. paštas: info@ikrautas.lt', pageWidth / 2, yPosition);
  yPosition += 4;
  
  doc.text('PVM mok.kodas: LT100013332910', 14, yPosition);
  doc.text('Tel.: +37064700009', pageWidth / 2, yPosition);
  yPosition += 10;

  // Offer number and dates
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Pasiūlymas Nr.: ${offer.offer_no}`, 14, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString('lt-LT');
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  
  doc.text(`PIRKĖJAS: ${offer.client_name}`, 14, yPosition);
  doc.text(`Data: ${currentDate}`, pageWidth / 2, yPosition);
  yPosition += 6;
  
  doc.text(`PROJEKTAS: ${offer.client_address || 'N/A'}`, 14, yPosition);
  doc.text(`Pasiūlymas galioja iki: ${validUntil.toLocaleDateString('lt-LT')}`, pageWidth / 2, yPosition);
  yPosition += 6;
  
  doc.text(`Pasiūlymą paruošė: ${offer.project_manager_name}`, 14, yPosition);
  yPosition += 6;
  
  // Client details (right side)
  doc.setFontSize(9);
  const rightX = pageWidth / 2 + 20;
  let rightY = yPosition - 18;
  doc.text(`Projektų vadovas: ${offer.project_manager_name}`, rightX, rightY);
  rightY += 4;
  doc.text(`Vykdytojas: ${offer.project_manager_name}`, rightX, rightY);
  rightY += 4;
  doc.text(`Kliento el. paštas: ${offer.client_email || 'N/A'}`, rightX, rightY);
  rightY += 4;
  doc.text(`Mokėjimo nr.: ${offer.payment_reference || 'N/A'}`, rightX, rightY);
  rightY += 4;
  doc.text(`Kliento tel. nr.: ${offer.client_phone || 'N/A'}`, rightX, rightY);
  rightY += 4;
  doc.text(`Kliento gimimo data: ${offer.client_birth_date || 'N/A'}`, rightX, rightY);
  
  if (offer.notes) {
    yPosition += 4;
    doc.text(`Pastabos: ${offer.notes}`, 14, yPosition);
  }
  
  yPosition += 12;

  // Products table
  const groupedItems = groupItemsByCategory(offer.items, categories);
  const tableData: any[] = [];
  
  let itemNumber = 1;
  
  groupedItems.forEach((group) => {
    // Category header row
    tableData.push([
      { content: group.category.name, colSpan: 7, styles: { fillColor: [230, 230, 230], fontStyle: 'bold', fontSize: 9 } }
    ]);
    
    // Items
    group.items.forEach((item) => {
      const lineTotal = item.unit_price * item.quantity;
      const lineTotalWithVat = lineTotal * (1 + item.vat_rate);
      
      tableData.push([
        itemNumber++,
        item.product_id || 'Custom',
        item.name,
        formatCurrency(item.unit_price),
        item.hide_qty ? '-' : item.quantity.toString(),
        formatCurrency(lineTotal),
        formatCurrency(lineTotalWithVat),
      ]);
    });
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Eil. Nr.', 'Kodas', 'Aprašymas', 'Kaina, EUR', 'Kiekis, vnt.', 'Suma, EUR\n(be PVM)', 'Suma, EUR\n(su PVM)']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 25, halign: 'left' },
      2: { cellWidth: 65, halign: 'left' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 28, halign: 'right' },
      6: { cellWidth: 28, halign: 'right' },
    },
    theme: 'grid',
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Puslapis ${doc.getCurrentPageInfo().pageNumber}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    },
  });

  // Totals
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const rightAlign = pageWidth - 14;
  
  doc.text(`EUR be PVM:`, rightAlign - 40, yPosition);
  doc.text(formatCurrency(totals.subtotal), rightAlign, yPosition, { align: 'right' });
  yPosition += 6;
  
  doc.text(`PVM 21%:`, rightAlign - 40, yPosition);
  doc.text(formatCurrency(totals.vat), rightAlign, yPosition, { align: 'right' });
  yPosition += 6;
  
  doc.setFont('helvetica', 'bold');
  doc.text(`EUR su PVM:`, rightAlign - 40, yPosition);
  doc.text(formatCurrency(totals.total), rightAlign, yPosition, { align: 'right' });
  yPosition += 8;
  
  // Discounts
  if (totals.discountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Nuolaida (${offer.discount_percent}%):`, rightAlign - 40, yPosition);
    doc.text(`-${formatCurrency(totals.discountAmount)}`, rightAlign, yPosition, { align: 'right' });
    yPosition += 6;
  }
  
  if (totals.ignitisDiscountAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text(`Ignitis nuolaida:`, rightAlign - 40, yPosition);
    doc.text(`-${formatCurrency(totals.ignitisDiscountAmount)}`, rightAlign, yPosition, { align: 'right' });
    yPosition += 6;
  }
  
  // Final total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  yPosition += 4;
  doc.text(`GALUTINĖ SUMA:`, rightAlign - 45, yPosition);
  doc.text(formatCurrency(totals.finalTotal), rightAlign, yPosition, { align: 'right' });

  // Footer notes
  yPosition += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('(+pasirinktos stotelės ar įrangos kaina)', rightAlign, yPosition, { align: 'right' });

  // Generate blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
