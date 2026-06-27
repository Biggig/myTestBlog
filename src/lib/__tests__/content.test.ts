import { describe, it, expect } from "vitest";
import { extractTextFromTipTap, stripHtml, estimateReadingTime } from "../content";

describe("extractTextFromTipTap", () => {
  it("extracts text from TipTap JSON", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "Hello World" }] },
      ],
    });
    expect(extractTextFromTipTap(json)).toBe("Hello World");
  });

  it("returns empty string for invalid JSON", () => {
    expect(extractTextFromTipTap("not json")).toBe("");
  });

  it("returns empty for empty doc", () => {
    const json = JSON.stringify({ type: "doc", content: [] });
    expect(extractTextFromTipTap(json)).toBe("");
  });

  it("truncates to 300 chars", () => {
    const longText = "a".repeat(500);
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: longText }] }],
    });
    const result = extractTextFromTipTap(json);
    expect(result.length).toBeLessThanOrEqual(300);
  });

  it("joins multiple text nodes with spaces", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "First" },
            { type: "text", text: "Second" },
          ],
        },
      ],
    });
    expect(extractTextFromTipTap(json)).toBe("First Second");
  });

  it("walks nested content blocks", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
              ],
            },
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Item 2" }] },
              ],
            },
          ],
        },
      ],
    });
    expect(extractTextFromTipTap(json)).toBe("Item 1 Item 2");
  });
});

describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello</p>")).toBe("Hello");
  });

  it("removes nested HTML tags", () => {
    expect(stripHtml("<p>Hello <b>World</b></p>")).toBe("Hello World");
  });

  it("collapses whitespace", () => {
    expect(stripHtml("<div>  a   b  </div>")).toBe("a b");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles plain text without tags", () => {
    expect(stripHtml("Just some text")).toBe("Just some text");
  });
});

describe("estimateReadingTime", () => {
  it("returns 1 for short content", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hi" }] }],
    });
    expect(estimateReadingTime(json)).toBe(1);
  });

  it("estimates reading time correctly for long content", () => {
    const longText = "x".repeat(1000); // ~2 min at 500 chars/min
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: longText }] }],
    });
    expect(estimateReadingTime(json)).toBe(2);
  });

  it("returns 1 for empty content", () => {
    const json = JSON.stringify({ type: "doc", content: [] });
    expect(estimateReadingTime(json)).toBe(1);
  });

  it("returns 1 for invalid JSON", () => {
    expect(estimateReadingTime("not json")).toBe(1);
  });

  it("counts full text without truncation", () => {
    const longText = "x".repeat(500);
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: longText }] }],
    });
    // 500 chars exactly -> Math.ceil(500/500) = 1
    expect(estimateReadingTime(json)).toBe(1);
  });
});
