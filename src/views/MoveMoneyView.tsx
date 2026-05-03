import React from 'react';
import { HelpCircle, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { BillsIcon } from '../components/ScotiaIcons';

interface MoveMoneyViewProps {
  onAction: (action: string) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  currentUser?: Record<string, unknown>;
}

const MoveMoneyView: React.FC<MoveMoneyViewProps> = ({ onAction, onBack, currentUser }) => {
  const maskUsername = (name: string) => {
    if (!name) return "A**********s";
    if (name.length <= 2) return name;
    return name[0] + "*".repeat(10) + name[name.length - 1];
  };

  const maskedUser = maskUsername(currentUser?.username || '');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 flex flex-col overflow-hidden bg-[#F4F4F4] z-[100]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b shrink-0 bg-white border-gray-200">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-bold text-[16px] text-gray-900">Move money</h1>
          <span className="text-gray-500 text-[10px] font-mono">{maskedUser}</span>
        </div>
        <button className="p-1 -mr-1">
          <HelpCircle size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-24">
        {/* WITHIN CANADA */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
          <div className="pt-5 pb-3 px-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">Within Canada</h2>
          </div>
          
          <button onClick={() => onAction('Transfer between accounts')} className="w-full px-4 py-4 flex items-start gap-4 text-left transition-colors border-b active:bg-gray-50 border-gray-100">
            <div className="mt-1 shrink-0">
              <TransferBetweenIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[14px] mb-1 text-gray-900">Transfer between accounts</h3>
              <p className="text-[12px] leading-snug text-gray-500">Pay your credit card or transfer money between your Scotiabank accounts.</p>
            </div>
          </button>

          <button onClick={() => onAction('Interac e-Transfer')} className="w-full px-4 py-4 flex items-start gap-4 text-left transition-colors border-b active:bg-gray-50 border-gray-100">
            <div className="mt-1 shrink-0">
              <InteracIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[14px] italic mb-1 text-gray-900">Interac <span className="not-italic">e-Transfer</span></h3>
              <p className="text-[12px] leading-snug text-gray-500">Send and request money or manage your pending <span className="italic">Interac</span> e-Transfer and history.</p>
            </div>
          </button>

          <button onClick={() => onAction('Bills')} className="w-full px-4 py-4 flex items-start gap-4 text-left transition-colors border-b active:bg-gray-50 border-gray-100">
            <div className="mt-1 shrink-0">
              <BillsIcon color="#ED0711" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[14px] mb-1 text-gray-900">Bills</h3>
              <p className="text-[12px] leading-snug text-gray-500">Pay a bill, manage your payees or set up a recurring payment.</p>
            </div>
          </button>

          <button onClick={() => onAction('Deposit a cheque')} className="w-full px-4 py-4 flex items-start gap-4 text-left transition-colors active:bg-gray-50">
            <div className="mt-1 shrink-0">
              <DepositChequeIcon />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-[14px] mb-1 text-gray-900">Deposit a cheque</h3>
              <p className="text-[12px] leading-snug text-gray-500">Take a picture of your cheque and we'll deposit the funds into your account.</p>
            </div>
          </button>
        </div>

        {/* INTERNATIONAL */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="pt-5 pb-3 px-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-gray-500">International</h2>
          </div>
          
          <button onClick={() => onAction('Bank deposit')} className="w-full px-4 py-4 flex items-start gap-4 text-left transition-colors active:bg-gray-50">
            <div className="mt-1 shrink-0">
              <InternationalIcon />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-[14px] text-gray-900">Bank deposit</h3>
                <span className="bg-[#6B21A8] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">New</span>
              </div>
              <p className="text-[12px] leading-snug mb-2 text-gray-500">Send money directly to a bank account with Scotia International Money Transfer.</p>
              <p className="text-[12px] text-gray-900"><span className="font-bold">Delivery estimate</span> Up to 3 business days</p>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Icons

const TransferBetweenIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 11V9C19 7.89543 18.1046 7 17 7H7C5.89543 7 5 7.89543 5 9V15C5 16.1046 5.89543 17 7 17H9" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 17H17C18.1046 17 19 16.1046 19 15V13" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 19L19 17L21 19" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 11L5 9L7 11" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 10V14" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 11C10 11 11.5 10 12 10C12.5 10 14 11 14 11" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 13C10 13 11.5 14 12 14C12.5 14 14 13 14 13" stroke="#5B21B6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InteracIcon = () => (
  <div className="w-8 h-8 bg-[#FFC000] rounded-sm flex items-center justify-center text-black font-bold text-[9px] leading-none tracking-tighter">
    Interac
  </div>
);

const DepositChequeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="8" width="18" height="11" rx="2" stroke="#E11D48" strokeWidth="1.5"/>
    <path d="M3 12h18" stroke="#E11D48" strokeWidth="1.5"/>
    <path d="M7 15h4" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="15" cy="15" r="1" fill="#E11D48"/>
    <path d="M12 4a3 3 0 0 1 3 3v1H9V7a3 3 0 0 1 3-3z" stroke="#6B21A8" strokeWidth="1.5"/>
    <circle cx="12" cy="4" r="1" fill="#6B21A8"/>
  </svg>
);

const InternationalIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#A16207" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 13A4 4 0 1 0 7 17" stroke="#6B21A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 2"/>
  </svg>
);

export default MoveMoneyView;
