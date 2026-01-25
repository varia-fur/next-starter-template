import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    const qrCode = request.nextUrl.searchParams.get('qrCode');

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Missing required parameter: qrCode' },
        { status: 400 }
      );
    }

    // Use local DB in development, Durable Objects in production
    if (isDev) {
      const result = localDB.checkTicket(qrCode);
      if (typeof result === 'string') {
        return NextResponse.json({ error: result }, { status: 404 });
      }
      return NextResponse.json(result, { status: 200 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/check-ticket?qrCode=${encodeURIComponent(qrCode)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
