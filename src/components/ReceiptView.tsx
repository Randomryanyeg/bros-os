import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Folder, ChevronDown } from 'lucide-react';

interface ReceiptViewProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  transferDetails: {
    referenceNumber: string;
    newBalance?: string;
    accountName: string;
    recipientName: string;
    recipientEmail?: string;
    amount: string;
    date: string;
    status?: string;
    securityQuestion?: string;
    securityAnswer?: string;
    message?: string;
    transactionType?: string;
  };
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ isOpen, onClose, title = 'Confirmation', message = 'Your transfer was accepted!', transferDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && transferDetails && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 z-[500] flex flex-col bg-[#F4F5F7] w-full h-full text-[#333333] font-sans"
        >
          {/* Modal Header */}
          <div className="px-4 py-4 flex justify-between items-center bg-white border-b border-gray-200 relative shrink-0">
            <div className="w-8" /> {/* Spacer for centering */}
            <h2 className="text-[19px] font-normal text-[#333333]">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black p-1">
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6 mb-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-full border-[2px] border-[#008751] flex items-center justify-center mb-4">
                  <Check size={32} className="text-[#008751]" strokeWidth={2} />
                </div>
                
                <h2 className="text-[22px] font-normal text-[#333333] text-center">{message}</h2>
              </div>

              <div className="w-full border border-gray-200 rounded-lg p-4 mb-8 flex items-center gap-4">
                <Folder size={28} className="text-[#E31837]" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[15px] text-gray-500">Reference number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#333333] text-[15px]">{transferDetails.referenceNumber}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(transferDetails.referenceNumber);
                      }} 
                      className="text-[#E31837] text-xs font-bold underline active:opacity-60 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Section */}
              <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => {
                    setIsExpanded(!isExpanded);
                  }}
                  className="w-full p-4 flex items-center justify-between bg-gray-50"
                >
                  <span className="font-bold text-[15px]">View transfer details</span>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="py-4">
                        <div className="text-[15px] text-gray-500 mb-1">From</div>
                        <div className="font-bold text-[#333333] text-[16px]">
                          {transferDetails.accountName}
                        </div>
                        {transferDetails.newBalance && (
                          <div className="text-[14px] text-gray-500 mt-0.5">{transferDetails.newBalance}</div>
                        )}
                      </div>

                      <div className="h-px bg-gray-200 my-2" />

                      <div className="py-4">
                        <div className="text-[15px] text-gray-500 mb-1">To</div>
                        <div className="font-bold text-[#333333] text-[16px]">
                          {transferDetails.recipientName}
                        </div>
                        {transferDetails.recipientEmail && (
                          <div className="text-[14px] text-gray-500 mt-0.5">{transferDetails.recipientEmail}</div>
                        )}
                      </div>

                      <div className="h-px bg-gray-200 my-2" />

                      <div className="py-4">
                        <div className="text-[15px] text-gray-500 mb-1">Amount</div>
                        <div className="font-bold text-[#333333] text-[18px]">
                          {sessionStorage.getItem('receipt_amount_shown') === 'true' 
                            ? '---' 
                            : (() => {
                                sessionStorage.setItem('receipt_amount_shown', 'true');
                                return transferDetails.amount;
                              })()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-white shrink-0">
            <button 
              onClick={() => {
                sessionStorage.removeItem('receipt_amount_shown');
                onClose();
              }}
              className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReceiptView;
