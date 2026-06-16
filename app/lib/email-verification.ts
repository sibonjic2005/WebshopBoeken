import emailjs from "@emailjs/nodejs";

// In-memory store for verification codes (expires after 1 hour)
const verificationCodes = new Map<
  string,
  { email: string; expiresAt: number }
>();

// Clean up expired codes every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      verificationCodes.delete(token);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a verification token (UUID v4)
 */
export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

/**
 * Store verification code and return the token
 */
export function storeVerificationCode(email: string): string {
  const token = generateVerificationToken();
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  verificationCodes.set(token, { email, expiresAt });
  return token;
}

/**
 * Verify a token and return the email if valid
 */
export function verifyToken(token: string): string | null {
  const data = verificationCodes.get(token);

  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    verificationCodes.delete(token);
    return null;
  }

  return data.email;
}

/**
 * Send verification email via EmailJS
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    throw new Error("EmailJS credentials are not configured");
  }

  try {
    emailjs.init({
      publicKey,
      privateKey,
    });

    console.log("Sending verification email to:", email);
    console.log("Service ID:", serviceId);
    console.log("Template ID:", templateId);
    console.log("Verification URL:", verificationUrl);

    const response = await emailjs.send(serviceId, templateId, {
      to_email: email,
      verification_url: verificationUrl,
    });

    console.log("Email sent successfully:", response);
  } catch (error) {
    console.error("EmailJS error:", error);
    throw error;
  }
}

/**
 * Clean up a verification token after use
 */
export function deleteVerificationToken(token: string): void {
  verificationCodes.delete(token);
}
