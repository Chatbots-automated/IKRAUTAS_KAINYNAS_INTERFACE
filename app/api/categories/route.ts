import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({
      ok: false,
      message: 'Failed to fetch categories',
      error: String(error),
    }, { status: 500 });
  }
}
