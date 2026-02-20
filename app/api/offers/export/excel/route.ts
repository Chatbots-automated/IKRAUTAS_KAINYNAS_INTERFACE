import { NextResponse } from 'next/server';
import { generateOfferExcel } from '@/lib/exports/excel-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { offer, categories, totals } = body;

    // Generate Excel
    const excelBuffer = await generateOfferExcel(offer, categories, totals);

    // Return as file
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="SAMATA_${offer.offer_no}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko sugeneruoti Excel',
      error: String(error),
    }, { status: 500 });
  }
}
