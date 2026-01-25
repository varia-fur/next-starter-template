import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 API /activations-by-company - isDev:', isDev);
    
    // Use local DB in development, Durable Objects in production
    if (isDev) {
      console.log('📊 API /activations-by-company - Calling localDB.getActivationsByCompany()');
      const result = localDB.getActivationsByCompany();
      console.log('📊 API /activations-by-company - Success, result keys:', Object.keys(result));
      return NextResponse.json(result, { status: 200 });
    }

    // This will call the Durable Object
    console.log('📊 API /activations-by-company - Calling Durable Object at:', process.env.NEXT_PUBLIC_API_URL);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/activations-by-company`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('❌ API /activations-by-company - Caught error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error message:', errorMessage);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : 'Unknown' },
      { status: 500 }
    );
  }
}
