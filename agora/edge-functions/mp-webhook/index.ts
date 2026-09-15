// Supabase Edge Function: mp-webhook
// Receives payment notifications from Mercado Pago
// Deploy: supabase functions deploy mp-webhook --project-ref <project-ref>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const body = await req.json()
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN')

    if (body.type === 'payment') {
      // Fetch payment details from Mercado Pago
      const paymentRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${body.data.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const payment = await paymentRes.json()

      if (payment.status === 'approved') {
        // Update order status in Supabase
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        await supabase
          .from('orders')
          .update({
            status: 'paid',
            payment_id: String(payment.id),
            payment_provider: 'mercadopago',
          })
          .eq('id', payment.external_reference)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
