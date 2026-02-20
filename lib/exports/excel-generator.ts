import ExcelJS from 'exceljs';
import { OfferWithItems } from '../types';
import { formatCurrency, groupItemsByCategory } from '../utils/calculations';
import * as fs from 'fs';
import * as path from 'path';

export async function generateOfferExcel(
  offer: OfferWithItems,
  categories: any[],
  totals: any
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('SAMATA', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  // Load and add logo
  const logoPath = path.join(process.cwd(), 'public', 'ikrautas-logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoId = workbook.addImage({
    buffer: logoBuffer as any,
    extension: 'png',
  });
  worksheet.addImage(logoId, {
    tl: { col: 0, row: 0 },
    ext: { width: 128, height: 46 }
  });

  // Company info (starting row 2 to leave space for logo)
  let currentRow = 3;
  
  worksheet.getCell(`A${currentRow}`).value = 'Ozo g. 3-5';
  worksheet.getCell(`D${currentRow}`).value = 'Ats.sąskaita: LT687044090100753403';
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'LT-08200 Vilnius';
  worksheet.getCell(`D${currentRow}`).value = 'SEB Bankas AB';
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'Įmonės kodas: 305604922';
  worksheet.getCell(`D${currentRow}`).value = 'el. paštas: info@ikrautas.lt';
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'PVM mok.kodas: LT100013332910';
  worksheet.getCell(`D${currentRow}`).value = 'Tel.: +37064700009';
  currentRow += 2;

  // Offer details
  worksheet.getCell(`A${currentRow}`).value = 'Pasiūlymas Nr.:';
  worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
  worksheet.getCell(`B${currentRow}`).value = offer.offer_no;
  worksheet.getCell(`B${currentRow}`).font = { bold: true, size: 12 };
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'PIRKĖJAS:';
  worksheet.getCell(`B${currentRow}`).value = offer.client_name;
  worksheet.getCell(`D${currentRow}`).value = 'Data:';
  worksheet.getCell(`E${currentRow}`).value = new Date();
  worksheet.getCell(`E${currentRow}`).numFmt = 'm/d/yyyy';
  
  worksheet.getCell(`J${currentRow}`).value = 'Projektų vadovas:';
  worksheet.getCell(`K${currentRow}`).value = offer.project_manager_name;
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'PROJEKTAS:';
  worksheet.getCell(`B${currentRow}`).value = offer.client_address || '';
  worksheet.getCell(`D${currentRow}`).value = 'Pasiūlymas galioja iki:';
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);
  worksheet.getCell(`E${currentRow}`).value = validUntil;
  worksheet.getCell(`E${currentRow}`).numFmt = 'm/d/yyyy';
  
  worksheet.getCell(`J${currentRow}`).value = 'Vykdytojas:';
  worksheet.getCell(`K${currentRow}`).value = offer.project_manager_name;
  currentRow++;
  
  worksheet.getCell(`A${currentRow}`).value = 'Pasiūlymą paruošė:';
  worksheet.getCell(`B${currentRow}`).value = offer.project_manager_name;
  
  worksheet.getCell(`J${currentRow}`).value = 'Kliento el. paštas:';
  worksheet.getCell(`K${currentRow}`).value = offer.client_email || '';
  worksheet.getCell(`L${currentRow}`).value = 'Mokėjimo nr.:';
  worksheet.getCell(`M${currentRow}`).value = offer.payment_reference || '';
  currentRow++;
  
  worksheet.getCell(`J${currentRow}`).value = 'Kliento tel. nr.:';
  worksheet.getCell(`K${currentRow}`).value = offer.client_phone || '';
  currentRow++;
  
  worksheet.getCell(`J${currentRow}`).value = 'Kliento gimimo data:';
  worksheet.getCell(`K${currentRow}`).value = offer.client_birth_date || '';
  currentRow++;
  
  if (offer.notes) {
    worksheet.getCell(`A${currentRow}`).value = 'Pastabos:';
    worksheet.getCell(`B${currentRow}`).value = offer.notes;
    currentRow++;
  }
  
  currentRow += 2;

  // Products table header
  const headerRow = worksheet.getRow(currentRow);
  const headers = [
    'Eil. Nr.',
    'Kodas',
    'Aprašymas',
    'Kaina, EUR',
    'Kiekis, vnt.',
    'Suma, EUR\n(be PVM)',
    'Suma, EUR\n(su PVM)',
    '', // Empty column
    'Tiekėjo nuolaida',
    'Pirkimo kaina',
    'Kaina po nuolaidos',
    'Suma',
    'Marža',
    '', // Empty
    'Garantinis terminas',
  ];
  
  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = header;
    cell.font = { bold: true, size: 8 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    
    // Purple background for purchase price columns
    if (idx >= 8 && idx <= 12) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF800080' }, // Purple
      };
      cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' } }; // White text
    }
  });
  
  headerRow.height = 39;
  currentRow++;

  // Products data
  const groupedItems = groupItemsByCategory(offer.items, categories);
  let itemNumber = 1;
  
  groupedItems.forEach((group) => {
    // Category header (merged row)
    const categoryRow = worksheet.getRow(currentRow);
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    const categoryCell = categoryRow.getCell(1);
    categoryCell.value = group.category.name;
    categoryCell.font = { bold: true, size: 9 };
    categoryCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }, // Light gray
    };
    categoryCell.alignment = { horizontal: 'left' };
    currentRow++;
    
    // Items
    group.items.forEach((item) => {
      const row = worksheet.getRow(currentRow);
      const lineTotal = item.unit_price * item.quantity;
      const lineTotalWithVat = lineTotal * (1 + item.vat_rate);
      
      // Dummy purchase price calculations (you should add real data to the Product model)
      const supplierDiscount = 0.1; // 10%
      const purchasePrice = item.unit_price * 0.8; // Assuming 20% markup for example
      const priceAfterDiscount = purchasePrice * (1 - supplierDiscount);
      const purchaseTotal = priceAfterDiscount * item.quantity;
      const margin = lineTotal > 0 ? (lineTotal - purchaseTotal) / lineTotal : 0;
      
      row.getCell(1).value = itemNumber++;
      row.getCell(1).alignment = { horizontal: 'center' };
      
      row.getCell(2).value = item.product_id || 'Custom';
      row.getCell(2).alignment = { horizontal: 'left' };
      
      row.getCell(3).value = item.name;
      row.getCell(3).alignment = { horizontal: 'left' };
      
      row.getCell(4).value = item.unit_price;
      row.getCell(4).numFmt = '#,##0.00';
      row.getCell(4).alignment = { horizontal: 'center' };
      
      row.getCell(5).value = item.hide_qty ? '' : item.quantity;
      row.getCell(5).alignment = { horizontal: 'center' };
      
      row.getCell(6).value = lineTotal;
      row.getCell(6).numFmt = '#,##0.00';
      row.getCell(6).alignment = { horizontal: 'center' };
      
      row.getCell(7).value = lineTotalWithVat;
      row.getCell(7).numFmt = '#,##0.00';
      row.getCell(7).alignment = { horizontal: 'center' };
      
      // Purchase price columns (purple background)
      row.getCell(9).value = supplierDiscount;
      row.getCell(9).numFmt = '0.00%';
      row.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800080' } };
      row.getCell(9).font = { color: { argb: 'FFFFFFFF' } };
      
      row.getCell(10).value = purchasePrice;
      row.getCell(10).numFmt = '#,##0.00';
      row.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800080' } };
      row.getCell(10).font = { color: { argb: 'FFFFFFFF' } };
      
      row.getCell(11).value = priceAfterDiscount;
      row.getCell(11).numFmt = '#,##0.00';
      row.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800080' } };
      row.getCell(11).font = { color: { argb: 'FFFFFFFF' } };
      
      row.getCell(12).value = purchaseTotal;
      row.getCell(12).numFmt = '#,##0.00';
      row.getCell(12).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800080' } };
      row.getCell(12).font = { color: { argb: 'FFFFFFFF' } };
      
      row.getCell(13).value = margin;
      row.getCell(13).numFmt = '0.00%';
      row.getCell(13).font = { bold: true };
      row.getCell(13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF800080' } };
      row.getCell(13).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      row.getCell(15).value = `${offer.warranty_years || 5} metų`;
      row.getCell(15).alignment = { horizontal: 'left' };
      
      row.height = 15;
      row.font = { size: 8 };
      currentRow++;
    });
  });
  
  // Totals section
  currentRow += 1;
  const totalsStartRow = currentRow;
  
  worksheet.getCell(`E${currentRow}`).value = 'EUR be PVM:';
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.getCell(`F${currentRow}`).value = totals.subtotal;
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
  worksheet.getCell(`F${currentRow}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  currentRow++;
  
  worksheet.getCell(`E${currentRow}`).value = 'PVM 21%:';
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.getCell(`F${currentRow}`).value = totals.vat;
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
  worksheet.getCell(`F${currentRow}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  currentRow++;
  
  worksheet.getCell(`E${currentRow}`).value = 'EUR su PVM:';
  worksheet.getCell(`E${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.getCell(`E${currentRow}`).font = { bold: true };
  worksheet.getCell(`F${currentRow}`).value = totals.total;
  worksheet.getCell(`F${currentRow}`).numFmt = '#,##0.00';
  worksheet.getCell(`F${currentRow}`).font = { bold: true };
  worksheet.getCell(`F${currentRow}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  currentRow++;
  
  worksheet.getCell(`F${currentRow}`).value = '(+pasirinktos stotelės ar įrangos kaina)';
  worksheet.getCell(`F${currentRow}`).alignment = { horizontal: 'right' };
  worksheet.getCell(`F${currentRow}`).font = { size: 8 };

  // Column widths
  worksheet.getColumn(1).width = 8;  // Eil. Nr.
  worksheet.getColumn(2).width = 12; // Kodas
  worksheet.getColumn(3).width = 40; // Aprašymas
  worksheet.getColumn(4).width = 12; // Kaina
  worksheet.getColumn(5).width = 10; // Kiekis
  worksheet.getColumn(6).width = 15; // Suma be PVM
  worksheet.getColumn(7).width = 15; // Suma su PVM
  worksheet.getColumn(8).width = 3;  // Empty
  worksheet.getColumn(9).width = 12; // Tiekėjo nuolaida
  worksheet.getColumn(10).width = 12; // Pirkimo kaina
  worksheet.getColumn(11).width = 12; // Kaina po nuolaidos
  worksheet.getColumn(12).width = 12; // Suma
  worksheet.getColumn(13).width = 10; // Marža
  worksheet.getColumn(14).width = 3;  // Empty
  worksheet.getColumn(15).width = 15; // Garantinis terminas

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
