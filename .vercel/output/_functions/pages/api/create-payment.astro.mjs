import { Client, Environment } from 'square';
import crypto from 'crypto';
export { renderers } from '../../renderers.mjs';

const squareClient = new Client({
  accessToken: "EAAAlxOKtG2G0fBFrc9R4OdxnC8Z8wui1e9-8Eju_xd92Lqbu7N3aGaltxJPT3I0",
  environment: Environment.Production 
});
const ALLOWED_ORIGINS = [
  "https://lillianruffpetspa.com",
  "https://www.lillianruffpetspa.com",
  "http://localhost:4321",
  "http://localhost:3000"
];
function getSecurityHeaders(origin) {
  const headers = {
    "Content-Type": "application/json",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  };
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}
const prerender = false;
const OPTIONS = async ({ request }) => {
  const origin = request.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getSecurityHeaders(origin)
  });
};
const POST = async ({ request }) => {
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
      customerName
    } = body;
    if (!sourceId || !amount) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: sourceId and amount"
        }),
        { status: 400, headers }
      );
    }
    if (typeof amount !== "number" || amount <= 0 || amount > 1e4) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid payment amount"
        }),
        { status: 400, headers }
      );
    }
    const amountInCents = Math.round(amount * 100);
    const idempotencyKey = crypto.randomUUID();
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amountInCents),
        currency
      },
      locationId: undefined                                  ,
      note: `Lillian Ruff Pet Spa - Online Order`,
      buyerEmailAddress: customerEmail
    });
    if (result.payment) {
      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: result.payment.id,
            status: result.payment.status,
            receiptUrl: result.payment.receiptUrl,
            totalMoney: result.payment.totalMoney
          }
        }),
        { status: 200, headers }
      );
    } else {
      throw new Error("Payment was not created");
    }
  } catch (error) {
    if (error.errors) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment processing failed. Please try again."
        }),
        { status: 400, headers }
      );
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again."
      }),
      { status: 500, headers }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  OPTIONS,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
