const { test, expect } = require("@playwright/test");

test("GET /health returns ok", async ({ request }) => {
  const response = await request.get("/health");

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toEqual({ ok: true });
});