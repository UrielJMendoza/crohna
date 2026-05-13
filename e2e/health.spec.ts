import { test, expect } from "@playwright/test";

test.describe("Health Check API", () => {
  test("GET /api/health returns status payload", async ({ request }) => {
    const res = await request.get("/api/health");
    // 200 when DB reachable, 503 when not — both are valid for a public health check.
    expect([200, 503]).toContain(res.status());

    const data = await res.json();
    expect(["healthy", "unhealthy"]).toContain(data.status);
    expect(data.services?.database).toBeDefined();
    expect(data.timestamp).toBeDefined();
  });
});
