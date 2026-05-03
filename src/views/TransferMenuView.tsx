import React, { useState } from 'react';
import { HelpCircle, ArrowLeft, UserPlus, Search, ChevronRight, Star, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useBank } from '../shared/BankContext';
import { Contact } from '../shared/types';

interface TransferMenuViewProps {
  onAction: (action: string) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
}

const TransferMenuView: React.FC<TransferMenuViewProps> = ({ onAction, onBack }) => {
  const { user, updateUser } = useBank();
  const [activeTab, setActiveTab] = useState<'Make a transfer' | 'Manage contacts'>('Make a transfer');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFavorite = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation();
    if (!user) return;
    const updatedContacts = user.contacts.map(c => 
      c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    
    const favoriteCount = updatedContacts.filter(c => c.isFavorite).length;
    if (!contact.isFavorite && favoriteCount > 5) {
      return;
    }

    updateUser({ contacts: updatedContacts });
  };

  const filteredContacts = user?.contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const favorites = filteredContacts.filter(c => c.isFavorite);
  const allContacts = [...filteredContacts].filter(c => !c.isFavorite).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[150] flex flex-col overflow-hidden bg-[#F4F4F4]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between shrink-0 bg-white border-b border-gray-200">
        <button onClick={activeTab === 'Manage contacts' ? () => setActiveTab('Make a transfer') : onBack} className="p-1 -ml-1">
          <ArrowLeft size={24} className="text-gray-900" />
        </button>
        <h1 className="font-bold text-[16px] text-gray-900">
          {activeTab === 'Manage contacts' ? 'Manage contacts' : 'Transfer'}
        </h1>
        <div className="w-8">
          {activeTab === 'Make a transfer' ? (
            <button className="p-1 -mr-1">
              <HelpCircle size={24} strokeWidth={1.5} className="text-gray-900" />
            </button>
          ) : (
            <button onClick={() => onAction('add-contact')} className="p-1 -mr-1">
              <Plus size={24} className="text-[#ED0711]" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b shrink-0 bg-white border-gray-200">
        {['Make a transfer', 'Manage contacts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'Make a transfer' | 'Manage contacts')}
            className={`flex-1 py-3.5 text-[13px] font-bold relative ${activeTab === tab ? 'text-[#ED0711]' : 'text-gray-500'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#ED0711]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {activeTab === 'Make a transfer' ? (
          <div className="space-y-4">
            <button onClick={() => onAction('Transfer between accounts')} className="w-full p-5 flex items-center justify-between text-left rounded-xl border shadow-sm transition-colors bg-white border-gray-200 active:bg-gray-50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[14px] mb-1 text-gray-900">Transfer between accounts</h3>
                <p className="text-[12px] leading-snug text-gray-500">Pay your credit card or transfer money between your Scotiabank accounts</p>
              </div>
              <div className="shrink-0">
                <TransferBetweenIcon />
              </div>
            </button>

            <button onClick={() => onAction('Interac e-Transfer')} className="w-full p-5 flex items-center justify-between text-left rounded-xl border shadow-sm transition-colors bg-white border-gray-200 active:bg-gray-50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[14px] mb-1 text-gray-900">Send money</h3>
                <p className="text-[12px] leading-snug text-gray-500">Email money with Interac e-Transfer to anyone with a Canadian bank account.</p>
              </div>
              <div className="shrink-0">
                <InteracIcon />
              </div>
            </button>

            <button onClick={() => onAction('Deposit a cheque')} className="w-full p-5 flex items-center justify-between text-left rounded-xl border shadow-sm transition-colors bg-white border-gray-200 active:bg-gray-50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[14px] mb-1 text-gray-900">Deposit a cheque</h3>
                <p className="text-[12px] leading-snug text-gray-500">Take a picture of your cheque and we'll deposit the funds into your account</p>
              </div>
              <div className="shrink-0">
                <DepositChequeIcon />
              </div>
            </button>

            <button onClick={() => onAction('Bank deposit')} className="w-full p-5 flex items-center justify-between text-left rounded-xl border shadow-sm transition-colors bg-white border-gray-200 active:bg-gray-50">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[14px] mb-1 text-gray-900">Send money internationally</h3>
                <p className="text-[12px] leading-snug text-gray-500">Send cash pickups or bank deposits to your friends and family all over the world.</p>
              </div>
              <div className="shrink-0">
                <InternationalIcon />
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add a new contact card */}
            <button 
              onClick={() => onAction('add-contact')} 
              className="w-full p-4 flex items-center justify-between rounded-xl bg-white border border-gray-200 shadow-sm active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ED0711]/10">
                  <UserPlus size={22} className="text-[#ED0711]" />
                </div>
                <div className="font-semibold text-[15px] text-gray-900">Add a new contact</div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            {/* Search bar */}
            <div className="relative flex items-center rounded-xl bg-white border border-gray-200">
              <Search size={18} className="absolute left-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search contacts" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3.5 pl-11 bg-transparent outline-none text-[14px] text-gray-900 placeholder:text-gray-500" 
              />
            </div>

            {/* Favourites Section */}
            {favorites.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[10px] font-bold uppercase tracking-wider px-1 text-gray-500">
                  FAVOURITES ({favorites.length}/5)
                </h2>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {favorites.map((c, idx) => (
                    <div 
                      key={c.id} 
                      className={`relative ${idx !== favorites.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div 
                        onClick={() => onAction(`contact-${c.id}`)}
                        className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[16px] text-gray-900 truncate">{c.name}</div>
                          <div className="text-[13px] text-gray-500 truncate mt-0.5">{c.email}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <button 
                            onClick={(e) => toggleFavorite(e, c)}
                            className="p-1"
                          >
                            <Star size={22} className="text-[#ED0711] fill-[#ED0711]" />
                          </button>
                          <ChevronRight size={18} className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Section */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-wider px-1 text-gray-500">
                ALL CONTACTS ({allContacts.length})
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {allContacts.map((c, idx) => (
                  <div 
                    key={c.id} 
                    className={`relative ${idx !== allContacts.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div 
                      onClick={() => onAction(`contact-${c.id}`)}
                      className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[14px] text-gray-900 truncate">{c.name}</div>
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">{c.email}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <button 
                          onClick={(e) => toggleFavorite(e, c)}
                          className="p-1"
                        >
                          {c.isFavorite ? (
                            <Star size={22} className="text-[#ED0711] fill-[#ED0711]" />
                          ) : (
                            <Star size={22} className="text-gray-300" />
                          )}
                        </button>
                        <ChevronRight size={18} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom close button */}
      <div className="p-4 border-t bg-white border-gray-200">
        <button onClick={onBack} className="w-full py-3.5 rounded-full font-bold text-[14px] bg-gray-100 text-gray-900">
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

// Icons

const TransferBetweenIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="8" width="18" height="11" rx="2" stroke="#E11D48" strokeWidth="1.5"/>
    <path d="M3 12h18" stroke="#E11D48" strokeWidth="1.5"/>
    <path d="M7 15h4" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="15" cy="15" r="1" fill="#E11D48"/>
    <path d="M12 4a3 3 0 0 1 3 3v1H9V7a3 3 0 0 1 3-3z" stroke="#6B21A8" strokeWidth="1.5"/>
    <circle cx="12" cy="4" r="1" fill="#6B21A8"/>
  </svg>
);

const InternationalIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0082C8" strokeWidth="1.5"/>
    <path d="M2 12h20" stroke="#0082C8" strokeWidth="1.5"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#0082C8" strokeWidth="1.5"/>
  </svg>
);

export default TransferMenuView;
