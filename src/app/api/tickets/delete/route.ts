import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { qrCode: string };
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Missing required field: qrCode' },
        { status: 400 }
      );
    }

    // Use local DB in development, Durable Objects in production
    if (isDev) {
      const result = localDB.deleteTicket(qrCode);
      if (typeof result === 'string') {
        return NextResponse.json({ error: result }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Ticket deleted' }, { status: 200 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/delete-ticket`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
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
