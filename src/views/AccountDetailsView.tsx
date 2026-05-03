import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ChevronRight, Search, Filter, ChevronLeft, ChevronDown, Check, Folder, RefreshCw, ArrowDown, Share2, FileText } from 'lucide-react';
import bwipjs from 'bwip-js';

interface AccountDetailsViewProps {
  accountName: string;
  balance: number;
  onHold?: number;
  history: Record<string, unknown>[];
  onBack: () => void;
  onAction: (action: string) => void;
  currentUser: Record<string, unknown>;
  onBalanceChange: (newBalance: number) => void;
}

const AccountDetailsView: React.FC<AccountDetailsViewProps> = ({ 
  accountName, 
  balance, 
  onHold = 0,
  history, 
  onBack, 
  onAction, 
  onBalanceChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBalance, setTempBalance] = useState(balance || 0);
  const [selectedTransaction, setSelectedTransaction] = useState<Record<string, unknown> | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const [sortConfig, setSortConfig] = useState<{ field: 'date' | 'description' | 'amount' | 'category', direction: 'asc' | 'desc' }>({ field: 'date', direction: 'desc' });
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullDistance = useMotionValue(0);
  const pullOpacity = useTransform(pullDistance, [0, 60], [0, 1]);
  const pullRotate = useTransform(pullDistance, [0, 100], [0, 360]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    pullDistance.set(0);
  };

  const handleDragEnd = () => {
    if (pullDistance.get() > 60) {
      handleRefresh();
    } else {
      pullDistance.set(0);
    }
  };

  // Apply sorting
  const sortedHistory = [...history].sort((a, b) => {
    let comparison = 0;
    if (sortConfig.field === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortConfig.field === 'description') {
      comparison = (a.description || '').localeCompare(b.description || '');
    } else if (sortConfig.field === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortConfig.field === 'category') {
      comparison = (a.category || '').localeCompare(b.category || '');
    }
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Group history by date
  const groupedHistory = sortedHistory.reduce((groups: Record<string, Record<string, unknown>[]>, item: Record<string, unknown>) => {
    const date = new Date(String(item.date)).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  useEffect(() => {
    if (selectedTransaction && barcodeRef.current) {
      try {
        const refNum = selectedTransaction.id || 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
        bwipjs.toCanvas(barcodeRef.current, {
          bcid: 'code128',
          text: refNum,
          scale: 2,
          height: 10,
          includetext: true,
          textxalign: 'center',
          textcolor: '333333',
        });
      } catch (e) {
        console.error('Barcode generation failed', e);
      }
    }
  }, [selectedTransaction]);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 bg-white flex flex-col z-[500] overflow-hidden font-sans"
    >
      {/* Red Top Section */}
      <div className="bg-[#ED0711] pt-12 pb-24 px-6 shrink-0 relative z-0">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-white p-2 -ml-2 active:scale-95 transition-transform">
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-white font-bold text-sm">
              {accountName.split(' ')[0]} (3456)
              <ChevronDown size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div className="w-8"></div>
        </div>
        
        <div className="text-center text-white">
          <div className="text-xs font-medium mb-1 opacity-80">Balance</div>
          {isEditing ? (
            <div className="flex justify-center items-center gap-2">
              <input 
                type="number" 
                value={tempBalance} 
                onChange={(e) => setTempBalance(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="text-3xl font-bold tracking-tight bg-transparent border-b border-white text-center w-32 text-white"
                autoFocus
                onBlur={() => { onBalanceChange(tempBalance); setIsEditing(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { onBalanceChange(tempBalance); setIsEditing(false); } }}
              />
            </div>
          ) : (
            <div 
              onClick={() => { setIsEditing(true); setTempBalance(balance); }}
              className="text-3xl font-bold tracking-tight flex flex-col justify-center items-center gap-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-sm font-medium opacity-80">On hold: ${onHold.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Card */}
      {!selectedTransaction && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 relative z-20 -mt-16 shrink-0"
        >
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6 flex justify-between items-center border border-gray-100">
            <ActionButton onClick={() => onAction('Transfer from')} icon={<TransferIcon />} label={"Transfer\nfrom"} />
            <ActionButton onClick={() => onAction('Send money')} icon={<SendMoneyIcon />} label="Send money" />
            <ActionButton onClick={() => onAction('Statements')} icon={<MoreIcon />} label="Statements" />
            <ActionButton onClick={() => onAction('Manage Account')} icon={<ManageIcon />} label="Manage" hasNotification />
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex items-center px-4 py-3 focus-within:border-[#ED0711] transition-colors shadow-sm">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transactions" 
                className="bg-transparent border-none outline-none text-gray-900 ml-3 w-full placeholder-gray-400 text-[14px]"
              />
            </div>
            <button onClick={() => onAction('Filter')} className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0 active:bg-gray-50 shadow-sm">
              <Filter size={20} className="text-gray-400" />
            </button>
            <button 
              onClick={() => {
                const fields: ('date' | 'description' | 'amount' | 'category')[] = ['date', 'description', 'amount', 'category'];
                const currentIndex = fields.indexOf(sortConfig.field);
                const nextField = fields[(currentIndex + 1) % fields.length];
                setSortConfig({ field: nextField, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
              }}
              className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shrink-0 active:bg-gray-50 shadow-sm"
            >
              <ArrowDown size={20} className={sortConfig.direction === 'asc' ? 'text-[#ED0711] rotate-180' : 'text-[#ED0711]'} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
        <motion.div 
          drag="y"
          dragConstraints={{ top: 0, bottom: isRefreshing ? 60 : 100 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          style={{ y: pullDistance }}
          className="flex-1 flex flex-col"
        >
          {/* Refresh Indicator */}
          <div className="absolute top-0 left-0 right-0 flex justify-center items-center h-[60px] -translate-y-full">
            <motion.div 
              style={{ opacity: pullOpacity, rotate: isRefreshing ? 0 : pullRotate }}
              className="bg-white rounded-full p-2 shadow-md border border-gray-100"
            >
              {isRefreshing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <RefreshCw size={20} className="text-[#ED0711]" />
                </motion.div>
              ) : (
                <ArrowDown size={20} className="text-[#ED0711]" />
              )}
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="px-4 pb-12 pt-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="space-y-6">
                  {Object.keys(groupedHistory).length > 0 ? (
                    Object.entries(groupedHistory).map(([date, items]) => (
                      <TransactionGroup key={date} date={date}>
                        {items.map((item) => (
                          <TransactionItem 
                            key={String(item.id)}
                            title={String(item.description)}
                            subtitle={String(item.category)}
                            amount={Number(item.amount)}
                            isPositive={Number(item.amount) > 0}
                            date={date}
                            status={String(item.status)}
                            onClick={() => setSelectedTransaction({ ...item, date })}
                          />
                        ))}
                      </TransactionGroup>
                    ))
                  ) : (
                    <div className="space-y-6">
                      <TransactionGroup date="MON, MAR 27, 2023">
                        <TransactionItem title="Deposit" subtitle="Free Interac e-transfer" amount={20.00} isPositive date="MON, MAR 27, 2023" onClick={() => setSelectedTransaction({ description: 'Deposit', category: 'Free Interac e-transfer', amount: 20.00, date: 'MON, MAR 27, 2023' })} />
                      </TransactionGroup>
                      
                      <TransactionGroup date="SAT, MAR 25, 2023">
                        <TransactionItem title="Deposit" subtitle="Free Interac e-transfer" amount={222.00} isPositive date="SAT, MAR 25, 2023" onClick={() => setSelectedTransaction({ description: 'Deposit', category: 'Free Interac e-transfer', amount: 222.00, date: 'SAT, MAR 25, 2023' })} />
                      </TransactionGroup>

                      <TransactionGroup date="TUE, FEB 28, 2023">
                        <TransactionItem title="Service Charge" subtitle="Record Keeping Fees" amount={-2.25} date="TUE, FEB 28, 2023" onClick={() => setSelectedTransaction({ description: 'Service Charge', category: 'Record Keeping Fees', amount: -2.25, date: 'TUE, FEB 28, 2023' })} />
                        <TransactionItem title="Service Charge" subtitle="" amount={-30.95} date="TUE, FEB 28, 2023" onClick={() => setSelectedTransaction({ description: 'Service Charge', category: '', amount: -30.95, date: 'TUE, FEB 28, 2023' })} />
                      </TransactionGroup>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 bg-[#F4F5F7] z-[9999] flex flex-col text-[#333333] font-sans"
          >
            {/* Modal Header */}
            <div className="px-4 py-4 flex justify-between items-center bg-white border-b border-gray-200 relative shrink-0">
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-500 hover:text-black p-1">
                <ChevronLeft size={24} strokeWidth={2} />
              </button>
              <h2 className="text-base font-bold text-[#333333]">Transaction Details</h2>
              <div className="flex gap-2">
                <button className="text-gray-500 p-1">
                  <Share2 size={20} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              <div className="p-6 mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-14 h-14 rounded-full border-[2px] border-[#008751] flex items-center justify-center mb-4">
                    <Check size={32} className="text-[#008751]" strokeWidth={2} />
                  </div>
                  
                  <h2 className="text-2xl font-normal text-[#333333] text-center">Transaction Details</h2>
                </div>

                <div className="w-full border border-gray-200 rounded-lg p-4 mb-8 flex items-center gap-4">
                  <Folder size={28} className="text-[#E31837]" strokeWidth={1.5} />
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Reference number:</span>
                    <span className="font-bold text-[#333333] text-sm">{selectedTransaction.id || 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  </div>
                </div>

                <div className="w-full">
                  <div className="pb-4 flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">From</div>
                      <div className="font-bold text-[#333333] text-base">
                        {accountName} <span className="font-normal text-gray-500">(3456)</span>
                      </div>
                      <div className="text-[#333333] text-base mt-1">
                        {selectedTransaction.amount < 0 ? `-$${Math.abs(selectedTransaction.amount).toFixed(2)}` : `$${selectedTransaction.amount.toFixed(2)}`}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-[#FFC000] rounded-sm flex items-center justify-center text-black font-bold text-[8px] leading-none tracking-tighter shrink-0 mt-1">
                      Interac
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-2" />

                  <div className="py-4">
                    <div className="text-sm text-gray-500 mb-1">To</div>
                    <div className="font-bold text-[#333333] text-base">
                      {selectedTransaction.description} <span className="font-normal text-gray-500">(3457)</span>
                    </div>
                    <div className="text-[#333333] text-base mt-1">
                      {selectedTransaction.amount < 0 ? `-$${Math.abs(selectedTransaction.amount).toFixed(2)}` : `$${selectedTransaction.amount.toFixed(2)}`}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-2" />

                  <div className="py-4">
                    <div className="text-sm text-gray-500 mb-1">Amount</div>
                    <div className="font-bold text-[#333333] text-lg">
                      {selectedTransaction.amount < 0 ? `-$${Math.abs(selectedTransaction.amount).toFixed(2)}` : `$${selectedTransaction.amount.toFixed(2)}`}
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-2" />

                  <div className="py-4 grid grid-cols-2">
                    <div className="border-r border-gray-200 pr-4">
                      <div className="text-sm text-gray-500 mb-1">Submitted</div>
                      <div className="font-bold text-[#333333] text-base">{selectedTransaction.date}</div>
                    </div>
                    <div className="pl-4">
                      <div className="text-sm text-gray-500 mb-1">Transfer date</div>
                      <div className="font-bold text-[#333333] text-base">{selectedTransaction.date}</div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-2" />

                  <div className="py-4">
                    <div className="text-sm text-gray-500 mb-1">Frequency</div>
                    <div className="font-bold text-[#333333] text-base">Once</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-xl active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Sub-components

const ActionButton = ({ icon, label, hasNotification, onClick }: { icon: React.ReactNode, label: string, hasNotification?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 w-16 group">
    <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center relative bg-gray-50 group-active:scale-95 transition-transform">
      {icon}
      {hasNotification && <div className="absolute top-0 right-0 w-3 h-3 bg-[#ED0711] rounded-full border-2 border-white"></div>}
    </div>
    <div className="text-[11px] text-center text-gray-500 font-bold uppercase tracking-tighter whitespace-pre-line leading-none">{label}</div>
  </button>
);

const TransactionGroup = ({ date, children }: { date: string, children: React.ReactNode }) => (
  <div className="mb-6 last:mb-0">
    <div className="text-[11px] text-gray-400 font-bold mb-4 uppercase tracking-widest border-b border-gray-100 pb-2">{date}</div>
    <div className="space-y-0">
      {children}
    </div>
  </div>
);

const TransactionItem = ({ title, subtitle, amount, isPositive, onClick, status }: { title: string, subtitle: string, amount: number, isPositive?: boolean, onClick: () => void, status?: string }) => {
  const getStatusBadge = (status?: string) => {
    if (!status || status === 'Completed' || status === 'Refunded' || status === 'Sent') return null;
    
    const styles: Record<string, string> = {
      'Pending': 'bg-[#FFC000]/10 text-[#FFC000]',
      'Failed': 'bg-red-100 text-red-600',
    };
    
    return (
      <div className={`text-xs ${styles[status] || 'bg-gray-100 text-gray-500'} px-2 py-0.5 rounded font-bold uppercase tracking-tight`}>
        {status}
      </div>
    );
  };

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between py-4 text-left active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
            <span className="text-gray-400 text-lg font-serif">$</span>
          </div>
          <div>
            <div className="text-gray-900 font-bold text-[14px] leading-tight">{title}</div>
            {subtitle && <div className="text-gray-500 text-[11px] mt-0.5">{subtitle}</div>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`font-bold text-[14px] ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
            {isPositive ? '+' : ''}{amount < 0 ? `-$${Math.abs(amount).toFixed(2)}` : `$${amount.toFixed(2)}`}
          </div>
          {getStatusBadge(status)}
          <ChevronRight size={18} className="text-gray-300" />
        </div>
      </button>
    </div>
  );
};

// Icons
const TransferIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const SendMoneyIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 530.28 530.28" className="w-full h-full">
      <style type="text/css">
        {`.st0{fill-rule:evenodd;clip-rule:evenodd;fill:#FFB92A;} .st1{fill:#2D2926;}`}
      </style>
      <g>
        <path className="st0" d="M530.28,447.71c0,45.6-36.97,82.57-82.57,82.57H81.91C36.67,530.28,0,493.61,0,448.38V78.96   C0,35.35,35.35,0,78.96,0h372.36c43.61,0,78.96,35.35,78.96,78.95V447.71z"/>
        <path className="st1" d="M50.03,206.39v134.76l-24.05,5.4V211.79L50.03,206.39z M113.7,223.77c-14.84,3.33-23.95,20.04-23.95,20.04   v-12.56l-23.34,5.09v80.4c2.85-1.09,5.94-1.72,9.17-1.72c5.2,0,10.03,1.56,14.07,4.22v-39.25c0.18-18.8,5.57-29.78,16.83-32.31   c9.89-2.22,13.6,5.15,13.44,16.53v61.39l22.91-5.17l0.16-61.2C143.19,229.26,131.1,219.86,113.7,223.77z M148.38,217.93l13.13-2.95   v-18.86l23.22-5.17v18.82l16.53-3.72l-0.23,20.38l-16.55,3.72l-0.12,51.03c0.11,6.23,1.2,10.09,8.19,8.52   c2.73-0.61,4.91-1.3,7.4-2.25l0.06,19.14c-5.8,2.75-9.3,3.86-14.07,4.93c-13.28,3.07-24.74-5.57-24.74-23.22l0.08-52.94   l-13.14,2.95L148.38,217.93z M229.24,256.52c0.01,2.15-0.05,3.91,0.3,5.98c1.74,10.34,6.82,18.37,17.27,16.03   c9.6-2.15,12.79-8.53,14.63-15.57l24.33-5.46c-2.54,15.59-10.97,35.24-37.53,41.19c-23.82,5.34-38.22-8.41-42.17-31.91   c-4.33-25.76,2.38-64.14,37.68-72.06c26.05-5.84,38.24,9.57,41.59,29.5c1.33,7.9,1.25,13.77,0.79,19.53L229.24,256.52z    M263.04,231.19c0.06-1.77-0.19-3.27-0.38-4.4c-1.42-8.46-6.08-15.03-16.36-12.72c-10.63,2.38-15.87,11.36-16.84,24.65   L263.04,231.19z M343.59,201.57c-16.17,3.83-23.97,15.1-24.06,37.2l-0.21,42l-23.2,5.21V184.74l22.39-5.02   c0.29,2.48,0.82,9.98,0.78,18.2c3.77-12.96,8.94-19.62,24.29-23.06V201.57z M426,256.08l-0.13,0.03l-23.29,5.26   c-1.6-2.91-3.21-7.53-3.91-10.78c-3.3,6.99-7.82,15.04-24.2,18.72c-17.4,3.91-27.29-7.94-29.45-19.38   c-5.11-26.99,14.26-40.1,34.08-45.15c7.13-1.82,13.13-2.89,19.9-4.6l-0.34-6.07c-0.15-7.39-1.86-16.39-14.31-13.59   c-11.09,2.49-11.67,9.51-12.66,14.62l-23.71,5.32c0.3-16.29,7.41-32.01,34.87-38.18c21.49-4.83,39.36,1.55,39.2,27.97v48.02   c0,0,0.57,8.1,1.49,12C424.47,254.23,426,256.08,426,256.08z M398.64,216.59c-5.8,1.3-10.68,2.79-15.17,4.39   c-12.54,5.16-16.77,11-15.21,19.24c1.06,5.62,5.12,9.21,12.63,7.52c16.03-3.6,17.43-18.77,17.7-29.57L398.64,216.59z M509.69,203.7   c-1.3,19.44-10.37,37.31-36.47,43.17c-22.35,5.02-36.85-6.77-41.25-30.02c-5.32-28.12,2.72-66.47,35.47-73.82   c28.66-6.44,40.04,14.27,41.19,26.91l-22.52,5.06c-1.59-7.46-5.26-14.65-15.67-12.31c-16.38,3.68-17.75,32.13-14.81,47.69   c2.55,13.5,8.64,18.38,16.99,16.51c7.68-1.72,12.08-7.6,13.85-17.96L509.69,203.7z M128.7,375.8l-32.84-22.35   c0,0-0.01,52.44-0.01,54.85c0,1.68-1.37,3.05-3.04,3.05c-1.68,0-3.03-1.37-3.03-3.05c0-0.59-0.07-59.97-0.07-67.22   c0-7.77-6.31-14.1-14.08-14.1c-7.8,0-14.1,6.33-14.1,14.1l0.02,117.11c0,21.02,17.11,38.16,38.14,38.16l2.52,0   c20.74,0,37.39-16.81,37.39-37.56c0,0,0.02-61.18,0.02-61.8C139.62,388.86,135.13,380.73,128.7,375.8z M33.41,358.34   c-5.81,1.4-9.4,7.24-8,13.05s7.24,9.4,13.05,8l16.41-3.94v-22.27L33.41,358.34z M33.41,387.03c-5.81,1.4-9.4,7.24-8,13.05   s7.24,9.4,13.05,8l16.41-3.94v-22.27L33.41,387.03z M25.41,428.78c1.39,5.81,7.24,9.4,13.05,8l16.41-3.94v-22.27l-21.46,5.15   C27.6,417.12,24.02,422.97,25.41,428.78z"/>
      </g>
    </svg>
  </div>
);

const MoreIcon = () => (
  <FileText size={20} className="text-gray-400" />
);

const ManageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default AccountDetailsView;
