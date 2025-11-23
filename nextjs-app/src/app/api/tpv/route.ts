import { NextRequest, NextResponse } from 'next/server';

interface TPVOrderItem {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
}

interface TPVOrderRequest {
  sessionId: string;
  cashierId: string;
  deviceId: string;
  items: TPVOrderItem[];
  paymentMethod: 'cash' | 'card' | 'transfer';
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: TPVOrderRequest = await request.json();

    // Validate input
    if (!orderData.sessionId || !orderData.cashierId || !orderData.deviceId) {
      return NextResponse.json(
        { error: 'Session ID, cashier ID, and device ID are required' },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Calculate total to verify
    const calculatedTotal = orderData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice), 0
    );

    if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
      return NextResponse.json(
        { error: 'Total amount does not match calculated total' },
        { status: 400 }
      );
    }

    // TODO: Implement actual payment processing
    // For now, simulate successful payment
    const orderId = `TPV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate tickets
    const tickets = orderData.items.flatMap(item =>
      Array.from({ length: item.quantity }, (_, index) => ({
        ticketId: `${orderId}-T${index + 1}`,
        ticketTypeId: item.ticketTypeId,
        qrCode: `${orderId}-${item.ticketTypeId}-${index + 1}`,
        price: item.unitPrice
      }))
    );

    // TODO: Enqueue invoice generation task in RabbitMQ
    // await enqueueTask('GENERAR_FACTURA_VERIFACTU', { orderId });

    return NextResponse.json({
      success: true,
      orderId,
      paymentStatus: 'completed',
      tickets,
      message: 'TPV order processed successfully'
    });

  } catch (error) {
    console.error('Error processing TPV order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  // TODO: Implement actual session validation
  // For now, return mock session data
  const mockSessionData = {
    sessionId,
    cashierId: 'CASH001',
    deviceId: 'DEV001',
    status: 'active',
    openedAt: new Date().toISOString()
  };

  return NextResponse.json(mockSessionData);
}