import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, ArrowUp, Smartphone, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallScreenProps {
  onComplete: () => void;
}

export const InstallScreen: React.FC<InstallScreenProps> = ({ onComplete }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(isIOSDevice);

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    
    if (standalone) {
      // If already installed, skip to complete after a short delay
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      // Don't prevent default, let the browser's native prompt also have a chance
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [onComplete]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
        // If no prompt, maybe it's already installed or not supported
        onComplete();
        return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onComplete();
    }
  };

  const handleContinue = () => {
    onComplete();
  };

  if (isStandalone) {
    return (
      <motion.div 
        exit={{ opacity: 0 }}
        className="h-screen w-screen bg-white flex flex-col items-center justify-center p-8"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-10 h-10 bg-[#ED0711] rounded-xl flex items-center justify-center shadow-xl mb-6">
            <img 
              src="https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B" 
              alt="Scotiabank" 
              className="w-5 h-5 rounded-md"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Scotiabank</h1>
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <ShieldCheck size={20} />
            <span>Secure Connection</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      exit={{ opacity: 0, y: -20 }}
      className="h-screen w-screen bg-white flex flex-col overflow-hidden"
    >
      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={handleContinue}
          className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
        >
          Skip
        </button>
      </div>
      {/* Header */}
      <div className="p-6 flex flex-col items-center text-center mt-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-8 h-8 bg-[#ED0711] rounded-lg flex items-center justify-center shadow-lg mb-4"
        >
          <img 
            src="https://cdn.brandfetch.io/idpIpGPfn2/w/400/h/400/theme/dark/icon.jpeg?c=1dxbfHSJFAPEGdCLU4o5B" 
            alt="Scotiabank" 
            className="w-4 h-4 rounded-sm"
          />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-gray-900"
        >
          Scotiabank Mobile
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-500 text-xs mt-1"
        >
          Official Mobile Banking Experience
        </motion.p>
      </div>

      {/* Features */}
      <div className="flex-1 px-8 py-4 space-y-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-[#ED0711] flex-shrink-0">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Faster Access</h3>
            <p className="text-xs text-gray-500">Launch directly from your home screen with no browser bars.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Enhanced Security</h3>
            <p className="text-xs text-gray-500">Secure, encrypted connection for all your banking needs.</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">Native Experience</h3>
            <p className="text-xs text-gray-500">Optimized for your device with smooth animations and gestures.</p>
          </div>
        </motion.div>
      </div>

      {/* Action Area */}
      <div className="p-8 bg-gray-50 border-t border-gray-100">
        {isIOS ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-bold text-gray-900 text-sm text-center mb-4">How to Install on iOS</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">1</div>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    Tap the <Share size={18} className="text-blue-500" /> button in the browser toolbar.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">2</div>
                  <p className="text-xs text-gray-600 flex items-center gap-2">
                    Scroll down and tap <PlusSquare size={18} /> <span className="font-bold">Add to Home Screen</span>.
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleContinue}
              className="w-full py-4 text-gray-500 font-medium text-xs hover:text-gray-700 transition-colors"
            >
              Continue in Browser
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="flex justify-center -mb-2">
              <span className="bg-red-100 text-[#ED0711] text-[9px] font-black px-2 py-0.5 rounded-full tracking-tighter border border-red-200">RECOMMENDED</span>
            </div>
            <button 
              onClick={handleInstallClick}
              className="w-full py-5 bg-[#ED0711] text-white font-bold rounded-xl shadow-2xl shadow-red-400/40 flex items-center justify-center gap-3 active:scale-[0.98] transition-all animate-bounce-subtle text-base border-2 border-white/20"
            >
              <Download size={24} />
              Install Scotia Mobile
            </button>
            <div className="pt-2 flex justify-center">
              <button 
                onClick={handleContinue}
                className="text-[9px] text-gray-400 font-medium hover:text-gray-600 transition-colors underline underline-offset-4 opacity-40"
              >
                Use limited web version instead
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Indicator for iOS */}
      {isIOS && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, repeat: Infinity, repeatType: 'reverse', duration: 1 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center text-blue-500"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1">Install Here</p>
          <ArrowUp size={24} />
        </motion.div>
      )}
    </motion.div>
  );
};
