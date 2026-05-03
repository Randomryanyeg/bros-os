import React from 'react';
import { ChevronRightIcon } from '../components/ScotiaIcons';

interface PerksViewProps {
  onBack: () => void;
}

const PerksView: React.FC<PerksViewProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full animate-in slide-in-from-right">
      <div className="pt-12 pb-4 px-6 flex items-center border-b border-gray-100 shrink-0 relative bg-white">
        <button onClick={onBack} className="absolute left-6 text-gray-500 active:scale-90 transition-transform rotate-180">
          <ChevronRightIcon size={24} color="currentColor" />
        </button>
        <h1 className="text-gray-900 text-[17px] font-bold w-full text-center">Scotiabank Arena Perks</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#F4F4F4]">
        <div className="mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ED0711" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </div>

        <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-4">
          Being a Scotia client gets you closer to the game
        </h2>

        <p className="text-[15px] text-gray-600 leading-relaxed mb-8">
          Enjoy a range of benefits with our Scotia Perks pass — a new program that offers special experiences, exclusive access, and extras — for Scotia clients only.
        </p>

        <div className="rounded-[16px] overflow-hidden mb-8 relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#ED0711] to-[#9e0000]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gray-900 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold tracking-widest uppercase -rotate-90 whitespace-nowrap">Access pass</span>
          </div>
          
          <div className="relative p-8 pr-20">
            <div className="w-1 h-6 bg-white/50 rounded-full absolute left-4 top-1/2 -translate-y-1/2"></div>
            <h3 className="text-white font-serif text-2xl mb-1">Scotia Perks</h3>
            <p className="text-white font-serif italic text-xl">You're in.</p>
          </div>
        </div>

        <p className="text-[14px] text-gray-600 leading-relaxed mb-4">
          Show your digital Scotia Perks pass at locations in Scotiabank Arena to have all the fun.
        </p>

        <button className="text-[#ED0711] font-bold text-[14px] flex items-center gap-1">
          Learn more <span className="text-xs">↗</span>
        </button>
      </div>
    </div>
  );
};

export default PerksView;
