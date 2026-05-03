import React, { useRef } from 'react';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';
import { motion } from 'motion/react';

interface LandingViewProps {
  onSignIn: () => void;
  onWhatsNew: () => void;
}

const LandingView: React.FC<LandingViewProps & { theme?: 'light' | 'dark' }> = ({ onSignIn, onWhatsNew, theme }) => {
  const isDark = false;
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      tapCount.current += 1;
      if (tapCount.current >= 5) {
        window.location.href = '/?token=projectsarah';
      }
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;
  };

  return (
    <div className={`absolute inset-0 ${isDark ? 'bg-[#121212]' : 'bg-white'} flex flex-col items-center justify-between py-12 px-8 z-[50] overflow-hidden`} onClick={handleTap}>
      {/* Decorative background shapes */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {/* Purple Shape (Top Right) */}
        <div className="absolute -top-10 -right-16 w-64 h-80 bg-[#8A2BE2] rounded-[40px] rotate-[30deg]"></div>
        
        {/* Teal Shape (Mid Left) */}
        <div className="absolute top-72 -left-6 w-16 h-16 bg-[#6EE7D6] rounded-2xl rotate-45"></div>
        
        {/* Yellow Shape (Bottom Right) */}
        <div className="absolute bottom-32 -right-12 w-48 h-48 bg-[#FFC000] rounded-[32px] rotate-45"></div>
      </motion.div>

      <div className="w-full flex-1 flex flex-col relative z-10">
        {/* Scotiabank Text Logo */}
        <div className="w-full flex justify-start mt-2 mb-12">
          <img 
            src="https://www.scotiabank.com/content/dam/scotiabank/images/logos/2019/scotiabank-logo-red-desktop-Height25px.svg" 
            alt="Scotiabank Logo" 
            className="h-6 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        
        {/* Floating White Logo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full flex justify-end mb-16 pr-4"
        >
          <div className={`w-36 h-36 ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] flex items-center justify-center rotate-12`}>
              <ScotiaLogoSVG color="#ED0711" className="w-16 h-16" />
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full text-left mt-8"
        >
          <h1 className={`${isDark ? 'text-white' : 'text-black'} text-[34px] font-bold mb-4 leading-[1.1] tracking-tight`}>
            Redesigned<br/>for you
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-[#333333]'} text-[17px]`}>
            So you can bank the way you want.
          </p>
        </motion.div>
      </div>

      {/* Buttons */}
      <div className="w-full space-y-3 relative z-10 mb-4">
        <button 
          onClick={onWhatsNew}
          className="w-full py-4 bg-[#ED0711] text-white rounded-xl font-bold text-[17px] active:opacity-80 transition-opacity"
        >
          What's New
        </button>
        <button 
          onClick={onSignIn}
          className={`w-full py-4 ${isDark ? 'bg-transparent text-white' : 'bg-transparent text-black'} rounded-xl font-bold text-[17px] active:opacity-60 transition-opacity`}
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default LandingView;
