import React, { useState } from 'react';
import TopHeader from '../components/TopHeader';

interface AddUserViewProps {
  onClose: () => void;
  onAddUser: (userData: Record<string, string>) => void;
}

const AddUserView: React.FC<AddUserViewProps> = ({ onClose, onAddUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accountPin, setAccountPin] = useState('');

  const handleAdd = () => {
    onAddUser({ name, email, accountPin });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[600] bg-white flex flex-col h-full animate-in slide-up">
      <TopHeader onBack={onClose} title="Add New User" />
      <div className="flex-1 p-6 space-y-6">
        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200">
          <p className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-3">Full Name</p>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="John Doe" 
            className="w-full bg-transparent text-black text-lg font-black outline-none placeholder:text-zinc-400" 
          />
        </div>
        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200">
          <p className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-3">Email Address</p>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="john@example.com" 
            className="w-full bg-transparent text-black text-lg font-black outline-none placeholder:text-zinc-400" 
          />
        </div>
        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200">
          <p className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-3">Account PIN</p>
          <input 
            type="password" 
            value={accountPin} 
            onChange={e => setAccountPin(e.target.value)} 
            placeholder="****" 
            maxLength={4}
            className="w-full bg-transparent text-black text-lg font-black outline-none placeholder:text-zinc-400" 
          />
        </div>
      </div>
      <div className="p-8 pb-12 border-t border-zinc-200">
        <button 
          onClick={handleAdd}
          disabled={!name || !email || !accountPin}
          className="w-full py-5 bg-[#ED0711] disabled:opacity-20 text-white font-black rounded-[22px] shadow-lg active:scale-95 transition-all uppercase tracking-widest text-[13px]"
        >
          Add User
        </button>
      </div>
    </div>
  );
};

export default AddUserView;
