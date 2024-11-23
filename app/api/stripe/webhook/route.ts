import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const stripe = await getStripe();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { checkout_reference } = paymentIntent.metadata;

        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString(),
            transaction_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq('checkout_reference', checkout_reference);

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { checkout_reference } = paymentIntent.metadata;
        const error = paymentIntent.last_payment_error;

        await supabase
          .from('orders')
          .update({
            status: 'failed',
            error_message: error?.message,
            error_code: error?.code,
            updated_at: new Date().toISOString(),
          })
          .eq('checkout_reference', checkout_reference);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}