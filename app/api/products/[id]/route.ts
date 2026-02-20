import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();

    const { error } = await supabaseServer
      .from('products')
      .update({
        sku: body.sku,
        name: body.name,
        unit_price: body.unit_price,
        category_id: body.category_id,
        vat_rate: body.vat_rate,
        is_service: body.is_service,
        is_internal_only: body.is_internal_only,
        collapse_into_materials: body.collapse_into_materials,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: 'Produktas atnaujintas sėkmingai',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko atnaujinti produkto',
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
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      message: 'Produktas ištrintas sėkmingai',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko ištrinti produkto',
      error: String(error),
    }, { status: 500 });
  }
}
