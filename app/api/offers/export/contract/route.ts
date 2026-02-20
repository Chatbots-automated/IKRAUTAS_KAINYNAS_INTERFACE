import { NextResponse } from 'next/server';
import { generateOfferDOCX } from '@/lib/exports/docx-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offer, categories, totals } = body;

    // Generate DOCX
    const docxBlob = await generateOfferDOCX(offer, categories, totals, 'contract');
    
    // Convert blob to buffer
    const arrayBuffer = await docxBlob.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

    // Return as file
    return new NextResponse(docxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Sutartis_${offer.offer_no}.docx"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko sugeneruoti sutarties',
      error: String(error),
    }, { status: 500 });
  }
}
