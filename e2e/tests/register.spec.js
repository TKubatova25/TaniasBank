const { test, expect } = require("@playwright/test");

test("POST /auth/register creates a user", async ({ request }) => {
  const email = `tania+${Date.now()}@example.com`;

  const res = await request.post("/auth/register", {
    data: { email, password: "secret12" },
  });

  expect(res.status()).toBe(201);

  const body = await res.json();
  expect(body.email).toBe(email);
  expect(body.id).toBeTruthy();
  expect(body.created_at).toBeTruthy();
});

test("POST /auth/register rejects duplicate email", async ({ request }) => {
  const email = `tania+dup+${Date.now()}@example.com`;

  const first = await request.post("/auth/register", {
    data: { email, password: "secret12" },
  });
  expect(first.status()).toBe(201);

  const second = await request.post("/auth/register", {
    data: { email, password: "secret12" },
  });
  expect(second.status()).toBe(409);
});

test("POST /auth/register rejects invalid input", async ({ request }) => {
  const res = await request.post("/auth/register", {
    data: { email: "not-an-email", password: "123" },
  });
  expect(res.status()).toBe(400);
});