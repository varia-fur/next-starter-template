import { NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

export async function GET() {
  const stats = localDB.getStats();
  
  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === 'development',
    stats: stats,
    timestamp: new Date().toISOString(),
  });
}
