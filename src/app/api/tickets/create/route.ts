import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { ticketType: string };
    const { ticketType } = body;

    if (!ticketType) {
      return NextResponse.json(
        { error: 'Missing required field: ticketType' },
        { status: 400 }
      );
    }

    // Use local DB in development, Durable Objects in production
    if (isDev) {
      console.log('📝 API /create - Creating ticket with type:', ticketType);
      const ticket = localDB.createTicket(ticketType);
      console.log('📝 API /create - Ticket created, returning:', ticket);
      return NextResponse.json(ticket, { status: 201 });
    }

    // This will call the Durable Object
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/create-ticket`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketType }),
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
