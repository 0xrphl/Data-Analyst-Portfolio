// Supabase Edge Function: create-mp-preference
// Deploy: supabase functions deploy create-mp-preference --project-ref <project-ref>
// Secrets: supabase secrets set MP_ACCESS_TOKEN=APP_USR-xxx --project-ref <project-ref>

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { order_id, items, payer_email } = await req.json()
    const accessToken = Deno.env.get('MP_ACCESS_TOKEN')

    if (!accessToken) throw new Error('MP_ACCESS_TOKEN not configured')

    const preference = {
      items: items.map((item: any) => ({
        title: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'COP',
      })),
      payer: { email: payer_email },
      back_urls: {
        success: 'https://3dagoralab.com/store/profile',
        failure: 'https://3dagoralab.com/store/checkout',
        pending: 'https://3dagoralab.com/store/profile',
      },
      auto_return: 'approved',
      external_reference: order_id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
    }

    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await res.json()

    return new Response(JSON.stringify({ init_point: data.init_point, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
