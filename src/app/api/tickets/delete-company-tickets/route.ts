import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { companyName: string };
    const { companyName } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Missing required field: companyName' },
        { status: 400 }
      );
    }

    console.log('📊 API /delete-company-tickets - Deleting tickets for company:', companyName);

    // Use local DB in development, Durable Objects in production
    if (isDev) {
      const result = localDB.deleteTicketsByCompany(companyName);
      console.log(`📊 API /delete-company-tickets - Deleted ${result.count} tickets`);
      return NextResponse.json(result, { status: 200 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/delete-company-tickets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName }),
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('❌ API /delete-company-tickets - Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
