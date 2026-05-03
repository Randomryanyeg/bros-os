import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ScotiaAccountMap } from '../shared/types';
import { ChevronRightIcon } from '../components/ScotiaIcons';

interface InteracSettingsViewProps {
  onBack: () => void;
  accounts: ScotiaAccountMap;
  theme: 'light' | 'dark';
}

const InteracSettingsView: React.FC<InteracSettingsViewProps> = ({ onBack, accounts }) => {
  const [senderName, setSenderName] = useState('John Doe');
  const [email, setEmail] = useState('john.doe@email.com');
  const [autoDeposit, setAutoDeposit] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(Object.keys(accounts)[0]);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 flex flex-col z-[200] overflow-hidden bg-[#F5F6F8]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b shrink-0 bg-white border-gray-200">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-[#121212]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="font-bold text-[17px] ml-2 text-[#121212]">Interac Settings</h1>
        </div>
        <button onClick={onBack} className="text-sm font-bold text-[#ED0711]">Done</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        
        {/* Sender Profile */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">Sender Profile</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">Name</label>
              <input 
                type="text" 
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-medium text-[16px] text-[#121212]"
              />
            </div>
            <div className="p-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 text-gray-400">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none outline-none font-medium text-[16px] text-[#121212]"
              />
            </div>
          </div>
        </section>

        {/* Autodeposit */}
        <section>
          <div className="flex items-center justify-between px-2 mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Autodeposit</h2>
            <span className="bg-[#ED0711] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">Recommended</span>
          </div>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1 pr-4">
                <div className="font-bold text-[16px] mb-1 text-[#121212]">Enable Autodeposit</div>
                <div className="text-[13px] leading-snug text-gray-500">Skip the security question and have money deposited directly into your account.</div>
              </div>
              <button 
                onClick={() => setAutoDeposit(!autoDeposit)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${autoDeposit ? 'bg-[#00A78E]' : 'bg-gray-300'}`}
              >
                <motion.div 
                  animate={{ x: autoDeposit ? 24 : 0 }}
                  className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                />
              </button>
            </div>
            
            {autoDeposit && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-2 text-gray-400">Deposit to</label>
                <div className="space-y-2">
                  {Object.keys(accounts).filter(k => accounts[k].type === 'banking').map(name => (
                    <button 
                      key={name}
                      onClick={() => setSelectedAccount(name)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className={`text-[15px] ${selectedAccount === name ? 'font-bold text-[#ED0711]' : 'text-[#121212]'}`}>{name}</span>
                      {selectedAccount === name && <div className="w-2 h-2 rounded-full bg-[#ED0711]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">Security</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <button className="w-full p-4 flex items-center justify-between text-left border-b border-gray-100 active:bg-gray-50">
              <span className="font-bold text-[15px] text-[#121212]">Manage security questions</span>
              <ChevronRightIcon size={18} className="text-gray-400" />
            </button>
            <button className="w-full p-4 flex items-center justify-between text-left active:bg-gray-50">
              <span className="font-bold text-[15px] text-[#121212]">Blocked contacts</span>
              <ChevronRightIcon size={18} className="text-gray-400" />
            </button>
          </div>
        </section>

        <p className="text-[11px] text-center px-6 leading-relaxed text-gray-400">
          By enabling Autodeposit, you agree to the Interac e-Transfer Terms and Conditions.
        </p>

      </div>
    </motion.div>
  );
};

export default InteracSettingsView;
