import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, recipientEmail, includeAttachments } = body;

    console.log('📧 [EMAIL] Sending offer email...');
    console.log('📧 [EMAIL] Offer ID:', offerId);
    console.log('📧 [EMAIL] Recipient:', recipientEmail);

    // Get offer details
    const { data: offer, error } = await supabaseServer
      .from('offers')
      .select(`
        *,
        offer_items (*)
      `)
      .eq('id', offerId)
      .single();

    if (error || !offer) {
      console.error('❌ [EMAIL] Offer not found:', error);
      return NextResponse.json(
        { ok: false, message: 'Pasiūlymas nerastas' },
        { status: 404 }
      );
    }

    // For demo: simulate email sending
    // In production, integrate with SendGrid, AWS SES, or similar
    const emailData = {
      to: recipientEmail || offer.client_email,
      subject: `Pasiūlymas ${offer.offer_no} - UAB Įkrautas`,
      body: `
Gerb. ${offer.client_name},

Siunčiame jums komercini pasiūlymą saulės elektrinės įrengimui.

Pasiūlymo numeris: ${offer.offer_no}
Projekto vadovas: ${offer.project_manager_name}

Daugiau detalių rasite pridėtuose dokumentuose.

Su pagarba,
UAB Įkrautas komanda
      `.trim(),
      attachments: includeAttachments ? [
        { filename: `Pasiulymas_${offer.offer_no}.xlsx`, type: 'excel' },
        { filename: `Sutartis_${offer.offer_no}.docx`, type: 'docx' },
      ] : [],
    };

    console.log('✅ [EMAIL] Email prepared:', emailData);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update offer status to 'sent'
    await supabaseServer
      .from('offers')
      .update({ 
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', offerId);

    console.log('✅ [EMAIL] Offer status updated to "sent"');
    console.log('✅ [EMAIL] Email sent successfully (simulated)');

    return NextResponse.json({
      ok: true,
      message: 'El. laiškas išsiųstas sėkmingai',
      emailData, // For demo purposes
    });
  } catch (error) {
    console.error('❌ [EMAIL] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Nepavyko išsiųsti el. laiško',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
