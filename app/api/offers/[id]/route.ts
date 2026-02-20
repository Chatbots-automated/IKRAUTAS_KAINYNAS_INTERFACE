import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { data: offer, error: offerError } = await supabaseServer
      .from('offers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (offerError) throw offerError;

    const { data: items, error: itemsError } = await supabaseServer
      .from('offer_items')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('offer_id', params.id)
      .order('sort_order', { ascending: true });

    if (itemsError) throw itemsError;

    return NextResponse.json({
      ok: true,
      data: {
        ...offer,
        items: items || [],
      },
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to fetch offer',
      error: String(error),
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const {
      formData,
      items,
      discountPercent,
      ignitisDiscountEur,
      applyDiscountAfterVat,
    } = body;

    // Update offer
    const { error: offerError } = await supabaseServer
      .from('offers')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (offerError) throw offerError;

    // Delete existing items
    const { error: deleteError } = await supabaseServer
      .from('offer_items')
      .delete()
      .eq('offer_id', params.id);

    if (deleteError) throw deleteError;

    // Insert new items
    if (items && items.length > 0) {
      const offerItemsToInsert = items.map((item: any) => ({
        offer_id: params.id,
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

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({
      ok: true,
      message: 'Pasiūlymas atnaujintas sėkmingai',
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko atnaujinti pasiūlymo',
      error: String(error),
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { error } = await supabaseServer
      .from('offers')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: 'Pasiūlymas ištrintas sėkmingai',
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko ištrinti pasiūlymo',
      error: String(error),
    }, { status: 500 });
  }
}
