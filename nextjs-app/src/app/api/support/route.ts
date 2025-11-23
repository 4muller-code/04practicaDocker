import { NextRequest, NextResponse } from 'next/server';

interface SupportTicketRequest {
  wholesalerId: string;
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export async function POST(request: NextRequest) {
  try {
    const ticketData: SupportTicketRequest = await request.json();

    // Validate input
    if (!ticketData.wholesalerId || !ticketData.subject || !ticketData.message) {
      return NextResponse.json(
        { error: 'Wholesaler ID, subject, and message are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database insertion
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Insert into TICKET_SOPORTE table with status='NUEVO'
    // TODO: Enqueue LLM classification task in RabbitMQ
    // await enqueueTask('CLASIFICAR_TICKET_LLM', {
    //   ticketId,
    //   message: ticketData.message
    // });

    return NextResponse.json({
      success: true,
      ticketId,
      status: 'new',
      message: 'Support ticket created successfully. LLM classification in progress.'
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wholesalerId = searchParams.get('wholesalerId');
  const status = searchParams.get('status');

  // TODO: Implement actual database query
  // For now, return mock support tickets
  const mockTickets = [
    {
      ticketId: 'TICKET-123456789',
      wholesalerId: wholesalerId || 'WHOLESALER001',
      subject: 'Issue with quota allocation',
      message: 'I cannot see my updated quota after purchase',
      status: status || 'new',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      llmClassification: {
        category: 'quota_management',
        priority: 'medium',
        summary: 'Customer experiencing issues with quota visibility after purchase',
        suggestedResponse: 'Check quota allocation system and verify purchase transaction'
      }
    },
    {
      ticketId: 'TICKET-987654321',
      wholesalerId: wholesalerId || 'WHOLESALER001',
      subject: 'Payment processing error',
      message: 'Payment failed during ticket purchase',
      status: status || 'in_progress',
      priority: 'high',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      llmClassification: {
        category: 'payment_issues',
        priority: 'high',
        summary: 'Payment gateway failure during transaction',
        suggestedResponse: 'Check payment gateway status and transaction logs'
      }
    }
  ];

  return NextResponse.json(mockTickets);
}