import nodemailer from "nodemailer";

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const EMAIL_USER = process.env.GMAIL_USER || "nikola@lillianruffpetspa.com";
const EMAIL_TO = process.env.EMAIL_TO || "nikola@lillianruffpetspa.com";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      phone,
      position,
      availability,
      startDate,
      message,
      resume,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !position || !availability) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Prepare attachment if resume is provided
    const attachments = [];
    if (resume && resume.content && resume.filename) {
      attachments.push({
        filename: resume.filename,
        content: Buffer.from(resume.content, "base64"),
        contentType: "application/pdf",
      });
    }

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

    // Format position name
    const positionNames = {
      bather: "Bather",
      groomer: "Groomer",
      receptionist: "Receptionist",
      manager: "Manager",
    };

    // Format availability
    const availabilityNames = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      flexible: "Flexible",
    };

    const formattedPosition = positionNames[position] || position;
    const formattedAvailability =
      availabilityNames[availability] || availability;
    const formattedStartDate = startDate
      ? new Date(startDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

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
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Job Application</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Lillian Ruff Pet Spa</p>
            </td>
          </tr>

          <!-- Position Badge -->
          <tr>
            <td style="padding: 32px 40px 0 40px; text-align: center;">
              <span style="display: inline-block; background-color: #ecfdf5; color: #059669; padding: 8px 20px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                Applying for: ${formattedPosition}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <!-- Applicant Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Applicant Information</h2>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Full Name</span><br>
                          <span style="color: #111827; font-size: 15px; font-weight: 500;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Email Address</span><br>
                          <a href="mailto:${email}" style="color: #059669; font-size: 15px; font-weight: 500; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Phone Number</span><br>
                          <a href="tel:${phone}" style="color: #059669; font-size: 15px; font-weight: 500; text-decoration: none;">${phone}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="color: #6b7280; font-size: 13px;">Availability</span><br>
                          <span style="color: #111827; font-size: 15px; font-weight: 500;">${formattedAvailability}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #6b7280; font-size: 13px;">Available Start Date</span><br>
                          <span style="color: #111827; font-size: 15px; font-weight: 500;">${formattedStartDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${
                resume
                  ? `
              <!-- Resume Attached Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; border-left: 4px solid #059669;">
                      <span style="color: #059669; font-size: 15px; font-weight: 500;">📎 Resume attached: ${resume.filename}</span>
                    </div>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              ${
                message
                  ? `
              <!-- Additional Message Section -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 16px; font-weight: 600;">Additional Message</h2>
                    <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #059669;">${message.replace(/\n/g, "<br>")}</p>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding: 0 40px 32px 40px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Your Application to Lillian Ruff Pet Spa - ${formattedPosition}" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; text-decoration: none;">
                Reply to Applicant
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 13px;">
                This application was submitted through the Lillian Ruff Pet Spa website.<br>
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
New Job Application - Lillian Ruff Pet Spa

Position: ${formattedPosition}

APPLICANT INFORMATION
---------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Availability: ${formattedAvailability}
Available Start Date: ${formattedStartDate}

${resume ? `RESUME\n------\nAttached: ${resume.filename}\n` : ""}
${message ? `ADDITIONAL MESSAGE\n------------------\n${message}\n` : ""}

---
This application was submitted through the Lillian Ruff Pet Spa website.
    `.trim();

    // Send email
    await transporter.sendMail({
      from: `"Lillian Ruff Pet Spa" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: email,
      subject: `New Job Application: ${formattedPosition} - ${name}`,
      text: textContent,
      html: htmlContent,
      attachments,
    });

    return res
      .status(200)
      .json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send application" });
  }
}
