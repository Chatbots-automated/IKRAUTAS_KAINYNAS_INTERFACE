import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('name', { ascending: true });

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to fetch products',
      error: String(error),
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        sku: body.sku,
        name: body.name,
        unit_price: body.unit_price,
        category_id: body.category_id,
        vat_rate: body.vat_rate,
        is_service: body.is_service,
        is_internal_only: body.is_internal_only,
        collapse_into_materials: body.collapse_into_materials,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data,
      message: 'Produktas sukurtas sėkmingai',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      ok: false,
      message: 'Nepavyko sukurti produkto',
      error: String(error),
    }, { status: 500 });
  }
}
