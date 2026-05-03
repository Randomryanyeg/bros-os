import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Shield, CreditCard, Bell, Lock, Smartphone, Info } from 'lucide-react';
import { useBank } from '../shared/BankContext';

interface ManageAccountViewProps {
  accountName: string;
  onBack: () => void;
  theme?: 'light' | 'dark';
}

const ManageAccountView: React.FC<ManageAccountViewProps> = ({ accountName, onBack, theme = 'light' }) => {
  const isDark = false;
  const { user } = useBank();
  const account = user?.accounts[accountName];

  const settings = [
    { title: 'Security', items: [
      { label: 'Face ID for this account', icon: <Shield size={20} className="text-blue-400" />, value: 'Enabled' },
      { label: 'Transaction alerts', icon: <Bell size={20} className="text-pink-400" />, value: 'On' },
      { label: 'Lock this card', icon: <Lock size={20} className="text-red-400" />, isToggle: true }
    ]},
    { title: 'Account Info', items: [
      { label: 'Account number', icon: <Info size={20} className="text-gray-400" />, value: account?.accountNumber || '**** 3456' },
      { label: 'Transit number', icon: <Info size={20} className="text-gray-400" />, value: account?.accountNumber?.split('-')[0] || '12345' },
      { label: 'Institution number', icon: <Info size={20} className="text-gray-400" />, value: account?.accountNumber?.split('-')[1] || '002' }
    ]},
    { title: 'Cards', items: [
      { label: 'Replace card', icon: <CreditCard size={20} className="text-emerald-400" /> },
      { label: 'Add to Apple Wallet', icon: <Smartphone size={20} className="text-black bg-white rounded-md p-0.5" /> }
    ]}
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`absolute inset-0 z-[200] flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'}`}
    >
      {/* Header */}
      <div className={`pt-12 pb-4 px-4 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-100'}`}>
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft size={24} strokeWidth={1.5} className={isDark ? 'text-gray-400' : 'text-[#4A4A4A]'} />
        </button>
        <h1 className="font-medium text-[17px]">Manage {accountName.split(' ')[0]}</h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-12">
        <div className="p-4">
          {settings.map((section, sIdx) => (
            <div key={sIdx} className="mb-8">
              <h3 className={`px-2 mb-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {section.title}
              </h3>
              <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-200'}`}>
                {section.items.map((item, iIdx) => (
                  <div 
                    key={iIdx}
                    className={`flex items-center gap-4 px-4 py-4 ${iIdx !== section.items.length - 1 ? (isDark ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}
                  >
                    <div className="w-8 flex justify-center">{item.icon}</div>
                    <span className="flex-1 text-[15px]">{item.label}</span>
                    {item.value && <span className="text-sm text-gray-500">{item.value}</span>}
                    {item.isToggle && (
                      <div className="w-10 h-5 bg-gray-600 rounded-full relative">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button className="w-full py-4 text-[#ED0711] font-bold border-2 border-[#ED0711] rounded-xl mt-4">
            Close this account
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageAccountView;
