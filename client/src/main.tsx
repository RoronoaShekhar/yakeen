// Polyfill for global if not defined
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
