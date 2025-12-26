const { test, expect } = require("@playwright/test");

test("login returns a JWT and /me works with it", async ({ request }) => {
  const email = `tania+${Date.now()}@example.com`;
  const password = "secret12";

  // register
  const reg = await request.post("/auth/register", { data: { email, password } });
  expect(reg.status()).toBe(201);

  // login
  const login = await request.post("/auth/login", { data: { email, password } });
  expect(login.status()).toBe(200);
  const { token } = await login.json();
  expect(token).toBeTruthy();

  // protected endpoint
  const me = await request.get("/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(me.status()).toBe(200);
  const body = await me.json();
  expect(body.email).toBe(email);
});

test("login fails with wrong password", async ({ request }) => {
  const email = `tania+${Date.now()}@example.com`;
  const password = "secret12";

  const reg = await request.post("/auth/register", { data: { email, password } });
  expect(reg.status()).toBe(201);

  const login = await request.post("/auth/login", {
    data: { email, password: "wrongpassword" },
  });
  expect(login.status()).toBe(401);
});

test("/me rejects missing token", async ({ request }) => {
  const me = await request.get("/me");
  expect(me.status()).toBe(401);
});