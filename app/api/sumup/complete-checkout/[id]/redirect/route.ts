import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checkoutId = params.id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Get the final checkout status from SumUp
    const response = await fetch(
      `https://api.sumup.com/v0.1/checkouts/${checkoutId}`,
      {
        headers: {
          "Authorization": `Bearer ${SUMUP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return redirect("/failed?reason=payment_failed");
    }

    const result = await response.json();

    // Handle different payment statuses
    switch (result.status?.toUpperCase()) {
      case "PAID":
        // Get client data from the pending order
        const { data: order } = await supabase
          .from('orders')
          .select('client_email, client_phone, client_name, client_country, id')
          .eq('sumup_checkout_id', checkoutId)
          .single();

        if (order) {
          // Store client data
          await supabase
            .from('clients')
            .insert({
              email: order.client_email,
              phone: order.client_phone || '',
              name: order.client_name,
              country: order.client_country || '',
              transaction_code: result.transaction_code,
              checkout_reference: result.checkout_reference,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          // Update order status
          await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);
        }

        // Redirect with order reference
        return redirect(`/success?reference=${result.checkout_reference}`);

      case "FAILED":
        return redirect("/failed?reason=payment_failed");

      case "CANCELLED":
        return redirect("/failed?reason=3ds_cancelled");

      default:
        return redirect("/failed?reason=3ds_failed");
    }
  } catch (error) {
    console.error("Error handling redirect:", error);
    return redirect("/failed?reason=payment_failed");
  }
}