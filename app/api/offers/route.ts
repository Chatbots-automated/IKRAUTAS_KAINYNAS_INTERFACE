import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to fetch offers',
      error: String(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      offerNo,
      formData,
      items,
      discountPercent,
      ignitisDiscountEur,
      applyDiscountAfterVat,
      totals,
    } = body;

    console.log('Creating offer:', {
      offerNo,
      clientName: formData.client_name,
      itemCount: items.length,
    });

    // Insert offer
    const { data: offer, error: offerError } = await supabaseServer
      .from('offers')
      .insert({
        offer_no: offerNo,
        client_name: formData.client_name,
        client_birth_date: formData.client_birth_date || null,
        client_address: formData.client_address,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        project_manager_name: formData.project_manager_name,
        payment_reference: formData.payment_reference || null,
        warranty_years: formData.warranty_years || 5,
        notes: formData.notes,
        discount_percent: discountPercent || null,
        ignitis_discount_eur: ignitisDiscountEur || null,
        apply_discount_after_vat: applyDiscountAfterVat,
        status: 'draft',
      })
      .select()
      .single();

    if (offerError) {
      console.error('Error creating offer:', offerError);
      throw offerError;
    }

    console.log('Offer created:', offer.id);

    // Insert offer items
    if (items && items.length > 0) {
      const offerItemsToInsert = items.map((item: any) => ({
        offer_id: offer.id,
        product_id: item.product_id || null,
        name: item.name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        category_id: item.category_id,
        vat_rate: item.vat_rate,
        hide_qty: item.hide_qty || false,
        is_custom: item.is_custom || false,
        sort_order: item.sort_order,
      }));

      const { error: itemsError } = await supabaseServer
        .from('offer_items')
        .insert(offerItemsToInsert);

      if (itemsError) {
        console.error('Error creating offer items:', itemsError);
        throw itemsError;
      }

      console.log('Offer items created:', offerItemsToInsert.length);
    }

    console.log('Offer saved successfully:', offer.id);

    return NextResponse.json({
      ok: true,
      data: offer,
      message: 'Pasiūlymas sėkmingai išsaugotas',
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko išsaugoti pasiūlymo',
      error: String(error),
    }, { status: 500 });
  }
}
