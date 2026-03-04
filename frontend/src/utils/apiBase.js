// Dynamic API base URL - uses current domain for production compatibility
const resolveApiBase = () => {
  const envUrl = process.env.REACT_APP_BACKEND_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};
export const API_BASE = resolveApiBase();
export const API = API_BASE + '/api';
