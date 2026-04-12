import { describe, expect, it, vi } from "vitest";

vi.mock("./supabase", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { api } from "./api";

describe("api", () => {
  it("returns the path when no VITE_API_URL is set", () => {
    expect(api("/health")).toBe("/health");
  });
});
