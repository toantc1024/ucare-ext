import React from "react";
import { createRoot } from "react-dom/client";
import Options from "./options";
import "../assets/tailwind.css";
function init() {
  const appContainer = document.createElement("div");
  appContainer.id = "app";
  document.body.appendChild(appContainer);
  if (!appContainer) {
    throw new Error("Can not find AppContainer");
  }
  const root = createRoot(appContainer);
  console.log(appContainer);
  root.render(<Options />);
}

init();
