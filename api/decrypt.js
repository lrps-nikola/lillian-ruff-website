import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Decrypt payment data
function decryptPaymentData(encryptedData) {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { data } = req.query;

  if (!data) {
    return res.status(400).json({ success: false, message: "No data provided" });
  }

  if (!ENCRYPTION_KEY) {
    return res.status(500).json({ success: false, message: "Server configuration error" });
  }

  const decrypted = decryptPaymentData(data);

  if (!decrypted) {
    return res.status(400).json({ success: false, message: "Invalid or corrupted data" });
  }

  return res.status(200).json({ success: true, data: decrypted });
}
