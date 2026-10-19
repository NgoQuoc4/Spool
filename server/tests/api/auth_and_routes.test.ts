import test, { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { Server } from "http";

describe("API Contract & Auth Automated Tests", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    // Set dynamic port for test environment
    process.env.PORT = "4099";
    process.env.JWT_SECRET_ACCESS_TOKEN = "test_access_secret_123456";
    process.env.PASSWORD_SECRET = "test_password_secret_123456";

    // Dynamic import to allow env variables to be read
    const { default: app } = await import("../../src/index");
    
    await new Promise<void>((resolve) => {
      // Find server instance
      server = app.listen(4099, () => {
        baseUrl = `http://localhost:4099`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    // Allow stdout to flush then exit cleanly
    setTimeout(() => process.exit(0), 100);
  });

  it("GET /health should return 200 and healthy message", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.message, "Server is running");
    assert.ok(data.timestamp);
  });

  it("POST /user/sign-in with empty body should return 422 Unprocessable Entity", async () => {
    const res = await fetch(`${baseUrl}/user/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 422);
    const data = await res.json();
    assert.ok(data.errors || data.message);
  });

  it("POST /tweets/create-tweet without Authorization header should return 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/tweets/create-tweet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Test tweet" }),
    });
    assert.equal(res.status, 401);
  });

  it("GET /tweets/:tweet_id without Authorization header should return 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/tweets/some-fake-id`, {
      headers: { "Content-Type": "application/json" },
    });
    assert.equal(res.status, 401);
  });
});
