import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    
    if (isStandalone) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      
      // Store the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const triggerHandler = () => {
      if (isStandalone) return;
      setIsVisible(true);
    };

    window.addEventListener('trigger-pwa-install', triggerHandler);

    // For iOS, we show the prompt manually after a delay if not standalone
    if (isIOSDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('trigger-pwa-install', triggerHandler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('trigger-pwa-install', triggerHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center gap-4"
      >
        <div className="w-8 h-8 bg-[#ED0711] rounded-lg flex items-center justify-center flex-shrink-0">
          <img 
            src="https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B" 
            alt="App Icon" 
            className="w-4 h-4 rounded-sm"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm">Transfer to the Scotia App</h3>
          <p className="text-xs text-gray-500 leading-tight">
            {isIOS 
              ? "Tap 'Share' then 'Add to Home Screen' for full features" 
              : "Switch to the secure App for a better experience"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-[#ED0711] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-red-100 animate-bounce-subtle"
            >
              <Download size={16} />
              Install
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

