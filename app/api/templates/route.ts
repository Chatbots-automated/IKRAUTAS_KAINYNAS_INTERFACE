import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET all templates
export async function GET() {
  try {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST create new template
export async function POST(request: Request) {
  try {
    const supabase = supabaseServer;
    const body = await request.json();

    const { data, error } = await supabase
      .from('templates')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
