import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = 'eur',
      clientData,
      selectedPackage,
      selectedFeatures,
      couponCode
    } = body;

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '';
    
    const parser = new UAParser(userAgent);
    const deviceInfo = JSON.stringify({
      device: parser.getDevice(),
      os: parser.getOS(),
      browser: parser.getBrowser()
    });

    const stripe = await getStripe();

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card'],
      metadata: {
        checkout_reference: `ORDER-${Date.now()}`,
        package: selectedPackage?.name,
        features: selectedFeatures?.join(','),
        coupon: couponCode || '',
        client_email: clientData.email,
        client_name: clientData.name,
        client_phone: clientData.phone,
        client_country: clientData.country,
      },
    });

    // Create order record
    const { error: orderError } = await supabase.from('orders').insert({
      checkout_reference: paymentIntent.metadata.checkout_reference,
      original_amount: amount,
      final_amount: amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      client_email: clientData.email,
      client_name: clientData.name,
      client_phone: clientData.phone,
      client_country: clientData.country,
      description: `Payment for ${selectedPackage?.name}`,
      payment_type: 'card',
      payment_method: 'stripe',
      coupon_code: couponCode,
      ip_address: ip,
      device_info: deviceInfo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      checkout_reference: paymentIntent.metadata.checkout_reference,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}