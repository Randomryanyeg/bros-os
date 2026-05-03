import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronDown, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Contact } from '../shared/types';

interface AddContactViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  theme?: 'light' | 'dark';
}

export const AddContactView: React.FC<AddContactViewProps> = ({ isOpen, onClose, onSave, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [method, setMethod] = useState('Email');
  const [email, setEmail] = useState('');
  const [methodError, setMethodError] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What is this for?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showSecurityFields, setShowSecurityFields] = useState(false);
  const [showAutoDepositModal, setShowAutoDepositModal] = useState(false);

  const handleMethodChange = (val: string) => {
    setMethod(val);
    setMethodError(val === 'Mobile' ? 'Mobile contact method is not supported.' : '');
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
  };

  const handleContinue = () => {
    if (!showSecurityFields) {
      // First click: Check auto-deposit
      setShowAutoDepositModal(true);
    } else {
      // Second click: Save contact directly
      handleSaveContact();
    }
  };

  const handleModalConfirm = () => {
    setShowAutoDepositModal(false);
    setShowSecurityFields(true);
  };

  const handleSaveContact = () => {
    // Save contact
    const contact = { 
      id: Date.now().toString(), 
      name, 
      email,
      securityQuestion,
      securityAnswer
    };
    onSave(contact);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className={`absolute inset-0 z-[400] flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-[#1A1A1A]'}`}
        >
          <div className={`pt-12 pb-3 px-4 flex items-center border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <button onClick={onClose} className="p-1 -ml-1">
              <ArrowLeft size={24} className={isDark ? 'text-gray-400' : 'text-[#4A4A4A]'} />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <h1 className="font-bold text-[17px]">Add new contact</h1>
            </div>
            <div className="w-8" />
          </div>

          <div className="flex-1 p-6 space-y-8">
            <UnderlineInput label="Contact name" value={name} onChange={setName} placeholder="First name Last name" isDark={isDark} />
            
            <div className="space-y-1.5">
              <div className={`text-[14px] font-medium ml-1 ${isDark ? 'text-gray-400' : 'text-[#4A4A4A]'}`}>Contact method</div>
              <div className="relative">
                <select 
                  className={`w-full p-2 border-b outline-none appearance-none ${isDark ? 'bg-[#121212] border-white/20 text-white focus:border-[#ED0711]' : 'bg-white border-gray-300 text-[#1A1A1A] focus:border-[#ED0711]'}`}
                  value={method}
                  onChange={e => handleMethodChange(e.target.value)}
                >
                  <option>Email</option>
                  <option>Mobile</option>
                </select>
                <ChevronDown className="absolute right-0 top-2 text-[#ED0711]" size={20} />
              </div>
              {methodError && <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{methodError}</p>}
            </div>

            <div className="space-y-1.5">
              <UnderlineInput label="Email" value={email} onChange={handleEmailChange} placeholder="name@email.com" isDark={isDark} />
              {showSecurityFields && (
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {email} is not registered for auto-deposit.
                </p>
              )}
            </div>

            {showSecurityFields && (
              <div className="space-y-4">
                <UnderlineInput label="Security Question" value={securityQuestion} onChange={setSecurityQuestion} isDark={isDark} placeholder="e.g. What is my dog's name?" />
                <UnderlineInput label="Security Answer" value={securityAnswer} onChange={setSecurityAnswer} isDark={isDark} placeholder="Answer" />
              </div>
            )}
          </div>

          <div className="p-6 flex justify-end items-center">
            <span className="text-[#ED0711] font-bold text-lg mr-4">Continue</span>
            <button 
              onClick={handleContinue}
              disabled={!!methodError || !email || (showSecurityFields && (!securityQuestion || !securityAnswer))}
              className="w-14 h-14 rounded-full bg-[#ED0711] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            >
              <ArrowRight size={28} />
            </button>
          </div>

          {/* Auto-deposit Modal */}
          {showAutoDepositModal && (
            <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/50 p-6">
              <div className={`p-8 rounded-[24px] max-w-[320px] w-full shadow-2xl animate-in fade-in zoom-in duration-200 ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#ED0711]/10 rounded-full flex items-center justify-center mb-4">
                    <ShieldCheck size={32} className="text-[#ED0711]" />
                  </div>
                  <h3 className={`text-[18px] font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Not Registered for Autodeposit</h3>
                  <p className={`text-[14px] leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {email} hasn't set up Autodeposit yet. This means they'll need to answer a security question to receive the funds you send.
                    <br /><br />
                    <strong>Why use Autodeposit?</strong><br />
                    Autodeposit is a secure way to receive funds without having to answer a security question. It's faster and more convenient for both the sender and the recipient.
                    <br /><br />
                    <strong>Important:</strong> You'll need to create a security question and share the answer with them securely. They will use this answer to deposit the funds into their own bank account.
                    <br /><br />
                    Make sure the answer is something only they would know, or share it with them through a different channel.
                  </p>
                  <button 
                    onClick={handleModalConfirm} 
                    className="w-full bg-[#ED0711] text-white py-4 rounded-full font-bold shadow-lg active:scale-[0.98] transition-all"
                  >
                    Set Security Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UnderlineInput = React.forwardRef<HTMLInputElement, { label: string, value: string, onChange: (v: string) => void, placeholder?: string, isDark: boolean }>(({ label, value, onChange, placeholder, isDark }, ref) => (
  <div className="space-y-1.5">
    <div className={`text-[14px] font-medium ml-1 ${isDark ? 'text-gray-400' : 'text-[#4A4A4A]'}`}>{label}</div>
    <input 
      ref={ref}
      className={`w-full p-2 border-b outline-none focus:border-[#ED0711] ${isDark ? 'bg-[#121212] border-white/20 text-white' : 'bg-white border-gray-300 text-[#1A1A1A]'}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
));
