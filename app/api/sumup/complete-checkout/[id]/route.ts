import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { OrderStatus, PaymentFailureCategory } from "@/lib/supabase";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export const dynamic = 'force-dynamic';

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const categorizeFailure = (errorCode: string): PaymentFailureCategory => {
  const errorMap: Record<string, PaymentFailureCategory> = {
    'card_declined': 'card_declined',
    'insufficient_funds': 'insufficient_funds',
    'expired_card': 'card_expired',
    'invalid_card': 'invalid_card',
    '3ds_failed': '3ds_failed',
    '3ds_timeout': '3ds_timeout',
    'processing_error': 'processing_error',
    'network_error': 'network_error',
    'fraud_suspected': 'fraud_suspected'
  };
  return errorMap[errorCode] || 'other';
};

const normalizeStatus = (status: string | undefined): OrderStatus => {
  if (!status) return 'pending';
  const normalized = status.toLowerCase();
  
  const statusMap: Record<string, OrderStatus> = {
    'paid': 'paid',
    'failed': 'failed',
    'pending': 'pending',
    '3ds_required': '3ds_required',
    '3ds_completed': '3ds_completed',
    '3ds_failed': '3ds_failed'
  };
  
  return statusMap[normalized] || 'pending';
};

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const checkoutId = params.id;
    const { payment_type, card } = body;
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
    
    const parser = new UAParser(userAgent);
    const deviceInfo = JSON.stringify({
      device: parser.getDevice(),
      os: parser.getOS(),
      browser: parser.getBrowser()
    });

    if (!checkoutId) {
      return NextResponse.json(
        { error: "Checkout ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${SUMUP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_type,
          card,
          redirect_url: `${SITE_URL}/api/sumup/complete-checkout/${checkoutId}/redirect`,
        }),
      }
    );

    const result = await response.json();
    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      console.error("SumUp API error:", result);
      
      const failureCategory = categorizeFailure(result?.error_code);
      
      // Create payment attempt record
      await supabase.from('payment_attempts').insert({
        order_id: checkoutId,
        status: 'failed',
        payment_method: payment_type,
        error_message: result?.message,
        error_code: result?.error_code,
        failure_category: failureCategory,
        is_3ds_required: false,
        processing_time: processingTime,
        ip_address: ip,
        device_info: deviceInfo,
        created_at: new Date().toISOString()
      });
      
      // Get current payment attempts count
      const { data: order } = await supabase
        .from('orders')
        .select('payment_attempts')
        .eq('sumup_checkout_id', checkoutId)
        .single();

      // Update order with incremented attempts
      await supabase
        .from('orders')
        .update({
          status: 'failed' as OrderStatus,
          error_message: result?.message || 'Payment processing failed',
          error_code: result?.error_code,
          failure_category: failureCategory,
          payment_attempts: (order?.payment_attempts || 0) + 1,
          last_attempt_date: new Date().toISOString(),
          processing_time: processingTime,
          ip_address: ip,
          device_info: deviceInfo,
          updated_at: new Date().toISOString()
        })
        .eq('sumup_checkout_id', checkoutId);
        
      return NextResponse.json(
        { error: "Failed to complete checkout", details: result },
        { status: response.status }
      );
    }

    const status = normalizeStatus(result.status);
    const is3DSRequired = status === '3ds_required';

    // Get current payment attempts
    const { data: order } = await supabase
      .from('orders')
      .select('payment_attempts')
      .eq('sumup_checkout_id', checkoutId)
      .single();

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      payment_attempts: (order?.payment_attempts || 0) + 1,
      last_attempt_date: new Date().toISOString(),
      processing_time: processingTime,
      ip_address: ip,
      device_info: deviceInfo,
      is_3ds_required: is3DSRequired
    };

    if (status === "paid") {
      const transaction = result.transactions?.[0];
      if (transaction) {
        Object.assign(updateData, {
          transaction_code: result.transaction_code,
          transaction_id: result.transaction_id,
          payment_date: result.date,
          payment_type: transaction.payment_type || payment_type,
          payment_method: transaction.payment_method,
          card_last4: transaction.card?.last4,
          card_brand: transaction.card?.brand,
          is_3ds_successful: true
        });
      }
    } else if (status === "failed") {
      const failureCategory = categorizeFailure(result.error_code);
      Object.assign(updateData, {
        error_message: result.error_message || 'Payment failed',
        error_code: result.error_code,
        failure_category: failureCategory,
        is_3ds_successful: false
      });
    }

    // Create payment attempt record
    await supabase.from('payment_attempts').insert({
      order_id: checkoutId,
      status: status === 'paid' ? 'success' : status === 'failed' ? 'failed' : 'pending',
      payment_method: payment_type,
      error_message: result.error_message,
      error_code: result.error_code,
      failure_category: status === 'failed' ? categorizeFailure(result.error_code) : undefined,
      is_3ds_required: is3DSRequired,
      processing_time: processingTime,
      ip_address: ip,
      device_info: deviceInfo,
      created_at: new Date().toISOString()
    });

    const { error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('sumup_checkout_id', checkoutId);

    if (orderError) {
      console.error("Error updating order data:", orderError);
    }

    if (result.next_step) {
      return NextResponse.json({
        status: updateData.status,
        next_step: result.next_step
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error completing checkout:", error);
    return NextResponse.json(
      { error: "Failed to complete checkout", message: (error as Error).message },
      { status: 500 }
    );
  }
}