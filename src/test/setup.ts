import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia - needed by useTheme hook
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: query === "(prefers-color-scheme: dark)" ? false : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom doesn't implement scrollIntoView - needed by AI Chat scroll effect
Element.prototype.scrollIntoView = () => {};

// Mock PointerEvent for FloatingWindow resize handle
if (!window.PointerEvent) {
  window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}
