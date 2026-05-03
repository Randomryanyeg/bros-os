import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, HelpCircle, Search, DollarSign } from 'lucide-react';
import { ManagePayeesIcon, SwitchBillsIcon } from '../components/ScotiaIcons';

interface BillsViewProps {
  onBack: () => void;
  onAction: (action: string) => void;
  theme?: 'light' | 'dark';
}

const BillsView: React.FC<BillsViewProps> = ({ onAction }) => {
  const [activeTab, setActiveTab] = useState<'Make a payment' | 'Manage bills'>('Manage bills');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`absolute inset-0 z-[100] flex flex-col font-sans bg-[#F4F4F4] text-[#1A1A1A]`}
    >
      {/* Header */}
      <div className={`pt-12 pb-4 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-200`}>
        <div className="w-10" /> {/* Spacer for centering */}
        <h1 className={`text-[16px] font-bold text-gray-900`}>Bills</h1>
        <button className="p-2">
          <HelpCircle size={24} strokeWidth={1.5} className={'text-gray-900'} />
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex shrink-0 bg-white border-b border-gray-200`}>
        {['Make a payment', 'Manage bills'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'Make a payment' | 'Manage bills')}
            className={`flex-1 py-4 text-[14px] font-bold relative ${activeTab === tab ? 'text-[#ED0711]' : 'text-gray-500'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="billsTab" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ED0711]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'Manage bills' ? (
            <motion.div 
              key="manage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 space-y-4"
            >
              {/* Top Cards */}
              <div className="space-y-3">
                <button 
                  onClick={() => onAction('Manage payees')}
                  className={`w-full rounded-xl p-4 flex items-center justify-between shadow-sm transition-colors bg-white active:bg-gray-50 border border-gray-200`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-gray-100`}>
                      <ManagePayeesIcon size={24} color="#007A33" />
                    </div>
                    <span className={`font-bold text-[14px] text-gray-900`}>Manage payees</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>

                <button 
                  onClick={() => onAction('Switch bills')}
                  className={`w-full rounded-xl p-4 flex items-center justify-between shadow-sm transition-colors bg-white active:bg-gray-50 border border-gray-200`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-gray-100`}>
                      <SwitchBillsIcon size={24} color="#005EB8" />
                    </div>
                    <span className={`font-bold text-[14px] text-gray-900`}>Switch my bills to Scotia</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Payment Schedule */}
              <div className={`rounded-xl shadow-sm overflow-hidden bg-white border border-gray-200`}>
                <div className="p-4">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment schedule (10)</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className={`font-bold text-[14px] text-gray-900`}>Taxes <span className="text-gray-500 font-normal">(1234)</span></p>
                      <p className="text-[12px] text-gray-500 mt-1">Payment date: <span className={'text-gray-700'}>Nov 12, 2020</span></p>
                      <p className="text-[12px] text-gray-500">$500.00</p>
                    </div>
                    <ChevronRight size={24} className="text-[#8B5CF6]" />
                  </div>
                </div>
                
                <button className={`w-full border-t p-4 flex items-center justify-between transition-colors border-gray-50 active:bg-gray-50`}>
                  <span className={`font-bold text-[14px] text-gray-900`}>View all payments <span className="text-gray-500 font-normal">(8)</span></span>
                  <ChevronDown size={24} className="text-[#8B5CF6]" />
                </button>
              </div>

              {/* Payment History */}
              <div className={`rounded-xl shadow-sm overflow-hidden bg-white border border-gray-200`}>
                <div className="p-4">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Payment history (81)</h3>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`flex-1 flex items-center justify-between px-4 py-3 border rounded-lg border-gray-200`}>
                      <div className="flex items-center gap-3">
                        <Search size={20} className="text-gray-500" />
                        <span className={`text-[14px] font-medium text-gray-700`}>Last 90 days</span>
                      </div>
                      <ChevronDown size={20} className="text-[#8B5CF6]" />
                    </div>
                    <button className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors border-gray-200 active:bg-gray-50`}>
                      <Search size={22} className="text-[#8B5CF6]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase mb-2">Fri, Nov 06, 2020</p>
                      <p className={`font-bold text-[14px] text-gray-900`}>City Utilities <span className="text-gray-500 font-normal">(4321)</span></p>
                      <p className="text-[12px] text-gray-500 mt-1">Last payment: <span className={'text-gray-700'}>$100.00</span></p>
                    </div>
                    <ChevronRight size={24} className="text-[#8B5CF6]" />
                  </div>
                </div>
                
                <button className={`w-full border-t p-4 flex items-center justify-between transition-colors border-gray-50 active:bg-gray-50`}>
                  <span className={`font-bold text-[14px] text-gray-900`}>View all history <span className="text-gray-500 font-normal">(80)</span></span>
                  <ChevronDown size={24} className="text-[#8B5CF6]" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="pay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center justify-center text-center"
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-gray-100`}>
                <DollarSign size={40} className="text-gray-400" />
              </div>
              <h3 className={`text-base font-bold mb-2 text-gray-900`}>Make a payment</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Select a payee to make a payment or add a new one to get started.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default BillsView;
