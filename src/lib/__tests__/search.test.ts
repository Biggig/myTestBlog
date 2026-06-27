import { describe, it, expect, vi } from "vitest";

// Mock Prisma before importing the module that uses it
vi.mock("../prisma", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
}));

import { searchPosts } from "../search";

describe("searchPosts", () => {
  it("is a function", () => {
    expect(typeof searchPosts).toBe("function");
  });

  it("is an async function", () => {
    expect(searchPosts.constructor.name).toBe("AsyncFunction");
  });
});
