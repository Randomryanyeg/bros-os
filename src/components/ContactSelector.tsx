import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, UserPlus, Search, ChevronRight } from 'lucide-react';
import { Contact } from '../shared/types';

interface ContactSelectorProps {
  contacts: Contact[];
  onSelect: (contact: string) => void;
  onClose: () => void;
  onAddContact?: () => void;
  theme?: 'light' | 'dark';
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({ contacts, onSelect, onClose, onAddContact, theme = 'light' }) => {
  const isDark = false;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = filteredContacts.filter(c => c.isFavorite);
  const others = filteredContacts.filter(c => !c.isFavorite);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, we'd update the backend here
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className={`absolute inset-0 z-[300] flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F8F9FA] text-[#1A1A1A]'}`}
    >
      {/* Header */}
      <div className={`pt-12 pb-4 px-4 flex items-center border-b ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-100'} relative`}>
        <button onClick={onClose} className="p-2 -ml-2 z-10">
          <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-[#4A4A4A]'} />
        </button>
        <h1 className={`absolute inset-x-0 text-center font-bold text-[17px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Select contact</h1>
        <div className="w-8" />
      </div>
      
      <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
        {/* Add a new contact card */}
        <button 
          onClick={onAddContact} 
          className={`w-full p-4 flex items-center justify-between rounded-xl border shadow-lg transition-all active:scale-[0.98] ${isDark ? 'bg-[#1E1E1E] border-white/5 active:bg-white/5' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white' : 'bg-[#ED0711]/10'}`}>
              <UserPlus size={24} className="text-[#ED0711]" />
            </div>
            <div className={`font-bold text-[17px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'}`}>Add a new contact</div>
          </div>
          <ChevronRight size={20} className="text-[#ED0711]" />
        </button>

        {/* Search bar */}
        <div className={`relative flex items-center rounded-xl border ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-200'}`}>
          <Search size={20} className="absolute left-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search contacts" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-4 pl-12 bg-transparent outline-none text-[16px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'} placeholder-gray-500`} 
          />
        </div>

        {/* Favourites Section */}
        {favorites.length > 0 && (
          <div className="space-y-4">
            <h2 className={`text-[11px] font-bold uppercase tracking-[0.1em] px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              FAVOURITES ({favorites.length}/5)
            </h2>
            <div className="space-y-2">
              {favorites.map((c) => (
                <div 
                  key={`${c.id || c.email || c.name}-fav`} 
                  onClick={() => { onSelect(c.name); onClose(); }} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${isDark ? 'bg-[#1E1E1E] border-white/5 active:bg-white/5' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button onClick={(e) => handleToggleFavorite(e)} className="shrink-0 p-1">
                      <Star size={24} className="text-blue-400 fill-blue-400" />
                    </button>
                    <div className="min-w-0">
                      <div className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'} truncate`}>{c.name}</div>
                      <div className={`text-[13px] ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate`}>{c.email}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-[#ED0711] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Section */}
        <div className="space-y-4 pb-10">
          <h2 className={`text-[11px] font-bold uppercase tracking-[0.1em] px-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            CONTACTS ({others.length})
          </h2>
          <div className="space-y-2">
            {others.map((c) => (
              <div 
                key={`${c.id || c.email || c.name}-other`} 
                onClick={() => { onSelect(c.name); onClose(); }} 
                className={`flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${isDark ? 'bg-[#1E1E1E] border-white/5 active:bg-white/5' : 'bg-white border-gray-100'}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button onClick={(e) => handleToggleFavorite(e)} className="shrink-0 p-1">
                    <Star size={24} className="text-gray-600" />
                  </button>
                  <div className="min-w-0">
                    <div className={`font-bold text-[16px] ${isDark ? 'text-white' : 'text-[#1A1A1A]'} truncate`}>{c.name}</div>
                    <div className={`text-[13px] ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate`}>{c.email}</div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#ED0711] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
