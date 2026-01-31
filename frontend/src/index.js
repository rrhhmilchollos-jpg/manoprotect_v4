import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { I18nProvider } from "@/i18n/I18nContext";

// Suppress PostHog/analytics errors in preview environment
const suppressPostHogError = (event) => {
  const message = event?.message || event?.reason?.message || '';
  const filename = event?.filename || '';
  
  if (message.includes('postMessage') || 
      message.includes('PerformanceServerTiming') ||
      message.includes('DataCloneError') ||
      filename.includes('posthog')) {
    event.preventDefault?.();
    event.stopPropagation?.();
    return true;
  }
  return false;
};

window.addEventListener('error', suppressPostHogError, true);
window.addEventListener('unhandledrejection', suppressPostHogError, true);

// Override console.error to filter PostHog errors
const originalConsoleError = console.error;
console.error = (...args) => {
  const errorStr = args.join(' ');
  if (errorStr.includes('posthog') || 
      errorStr.includes('PerformanceServerTiming') ||
      errorStr.includes('DataCloneError')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <App />
        <Toaster position="top-right" richColors />
      </I18nProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
