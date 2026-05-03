export const getApiUrl = (endpoint: string) => {
  // If no base URL is defined for either, default to relative path, 
  // which will naturally resolve to the current host (e.g., trycloudflared URL).
  const phpBase = (typeof window !== 'undefined' && localStorage.getItem('custom_php_backend_url')) || import.meta.env.VITE_PHP_BACKEND_URL || '';
  const apiBase = (typeof window !== 'undefined' && localStorage.getItem('custom_api_base_url')) || import.meta.env.VITE_API_BASE_URL || '';                
  
  const pathname = endpoint.split('?')[0];                
  
  if (pathname.endsWith('.php')) {
    return `${phpBase}${endpoint}`;
  }
  return `${apiBase}${endpoint}`;
};
