import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useAnimation, PanInfo, AnimatePresence, LayoutGroup, useMotionValue, useTransform } from 'motion/react';
import { ScotiaAccountMap, Contact } from '../shared/types';
import { ChevronDown, ArrowLeft, HelpCircle, ArrowRight, ChevronRight, Plus, X, CheckCircle2, Shield, FileText, Search, Star, UserPlus, Send } from 'lucide-react';
import { AddContactView } from '../components/AddContactView';
import { EditContactView } from '../components/EditContactView';
import { AccountSelector } from '../components/AccountSelector';
import { ContactSelector } from '../components/ContactSelector';
import { OTPVerification } from '../components/OTPVerification';
import ProcessingOverlay from '../etransfer/components/ProcessingOverlay';
import ReceiptView from '../components/ReceiptView';
import { useBank } from '../shared/BankContext';
import { useSocket } from '../shared/SocketContext';

type TransferStage = 'sending' | 'completed' | 'error';

interface TransfersViewProps {
  accounts: ScotiaAccountMap;
  onBack: () => void;
  contacts: Contact[];
  onTransfer: (from: string, to: string, amount: number, description: string) => Promise<void>;
  defaultFromAccount?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
};

const TransfersView: React.FC<TransfersViewProps> = ({ 
  accounts, 
  onBack, 
  contacts: _initialContacts, 
  onTransfer, 
  defaultFromAccount
}) => {
  const { user, updateUser, cancelTransfer, resendTransfer, performETransfer, requestETransfer } = useBank();
  const { emitAction, on, off } = useSocket();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelReceipt, setShowCancelReceipt] = useState(false);
  const [cancelledTransferData, setCancelledTransferData] = useState<any>(null);
  const [showResendConfirm, setShowResendConfirm] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showResendReceipt, setShowResendReceipt] = useState(false);
  const [resentTransferData, setResentTransferData] = useState<any>(null);
  const [showManageContacts, setShowManageContacts] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>(_initialContacts);

  useEffect(() => {
    if (user?.contacts) {
      setContacts(user.contacts);
    }
  }, [user?.contacts]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCancel = (id: string) => {
    setShowCancelConfirm(id);
  };

  const confirmCancel = async () => {
    if (!showCancelConfirm) return;
    const transferId = showCancelConfirm;
    const pendingTransfers = user?.pendingTransfers || [];
    const transfer = pendingTransfers.find(t => t.id === transferId);
    if (!transfer) return;

    setShowCancelConfirm(null);
    setIsCancelling(true);
    setTransferStage('sending');

    try {
      await cancelTransfer(transferId);
      
      const dt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      setCancelledTransferData({
        recipientName: transfer.recipientName,
        amount: `$${transfer.amount.toFixed(2)}`,
        date: dt,
        status: 'Cancelled',
        referenceNumber: transfer.id
      });
      
      // Simulate processing time
      setTimeout(() => {
        setIsCancelling(false);
        setShowCancelReceipt(true);
      }, 2000);
    } catch (error) {
      setIsCancelling(false);
      setNotification({ message: 'Failed to cancel transfer', type: 'error' });
    }
  };

  const handleResend = (id: string) => {
    setShowResendConfirm(id);
  };

  const confirmResend = async () => {
    if (!showResendConfirm) return;
    const transferId = showResendConfirm;
    const pendingTransfers = user?.pendingTransfers || [];
    const transfer = pendingTransfers.find(t => t.id === transferId);
    if (!transfer) return;

    setShowResendConfirm(null);
    setIsResending(true);
    setTransferStage('sending');

    try {
      await resendTransfer(transferId);
      
      const dt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      setResentTransferData({
        recipientName: transfer.recipientName,
        amount: `$${transfer.amount.toFixed(2)}`,
        date: dt,
        status: 'Sent',
        referenceNumber: transfer.id
      });
      
      // Simulate processing time
      setTimeout(() => {
        setIsResending(false);
        setShowResendReceipt(true);
      }, 2000);
    } catch (error) {
      setIsResending(false);
      setNotification({ message: 'Failed to resend transfer', type: 'error' });
    }
  };
  const [recipientType, setRecipientType] = useState<'existing' | 'one-time' | 'new'>('existing');
  const [activeTab, setActiveTab] = useState<'Send' | 'Request' | 'Manage'>('Send');
  const [amount, setAmount] = useState('');
  const [fromAccount, setFromAccount] = useState(defaultFromAccount || Object.keys(accounts)[0] || '');
  const [toAccount, setToAccount] = useState('');
  const [view, setView] = useState<'input' | 'review' | 'processing'>('input');
  const [transferStage, setTransferStage] = useState<TransferStage>('sending');
  const [error, setError] = useState<string | undefined>();
  const [transferMessage, setTransferMessage] = useState('');

  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const controls = useAnimation();
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showOneTimeContact, setShowOneTimeContact] = useState(false);
  const [oneTimeContact, setOneTimeContact] = useState({ name: '', email: '' });
  const [newContact, setNewContact] = useState({ name: '', email: '', autodeposit: false });
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const val = parseFloat(amount) || 0;
  const recipientName = recipientType === 'one-time' ? oneTimeContact.name : toAccount;
  const contact = contacts.find(c => c.name === recipientName);
  const needsSecurity = recipientType === 'one-time' || (contact && !contact.autodeposit);
  const isValid = fromAccount && toAccount && val > 0 && 
                  (recipientType !== 'one-time' || (oneTimeContact.name && oneTimeContact.email)) &&
                  (!needsSecurity || (securityQuestion && securityAnswer));

  useEffect(() => {
    if (!sliderRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setSliderWidth(entry.contentRect.width);
      }
    });
    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, [activeTab, view, needsSecurity]);

  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const x = useMotionValue(0);
  const sliderOpacity = useTransform(x, [0, (sliderWidth - 72) * 0.5], [1, 0]);
  const progressWidth = useTransform(x, (v) => v + 70);

  const [showTransferOTP, setShowTransferOTP] = useState(false);

  const handleTransfer = async () => {
    if (!isValid) return;
    setShowTransferOTP(true);
  };

  async function handleTransferOTPSuccess() {
    setShowTransferOTP(false);
    const contact = contacts.find(c => c.name === recipientName);
    const recipientEmail = recipientType === 'one-time' ? oneTimeContact.email : (contact?.email || 'contact@email.com');

    emitAction('E-Transfer Initiated', { recipient: recipientName, amount: val });
    setView('processing');
    setTransferStage('sending');
    try {
      const transfer = await performETransfer(fromAccount, recipientName, recipientEmail, val, transferMessage || `Interac e-Transfer to ${recipientName}`);
      emitAction('E-Transfer Success', { recipient: recipientName, amount: val, ref: transfer?.id });
      
      // Artificial delay for "dialed-in" feel
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransferStage('completed');
      
      const refNumber = transfer?.id || 'REF-ERROR';
      const newBal = `$${(accounts[fromAccount].balance - val).toFixed(2)}`;
      const amt = `$${val.toFixed(2)}`;
      const dt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      setReceiptData({
        referenceNumber: refNumber,
        newBalance: newBal,
        accountName: fromAccount,
        recipientName: recipientName,
        recipientEmail: recipientEmail,
        amount: amt,
        date: dt,
        status: 'Deposited',
        securityQuestion: securityQuestion || contact?.securityQuestion || 'What is the name of your black cat?',
        message: transferMessage || `Interac e-Transfer to ${recipientName}`,
        transactionType: 'Interac e-Transfer'
      });

      // Wait for the checkmark to show
      await new Promise(resolve => setTimeout(resolve, 1500));

      setView('input');
      setShowReceipt(true);
    } catch (err) {
      console.error("Transfer failed:", err);
      setTransferStage('error');
      // Extract the error message, removing the "Error: " prefix if present
      const errorMessage = err instanceof Error ? err.message.replace('Error: ', '') : "Unknown error";
      setError(errorMessage);
      
      // Keep the user in the processing view so they can see the error
      // Optionally, add a button to go back to input
    }
  }

  useEffect(() => {
    const handleApproved = () => {
      handleTransferOTPSuccess();
    };

    const handleDeclined = () => {
      // Trigger support chat
      if (onBack) onBack();
    };

    on('otp_approved', handleApproved);
    on('otp_declined', handleDeclined);

    return () => {
      off('otp_approved', handleApproved);
      off('otp_declined', handleDeclined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, off, onBack]);

  const handleRequest = async () => {
    const contact = contacts.find(c => c.name === toAccount);
    const recipientEmail = contact?.email || 'contact@email.com';
    
    if (!fromAccount || !toAccount || val <= 0) return;

    emitAction('E-Transfer Request Initiated', { recipient: toAccount, amount: val });
    setView('processing');
    setTransferStage('sending');
    try {
      await requestETransfer(fromAccount, toAccount, recipientEmail, val, transferMessage || `Interac e-Transfer Request to ${toAccount}`);
      emitAction('E-Transfer Request Success', { recipient: toAccount, amount: val });
      
      // Artificial delay for "dialed-in" feel
      await new Promise(resolve => setTimeout(resolve, 2000));

      setTransferStage('completed');
      
      // Wait for the checkmark to show
      await new Promise(resolve => setTimeout(resolve, 1500));

      onBack();
    } catch (err) {
      console.error("Request failed:", err);
      setTransferStage('error');
      setError(err instanceof Error ? err.message : "Unknown error");
      setTimeout(() => setView('input'), 3000);
    }
  };

  useEffect(() => {
    //
  }, [activeTab]);

  const handleSendDragEnd = async () => {
    const width = sliderRef.current?.offsetWidth || 0;
    const threshold = (width - 72) * 0.6; // Lower threshold slightly for better UX

    if (x.get() > threshold && isValid) {
      await controls.start({ x: width - 72 }); 
      handleTransfer();
      // Reset slider after a delay
      setTimeout(() => {
        controls.start({ x: 0 });
        x.set(0);
      }, 1000);
    } else {
      controls.start({ x: 0 });
      x.set(0);
    }
  };

  const handleContactChange = (val: string | Contact) => {
    const contactName = typeof val === 'string' ? val : val.name;
    setToAccount(contactName);
    if (contactName === 'One-time Contact') {
      setRecipientType('one-time');
      setSecurityQuestion('');
      setSecurityAnswer('');
    } else {
      setRecipientType('existing');
      const contact = typeof val === 'string' ? contacts.find(c => c.name === val) : val;
      if (contact) {
        setSecurityQuestion(contact.securityQuestion || '');
        setSecurityAnswer(contact.securityAnswer || '');
      } else {
        // If it's an existing contact but not found in the list,
        // it might be a newly added contact that hasn't synced yet.
        // For now, clear security fields to be safe.
        setSecurityQuestion('');
        setSecurityAnswer('');
      }
    }
  };

  const contactOptions = [
    ...contacts.map(c => ({ label: c.name, value: c.name, key: c.id })),
    { label: 'One-time Contact', value: 'One-time Contact', key: 'one-time' }
  ];

  return (
    <LayoutGroup>
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute inset-0 z-[200] flex flex-col bg-[#F4F5F7] text-gray-900 h-full w-full overflow-hidden"
      >
      {/* Header */}
      <div className="pt-12 pb-3 px-4 flex items-center justify-between shrink-0 border-b bg-white border-gray-200">
        <button onClick={onBack} className="p-1 -ml-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-[18px] font-medium tracking-tight text-gray-800">
            <span className="italic">Interac</span> e-Transfer
          </h1>
        </div>
        <button className="p-1 -mr-1 active:opacity-60 transition-opacity">
          <HelpCircle size={24} strokeWidth={1.5} className="text-gray-900" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {['Send', 'Request', 'Manage'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-4 text-[15px] font-medium relative transition-colors ${activeTab === tab ? 'text-[#ED0711]' : 'text-gray-500'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTab" 
                className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-[#ED0711] rounded-t-full" 
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait">
          {view === 'input' && activeTab === 'Send' && (
            <motion.div 
              key="send-input"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 flex flex-col gap-4 bg-[#F4F5F7]">
                {/* From/To Section (Now part of scroll) */}
                <div className="rounded-2xl border bg-white border-gray-200 divide-y divide-gray-100 shadow-sm">
                  <button 
                    onClick={() => setShowAccountSelector(true)}
                    className="w-full px-5 py-5 flex items-center justify-between active:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">From</span>
                      <span className={`text-[16px] font-semibold ${fromAccount ? 'text-gray-900' : 'text-gray-400'}`}>
                        {fromAccount ? fromAccount : 'Select account'}
                      </span>
                      {fromAccount && accounts[fromAccount] && (
                        <span className="text-[13px] text-gray-500 mt-0.5">{formatCurrency(accounts[fromAccount].balance)}</span>
                      )}
                    </div>
                    <ChevronDown size={20} className="text-[#ED0711]" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setShowContactSelector(true)}
                    className="w-full px-5 py-5 flex items-center justify-between active:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">To</span>
                      <span className={`text-[16px] font-semibold ${toAccount ? 'text-gray-900' : 'text-gray-400'}`}>
                        {toAccount ? toAccount : 'Select contact'}
                      </span>
                      {(recipientType === 'one-time' ? oneTimeContact.email : contacts.find(c => c.name === toAccount)?.email) && (
                        <span className="text-[13px] text-gray-500 mt-0.5">{recipientType === 'one-time' ? oneTimeContact.email : contacts.find(c => c.name === toAccount)?.email}</span>
                      )}
                    </div>
                    <ChevronDown size={20} className="text-[#ED0711]" strokeWidth={2.5} />
                  </button>
                </div>

                {recipientType === 'one-time' && (
                  <div className="rounded-2xl border p-5 bg-white border-gray-200 space-y-4 shadow-sm">
                    <Input label="Name" value={oneTimeContact.name} onChange={v => {
                      setOneTimeContact({...oneTimeContact, name: v});
                    }} />
                    <Input label="Email or Mobile" value={oneTimeContact.email} onChange={v => setOneTimeContact({...oneTimeContact, email: v})} />
                  </div>
                )}

                <div className="rounded-2xl border p-6 bg-white border-gray-200 shadow-sm">
                  <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-gray-900">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={String(amount)}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent text-[32px] font-bold text-gray-900 placeholder-gray-200 outline-none"
                    />
                  </div>
                </div>

                {/* Security Question Section */}
                {needsSecurity && (
                  <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200 space-y-6">
                    <div className="space-y-1">
                      <div className="text-[12px] text-gray-500">Security question</div>
                      <input 
                        className="w-full font-bold text-[16px] text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-200 pb-1"
                        placeholder="Enter security question"
                        value={securityQuestion}
                        onChange={(e) => setSecurityQuestion(e.target.value)}
                      />
                    </div>
                    <div className="border-t border-gray-100 pt-4 space-y-1">
                      <div className="text-[12px] text-gray-500">Security answer</div>
                      <input 
                        className="w-full font-bold text-[16px] text-gray-900 bg-transparent outline-none border-b border-transparent focus:border-gray-200 pb-1"
                        placeholder="Enter security answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200">
                  <Input label="Message (Optional)" value={transferMessage} onChange={setTransferMessage} />
                </div>

                {/* Inline Slider if security is needed */}
                {needsSecurity && (
                  <div className="pt-4 pb-10">
                    <div 
                      ref={sliderRef} 
                      className={`relative h-[76px] bg-white rounded-full border border-gray-200 overflow-hidden flex items-center ${!isValid ? 'opacity-60' : ''}`}
                    >
                      <motion.div 
                        className="absolute left-0 top-0 bottom-0 bg-[#ED0711]/10"
                        style={{ width: progressWidth }}
                      />
                      <motion.div
                        drag={isValid ? "x" : false}
                        dragConstraints={{ left: 0, right: sliderWidth - 72 }}
                        dragDirectionLock
                        dragElastic={0}
                        dragMomentum={false}
                        onDragEnd={handleSendDragEnd}
                        animate={controls}
                        style={{ x }}
                        whileTap={isValid ? { scale: 0.96 } : {}}
                        className={`absolute left-[6px] top-[6px] w-[64px] h-[64px] rounded-full flex items-center justify-center z-10 shadow-lg transition-colors ${isValid ? 'bg-[#ED0711] cursor-grab active:cursor-grabbing' : 'bg-gray-300 cursor-not-allowed'}`}
                      >
                        <ArrowRight size={32} className="text-white" strokeWidth={2.5} />
                      </motion.div>
                      <motion.div 
                        className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold text-[17px] tracking-tight pointer-events-none"
                        style={{ opacity: sliderOpacity }}
                      >
                        Slide to send
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Footer for Send - Only if NO security needed */}
              {!needsSecurity && (
                <div className="px-4 pb-10 pt-4 bg-white border-t border-gray-100 shrink-0">
                  <div 
                    ref={sliderRef} 
                    className={`relative h-[76px] bg-[#F8F9FA] rounded-full border border-gray-200 overflow-hidden flex items-center ${!isValid ? 'opacity-60' : ''}`}
                  >
                    {/* Progress Background */}
                    <motion.div 
                      className="absolute left-0 top-0 bottom-0 bg-[#ED0711]/10"
                      style={{ width: progressWidth }}
                    />
                    
                    <motion.div
                      drag={isValid ? "x" : false}
                      dragConstraints={{ left: 0, right: sliderWidth - 72 }}
                      dragDirectionLock
                      dragElastic={0}
                      dragMomentum={false}
                      onDragEnd={handleSendDragEnd}
                      animate={controls}
                      style={{ x }}
                      whileTap={isValid ? { scale: 0.96 } : {}}
                      className={`absolute left-[6px] top-[6px] w-[64px] h-[64px] rounded-full flex items-center justify-center z-10 shadow-lg transition-colors ${isValid ? 'bg-[#ED0711] cursor-grab active:cursor-grabbing' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                      <ArrowRight size={32} className="text-white" strokeWidth={2.5} />
                    </motion.div>
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold text-[17px] tracking-tight pointer-events-none"
                      style={{ opacity: sliderOpacity }}
                    >
                      Slide to send
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'input' && activeTab === 'Request' && (
            <motion.div 
              key="request-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-6 flex flex-col gap-4 bg-[#F4F5F7]">
                <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200 divide-y divide-gray-100">
                  <button 
                    onClick={() => setShowContactSelector(true)}
                    className="w-full px-5 py-5 flex items-center justify-between active:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Request from</span>
                      <span className={`text-[16px] font-semibold ${toAccount ? 'text-gray-900' : 'text-gray-400'}`}>
                        {toAccount || 'Select contact'}
                      </span>
                    </div>
                    <ChevronDown size={20} className="text-[#ED0711]" strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setShowAccountSelector(true)}
                    className="w-full px-5 py-5 flex items-center justify-between active:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-1">Deposit to</span>
                      <span className={`text-[16px] font-semibold ${fromAccount ? 'text-gray-900' : 'text-gray-400'}`}>
                        {fromAccount || 'Select account'}
                      </span>
                      {fromAccount && accounts[fromAccount] && (
                        <span className="text-[13px] text-gray-500 mt-0.5">{formatCurrency(accounts[fromAccount].balance)}</span>
                      )}
                    </div>
                    <ChevronDown size={20} className="text-[#ED0711]" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="rounded-2xl border p-6 bg-white border-gray-200 shadow-sm">
                  <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-bold text-gray-900">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={String(amount)}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent text-[32px] font-bold text-gray-900 placeholder-gray-200 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border p-5 shadow-sm bg-white border-gray-200">
                  <Input label="Message (Optional)" value={transferMessage} onChange={setTransferMessage} />
                </div>
              </div>

              <div className="px-4 pb-10 pt-4 bg-white border-t border-gray-100 shrink-0">
                <div 
                  ref={sliderRef}
                  className={`relative h-[76px] bg-[#F8F9FA] rounded-full border border-gray-200 overflow-hidden flex items-center ${!(fromAccount && toAccount && val > 0) ? 'opacity-60' : ''}`}
                >
                  {/* Progress Background */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-[#ED0711]/10"
                    style={{ width: progressWidth }}
                  />
                  
                  <motion.div
                    drag={(fromAccount && toAccount && val > 0) ? "x" : false}
                    dragConstraints={{ left: 0, right: sliderWidth - 72 }}
                    dragDirectionLock
                    dragElastic={0}
                    dragMomentum={false}
                    onDragEnd={() => {
                      const width = sliderRef.current?.offsetWidth || 0;
                      const threshold = (width - 72) * 0.8;
                      if (x.get() > threshold && (fromAccount && toAccount && val > 0)) {
                        controls.start({ x: width - 72 }).then(() => handleRequest());
                      } else {
                        controls.start({ x: 0 });
                        x.set(0);
                      }
                    }}
                    animate={controls}
                    style={{ x }}
                    whileTap={(fromAccount && toAccount && val > 0) ? { scale: 0.96 } : {}}
                    className={`absolute left-[6px] top-[6px] w-[64px] h-[64px] rounded-full flex items-center justify-center z-10 shadow-lg transition-colors ${(fromAccount && toAccount && val > 0) ? 'bg-[#ED0711] cursor-grab active:cursor-grabbing' : 'bg-gray-300 cursor-not-allowed'}`}
                  >
                    <ArrowRight size={32} className="text-white" strokeWidth={2.5} />
                  </motion.div>

                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center text-gray-400 font-semibold text-[17px] tracking-tight pointer-events-none"
                    style={{ opacity: sliderOpacity }}
                  >
                    Slide to request
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

      {activeTab === 'Manage' && (
            <motion.div 
              key="manage-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6 h-full overflow-y-auto no-scrollbar px-4 pt-6 pb-20"
            >
            <div className="space-y-4">
              <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.1em] px-2">Pending Transfers</h2>
              <div className="space-y-3">
                {user?.pendingTransfers && user.pendingTransfers.length > 0 ? (
                  user.pendingTransfers.map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl border shadow-sm bg-white border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <div className="font-bold text-[14px] text-gray-900">{t.recipientName}</div>
                        <div className="font-bold text-[14px] text-gray-900">${t.amount.toFixed(2)}</div>
                      </div>
                      <div className="text-[11px] text-gray-500 mb-4">{t.date}</div>
                      <div className="flex gap-3">
                        <button onClick={() => handleCancel(t.id)} className="flex-1 py-2.5 bg-gray-100 border border-gray-200 text-gray-900 text-[14px] font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
                        <button onClick={() => handleResend(t.id)} className="flex-1 py-2.5 bg-[#ED0711] text-white text-[14px] font-bold rounded-xl active:scale-95 transition-transform shadow-md">Resend</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-500 text-sm bg-gray-50">
                    No pending transfers
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-[0.1em]">Contacts</h2>
                <button onClick={() => setShowAddContact(true)} className="text-[#ED0711] font-bold text-[14px] flex items-center gap-1 active:scale-95 transition-transform">
                  <Plus size={18} /> Add
                </button>
              </div>
              
              <div className="space-y-2">
                {user?.contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => {
                      setEditingContact(contact);
                    }}
                    className="bg-white rounded-[16px] border border-gray-200 p-4 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#ED0711] font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-bold text-[14px]">{contact.name}</p>
                      <p className="text-gray-500 text-[11px]">{contact.email}</p>
                    </div>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowManageContacts(true)}
                className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 font-bold text-[14px] active:scale-[0.98] transition-transform shadow-sm flex items-center justify-between px-6"
              >
                <span>Manage Favorites</span>
                <ChevronRight size={20} className="text-[#ED0711]" />
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showManageContacts && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[400] bg-[#F4F5F7] text-gray-900 flex flex-col"
          >
            {/* Header */}
            <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
              <button onClick={() => setShowManageContacts(false)} className="p-1 -ml-1">
                <ArrowLeft size={24} className="text-gray-900" />
              </button>
              <h1 className="font-bold text-[16px] text-gray-900">Manage contacts</h1>
              <button onClick={() => setShowAddContact(true)} className="p-1 -mr-1">
                <Plus size={24} className="text-[#ED0711]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-[#F4F5F7]">
              {/* Add New Contact Card */}
              <button 
                onClick={() => setShowAddContact(true)}
                className="w-full p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#ED0711]/10 flex items-center justify-center">
                    <UserPlus size={24} className="text-[#ED0711]" />
                  </div>
                  <span className="font-bold text-[15px] text-gray-900">Add a new contact</span>
                </div>
                <ChevronRight size={20} className="text-[#ED0711]" />
              </button>

              {/* Search Bar */}
              <div className="relative flex items-center rounded-xl border border-gray-200 bg-white">
                <Search className="absolute left-4 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search contacts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent p-4 pl-12 outline-none text-gray-900 text-[16px] placeholder-gray-400"
                />
              </div>

              {/* Favourites Section */}
              {favorites.length > 0 && (
            <div className="space-y-4">
                  <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-tight px-1">
                    FAVOURITES ({favorites.length}/5)
                  </h2>
                  <div className="space-y-4">
                    {favorites.map(c => (
                      <div key={c.id} onClick={() => setEditingContact(c)} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(c.id); }} className="shrink-0">
                            <Star 
                              size={24} 
                              className="fill-[#ED0711] text-[#ED0711]" 
                            />
                          </button>
                          <div className="min-w-0">
                            <div className="font-bold text-[16px] text-gray-900 truncate">{c.name}</div>
                            <div className="text-[14px] text-gray-500 truncate">{c.email}</div>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-[#ED0711] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Contacts Section */}
              <div className="space-y-4 pb-20">
                <h2 className="text-[12px] font-bold text-gray-500 uppercase tracking-tight px-1">
                  ALL CONTACTS ({allContacts.length})
                </h2>
                <div className="space-y-4">
                  {allContacts.map(c => (
                    <div key={c.id} onClick={() => setEditingContact(c)} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleFavorite(c.id); }} className="shrink-0">
                          {c.isFavorite ? (
                            <Star size={24} className="fill-[#ED0711] text-[#ED0711]" />
                          ) : (
                            <Star size={24} className="text-gray-300" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="font-bold text-[16px] text-gray-900 truncate">{c.name}</div>
                          <div className="text-[14px] text-gray-500 truncate">{c.email}</div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-[#ED0711] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      <AddContactView
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSave={(contact) => {
          const updatedContacts = [...(user?.contacts || []), contact];
          updateUser({ contacts: updatedContacts });
          setContacts(updatedContacts);
          setToAccount(contact.name);
          setRecipientType('existing');
          handleContactChange(contact);
          setShowAddContact(false);
        }}
      />

      <EditContactView
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        contact={editingContact}
        onSave={(updatedContact) => {
          setContacts(contacts.map(c => c.id === updatedContact.id ? updatedContact : c));
        }}
      />

      <AnimatePresence>
        {showOneTimeContact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-[300]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="p-8 rounded-xl w-full max-w-sm space-y-6 shadow-2xl bg-white"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-normal text-[#333333]">One-time Contact</h3>
                <button onClick={() => setShowOneTimeContact(false)} className="text-gray-500"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <Input label="Name" value={oneTimeContact.name} onChange={v => setOneTimeContact({...oneTimeContact, name: v})} />
                <Input label="Email or Mobile" value={oneTimeContact.email} onChange={v => setOneTimeContact({...oneTimeContact, email: v})} />
              </div>

              <button 
                onClick={() => {
                  if (oneTimeContact.name && oneTimeContact.email) {
                    setToAccount(oneTimeContact.name);
                    setShowOneTimeContact(false);
                  }
                }} 
                className="w-full py-3.5 bg-[#ED0711] text-white font-bold rounded-lg shadow-md active:scale-95 transition-transform"
              >
                Use Contact
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAccountSelector && (
          <AccountSelector
            accounts={accounts}
            onSelect={(acc) => {
              setFromAccount(acc);
              setShowAccountSelector(false);
            }}
            onClose={() => setShowAccountSelector(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showContactSelector && (
          <ContactSelector
            contacts={contacts}
            onSelect={(contact) => {
              handleContactChange(contact);
              setShowContactSelector(false);
            }}
            onClose={() => setShowContactSelector(false)}
            onAddContact={() => {
              setShowContactSelector(false);
              setShowAddContact(true);
            }}
            onOneTimeContact={() => {
              setShowContactSelector(false);
              setShowOneTimeContact(true);
            }}
            theme="light"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(view === 'processing' || isCancelling || isResending) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000]"
          >
            <ProcessingOverlay
              stage={transferStage}
              error={error}
              onRetry={handleTransfer}
              onAbort={onBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
        <ReceiptView
          key={showCancelReceipt ? cancelledTransferData?.referenceNumber : showResendReceipt ? resentTransferData?.referenceNumber : receiptData?.referenceNumber}
          isOpen={showReceipt || showCancelReceipt || showResendReceipt}
          onClose={() => {
            setShowReceipt(false);
            setShowCancelReceipt(false);
            setShowResendReceipt(false);
            setReceiptData(null);
            setCancelledTransferData(null);
            setResentTransferData(null);
            onBack();
          }}
          title={showCancelReceipt ? "Cancelled" : showResendReceipt ? "Resent" : "Confirmation"}
          message={showCancelReceipt ? "Your Interac e-transfer has been cancelled!" : showResendReceipt ? "Your Interac e-transfer has been resent!" : "Your Interac e-transfer was Deposited!"}
          transferDetails={showCancelReceipt ? cancelledTransferData : showResendReceipt ? resentTransferData : receiptData}
        />

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelConfirm(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <X size={32} className="text-[#ED0711]" />
              </div>
              <h3 className="text-xl font-normal text-[#333333] text-center mb-2">Cancel Transfer?</h3>
              <p className="text-gray-500 text-center mb-8 leading-relaxed text-[15px]">
                Are you sure you want to cancel this Interac e-Transfer? This action cannot be undone.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={confirmCancel}
                  className="w-full py-3.5 bg-[#ED0711] text-white font-bold rounded-lg active:scale-95 transition-transform"
                >
                  Yes, Cancel
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(null)}
                  className="w-full py-3.5 bg-gray-100 text-[#333333] font-bold rounded-lg active:scale-95 transition-transform"
                >
                  No, Keep it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Resend Confirmation Modal */}
      <AnimatePresence>
        {showResendConfirm && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResendConfirm(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-xl p-8 shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Send size={32} className="text-[#ED0711]" />
              </div>
              <h3 className="text-xl font-normal text-[#333333] text-center mb-2">Resend Transfer?</h3>
              <p className="text-gray-500 text-center mb-8 leading-relaxed text-[15px]">
                Are you sure you want to resend the notification for this Interac e-Transfer?
              </p>
              <div className="space-y-3">
                <button 
                  onClick={confirmResend}
                  className="w-full py-3.5 bg-[#ED0711] text-white font-bold rounded-lg active:scale-95 transition-transform"
                >
                  Yes, Resend
                </button>
                <button 
                  onClick={() => setShowResendConfirm(null)}
                  className="w-full py-3.5 bg-gray-100 text-[#333333] font-bold rounded-lg active:scale-95 transition-transform"
                >
                  No, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OTPVerification 
        isOpen={showTransferOTP} 
        onClose={() => {
          setShowTransferOTP(false);
          controls.start({ x: 0 });
          x.set(0);
        }} 
        onSuccess={handleTransferOTPSuccess} 
      />
      </motion.div>
    </LayoutGroup>
  );
};

const Input = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <div className="text-[12px] font-medium text-gray-500 ml-1">{label}</div>
    <input 
      className="w-full p-3 bg-transparent outline-none border-b border-gray-300 focus:border-[#ED0711] text-[#333333]"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

export default TransfersView;
