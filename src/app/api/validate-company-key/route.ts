import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { companyName: string; apiKey: string };
    const { companyName, apiKey } = body;

    if (!companyName || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, apiKey' },
        { status: 400 }
      );
    }

    if (isDev) {
      const isValid = localDB.validateCompanyKey(companyName, apiKey);
      return NextResponse.json(
        { valid: isValid },
        { status: 200 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate-company-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, apiKey }),
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('❌ API /validate-company-key - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
