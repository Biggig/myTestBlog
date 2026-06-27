import { describe, it, expect } from "vitest";
import { slugify, cn } from "../utils";

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my blog post")).toBe("my-blog-post");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! World?")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("converts Chinese text to slug", () => {
    // Chinese characters should be preserved in the slug
    const result = slugify("你好世界");
    expect(result).toBeTruthy();
    expect(result).not.toContain(" ");
  });

  it("handles mixed Chinese and English", () => {
    const result = slugify("博客 My Blog");
    expect(result).toBeTruthy();
    expect(result).not.toContain(" ");
  });

  it("handles text with numbers", () => {
    expect(slugify("Post 123 Title")).toBe("post-123-title");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("resolves Tailwind conflicts via twMerge", () => {
    // twMerge should resolve p-4 vs p-6 conflict
    expect(cn("p-4", "p-6")).toBe("p-6");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});
