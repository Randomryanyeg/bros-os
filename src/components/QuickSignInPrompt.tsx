import React from 'react';
import { ScotiaLogoSVG } from './ScotiaIcons';
import { Check } from 'lucide-react';

interface QuickSignInPromptProps {
  onYes: () => void;
  onNo: () => void;
}

const QuickSignInPrompt: React.FC<QuickSignInPromptProps> = ({ onYes, onNo }) => {
  return (
    <div className="flex flex-col bg-white p-8 pt-16 h-full font-sans justify-between">
      <div className="flex justify-between items-start">
        <ScotiaLogoSVG color="#ED0711" className="w-12 h-12" />
        <div className="w-20 h-20 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
          <Check size={40} className="text-[#ED0711]" />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick sign in</h2>
        <p className="text-lg text-gray-600">Remember my card number or username each time I sign in?</p>
      </div>
        
      <div className="flex flex-col gap-4">
        <button 
          onClick={onYes}
          className="w-full py-4 bg-[#ED0711] text-white rounded-xl font-bold text-lg flex items-center justify-between px-6"
        >
          Yes, remember me
          <Check size={24} />
        </button>
        <button 
          onClick={onNo}
          className="w-full py-4 bg-white text-[#ED0711] border-2 border-[#ED0711] rounded-xl font-bold text-lg"
        >
          No thanks
        </button>
      </div>
    </div>
  );
};

export default QuickSignInPrompt;
