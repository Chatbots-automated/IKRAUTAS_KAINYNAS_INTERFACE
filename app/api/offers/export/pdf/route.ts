import { NextResponse } from 'next/server';
import { generateOfferPDF } from '@/lib/exports/pdf-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offer, categories, totals } = body;

    // Generate PDF
    const pdfBlob = await generateOfferPDF(offer, categories, totals);
    
    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Return as file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Pasiulymas_${offer.offer_no}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko sugeneruoti PDF',
      error: String(error),
    }, { status: 500 });
  }
}
