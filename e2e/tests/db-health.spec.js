const { test, expect } = require("@playwright/test");

test("GET /db-health returns db ok", async ({ request }) => {
  const response = await request.get("/db-health");

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toEqual({ db: "ok" });
});