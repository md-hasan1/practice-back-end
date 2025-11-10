// Do not keep Twilio credentials in source. Use environment variables.
import type { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const fromNumber = process.env.TWILIO_FROM_NUMBER || '';

let client: Twilio | null = null;
if (accountSid && authToken) {
  // Lazy-require so module import doesn't fail if env not set during build-time checks
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  client = require('twilio')(accountSid, authToken);
}

// Function to generate a random 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit number
}

export async function sendOtp(customerNumber: string) {
  if (!client) {
    throw new Error('Twilio client not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }
  if (!fromNumber) {
    throw new Error('TWILIO_FROM_NUMBER is not configured.');
  }

  const otp = generateOTP();
  return client.messages.create({
    body: `Your OTP is ${otp}. Please use this code to verify your account.`,
    from: fromNumber,
    to: customerNumber,
  });
}

// Note: we no longer execute sending at module import. Call sendOtp(...) where needed.