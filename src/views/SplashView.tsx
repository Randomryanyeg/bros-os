
import React, { useEffect } from 'react';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';
import { motion } from 'motion/react';

interface SplashViewProps {
  onComplete?: () => void;
}

const SplashView: React.FC<SplashViewProps> = ({ onComplete }) => {
  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <motion.div 
      className="absolute inset-0 bg-[#ED0711] flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          scale: {
            type: "spring",
            damping: 12,
            stiffness: 100
          }
        }}
        className="flex flex-col items-center"
      >
        <ScotiaLogoSVG color="white" className="w-20 h-20" />
      </motion.div>
    </motion.div>
  );
};

export default SplashView;
