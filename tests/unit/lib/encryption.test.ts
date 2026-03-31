import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption";

// Set the encryption key for tests
process.env.IDEON_MASTER_ENCRYPTION_KEY = "test-encryption-key-must-be-long-enough";

describe("encryption", () => {
  it("should encrypt and decrypt correctly", () => {
    const originalText = "hello world";
    const { encrypted, iv } = encrypt(originalText);
    
    expect(encrypted).toBeDefined();
    expect(iv).toBeDefined();
    expect(encrypted).not.toBe(originalText);
    
    const decryptedText = decrypt(encrypted, iv);
    expect(decryptedText).toBe(originalText);
  });

  it("should produce different encrypted output for the same text (due to unique IV)", () => {
    const text = "consistent text";
    const result1 = encrypt(text);
    const result2 = encrypt(text);
    
    expect(result1.encrypted).not.toBe(result2.encrypted);
    expect(result1.iv).not.toBe(result2.iv);
    
    expect(decrypt(result1.encrypted, result1.iv)).toBe(text);
    expect(decrypt(result2.encrypted, result2.iv)).toBe(text);
  });

  it("should throw error when decrypting with wrong key or tampered data", () => {
    const text = "original message";
    const { encrypted, iv } = encrypt(text);
    
    // Tamper with encrypted text
    const tamperedEncrypted = encrypted.substring(0, encrypted.length - 1) + (encrypted.endsWith('a') ? 'b' : 'a');
    
    expect(() => decrypt(tamperedEncrypted, iv)).toThrow();
  });
});
