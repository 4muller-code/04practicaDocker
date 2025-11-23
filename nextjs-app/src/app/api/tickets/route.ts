import { NextRequest, NextResponse } from 'next/server';

// Types for ticket system
interface TicketOrder {
  ticketTypeId: string;
  quantity: number;
  date: string;
  timeSlot: string;
  visitorType: 'adult' | 'child';
}

interface OrderRequest {
  tickets: TicketOrder[];
  customerEmail: string;
  customerName: string;
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderRequest = await request.json();

    // Validate input
    if (!orderData.tickets || orderData.tickets.length === 0) {
      return NextResponse.json(
        { error: 'At least one ticket is required' },
        { status: 400 }
      );
    }

    if (!orderData.customerEmail || !orderData.customerName) {
      return NextResponse.json(
        { error: 'Customer information is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database logic
    // For now, simulate successful order creation
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate QR codes for each ticket
    const ticketsWithQr = orderData.tickets.map((ticket, index) => ({
      ...ticket,
      qrCode: `${orderId}-${index + 1}`,
      ticketId: `${orderId}-T${index + 1}`
    }));

    // TODO: Enqueue invoice generation task in RabbitMQ
    // await enqueueTask('GENERAR_FACTURA_VERIFACTU', { orderId });

    return NextResponse.json({
      success: true,
      orderId,
      tickets: ticketsWithQr,
      message: 'Order created successfully. Tickets generated.'
    });

  } catch (error) {
    console.error('Error creating ticket order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const ticketType = searchParams.get('ticketType');

  // TODO: Implement actual availability check from database
  // For now, return mock availability
  const mockAvailability = {
    date: date || '2024-01-01',
    ticketType: ticketType || 'general',
    availableSlots: [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ],
    availableTickets: 100
  };

  return NextResponse.json(mockAvailability);
}