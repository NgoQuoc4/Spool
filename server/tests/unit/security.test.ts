import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, comparePassword, hashSHA256 } from "../../src/utils/crypto";

describe("Security & Crypto Unit Tests", () => {
  it("should generate deterministic SHA256 hex string", () => {
    const input = "test_string";
    const hash1 = hashSHA256(input);
    const hash2 = hashSHA256(input);
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });

  it("should correctly hash password and compare with matching input", () => {
    process.env.PASSWORD_SECRET = "test_secret_salt_123";
    const rawPassword = "SecurePassword!2026";
    const hashed = hashPassword(rawPassword);

    assert.notEqual(hashed, rawPassword);
    assert.equal(comparePassword(rawPassword, hashed), true);
    assert.equal(comparePassword("WrongPassword!2026", hashed), false);
  });
});
