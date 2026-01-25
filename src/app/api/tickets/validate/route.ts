import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { qrCode: string; scannerLocation?: string };
    const { qrCode, scannerLocation } = body;

    if (!qrCode) {
      return NextResponse.json(
        { error: 'Missing required field: qrCode' },
        { status: 400 }
      );
    }

    // Use local DB in development, Durable Objects in production
    if (isDev) {
      console.log('✓ API /validate - Validating:', qrCode);
      const result = localDB.validateTicket(qrCode, scannerLocation);
      if (typeof result === 'string') {
        console.log('✗ Validation failed:', result);
        return NextResponse.json({ valid: false, error: result }, { status: 400 });
      }
      console.log('✓ Validation succeeded for ticket:', result.id);
      return NextResponse.json({ valid: true, ticket: result }, { status: 200 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate-ticket`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode, scannerLocation }),
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
