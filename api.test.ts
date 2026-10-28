import { afterEach, describe, expect, it, vi } from "vitest";
import { api, auth, setToken } from "../src/services/api";

function mockResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body, text: async () => JSON.stringify(body) } as Response;
}
afterEach(() => { vi.restoreAllMocks(); setToken(""); localStorage.clear(); });

describe("CareerTrack API client", () => {
  it("sends the bearer token with protected requests", async () => {
    setToken("test-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse([]));
    await api.list();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
  });

  it("posts registration details to the auth endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse({ access_token: "token", user: { id: 1, email: "person@example.com", created_at: "2026-10-28T00:00:00Z" } }, 201));
    const result = await auth.register("person@example.com", "secure-password");
    expect(result.access_token).toBe("token");
    expect(String(fetchMock.mock.calls[0][0])).toContain("/auth/register");
  });
});
