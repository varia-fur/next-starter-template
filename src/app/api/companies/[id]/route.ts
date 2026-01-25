import { NextRequest, NextResponse } from 'next/server';
import { localDB } from '@/lib/local-ticket-db';

const isDev = process.env.NODE_ENV === 'development';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (isDev) {
      const success = localDB.deleteCompany(id);
      if (!success) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('❌ API /companies/[id] DELETE - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { action: string };
    const { action } = body;

    if (action === 'regenerate-key') {
      if (isDev) {
        const result = localDB.regenerateCompanyKey(id);
        if (typeof result === 'string') {
          return NextResponse.json(
            { error: result },
            { status: 404 }
          );
        }
        return NextResponse.json(result, { status: 200 });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );

      const result = await response.json();
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ API /companies/[id] POST - Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
