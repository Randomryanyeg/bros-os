import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, HelpCircle, User, Menu, Phone } from 'lucide-react';

interface OTPVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumberEnding?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  phoneNumberEnding = '890'
}) => {
  // Force white mode for OTP verification as requested
  const isDark = false; 
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  }, [onSuccess]);

  useEffect(() => {
    if (isOpen) {
      const newCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10).toString()).join('');
      setGeneratedCode(newCode);
      setCode(['', '', '', '', '', '']);
      setIsLoading(false);
      setShowNotification(false);
      
      // Trigger fake notification after a short delay
      const timer = setTimeout(() => {
        setShowNotification(true);
        // Auto-fill code when notification appears as requested
        const codeArray = newCode.split('');
        setTimeout(() => {
          setCode(codeArray);
          // Auto-submit after a brief pause
          setTimeout(() => {
            handleSubmit();
          }, 1500);
        }, 1000);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, handleSubmit]);

  const handleNotificationClick = () => {
    setShowNotification(false);
    
    // Auto-fill code with the generated code
    const codeArray = generatedCode.split('');
    setCode(codeArray);
    
    // Auto-submit after a brief pause
    setTimeout(() => {
      handleSubmit();
    }, 800);
  };

  const handleInputChange = (index: number, value: string) => {
    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto-submit if all filled
      if (newCode.every(d => d !== '')) {
        setTimeout(() => handleSubmit(), 500);
      }
    } else {
      const newCode = [...code];
      // Only take the last character if multiple are somehow entered
      newCode[index] = value.slice(-1);
      setCode(newCode);
      
      // Auto-advance
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit if all filled
      if (newCode.every(d => d !== '')) {
        setTimeout(() => handleSubmit(), 500);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className={`absolute inset-0 z-[1000] flex flex-col font-sans ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F4F5F7] text-[#333333]'}`}
        >
      {/* Fake OS Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 16, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`absolute top-0 left-4 right-4 z-[1100] backdrop-blur-md rounded-2xl shadow-lg p-4 cursor-pointer border ${isDark ? 'bg-[#1E1E1E]/90 border-white/10' : 'bg-white/90 border-gray-200'}`}
            onClick={handleNotificationClick}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Messages • now</span>
            </div>
            <div className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Scotiabank</div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your Scotiabank verification code is {generatedCode}. Do not share this code.</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={`${isDark ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-200'} px-4 py-3 flex items-center justify-between border-b shrink-0`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ED0711] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg italic">S</span>
          </div>
        </div>
        <div className={`flex items-center gap-4 ${isDark ? 'text-white' : 'text-[#333333]'}`}>
          <HelpCircle size={24} strokeWidth={1.5} />
          <User size={24} strokeWidth={1.5} />
          <Menu size={24} strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <div className={`px-6 py-5 shrink-0 ${isDark ? 'bg-[#121212]' : 'bg-[#F4F5F7]'}`}>
        <h1 className={`text-[28px] font-bold ${isDark ? 'text-white' : 'text-[#333333]'}`}>2-step verification</h1>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isDark ? 'bg-[#121212]' : 'bg-white'} border-t ${isDark ? 'border-white/5' : 'border-gray-200'} px-6 py-8`}>
        <div className="mb-6">
          <div className="w-12 h-16 bg-[#FFC000] rounded-lg relative flex items-center justify-center mb-2">
            <div className="absolute inset-x-0 bottom-2 flex justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="w-8 h-10 border-2 border-white rounded-t-full rounded-b-md absolute top-2 flex items-center justify-center bg-[#008751]">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className={`w-8 h-1 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-full mx-2`}></div>
        </div>

        <h2 className={`text-[24px] font-bold ${isDark ? 'text-white' : 'text-[#333333]'} mb-4`}>Let's confirm it's you</h2>
        
        <p className={`text-[18px] ${isDark ? 'text-gray-300' : 'text-[#333333]'} mb-8 leading-relaxed`}>
          We sent a <span className="font-bold">verification code</span> to your phone number ending with <span className="font-bold">*******{phoneNumberEnding}</span>.
        </p>

        <div className="mb-8">
          <label className={`block text-[15px] font-bold ${isDark ? 'text-gray-300' : 'text-[#333333]'} mb-3`}>Enter 6-digit code</label>
          <div className="flex gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className={`w-12 h-14 ${isDark ? 'bg-[#1E1E1E] text-white' : 'bg-[#F4F5F7] text-[#333333]'} border-b-2 ${digit || document.activeElement === inputRefs.current[index] ? 'border-[#008751]' : (isDark ? 'border-gray-600' : 'border-gray-300')} text-center text-xl font-bold focus:outline-none focus:bg-gray-800`}
              />
            ))}
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-[#555555]'} font-bold text-[15px] mb-8`}>
          <Phone size={20} />
          <span>Resend code by phone call in 58 seconds</span>
        </div>

        <p className={`text-[15px] ${isDark ? 'text-gray-400' : 'text-[#333333]'}`}>
          Need help? Try these <span className="border-b border-dashed border-gray-400 pb-0.5 cursor-pointer">troubleshooting tips.</span>
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className={`${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} px-6 py-6 flex items-center justify-between shrink-0`}>
        <button onClick={onClose} className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#333333]'} font-bold text-[16px]`}>
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="flex items-center gap-4">
          <span className={`${isDark ? 'text-white' : 'text-[#333333]'} font-bold text-[16px]`}>Submit code</span>
          <button 
            onClick={handleSubmit}
            disabled={code.some(d => !d) || isLoading}
            className={`w-14 h-14 rounded-full border ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-[#333333]'} flex items-center justify-center disabled:opacity-50 relative`}
          >
            {isLoading ? (
              <div className={`w-6 h-6 border-2 ${isDark ? 'border-gray-600 border-t-[#ED0711]' : 'border-gray-300 border-t-[#ED0711]'} rounded-full animate-spin`}></div>
            ) : (
              <ArrowRight size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
