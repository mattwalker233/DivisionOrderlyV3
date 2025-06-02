import { NextResponse } from 'next/server';
import { testTextractConnection } from '@/lib/textract-test';

export async function GET() {
  try {
    const isConnected = await testTextractConnection();
    
    if (isConnected) {
      return NextResponse.json({ status: 'success', message: 'Textract connection successful' });
    } else {
      return NextResponse.json(
        { status: 'error', message: 'Failed to connect to Textract' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error testing Textract:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Error testing Textract connection',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 