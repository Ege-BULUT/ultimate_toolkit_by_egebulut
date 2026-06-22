import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Welcome, isFirstVisit, dismissOnboarding, resetOnboarding } from "../Welcome";

beforeEach(() => {
  localStorage.clear();
});

describe("Welcome utility functions", () => {
  it("isFirstVisit returns true when no onboarding flag", () => {
    expect(isFirstVisit()).toBe(true);
  });

  it("isFirstVisit returns false after dismiss", () => {
    dismissOnboarding();
    expect(isFirstVisit()).toBe(false);
  });

  it("resetOnboarding clears the flag", () => {
    dismissOnboarding();
    resetOnboarding();
    expect(isFirstVisit()).toBe(true);
  });
});

describe("Welcome component", () => {
  it("renders on first visit", () => {
    render(<Welcome onDismiss={() => {}} />);
    expect(screen.getByText("Welcome to Ultimate Toolkit")).toBeTruthy();
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("does not render after onboarding dismissed", () => {
    dismissOnboarding();
    render(<Welcome onDismiss={() => {}} />);
    expect(screen.queryByText("Welcome to Ultimate Toolkit")).toBeNull();
  });

  it("shows quick start steps", () => {
    render(<Welcome onDismiss={() => {}} />);
    expect(screen.getByText("Browse Plugins")).toBeTruthy();
    expect(screen.getByText("Configure API Keys")).toBeTruthy();
    expect(screen.getByText("Floating Windows")).toBeTruthy();
    expect(screen.getByText("Customize")).toBeTruthy();
  });

  it("calls onDismiss and hides when Get Started is clicked", () => {
    let dismissed = false;
    render(<Welcome onDismiss={() => { dismissed = true; }} />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(dismissed).toBe(true);
    expect(screen.queryByText("Welcome to Ultimate Toolkit")).toBeNull();
  });

  it("shows documentation and GitHub links", () => {
    render(<Welcome onDismiss={() => {}} />);
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href")?.includes("utoolkit.vercel.app"))).toBe(true);
    expect(links.some((l) => l.getAttribute("href")?.includes("github.com/egebulut"))).toBe(true);
  });
});
