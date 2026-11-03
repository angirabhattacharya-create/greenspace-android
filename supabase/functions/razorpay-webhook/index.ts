// Razorpay webhook outline.
// Verify X-Razorpay-Signature against the raw request body before updating payment state.
// Use an idempotent event ledger in production to prevent duplicate webhook processing.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // TODO:
  // 1. Read raw body and verify HMAC SHA-256 using RAZORPAY_WEBHOOK_SECRET.
  // 2. Reject invalid signatures.
  // 3. Idempotently reconcile payment/order/booking using provider IDs.
  // 4. Mark paid only on verified provider event; never trust a client callback.
  return Response.json({ received: true, integration: "pending" }, { status: 501 });
});