import crypto from "crypto";

const ENCRYPTION_KEY = process.env.IDEON_MASTER_ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";

if (!ENCRYPTION_KEY) {
  throw new Error("IDEON_MASTER_ENCRYPTION_KEY is not defined in environment variables");
}

// Ensure the key is exactly 32 bytes (256 bits)
const keyBuffer = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

export function encrypt(text: string): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    // We append the auth tag to the end for easier storage
    encrypted: encrypted + authTag,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encrypted: string, ivHex: string): string {
  // Extract auth tag from the end (GCM auth tag is 16 bytes = 32 hex chars)
  const authTag = Buffer.from(encrypted.slice(-32), "hex");
  const encryptedText = encrypted.slice(0, -32);
  const iv = Buffer.from(ivHex, "hex");
  
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
