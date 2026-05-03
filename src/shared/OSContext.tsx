import React, { createContext, useContext, useState, useEffect } from 'react';
import { OSType } from './types';

interface OSConfig {
  os: string;
  version: string;
  features: string[];
  theme: 'light' | 'dark';
  password?: string;
}

interface OSContextType {
  currentOS: OSType;
  setOS: (os: OSType) => void;
  config: OSConfig | null;
  loading: boolean;
  isAdmin: boolean;
  setAdmin: (isAdmin: boolean) => void;
  deferredPrompt: unknown;
}

const OSContext = createContext<OSContextType | undefined>(undefined);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOS, setCurrentOS] = useState<OSType>('ios');
  const [config, setConfig] = useState<OSConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        console.log(`Fetching OS config from /api/os?os=${currentOS}`);
        const response = await fetch(`/api/os?os=${currentOS}`);
        if (!response.ok) {
          console.error(`Fetch failed with status ${response.status}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Failed to fetch OS config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [currentOS]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <OSContext.Provider value={{ currentOS, setOS: setCurrentOS, config, loading, isAdmin, setAdmin: setIsAdmin, deferredPrompt }}>
      {children}
    </OSContext.Provider>
  );
};

export const useOS = () => {
  const context = useContext(OSContext);
  if (context === undefined) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
