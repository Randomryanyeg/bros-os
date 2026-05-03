import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, RefreshCcw, MessageSquare, Loader2 } from 'lucide-react';
import { BackIcon, HelpCircleIcon, ChevronDownIcon, ScotiaLogoSVG } from '../components/ScotiaIcons';
import { ScotiaAccountMap, Contact } from '../shared/types';
import { OTPVerification } from '../components/OTPVerification';
import { AccountSelector } from '../components/AccountSelector';

import { useBank } from '../shared/BankContext';

interface InteracETransferViewProps {
  accounts: ScotiaAccountMap;
  onBack: () => void;
  onSettings?: () => void;
}

const InteracETransferView: React.FC<InteracETransferViewProps> = ({ accounts, onBack }) => {
  const { user, updateUser, performETransfer } = useBank();
  const [activeTab, setActiveTab] = useState<'send' | 'request' | 'manage'>('send');
  const accountNames = Object.keys(accounts);
  const [selectedAccount, setSelectedAccount] = useState(accountNames[0]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [amount, setAmount] = useState('0.00');
  const [isSent, setIsSent] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSelectingContact, setIsSelectingContact] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactQuestion, setNewContactQuestion] = useState('');
  const [newContactAnswer, setNewContactAnswer] = useState('');
  const [showAddContactOTP, setShowAddContactOTP] = useState(false);
  const [pendingContact, setPendingContact] = useState<Contact | null>(null);

  const contacts = user?.contacts || [];
  const pendingTransfers = user?.pendingTransfers || [];

  // Slide to send logic
  const x = useMotionValue(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!sliderRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, [activeTab, isSent]);

  const buttonWidth = 56;
  const slideRange = containerWidth ? containerWidth - buttonWidth - 8 : 260;
  
  const opacity = useTransform(x, [0, slideRange * 0.5], [1, 0]);

  const numAmount = parseFloat(amount);
  const selectedContactData = contacts.find(c => c.name === selectedContact);
  const isValid = selectedContact && amount && !isNaN(numAmount) && numAmount > 0;

  const handleDragEnd = () => {
    const threshold = slideRange * 0.9;
    if (x.get() > threshold && isValid) {
      setIsConfirming(true);
      x.set(0); // Reset slider position
    } else {
      x.set(0);
    }
  };

  const handleConfirmSend = async () => {
    setIsConfirming(false);
    setIsLoading(true);

    try {
      const amountNum = parseFloat(amount);
      const contact = contacts.find(c => c.name === selectedContact);
      if (!contact) throw new Error("Contact not selected");

      await performETransfer(selectedAccount, contact.name, contact.email, amountNum, `Interac e-Transfer to ${contact.name}`);
      
      setIsLoading(false);
      setIsSent(true);

      // Play success sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.play().catch(e => console.warn('Audio play failed', e));
      } catch (e) {
        console.warn('Audio failed', e);
      }

      // Show SMS notification
      window.dispatchEvent(new CustomEvent('scotia_notification', {
        detail: {
          title: 'Interac e-Transfer',
          message: `10001: Interac e-Transfer: Transfer of $${amount} to ${selectedContact} was successfully deposited.`
        }
      }));
    } catch (error) {
      console.error("Transfer failed", error);
      setIsLoading(false);
      setIsFailed(true);
    }
  };

  const handleCancelSend = () => {
    setIsConfirming(false);
    x.set(0);
  };

  const handleAddContact = async () => {
    if (newContactName && newContactEmail) {
      const contactData: Contact = {
        name: newContactName,
        email: newContactEmail,
        securityQuestion: newContactQuestion,
        securityAnswer: newContactAnswer,
        autodeposit: false,
        id: ''
      };

      if (isEditingContact && viewingContact) {
        const updatedContacts = contacts.map(c => c.id === viewingContact.id ? {
          ...c,
          ...contactData,
          id: c.id
        } : c);
        
        await updateUser({ contacts: updatedContacts });
        
        setIsAddingContact(false);
        setIsEditingContact(false);
        setViewingContact(null);
      } else {
        // For new contact, trigger OTP
        setPendingContact({
          ...contactData,
          id: Date.now().toString()
        });
        setShowAddContactOTP(true);
      }
    }
  };

  const handleOTPSuccess = async () => {
    if (pendingContact) {
      const updatedContacts = [pendingContact, ...contacts];
      await updateUser({ contacts: updatedContacts });
      setSelectedContact(pendingContact.name);
      setPendingContact(null);
    }
    setShowAddContactOTP(false);
    setIsAddingContact(false);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactQuestion('');
    setNewContactAnswer('');
  };

  const startEditing = (contact: Contact) => {
    setNewContactName(contact.name);
    setNewContactEmail(contact.email);
    setNewContactQuestion(contact.question || '');
    setNewContactAnswer(contact.answer || '');
    setIsEditingContact(true);
    setIsAddingContact(true);
  };

  const account = accounts[selectedAccount] || accounts[accountNames[0]];

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-[200] overflow-hidden animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="pt-12 pb-2 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-100">
        <button onClick={onBack} className="text-gray-900 p-2 -ml-2 active:opacity-60 transition-opacity">
          <BackIcon color="currentColor" size={24} />
        </button>
        <h1 className="text-gray-900 font-bold text-[16px] tracking-tight">Interac e-Transfer</h1>
        <button className="text-gray-900 p-2 -mr-2 active:opacity-60 transition-opacity">
          <HelpCircleIcon color="currentColor" size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-4 bg-white">
        {(['send', 'request', 'manage'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-center text-[13px] font-bold capitalize relative transition-colors ${
              activeTab === tab ? 'text-[#ED0711]' : 'text-gray-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ED0711]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#F4F4F4]">
        {activeTab === 'send' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* From & To Card */}
            <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm">
            {/* From Section */}
              <button 
                onClick={() => setShowAccountSelector(true)}
                className="w-full p-5 text-left active:bg-gray-50 transition-colors border-b border-gray-100 group">
                <p className="text-gray-500 text-[11px] font-medium mb-1">From</p>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-gray-900 font-bold text-[14px] leading-tight">{selectedAccount}</p>
                    <p className="text-gray-500 text-[12px] font-medium">({account?.accountNumber ? account.accountNumber.slice(-4) : '2188'})</p>
                    <p className="text-gray-900 font-bold text-[14px] mt-1">${account?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-[#ED0711] group-active:translate-y-0.5 transition-transform">
                    <ChevronDownIcon color="currentColor" size={24} />
                  </div>
                </div>
              </button>

              {/* To Section */}
              <button 
                onClick={() => setIsSelectingContact(true)}
                className="w-full p-5 text-left active:bg-gray-50 transition-colors group"
              >
                <p className="text-gray-500 text-[11px] font-medium mb-1">To</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <p className={`text-[14px] font-medium ${selectedContact ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                      {selectedContact || 'Select contact'}
                    </p>
                    {selectedContact && (
                      <p className="text-gray-500 text-[12px] font-medium">
                        {contacts.find(c => c.name === selectedContact)?.email}
                      </p>
                    )}
                  </div>
                  <div className="text-[#ED0711] group-active:translate-y-0.5 transition-transform">
                    <ChevronDownIcon color="currentColor" size={24} />
                  </div>
                </div>
              </button>
            </div>

            {/* Amount Card */}
            <div className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-sm">
              <p className="text-gray-900 font-bold text-[14px] mb-3">Amount</p>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  value={amount}
                  onFocus={() => amount === '0.00' && setAmount('')}
                  onBlur={() => !amount && setAmount('0.00')}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  className="w-full bg-transparent text-gray-900 text-[14px] font-medium outline-none placeholder:text-gray-400 py-1"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-100" />
              </div>
            </div>

            {/* Security Question & Answer (Visible when contact is selected) */}
            {selectedContactData && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-sm space-y-4"
              >
                <div>
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Security Question</p>
                  <p className="text-gray-900 font-medium text-[14px]">{selectedContactData.question || 'No question set'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Security Answer</p>
                  <p className="text-gray-900 font-medium text-[14px]">{selectedContactData.answer || 'No answer set'}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === 'manage' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <section className="space-y-3">
              <h2 className="text-gray-900 font-bold text-[16px] px-1">Pending Transfers</h2>
              <div className="space-y-3">
                {pendingTransfers.map((transfer) => (
                  <div key={transfer.id} className="bg-white rounded-[16px] border border-gray-200 p-5 shadow-sm flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer">
                    <div>
                      <p className="text-gray-900 font-bold text-[14px]">{transfer.name}</p>
                      <p className="text-gray-500 text-[12px] font-medium">{transfer.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 font-bold text-[14px]">${transfer.amount.toFixed(2)}</p>
                      <p className="text-[#ED0711] text-[10px] font-extrabold uppercase tracking-wider mt-0.5">{transfer.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              {pendingTransfers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 font-medium">No pending transfers</p>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-gray-900 font-bold text-[16px]">Manage Contacts</h2>
                <button 
                  onClick={() => setIsAddingContact(true)}
                  className="text-[#ED0711] font-bold text-[14px]"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div 
                    key={contact.id}
                    onClick={() => startEditing(contact)}
                    className="bg-white rounded-[16px] border border-gray-200 p-4 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#ED0711] font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-bold text-[14px]">{contact.name}</p>
                      <p className="text-gray-500 text-[11px]">{contact.email}</p>
                    </div>
                    <ChevronDownIcon className="-rotate-90 text-gray-300" size={20} />
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {activeTab === 'request' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScotiaLogoSVG color="#ED0711" className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-gray-400 font-medium">Request money feature coming soon</p>
          </motion.div>
        )}
      </div>

      {/* Contact Selection View */}
      {isSelectingContact && (
        <div className="absolute inset-0 bg-white z-[300] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b border-gray-100">
            <button onClick={() => setIsSelectingContact(false)} className="text-gray-900 p-2">
              <BackIcon color="currentColor" size={24} />
            </button>
            <h2 className="text-gray-900 font-bold text-[16px]">Select Contact</h2>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            <button 
              onClick={() => setIsAddingContact(true)}
              className="w-full p-4 bg-gray-50 rounded-[12px] flex items-center gap-3 active:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-[#ED0711]/10 flex items-center justify-center">
                <span className="text-[#ED0711] text-[20px] font-bold">+</span>
              </div>
              <span className="text-gray-900 font-bold">Add new contact</span>
            </button>
            
            <div className="pt-4 pb-2">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider px-1">All Contacts</p>
            </div>
            
            {contacts.map((contact) => (
              <button 
                key={contact.id}
                onClick={() => {
                  setViewingContact(contact);
                }}
                className="w-full p-4 bg-white border border-gray-100 rounded-[12px] flex items-center justify-between text-left active:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold">{contact.name}</span>
                  <span className="text-gray-500 text-[11px]">{contact.email}</span>
                </div>
                <div className="text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {viewingContact && !isAddingContact && (
        <div className="absolute inset-0 bg-white z-[350] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b border-gray-100">
            <button onClick={() => setViewingContact(null)} className="text-gray-900 p-2">
              <BackIcon color="currentColor" size={24} />
            </button>
            <h2 className="text-gray-900 font-bold text-[16px]">Contact Details</h2>
            <button onClick={() => startEditing(viewingContact)} className="text-[#ED0711] font-bold text-[14px] p-2">Edit</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="flex flex-col items-center text-center pb-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-[#ED0711] font-bold text-[32px]">
                {viewingContact.name.charAt(0)}
              </div>
              <h3 className="text-gray-900 font-bold text-[20px]">{viewingContact.name}</h3>
              <p className="text-gray-500">{viewingContact.email}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-[16px] p-5 border border-gray-100">
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Security Question</p>
                <p className="text-gray-900 font-medium">{viewingContact.question || 'Not set'}</p>
              </div>

              <div className="bg-gray-50 rounded-[16px] p-5 border border-gray-100">
                <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Security Answer</p>
                <p className="text-gray-900 font-medium">{viewingContact.answer ? '••••••••' : 'Not set'}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                setSelectedContact(viewingContact.name);
                setViewingContact(null);
                setIsSelectingContact(false);
              }}
              className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all"
            >
              Select for Transfer
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Contact Modal */}
      {isAddingContact && (
        <div className="absolute inset-0 bg-white z-[400] flex flex-col animate-in slide-in-from-bottom-full duration-300">
          <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b border-gray-100">
            <button onClick={() => { setIsAddingContact(false); setIsEditingContact(false); }} className="text-gray-900 p-2">
              <BackIcon color="currentColor" size={24} />
            </button>
            <h2 className="text-gray-900 font-bold text-[16px]">{isEditingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
            <div className="w-10" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="space-y-2">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Full Name</label>
              <input 
                type="text"
                placeholder="Enter name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-4 text-gray-900 outline-none focus:border-[#ED0711] transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Email Address</label>
              <input 
                type="email"
                placeholder="Enter email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-4 text-gray-900 outline-none focus:border-[#ED0711] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Security Question</label>
              <input 
                type="text"
                placeholder="Enter question"
                value={newContactQuestion}
                onChange={(e) => setNewContactQuestion(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-4 text-gray-900 outline-none focus:border-[#ED0711] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Security Answer</label>
              <input 
                type="text"
                placeholder="Enter answer"
                value={newContactAnswer}
                onChange={(e) => setNewContactAnswer(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-[12px] p-4 text-gray-900 outline-none focus:border-[#ED0711] transition-colors"
              />
            </div>
            
            <button 
              onClick={handleAddContact}
              disabled={!newContactName || !newContactEmail}
              className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 mt-4"
            >
              {isEditingContact ? 'Update Contact' : 'Save Contact'}
            </button>
          </div>
        </div>
      )}

      {/* Footer / Slider */}
      {activeTab === 'send' && (
        <div className="p-8 pb-12 flex justify-center bg-[#F4F4F4]">
          {!isSent && !isFailed && !isLoading && (
            <div 
              ref={sliderRef}
              className="relative w-full max-w-[360px] h-[64px] bg-white rounded-full p-1 flex items-center shadow-md overflow-hidden border border-gray-200"
            >
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ opacity }}
              >
                <span className="text-gray-400 font-bold text-[14px] tracking-tight">Slide to send</span>
              </motion.div>
              
              <motion.div
                drag={isValid ? "x" : false}
                dragConstraints={{ left: 0, right: slideRange }}
                dragElastic={0}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`w-14 h-14 rounded-full flex items-center justify-center z-10 shadow-lg ${isValid ? 'bg-[#ED0711] cursor-grab active:cursor-grabbing' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>
          )}
          {(isSent || isFailed || isLoading) && (
            <div className="h-[64px]" /> // Placeholder to maintain layout
          )}
        </div>
      )}

      {/* Confirmation Notice */}
      {isConfirming && (
        <div className="absolute inset-0 bg-black/60 z-[500] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-[320px] rounded-[24px] p-6 border border-gray-200 shadow-2xl"
          >
            <h2 className="text-gray-900 font-bold text-[18px] mb-2 text-center">Confirm Transfer</h2>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to send <span className="text-gray-900 font-bold">${amount}</span> to <span className="text-gray-900 font-bold">{selectedContact || 'this contact'}</span>?
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleConfirmSend}
                className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-full shadow-lg active:scale-[0.98] transition-all"
              >
                Send Now
              </button>
              <button 
                onClick={handleCancelSend}
                className="w-full py-4 bg-gray-100 text-gray-900 font-bold rounded-full active:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Status Overlays */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-[1000] flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="mb-6"
            >
              <Loader2 size={64} className="text-[#ED0711]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Transfer</h2>
            <p className="text-gray-500">Please wait while we securely process your Interac e-Transfer...</p>
          </motion.div>
        )}

        {isSent && (
          <motion.div 
            key="success"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 bg-white z-[1000] flex flex-col pt-12"
          >
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
                <CheckCircle2 size={48} className="text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transfer Successful</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                Your transfer of <span className="text-gray-900 font-bold">${amount}</span> to <span className="text-gray-900 font-bold">{selectedContact}</span> has been sent.
              </p>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={() => {
                    setIsSent(false);
                    onBack();
                  }}
                  className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isFailed && (
          <motion.div 
            key="failure"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 bg-white z-[1000] flex flex-col pt-12"
          >
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
                <XCircle size={48} className="text-[#ED0711]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transfer Failed</h2>
              <p className="text-gray-500 mb-12 max-w-xs">
                We encountered an error while processing your transfer. Your funds have not been moved.
              </p>
              
              <div className="w-full space-y-4 px-4">
                <button 
                  onClick={() => setIsFailed(false)}
                  className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <RefreshCcw size={20} />
                  Try Again
                </button>
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('scotia_open_chat'));
                    setIsFailed(false);
                  }}
                  className="w-full py-4 bg-white border-2 border-[#ED0711] text-[#ED0711] font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageSquare size={20} />
                  Contact Support
                </button>
                <button 
                  onClick={() => {
                    setIsFailed(false);
                    onBack();
                  }}
                  className="w-full py-4 text-gray-400 font-medium"
                >
                  Cancel and return
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OTPVerification 
        isOpen={showAddContactOTP} 
        onClose={() => setShowAddContactOTP(false)} 
        onSuccess={handleOTPSuccess} 
        phoneNumberEnding="452"
      />
      {showAccountSelector && (
        <AccountSelector
          accounts={accounts}
          onSelect={setSelectedAccount}
          onClose={() => setShowAccountSelector(false)}
        />
      )}
    </div>
  );
};

export default InteracETransferView;
