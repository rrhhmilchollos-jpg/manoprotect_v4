import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";

// Suppress PostHog/analytics errors in preview environment
window.addEventListener('error', (event) => {
  if (event.message?.includes('postMessage') || 
      event.message?.includes('PerformanceServerTiming') ||
      event.filename?.includes('posthog')) {
    event.preventDefault();
    return false;
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
      <Toaster position="top-right" richColors />
    </HelmetProvider>
  </React.StrictMode>,
);
