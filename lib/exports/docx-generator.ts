import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  TextRun,
  HeadingLevel,
  VerticalAlign,
  ExternalHyperlink,
  ImageRun
} from 'docx';
import { OfferWithItems } from '../types';
import { formatCurrency, groupItemsByCategory } from '../utils/calculations';
import * as fs from 'fs';
import * as path from 'path';

function hasDynamicPowerController(offer: OfferWithItems): boolean {
  return offer.items.some(item => 
    item.name.toLowerCase().includes('dinaminio galios valdiklio') ||
    item.name.toLowerCase().includes('dgv') ||
    item.name.toLowerCase().includes('power controller')
  );
}

export async function generateOfferDOCX(
  offer: OfferWithItems,
  categories: any[],
  totals: any,
  documentType: 'contract' | 'pp-act'
): Promise<Blob> {
  const sections = [];
  const currentDate = new Date().toLocaleDateString('lt-LT');
  
  // Load logo
  const logoPath = path.join(process.cwd(), 'public', 'ikrautas-logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  
  if (documentType === 'contract') {
    // CONTRACT DOCUMENT
    sections.push(
      // Logo
      new Paragraph({
        children: [
          new ImageRun({
            data: logoBuffer as any,
            transformation: {
              width: 186,
              height: 63,
            },
            type: 'png',
          } as any),
        ],
        spacing: { after: 200 },
      }),
      // Company header
      new Paragraph({
        children: [new TextRun({ text: 'Ozo g. 1, Vilnius', size: 20 })],
        spacing: { after: 0 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'UAB Įkrautas', bold: true, size: 20 })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ 
          text: `Elektromobilių įkrovimo stotelių pardavimo ir įrengimo sutartis Nr. ${offer.offer_no}, Data: ${currentDate}`, 
          bold: true,
          size: 20
        })],
        spacing: { after: 200 },
      }),
      
      // Client info
      new Paragraph({
        children: [
          new TextRun({ text: 'Klientas: ', bold: true, size: 16 }),
          new TextRun({ text: `${offer.client_name}`, size: 16 }),
          new TextRun({ text: offer.client_birth_date ? `, ${offer.client_birth_date}` : '', size: 16 }),
          new TextRun({ text: offer.client_email ? `, ${offer.client_email}` : '', size: 16 }),
          new TextRun({ text: offer.client_phone ? `, ${offer.client_phone}` : '', size: 16 }),
          new TextRun({ text: offer.client_address ? `, ${offer.client_address}` : '', size: 16 }),
        ],
        spacing: { after: 100 },
      }),
      
      // Contractor info
      new Paragraph({
        children: [
          new TextRun({ text: 'Rangovas: ', bold: true, size: 16 }),
          new TextRun({ text: 'UAB Įkrautas', bold: true, size: 16 }),
          new TextRun({ text: ', 305604922, LT100013332910, Ozo g. 3, LT-08200 Vilnius, el. paštas: info@ikrautas.lt, +37064700009, Banko A/S LT687044090100753403, SEB Bankas', size: 16 }),
        ],
        spacing: { after: 400 },
      })
    );
    
    // Section 1: Products table
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: '1. Elektromobilių įkrovimo stotelės (-ių) montavimas ir rangos darbų sąmata:', bold: true, size: 16 })],
        numbering: { reference: 'main-numbering', level: 0 },
        spacing: { before: 200, after: 200 },
      })
    );
    
    // Products table
    const groupedItems = groupItemsByCategory(offer.items, categories);
    const tableRows: TableRow[] = [];
    
    // Header row
    tableRows.push(
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Pavadinimas', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Kiekis', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Vnt. kaina (EUR)', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Suma (EUR)', bold: true })], alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );
    
    // Data rows
    groupedItems.forEach((group) => {
      // Category header
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: group.category.name, bold: true })], alignment: AlignmentType.LEFT })],
              columnSpan: 4,
              shading: { fill: 'E0E0E0' },
            }),
          ],
        })
      );
      
      // Items
      group.items.forEach((item) => {
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: item.name, alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: item.hide_qty ? '-' : item.quantity.toString(), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: formatCurrency(item.unit_price), alignment: AlignmentType.RIGHT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: formatCurrency(item.unit_price * item.quantity), alignment: AlignmentType.RIGHT })],
              }),
            ],
          })
        );
      });
    });
    
    const itemsTable = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(itemsTable);
    
    // Section 2: Payment terms
    const advancePayment = totals.finalTotal * 0.5;
    const finalPayment = totals.finalTotal * 0.5;
    
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: `2. Atsiskaitymo tvarka: `, bold: true, size: 16 })],
        numbering: { reference: 'main-numbering', level: 0 },
        spacing: { before: 400, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Už perduotas Prekes ir atliktus Darbus Klientas Rangovui įsipareigoja sumokėti Kainą, lygią `, size: 16 }),
          new TextRun({ text: formatCurrency(totals.finalTotal), bold: true, size: 16 }),
          new TextRun({ text: ' EUR (su PVM).', size: 16 }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `50% Kainos, t.y. `, size: 16 }),
          new TextRun({ text: formatCurrency(advancePayment), bold: true, size: 16 }),
          new TextRun({ text: ' EUR, per 5 kalendorines dienas nuo Sutarties pasirašymo dienos (avansinis mokėjimas). ', size: 16 }),
          new TextRun({ text: 'Atliekant avansinį mokėjimą būtina nurodyti mokėjimo numerį: ', bold: true, size: 16 }),
          new TextRun({ text: offer.payment_reference || 'N/A', bold: true, color: '0070C0', size: 16 }),
        ],
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `50% Kainos, t.y. `, size: 16 }),
          new TextRun({ text: formatCurrency(finalPayment), bold: true, size: 16 }),
          new TextRun({ text: ' EUR, sumokama per 7 kalendorines dienas nuo Rangovo Atliktų darbų priėmimo - perdavimo akto pasirašymo datos (pagal Rangovo išrašytą PVM sąskaitą-faktūrą).', size: 16 }),
        ],
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 200 },
      })
    );
    
    // Section 3: Work terms and warranty
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: '3. Darbų atlikimo terminai ir kita svarbi informacija:', bold: true, size: 16 })],
        numbering: { reference: 'main-numbering', level: 0 },
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Garantija (išimtys sutarties bendrojoje dalyje 8.6. punkte)', bold: true, size: 16 })],
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 50 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Stotelei – `, size: 16 }),
          new TextRun({ text: `${offer.warranty_years || 5}`, bold: true, color: '0070C0', size: 16 }),
          new TextRun({ text: ' metų;', size: 16 }),
        ],
        numbering: { reference: 'sub-sub-numbering', level: 2 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Atliktiems darbams – 2 metai;', size: 16 })],
        numbering: { reference: 'sub-sub-numbering', level: 2 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Sumontuotoms medžiagom – 2 metai;', size: 16 })],
        numbering: { reference: 'sub-sub-numbering', level: 2 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'Rangovas įsipareigoja atlikti Elektromobilių įkrovimo stotelės (toliau – Stotelė) įrengimo darbus per 8 savaites nuo Sutarties įsigaliojimo dienos.',
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Prekės pristatomos ir Darbai atliekami Statybos aikštelėje, esančioje: ', size: 16 }),
          new TextRun({ text: offer.client_address || 'N/A', color: '0070C0', size: 16 }),
        ],
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 200 },
      })
    );
    
    // Section 4: Terms and conditions
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: '4. Sutarties sąlygos: ', bold: true, size: 16 })],
        numbering: { reference: 'main-numbering', level: 0 },
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Sutarties bendrąsias sąlygas rasite paspaudę ant šios nuorodos: ', size: 16 }),
          new ExternalHyperlink({
            children: [new TextRun({ text: 'NUORODA', color: '0000FF', underline: {}, size: 16 })],
            link: 'https://ikrautas.lt/wp-content/uploads/2024/09/Ikrovimo-irangos-pardavimo-ir-irengimo-salygos_Bendroji-dalis.pdf',
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'Šalys pasirašydamos sutinka su sutarties sąlygomis ir duomenų tvarkymu;',
        numbering: { reference: 'sub-numbering', level: 1 },
        spacing: { after: 400 },
      })
    );
    
    // Signature section
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'Sutarties Šalys', bold: true, size: 20 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
      })
    );
    
    const signatureTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Klientas', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Rangovas', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: offer.client_name })],
            }),
            new TableCell({
              children: [new Paragraph({ text: 'UAB „Įkrautas"' })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: '' })],
            }),
            new TableCell({
              children: [new Paragraph({ text: `Projektų vadovas ${offer.project_manager_name}` })],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '___________________' }),
                new Paragraph({ text: '(parašas)' }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '___________________' }),
                new Paragraph({ text: '(parašas)' }),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(signatureTable);
    
  } else {
    // PP ACT DOCUMENT
    const hasDynamic = hasDynamicPowerController(offer);
    
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: 'MONTAVIMO/ĮRENGIMO DARBŲ PERDAVIMO-PRIĖMIMO AKTAS', bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: currentDate, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
    
    // Party info table
    const partyTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Užsakovas (paslaugų rezultatus priima):', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Vykdytojas (paslaugų rezultatus perduoda):', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: offer.client_name, color: '4C94D8' })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: 'UAB „Įkrautas" pardavimų vadovas' }),
                new Paragraph({ children: [new TextRun({ text: offer.project_manager_name, color: '4C94D8' })] }),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(partyTable);
    
    // Products table
    const groupedItems = groupItemsByCategory(offer.items, categories);
    const ppTableRows: TableRow[] = [];
    
    // Header row
    ppTableRows.push(
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Pavadinimas', bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
            width: { size: 40, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Kiekis', bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Vnt. kaina (EUR)', bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: 'Suma (EUR)', bold: true, size: 16 })], alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE },
          }),
        ],
      })
    );
    
    // Data rows
    groupedItems.forEach((group) => {
      ppTableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: group.category.name, bold: true })], alignment: AlignmentType.LEFT })],
              columnSpan: 4,
              shading: { fill: 'E0E0E0' },
            }),
          ],
        })
      );
      
      group.items.forEach((item) => {
        ppTableRows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: item.name, alignment: AlignmentType.LEFT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: item.hide_qty ? '-' : item.quantity.toString(), alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                children: [new Paragraph({ text: formatCurrency(item.unit_price), alignment: AlignmentType.RIGHT })],
              }),
              new TableCell({
                children: [new Paragraph({ text: formatCurrency(item.unit_price * item.quantity), alignment: AlignmentType.RIGHT })],
              }),
            ],
          })
        );
      });
    });
    
    sections.push(
      new Paragraph({ text: '', spacing: { before: 400 } }),
      new Table({
        rows: ppTableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
    
    // Service address
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Paslaugų suteikimo adresas: ', bold: true }),
          new TextRun({ text: offer.client_address || 'N/A', italics: true, color: '4C94D8' }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );
    
    // Content based on dynamic power controller
    if (hasDynamic) {
      sections.push(
        new Paragraph({
          text: 'Įrengta elektromobilių įkrovimo stotelė su prieiga (-omis) ir įsigytais priedais ar papildoma įranga (įskaitant dinaminio galios (apkrovos) valdymo skaitiklį) užtikrina dinaminio galios valdymo funkcijos veikimą',
          spacing: { after: 200 },
        })
      );
    }
    
    // Standard clauses
    sections.push(
      new Paragraph({
        children: [
          new TextRun({ text: hasDynamic ? 'Vykdytojas patvirtina' : 'Įrengta elektromobilių įkrovimo stotelė su prieiga (-omis).' }),
        ],
        numbering: { reference: 'clauses-numbering', level: 0 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Vykdytojas patvirtina, kad elektromobilių įkrovimo stotelė su prieiga (-omis) įrengta pagal gamintojo instrukciją ir vadovaujantis Elektros įrenginių įrengimo bendrosiomis taisyklėmis, patvirtintomis ' }),
          new ExternalHyperlink({
            children: [new TextRun({ text: 'Lietuvos Respublikos energetikos ministro 2012 m. vasario 3 d. įsakymu Nr. 1-22', color: '0000FF', underline: {} })],
            link: 'https://www.e-tar.lt/portal/lt/legalAct/TAR.6AF8895BD875/asr',
          }),
          new TextRun({ text: ' reikalavimais.' }),
        ],
        numbering: { reference: 'clauses-numbering', level: 0 },
        spacing: { after: 100 },
      })
    );
    
    if (hasDynamic) {
      sections.push(
        new Paragraph({
          text: 'Elektromobilio įkrovimo stotelės įrengimo metu stotelės galia buvo apribota iki 11kW.',
          numbering: { reference: 'clauses-numbering', level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    
    sections.push(
      new Paragraph({
        text: 'Vykdytojas perduoda Užsakovui darbus, o Užsakovas šiuos darbus priima. Užsakovas neturi Vykdytojui pretenzijų dėl atliktų darbų kokybės.',
        numbering: { reference: 'clauses-numbering', level: 0 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'Šis aktas sudarytas dviem egzemplioriais, kurie abu turi vienodą teisinę galią. Vienas pateikiamas Užsakovui, kitas lieka Vykdytojui.',
        numbering: { reference: 'clauses-numbering', level: 0 },
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: 'Jei Užsakovas be motyvuotos pretenzijos ilgiau kaip penkias darbo dienas nepasirašo šio akto, tuomet prekės ir darbai laikomi perduotais Užsakovui vienašališkai be Užsakovo pastabų.',
        numbering: { reference: 'clauses-numbering', level: 0 },
        spacing: { after: 400 },
      })
    );
    
    // Final signature table
    const ppSignatureTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Vykdytojas:', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Užsakovas:', bold: true })], alignment: AlignmentType.LEFT })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '________________' }),
                new Paragraph({ text: 'Parašas' }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '________________' }),
                new Paragraph({ text: 'Parašas' }),
              ],
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '___' }),
                    new TextRun({ text: offer.project_manager_name, underline: {}, color: '4C94D8' }),
                    new TextRun({ text: '___' }),
                  ],
                }),
                new Paragraph({ text: 'Vardas, pavardė' }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({ text: '' }),
                new Paragraph({
                  children: [
                    new TextRun({ text: '___' }),
                    new TextRun({ text: offer.client_name, underline: {}, color: '4C94D8' }),
                    new TextRun({ text: '___' }),
                  ],
                }),
                new Paragraph({ text: 'Vardas, pavardė' }),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(ppSignatureTable);
  }
  
  // Create document
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'main-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
        {
          reference: 'sub-numbering',
          levels: [
            {
              level: 1,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 1440, hanging: 360 },
                },
              },
            },
          ],
        },
        {
          reference: 'sub-sub-numbering',
          levels: [
            {
              level: 2,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 2160, hanging: 360 },
                },
              },
            },
          ],
        },
        {
          reference: 'clauses-numbering',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
  
  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
}
