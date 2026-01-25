import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    // Use local DB in development, Durable Objects in production
    if (isDev) {
      const tickets = localDB.listTickets();
      return NextResponse.json(tickets, { status: 200 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/list-tickets`,
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
