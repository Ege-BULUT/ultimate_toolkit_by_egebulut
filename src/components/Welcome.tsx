import React, { useEffect, useState } from "react";

const ONBOARDING_KEY = "ut-onboarding-done";

export function isFirstVisit(): boolean {
  try {
    return !localStorage.getItem(ONBOARDING_KEY);
  } catch {
    return true;
  }
}

export function dismissOnboarding() {
  try {
    localStorage.setItem(ONBOARDING_KEY, "1");
  } catch {}
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(ONBOARDING_KEY);
  } catch {}
}

interface WelcomeProps {
  onDismiss: () => void;
}

const QUICK_STEPS = [
  { icon: "🧩", title: "Browse Plugins", desc: "Explore OCR and AI Chat plugins on the Plugins page. Toggle them on to get started." },
  { icon: "🔑", title: "Configure API Keys", desc: "For AI Chat, open the plugin and enter your API key. No key needed for local Ollama." },
  { icon: "🪟", title: "Floating Windows", desc: "Once active, click 'Floating Window' to pop out OCR or AI Chat into a movable, resizable panel." },
  { icon: "⚙️", title: "Customize", desc: "Visit Settings to switch between Dark/Light/System theme and manage auto-updates." },
];

export const Welcome: React.FC<WelcomeProps> = ({ onDismiss }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isFirstVisit()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
        style={{
          background: "var(--color-surface)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "var(--color-accent)" }}
          >
            UT
          </div>
          <div>
            <h2 className="text-lg font-bold">Welcome to Ultimate Toolkit</h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              v0.1.0
            </p>
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          Your all-in-one Windows utility toolkit. Modular plugins, beautiful themes,
          and a blazing-fast Rust backend.
        </p>

        {/* Quick Start Steps */}
        <div className="space-y-3 mb-6">
          {QUICK_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl"
              style={{ background: "var(--color-surface-alt)" }}
            >
              <span className="text-xl shrink-0 mt-0.5">{step.icon}</span>
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4 mb-6 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <a
            href="https://utoolkit.vercel.app/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            📖 Full Docs
          </a>
          <a
            href="https://github.com/egebulut/ultimate_toolkit_by_egebulut"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--color-accent)" }}
          >
            ⭐ GitHub
          </a>
        </div>

        <button
          onClick={() => {
            dismissOnboarding();
            setShow(false);
            onDismiss();
          }}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};
