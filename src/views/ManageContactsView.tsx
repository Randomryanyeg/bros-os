import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Search, Star, ChevronRight, UserPlus } from 'lucide-react';
import { useBank } from '../shared/BankContext';
import { Contact } from '../shared/types';
import { AddContactView } from '../components/AddContactView';
import { EditContactView } from '../components/EditContactView';

interface ManageContactsViewProps {
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export const ManageContactsView: React.FC<ManageContactsViewProps> = ({ onBack, theme = 'light' }) => {
  const { user, updateUser } = useBank();
  const isDark = theme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  if (!user) return null;

  const toggleFavorite = (e: React.MouseEvent, contact: Contact) => {
    e.stopPropagation();
    const updatedContacts = user.contacts.map(c => 
      c.id === contact.id ? { ...c, isFavorite: !c.isFavorite } : c
    );
    updateUser({ contacts: updatedContacts });
  };

  const filteredContacts = user.contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favorites = filteredContacts.filter(c => c.isFavorite);
  const allContacts = [...filteredContacts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className={`absolute inset-0 z-[150] flex flex-col ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F4F4F4] text-gray-900'}`}
    >
      {/* Header */}
      <div className={`pt-12 pb-4 px-4 flex items-center justify-between border-b shrink-0 ${isDark ? 'bg-[#1E1E1E] border-white/5' : 'bg-white border-gray-200'}`}>
        <button onClick={onBack} className="p-1 -ml-1 active:opacity-60 transition-opacity">
          <ArrowLeft size={24} className={isDark ? 'text-white' : 'text-gray-900'} />
        </button>
        <h1 className="font-bold text-[17px]">Manage contacts</h1>
        <button onClick={() => setShowAddContact(true)} className="p-1 -mr-1 active:opacity-60 transition-opacity">
          <Plus size={24} className="text-[#ED0711]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Search bar */}
        <div className={`relative flex items-center rounded-xl border ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-200'} shadow-sm`}>
          <Search size={18} className="absolute left-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search contacts" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3.5 pl-11 bg-transparent outline-none text-[14px] placeholder:text-gray-500" 
          />
        </div>

        {/* Add Contact Shortcut */}
        <button 
          onClick={() => setShowAddContact(true)}
          className={`w-full p-4 flex items-center justify-between rounded-xl border shadow-sm active:opacity-80 transition-opacity ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ED0711]/10">
              <UserPlus size={22} className="text-[#ED0711]" />
            </div>
            <div className="font-semibold text-[15px]">Add a new contact</div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </button>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider px-1 text-gray-500">Favourites</h2>
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-200'}`}>
              {favorites.map((c, idx) => (
                <div 
                  key={c.id} 
                  onClick={() => setEditingContact(c)}
                  className={`flex items-center justify-between p-4 active:bg-gray-50/5 transition-colors cursor-pointer ${idx !== favorites.length - 1 ? (isDark ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[15px] truncate">{c.name}</div>
                    <div className="text-[12px] text-gray-500 truncate mt-0.5">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <button onClick={(e) => toggleFavorite(e, c)} className="p-1">
                      <Star size={20} className="text-[#ED0711] fill-[#ED0711]" />
                    </button>
                    <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Contacts Section */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider px-1 text-gray-500">All Contacts ({allContacts.length})</h2>
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#1E1E1E] border-white/10' : 'bg-white border-gray-200'}`}>
            {allContacts.map((c, idx) => (
              <div 
                key={c.id} 
                onClick={() => setEditingContact(c)}
                className={`flex items-center justify-between p-4 active:bg-gray-50/5 transition-colors cursor-pointer ${idx !== allContacts.length - 1 ? (isDark ? 'border-b border-white/5' : 'border-b border-gray-100') : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px] truncate">{c.name}</div>
                  <div className="text-[12px] text-gray-500 truncate mt-0.5">{c.email}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <button onClick={(e) => toggleFavorite(e, c)} className="p-1">
                    <Star size={20} className={c.isFavorite ? "text-[#ED0711] fill-[#ED0711]" : "text-gray-300"} />
                  </button>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subviews */}
      <AddContactView 
        isOpen={showAddContact}
        onClose={() => setShowAddContact(false)}
        onSave={(contact) => {
          updateUser({ contacts: [...user.contacts, contact] });
          setShowAddContact(false);
        }}
        theme={theme}
      />

      <EditContactView 
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        contact={editingContact!}
        onSave={(updated) => {
          const updatedContacts = user.contacts.map(c => c.id === updated.id ? updated : c);
          updateUser({ contacts: updatedContacts });
          setEditingContact(null);
        }}
        onDelete={(id) => {
          const updatedContacts = user.contacts.filter(c => c.id !== id);
          updateUser({ contacts: updatedContacts });
          setEditingContact(null);
        }}
        theme={theme}
      />
    </motion.div>
  );
};
