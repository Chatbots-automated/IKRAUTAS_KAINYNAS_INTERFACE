import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';

export async function POST() {
  try {
    const result = await seedDatabase();
    
    if (result.success) {
      return NextResponse.json({
        ok: true,
        message: 'Database seeded successfully',
      });
    } else {
      return NextResponse.json({
        ok: false,
        message: 'Failed to seed database',
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: 'Failed to seed database',
      error: String(error),
    }, { status: 500 });
  }
}
