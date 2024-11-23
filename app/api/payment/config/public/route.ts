import { NextResponse } from 'next/server';
import { getPaymentConfig } from '@/lib/payment-config';

export async function GET() {
  try {
    const config = await getPaymentConfig();
    
    return NextResponse.json({
      activeGateway: config.activeGateway,
      stripePublishableKey: config.stripePublishableKey,
      isEnabled: config.isEnabled,
      status: config.isEnabled ? 'available' : 'unavailable'
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    console.error('Failed to get payment configuration:', error);
    return NextResponse.json({
      activeGateway: 'sumup',
      stripePublishableKey: null,
      isEnabled: false,
      status: 'error'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60',
      }
    });
  }
}