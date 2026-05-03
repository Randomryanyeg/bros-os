import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface WhatsNewViewProps {
  onBack: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const WhatsNewView: React.FC<WhatsNewViewProps> = ({ onBack }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F4F4F4] flex flex-col z-[100] overflow-hidden">
      <div className="bg-white pt-12 pb-4 px-4 flex items-center border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="text-gray-900 p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="text-gray-900 font-bold text-xl ml-2">What's New</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!isPWA && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6 shadow-sm">
            <h2 className="text-gray-900 font-bold text-xl">Install Scotia App</h2>
            <p className="text-gray-600 text-sm">
              Get a faster, more reliable experience by installing Scotia as an app on your device.
            </p>

            {platform === 'android' && deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="w-full py-4 bg-[#ED0711] text-white rounded-xl font-bold text-lg"
              >
                Install App
              </button>
            )}

            {platform === 'ios' && (
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 space-y-2 border border-gray-100">
                <p>To install on iOS:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap the <strong>Share</strong> button in your browser.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>
            )}

            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-500 text-xs">Or scan to install on another device:</p>
              <div className="p-2 bg-white rounded-xl border border-gray-100">
                <QRCodeSVG value={window.location.origin + '/?token=projectsarah'} size={128} />
              </div>
            </div>
          </div>
        )}
        <UpdateCard 
          version="Version 24.3.0"
          date="March 31, 2026"
          title="Light Mode is Here!"
          description="A fresh new look. Enjoy a clean, crisp light mode experience across the entire app. It's designed for maximum readability and a modern feel."
        />
        <UpdateCard 
          version="Version 24.2.1"
          date="February 28, 2026"
          title="Enhanced Security"
          description="We've added new security features to keep your accounts even safer, including improved Face ID integration and real-time fraud alerts."
        />
        <UpdateCard 
          version="Version 24.1.0"
          date="January 10, 2026"
          title="Redesigned Dashboard"
          description="A fresh new look for your accounts dashboard. Finding your balances and recent transactions is now faster than ever."
        />
      </div>
    </div>
  );
};

const UpdateCard = ({ version, date, title, description }: { version: string, date: string, title: string, description: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
  >
    <div className="flex justify-between items-center mb-4">
      <span className="text-[#ED0711] font-bold text-sm">{version}</span>
      <span className="text-gray-500 text-xs">{date}</span>
    </div>
    <h2 className="text-gray-900 font-bold text-lg mb-2">{title}</h2>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

export default WhatsNewView;
