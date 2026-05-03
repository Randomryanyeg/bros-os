export const getApiUrl = (endpoint: string) => {
  // If no base URL is defined for either, default to relative path, 
  // which will naturally resolve to the current host (e.g., trycloudflared URL).
  const phpBase = import.meta.env.VITE_PHP_BACKEND_URL || '';
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  
  const pathname = endpoint.split('?')[0];
  
  if (pathname.endsWith('.php')) {
    return `${phpBase}${endpoint}`;
  }
  return `${apiBase}${endpoint}`;
};
