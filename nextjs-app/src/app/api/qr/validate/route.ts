import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json();

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual QR validation logic
    // For now, simulate validation
    const isValid = qrCode.startsWith('ORD-') || qrCode.startsWith('TPV-');

    if (!isValid) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid QR code format'
      });
    }

    // Mock ticket data
    const mockTicketData = {
      valid: true,
      ticketId: qrCode,
      ticketType: 'General Admission',
      date: '2024-01-01',
      timeSlot: '10:00',
      visitorName: 'John Doe',
      status: 'valid',
      used: false,
      validationTime: new Date().toISOString()
    };

    // TODO: Update ticket status in database
    // TODO: Log validation event

    return NextResponse.json(mockTicketData);

  } catch (error) {
    console.error('Error validating QR code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const qrCode = searchParams.get('qrCode');

  if (!qrCode) {
    return NextResponse.json(
      { error: 'QR code is required' },
      { status: 400 }
    );
  }

  // Mock validation for GET requests
  const isValid = qrCode.startsWith('ORD-') || qrCode.startsWith('TPV-');

  return NextResponse.json({
    valid: isValid,
    qrCode,
    message: isValid ? 'QR code is valid' : 'Invalid QR code'
  });
}