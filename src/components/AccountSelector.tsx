import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { ScotiaAccountMap } from '../shared/types';

interface AccountSelectorProps {
  accounts: ScotiaAccountMap;
  onSelect: (account: string) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({ accounts, onSelect, onClose, theme = 'light' }) => {
  const isDark = false;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className={`absolute inset-0 z-[300] flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'}`}
    >
      <div className={`pt-12 pb-4 px-4 flex items-center border-b ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-100'} relative`}>
        <button onClick={onClose} className="p-2 -ml-2 z-10">
          <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-[#4A4A4A]'} />
        </button>
        <h1 className={`absolute inset-x-0 text-center font-bold text-[17px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Select account</h1>
        <div className="w-8" />
      </div>
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
        {Object.entries(accounts).map(([name, acc]) => (
          <button
            key={name}
            onClick={() => { onSelect(name); onClose(); }}
            className={`w-full p-5 flex items-center justify-between rounded-2xl border transition-all active:scale-[0.98] ${isDark ? 'bg-[#1E1E1E] border-white/5 active:bg-white/5' : 'bg-white border-gray-100'}`}
          >
            <div className="flex flex-col items-start w-full gap-1">
              <div className={`font-bold text-[17px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'} leading-tight`}>{name}</div>
              <div className={`text-[13px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {acc.accountNumber}
              </div>
              <div className="text-[18px] font-bold text-emerald-500 mt-1">
                ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <ChevronRight size={20} className="text-[#ED0711]" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};
