import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "../MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders plain text", () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders bold text", () => {
    render(<MarkdownRenderer content="This is **bold** text" />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("renders italic text", () => {
    render(<MarkdownRenderer content="This is *italic* text" />);
    expect(screen.getByText("italic").tagName).toBe("EM");
  });

  it("renders inline code", () => {
    render(<MarkdownRenderer content="Use the `code()` function" />);
    const code = screen.getByText("code()");
    expect(code.tagName).toBe("CODE");
  });

  it("renders code blocks", () => {
    render(<MarkdownRenderer content={"```\nconst x = 1;\n```"} />);
    const pre = document.querySelector(".markdown-content pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toContain("const x = 1;");
  });

  it("renders lists", () => {
    render(<MarkdownRenderer content={"- Item 1\n- Item 2"} />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("renders headings", () => {
    render(<MarkdownRenderer content={"# Big Heading\n\n## Small Heading"} />);
    const h1 = document.querySelector("h1");
    const h2 = document.querySelector("h2");
    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();
    expect(h1?.textContent).toBe("Big Heading");
    expect(h2?.textContent).toBe("Small Heading");
  });

  it("renders links", () => {
    render(<MarkdownRenderer content='[Click here](https://example.com)' />);
    const link = screen.getByText("Click here");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders blockquotes", () => {
    render(<MarkdownRenderer content={"> A wise quote"} />);
    const blockquote = document.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();
    expect(blockquote?.textContent).toContain("A wise quote");
  });

  it("handles empty content", () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.querySelector(".markdown-content")).toBeInTheDocument();
  });

  it("handles mixed formatting", () => {
    render(
      <MarkdownRenderer
        content={"# Hello\n\nThis is **bold** and `code`.\n\n- List item"}
      />
    );
    expect(document.querySelector("h1")).toBeInTheDocument();
    expect(screen.getByText("bold")).toBeInTheDocument();
    expect(screen.getByText("code")).toBeInTheDocument();
    expect(screen.getByText("List item")).toBeInTheDocument();
  });
});
