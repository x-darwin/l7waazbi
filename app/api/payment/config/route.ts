import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getPaymentConfig, updatePaymentConfig } from '@/lib/payment-config';

export async function GET(request: NextRequest) {
  try {
    // Add proper headers
    const response = new NextResponse();
    response.headers.set('Content-Type', 'application/json');

    if (!(await verifyAuth(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const config = await getPaymentConfig();
    return NextResponse.json(config, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Failed to get payment configuration:', error);
    return NextResponse.json(
      { error: 'Failed to get payment configuration' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyAuth(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    if (typeof body.isEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid isEnabled value' },
        { status: 400 }
      );
    }

    const updates = {
      isEnabled: body.isEnabled,
      sumupKey: body.sumupKey?.trim() || undefined,
      sumupMerchantEmail: body.sumupMerchantEmail?.trim() || undefined,
    };

    // Only validate credentials if they are being updated
    if (updates.sumupKey !== undefined || updates.sumupMerchantEmail !== undefined) {
      if (!updates.sumupKey || !updates.sumupMerchantEmail) {
        return NextResponse.json(
          { error: 'Both SumUp API key and merchant email are required when updating credentials' },
          { status: 400 }
        );
      }
    }

    const updatedConfig = await updatePaymentConfig(updates);
    
    return new NextResponse(JSON.stringify(updatedConfig), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Failed to update payment configuration:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update payment configuration' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
