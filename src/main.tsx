import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FloatingApp from "./floating/FloatingApp";
import FloatingToolbar from "./floating/FloatingToolbar";
import "./styles/globals.css";

const params = new URLSearchParams(window.location.search);
const floatingMode = params.get("floating");
const toolbarMode = params.has("toolbar");

function Root() {
  if (floatingMode) {
    return <FloatingApp pluginId={floatingMode} />;
  }
  if (toolbarMode) {
    return <FloatingToolbar onToggle={() => {}} />;
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
