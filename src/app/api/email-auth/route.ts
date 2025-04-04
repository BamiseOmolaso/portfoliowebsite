import { NextResponse } from 'next/server';
import { 
  setupEmailAuthentication, 
  verifyEmailAuthentication, 
  getEmailAuthenticationStatus 
} from '@/lib/resend';

export async function GET() {
  try {
    const status = await getEmailAuthenticationStatus();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Failed to get email authentication status' },
        { status: 500 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in GET /api/email-auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const setup = await setupEmailAuthentication();
    
    if (!setup) {
      return NextResponse.json(
        { error: 'Failed to set up email authentication' },
        { status: 500 }
      );
    }

    return NextResponse.json(setup);
  } catch (error) {
    console.error('Error in POST /api/email-auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  try {
    const verified = await verifyEmailAuthentication();
    
    if (!verified) {
      return NextResponse.json(
        { error: 'Failed to verify email authentication' },
        { status: 500 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error('Error in PUT /api/email-auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 