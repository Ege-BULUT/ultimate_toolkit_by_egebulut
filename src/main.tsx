import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FloatingApp from "./floating/FloatingApp";
import FloatingToolbar from "./floating/FloatingToolbar";
import "./styles/globals.css";

// Init logger so console interception works from startup
import "./hooks/useLogger";

const params = new URLSearchParams(window.location.search);
const floatingMode = params.get("floating");
const toolbarMode = params.has("toolbar");

console.log("App started, mode:", floatingMode ? "floating-" + floatingMode : toolbarMode ? "toolbar" : "main");

function Root() {
  if (floatingMode) {
    return <FloatingApp pluginId={floatingMode} />;
  }
  if (toolbarMode) {
    return <FloatingToolbar />;
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
