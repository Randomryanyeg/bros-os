import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'motion/react';
import { ArrowLeft, HelpCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { ScotiaAccountMap } from '../shared/types';

interface TransferBetweenAccountsViewProps {
  accounts: ScotiaAccountMap;
  onBack: () => void;
  onTransfer: (from: string, to: string, amount: number, desc: string) => Promise<void>;
  theme?: 'light' | 'dark';
}

const TransferBetweenAccountsView: React.FC<TransferBetweenAccountsViewProps> = ({ 
  accounts, onBack, onTransfer 
}) => {
  const [fromAccount, setFromAccount] = useState<string | null>(null);
  const [toAccount, setToAccount] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [isSelecting, setIsSelecting] = useState<'from' | 'to' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const controls = useAnimation();
  const x = useMotionValue(0);

  useEffect(() => {
    if (!sliderRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSliderWidth(entry.contentRect.width);
      }
    });
    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, []);

  const accountList = Object.keys(accounts);
  const numAmount = parseFloat(amount);
  const isValid = fromAccount && toAccount && amount && !isNaN(numAmount) && numAmount > 0 && !isProcessing;

  const handleDragEnd = async () => {
    if (x.get() > sliderWidth * 0.5 && isValid) {
      await controls.start({ x: sliderWidth - 56 });
      await handleTransfer();
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
      x.set(0);
    }
  };

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount || isProcessing) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsProcessing(true);
    setError(null);
    try {
      await onTransfer(fromAccount, toAccount, numAmount, `Transfer to ${toAccount}`);
      setIsSuccess(true);
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-black">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Successfully deposited</h2>
        <p className="text-gray-500 text-center">Your transfer has been completed successfully.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 flex flex-col z-[100] bg-[#F8F9FA] text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-[15px] font-bold tracking-tight">Transfer</h1>
        <button className="p-2 -mr-2">
          <HelpCircle size={24} strokeWidth={1.5} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="rounded-2xl border overflow-hidden shadow-xl bg-white border-gray-200">
          {/* From Account */}
          <button 
            onClick={() => setIsSelecting('from')}
            className="w-full p-4 flex justify-between items-center border-b bg-white border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ED0711]/20 flex items-center justify-center shrink-0">
                <span className="text-[#ED0711] font-bold">F</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] mb-0.5 text-gray-500">From</p>
                {fromAccount ? (
                  <p className="font-bold text-[13px] text-black">{fromAccount}</p>
                ) : (
                  <p className="font-bold text-[13px] text-black">Select Account</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {fromAccount && (
                <p className="text-[13px] font-medium text-black">
                  ${accounts[fromAccount].balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </button>

          {/* To Account */}
          <button 
            onClick={() => setIsSelecting('to')}
            className="w-full p-4 flex justify-between items-center bg-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ED0711]/20 flex items-center justify-center shrink-0">
                <span className="text-[#ED0711] font-bold">T</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] mb-0.5 text-gray-500">To</p>
                {toAccount ? (
                  <p className="font-bold text-[13px] text-black">{toAccount}</p>
                ) : (
                  <p className="font-bold text-[13px] text-black">Select Account</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {toAccount && (
                <p className="text-[13px] font-medium text-black">
                  ${accounts[toAccount].balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </button>
        </div>

        {/* Amount */}
        <div className="rounded-2xl border shadow-xl overflow-hidden bg-white border-gray-200">
          <div className="p-4">
            <p className="text-[11px] mb-2 text-gray-500">Amount</p>
            <div className="flex items-center">
              <span className="text-3xl font-light mr-1 text-gray-500">$</span>
              <input 
                type="number" 
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-4xl font-light text-black placeholder-gray-300"
              />
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <div className="mt-auto pt-6">
          <div ref={sliderRef} className={`relative h-14 rounded-full border overflow-hidden flex items-center shadow-sm bg-white border-gray-200 ${!isValid ? 'opacity-50' : ''}`}>
            <motion.div
              drag={isValid ? "x" : false}
              dragConstraints={{ left: 0, right: sliderWidth - 56 }}
              dragDirectionLock
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x }}
              className={`absolute left-1 top-1 w-12 h-12 rounded-full flex items-center justify-center z-10 ${isValid ? 'bg-[#ED0711] cursor-grab active:cursor-grabbing' : 'bg-gray-600 cursor-not-allowed'}`}
            >
              <ArrowRight size={24} className="text-white" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center font-medium pointer-events-none text-gray-500">
              {isProcessing ? 'Processing...' : 'Slide to transfer'}
            </div>
          </div>
        </div>
      </div>

      {/* Account Selection Modal */}
      {isSelecting && (
        <div className="absolute inset-0 z-[200] flex flex-col bg-black/60 backdrop-blur-sm">
          <div className="flex-1" onClick={() => setIsSelecting(null)} />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full max-h-[70%] rounded-t-3xl p-6 overflow-y-auto bg-white"
          >
            <h3 className="text-xl font-bold mb-6 text-gray-900">Select Account</h3>
            <div className="space-y-3">
              {accountList.map(accName => (
                <button 
                  key={accName}
                  onClick={() => {
                    if (isSelecting === 'from') setFromAccount(accName);
                    else setToAccount(accName);
                    setIsSelecting(null);
                  }}
                  className="w-full p-5 rounded-2xl border text-left flex justify-between items-center bg-gray-50 border-gray-200"
                >
                  <div>
                    <p className="font-bold text-gray-900">{accName}</p>
                    <p className="text-xs text-gray-500">${accounts[accName].balance.toLocaleString()}</p>
                  </div>
                  {(isSelecting === 'from' ? fromAccount === accName : toAccount === accName) && (
                    <div className="w-6 h-6 bg-[#ED0711] rounded-full flex items-center justify-center">
                      <Check size={14} color="white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const Check = ({ size, color, strokeWidth }: { size: number, color: string, strokeWidth: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default TransferBetweenAccountsView;
