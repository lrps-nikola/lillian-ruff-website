import nodemailer from "nodemailer";
import crypto from "crypto";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.GMAIL_USER || "nikola@lillianruffpetspa.com";
const EMAIL_TO = process.env.EMAIL_TO || "nikola@lillianruffpetspa.com";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const SITE_URL = process.env.SITE_URL || "https://lillianruffpetspa.com";

// Encrypt payment data
function encryptPaymentData(data) {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { customer, dogs, payment, totals } = req.body;

    // Validate required fields
    if (!customer || !customer.firstName || !customer.lastName || !customer.phone) {
      return res.status(400).json({ success: false, message: "Missing customer information" });
    }

    if (!dogs || dogs.length === 0) {
      return res.status(400).json({ success: false, message: "At least one dog is required" });
    }

    if (!payment || !payment.cardNumber || !payment.cvv) {
      return res.status(400).json({ success: false, message: "Missing payment information" });
    }

    // Encrypt payment data
    const encryptedPayment = encryptPaymentData({
      cardholderName: payment.cardholderName,
      cardNumber: payment.cardNumber,
      expiryDate: payment.expiryDate,
      cvv: payment.cvv,
      zipCode: payment.zipCode,
      customerName: `${customer.firstName} ${customer.lastName}`,
      timestamp: new Date().toISOString()
    });

    const decryptUrl = `${SITE_URL}/decrypt?data=${encodeURIComponent(encryptedPayment)}`;

    // Create OAuth2 transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
      },
    });

    // Build dogs HTML
    const dogsHtml = dogs.map((dog, index) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-weight: bold; font-size: 16px;">${index + 1}</span>
              </div>
              <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${dog.name}</h3>
            </div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 13px;">Breed</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${dog.breed}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 13px;">Weight</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${dog.weight} lbs</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 13px;">Membership Plan</span><br>
                  <span style="color: #059669; font-size: 14px; font-weight: 600;">${dog.membershipType}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 13px;">Billing Cycle</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${dog.billingCycle}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 13px;">Start Date</span><br>
                  <span style="color: #111827; font-size: 14px; font-weight: 500;">${dog.startDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0;">
                  <span style="color: #6b7280; font-size: 13px;">Price</span><br>
                  <span style="color: #059669; font-size: 16px; font-weight: 700;">$${dog.price.toFixed(2)}<span style="font-size: 12px; font-weight: 400; color: #6b7280;"> / cycle</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `).join('');

    // Build dogs plain text
    const dogsText = dogs.map((dog, index) => `
Dog ${index + 1}: ${dog.name}
  - Breed: ${dog.breed}
  - Weight: ${dog.weight} lbs
  - Plan: ${dog.membershipType}
  - Billing: ${dog.billingCycle}
  - Start: ${dog.startDate}
  - Price: $${dog.price.toFixed(2)}/cycle
`).join('\n');

    // Create HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Membership Signup</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Lillian Ruff Pet Spa</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Customer Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Customer Information</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Name</span><br>
                          <span style="color: #111827; font-size: 15px; font-weight: 500;">${customer.firstName} ${customer.lastName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Phone</span><br>
                          <a href="tel:${customer.phone}" style="color: #059669; font-size: 15px; font-weight: 500; text-decoration: none;">${customer.phone}</a>
                        </td>
                      </tr>
                      ${customer.email ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px;">Email</span><br>
                          <a href="mailto:${customer.email}" style="color: #059669; font-size: 15px; font-weight: 500; text-decoration: none;">${customer.email}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Dogs Section -->
              <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Membership Details</h2>
              ${dogsHtml}

              <!-- Order Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111827; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</h2>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151;">
                          <span style="color: #9ca3af; font-size: 14px;">Subtotal</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151; text-align: right;">
                          <span style="color: #ffffff; font-size: 14px; font-weight: 500;">$${totals.subtotal.toFixed(2)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151;">
                          <span style="color: #9ca3af; font-size: 14px;">NY Sales Tax (8.875%)</span>
                        </td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #374151; text-align: right;">
                          <span style="color: #ffffff; font-size: 14px; font-weight: 500;">$${totals.tax.toFixed(2)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0 0 0;">
                          <span style="color: #ffffff; font-size: 18px; font-weight: 700;">Total</span>
                        </td>
                        <td style="padding: 12px 0 0 0; text-align: right;">
                          <span style="color: #10b981; font-size: 24px; font-weight: 700;">$${totals.total.toFixed(2)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Payment Link -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 500;">Secure payment information stored separately</p>
                    <a href="${decryptUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none;">
                      View Payment Details
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                This membership request was submitted through the Lillian Ruff Pet Spa website.<br>
                <span style="color: #9ca3af;">Received on ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    // Plain text fallback
    const textContent = `
New Membership Signup - Lillian Ruff Pet Spa

CUSTOMER INFORMATION
--------------------
Name: ${customer.firstName} ${customer.lastName}
Phone: ${customer.phone}
${customer.email ? `Email: ${customer.email}` : ''}

MEMBERSHIP DETAILS
------------------
${dogsText}

ORDER SUMMARY
-------------
Subtotal: $${totals.subtotal.toFixed(2)}
NY Sales Tax (8.875%): $${totals.tax.toFixed(2)}
Total: $${totals.total.toFixed(2)}

PAYMENT DETAILS
---------------
View secure payment information: ${decryptUrl}

---
This membership request was submitted through the Lillian Ruff Pet Spa website.
    `.trim();

    // Send email
    await transporter.sendMail({
      from: `"Lillian Ruff Pet Spa" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: customer.email || EMAIL_TO,
      subject: `New Membership Signup: ${customer.firstName} ${customer.lastName} - ${dogs.length} dog${dogs.length > 1 ? 's' : ''}`,
      text: textContent,
      html: htmlContent,
    });

    return res.status(200).json({ success: true, message: "Membership request submitted successfully" });
  } catch (error) {
    console.error("Error sending membership email:", error);
    return res.status(500).json({ success: false, message: "Failed to submit membership request" });
  }
}
