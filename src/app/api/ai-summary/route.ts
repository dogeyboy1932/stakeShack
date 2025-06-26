import { NextRequest, NextResponse } from 'next/server';
import { generateProfileSummary, generateApartmentSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Missing type or data in request' },
        { status: 400 }
      );
    }

    let summary: string;

    if (type === 'profile') {
      summary = await generateProfileSummary(data);
    } else if (type === 'apartment') {
      summary = await generateApartmentSummary(data);
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "profile" or "apartment"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in AI summary API:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
} 