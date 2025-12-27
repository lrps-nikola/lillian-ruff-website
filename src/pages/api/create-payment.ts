import type { APIRoute } from "astro";
import { Client, Environment } from "square";
import crypto from "crypto";

// Square client configuration
const squareClient = new Client({
  accessToken: import.meta.env.SQUARE_ACCESS_TOKEN,
  environment:
    import.meta.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://lillianruffpetspa.com",
  "https://www.lillianruffpetspa.com",
  "http://localhost:4321",
  "http://localhost:3000",
];

// Security headers for all responses
function getSecurityHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
  };

  // Only add CORS headers if origin is allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }

  return headers;
}

export const prerender = false;

// Handle preflight requests
export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(origin),
  });
};

export const POST: APIRoute = async ({ request }) => {
  const origin = request.headers.get("origin");
  const headers = getSecurityHeaders(origin);

  try {
    const body = await request.json();
    const {
      sourceId,
      amount,
      currency = "USD",
      items,
      customerEmail,
      customerName,
    } = body;

    if (!sourceId || !amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: sourceId and amount",
        }),
        { status: 400, headers },
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0 || amount > 10000) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid payment amount",
        }),
        { status: 400, headers },
      );
    }

    // Convert amount to cents (Square expects amounts in smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create a unique idempotency key for this payment
    const idempotencyKey = crypto.randomUUID();

    // Create the payment
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountInCents),
        currency,
      },
      locationId: import.meta.env.SQUARE_LOCATION_ID,
      note: `Lillian Ruff Pet Spa - Online Order`,
      buyerEmailAddress: customerEmail,
    });

    if (result.payment) {
      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: result.payment.id,
            status: result.payment.status,
            receiptUrl: result.payment.receiptUrl,
            totalMoney: result.payment.totalMoney,
          },
        }),
        { status: 200, headers },
      );
    } else {
      throw new Error("Payment was not created");
    }
  } catch (error: any) {
    // Log error server-side only (not exposed to client)
    if (import.meta.env.DEV) {
      console.error("Square Payment Error:", error);
    }

    // Handle Square API errors - return sanitized error message
    if (error.errors) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment processing failed. Please try again.",
        }),
        { status: 400, headers },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers },
    );
  }
};
