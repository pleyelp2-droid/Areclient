import { NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET() {
  try {
    const pool = await getDbPool();
    if (!pool) {
      return NextResponse.json({ status: 'disconnected', message: 'Database pool could not be initialized' }, { status: 503 });
    }
    // Check if tables exist, if not, we might want to create them or just return empty
    // For now, let's just try to fetch some stats
    const client = await pool.connect();
    try {
      // Basic check to see if we can connect
      await client.query('SELECT NOW()');
      return NextResponse.json({ status: 'connected' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
