import React, { useState, useMemo } from 'react';
import { ScotiaAccountMap, ScotiaAccount } from '../shared/types';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';
import { MessageCircle, ChevronUp, ChevronRight, Bell, Lock, ArrowLeft, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { User } from '../shared/types';

interface HomeViewProps {
    theme: 'light' | 'dark';
    accounts: ScotiaAccountMap;
    onSelectAccount: (name: string) => void;
    onAction: (action: string) => void;
    onChat: () => void;
    currentUser: User | null;
}

const HomeView: React.FC<HomeViewProps> = ({ 
    accounts, 
    onSelectAccount, 
    onAction, 
    onChat,
    currentUser 
}) => {
    const [subTab, setSubTab] = useState<'accounts' | 'updates'>('accounts');
    const [bankingExpanded, setBankingExpanded] = useState(true);
    const [creditExpanded, setCreditExpanded] = useState(true);
    
    // Speed tap logic
    const [tapCount, setTapCount] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [showPinPrompt, setShowPinPrompt] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState(false);

    const handleLogoTap = () => {
        const now = Date.now();
        if (now - lastTapTime < 500) {
            const newCount = tapCount + 1;
            setTapCount(newCount);
            if (newCount >= 5) {
                setShowPinPrompt(true);
                setTapCount(0);
            }
        } else {
            setTapCount(1);
        }
        setLastTapTime(now);
    };

    const handlePinSubmit = (enteredPin: string) => {
        const correctPin = currentUser?.settings?.adminPin || '6969';
        if (enteredPin === correctPin) {
            setShowPinPrompt(false);
            setPin('');
            onAction('AdminSettings');
        } else {
            setPinError(true);
            setPin('');
            setTimeout(() => setPinError(false), 500);
        }
    };

    const bankingEntries = useMemo(() => 
        (Object.entries(accounts) as [string, ScotiaAccount][]).filter(([, acc]) => acc.type === 'banking'), 
    [accounts]);
    
    const creditEntries = useMemo(() => 
        (Object.entries(accounts) as [string, ScotiaAccount][]).filter(([, acc]) => acc.type === 'credit'), 
    [accounts]);

    const name = currentUser?.settings?.displayName || currentUser?.username?.split('@')[0] || 'First Name';
    
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-[#F4F7F9] overflow-hidden h-full font-sans">
            <div className="bg-[#ED0711] pt-12 pb-24 px-6 shrink-0 relative">
                <div className="flex items-center justify-between mb-6">
                    <div onClick={handleLogoTap} className="cursor-pointer active:scale-95 transition-transform">
                        <ScotiaLogoSVG color="white" className="w-11 h-11" />
                    </div>
                    <button onClick={onChat} className="p-1 active:scale-90 transition-transform">
                        <MessageCircle size={28} className="text-white" strokeWidth={1.5} />
                    </button>
                </div>
                <h1 className="text-white text-[22px] font-bold leading-tight mb-2">{greeting}, {name}</h1>
            </div>
            
            {/* Main Content Container - Overlapping Card */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 -mt-16 px-4 pb-24">
                <div className="bg-white rounded-[14px] shadow-sm overflow-hidden mb-4">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <TabButton 
                            active={subTab === 'accounts'} 
                            onClick={() => setSubTab('accounts')} 
                            label="My accounts" 
                        />
                        <TabButton 
                            active={subTab === 'updates'} 
                            onClick={() => setSubTab('updates')} 
                            label="My updates" 
                        />
                    </div>

                    {subTab === 'accounts' && (
                        <div className="px-4 pb-2">
                            <div className="flex items-center justify-between w-full py-5">
                                <span className="font-bold text-[18px] text-[#ED0711]">Banking ({bankingEntries.length})</span>
                                <ChevronUp size={24} color="#ED0711" className={`transition-transform ${!bankingExpanded ? 'rotate-180' : ''}`} onClick={() => setBankingExpanded(!bankingExpanded)} />
                            </div>
                            
                            {bankingExpanded && (
                                <div className="space-y-0">
                                    {bankingEntries.map(([name, acc]) => (
                                        <AccountRow 
                                            key={name}
                                            name={name} 
                                            balance={acc.balance || 0} 
                                            accountNumber={acc.accountNumber || '0000'} 
                                            isLast={false} 
                                            onClick={() => onSelectAccount(name)} 
                                        />
                                    ))}
                                    
                                    <div className="flex items-center justify-between py-5 border-t border-gray-100">
                                        <span className="font-bold text-[16px] text-gray-900">Total:</span>
                                        <span className="text-[16px] text-gray-600">
                                            ${bankingEntries.reduce((sum, [, acc]) => sum + (acc.balance || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {subTab === 'updates' && (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-xs">No new updates right now.</p>
                        </div>
                    )}
                </div>

                {subTab === 'accounts' && (
                    <>
                        <div className="bg-white rounded-[14px] shadow-sm px-4 pb-2 mb-4">
                            <div className="flex items-center justify-between w-full py-5">
                                <span className="font-bold text-[18px] text-[#ED0711]">Credit cards ({creditEntries.length})</span>
                                <ChevronUp size={24} color="#ED0711" className={`transition-transform ${!creditExpanded ? 'rotate-180' : ''}`} onClick={() => setCreditExpanded(!creditExpanded)} />
                            </div>
                            
                            {creditExpanded && (
                                <div className="space-y-0">
                                    {creditEntries.map(([name, acc]) => (
                                        <AccountRow 
                                            key={name}
                                            name={name} 
                                            balance={acc.balance || 0} 
                                            accountNumber={acc.accountNumber || '0000'} 
                                            isLast={false} 
                                            onClick={() => onSelectAccount(name)} 
                                        />
                                    ))}
                                    <div className="flex items-center justify-between py-5 border-t border-gray-100">
                                        <span className="font-bold text-[16px] text-gray-900">Total:</span>
                                        <span className="text-[16px] text-gray-600">
                                            ${creditEntries.reduce((sum, [, acc]) => sum + (acc.balance || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[14px] shadow-sm p-5 flex items-center justify-between active:bg-gray-50 transition-colors" onClick={() => onAction('AddProduct')}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <div className="relative">
                                        <CreditCard size={28} className="text-gray-700" />
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                            <div className="bg-[#00A4E4] rounded-full p-0.5">
                                                <div className="w-2.5 h-2.5 flex items-center justify-center text-white text-[10px] font-bold">+</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className="font-bold text-[18px] text-gray-800">Add a new product</span>
                            </div>
                            <ChevronRight size={24} className="text-[#00A4E4]" />
                        </div>
                    </>
                )}
            </div>

            {/* PIN Prompt Modal */}
            <AnimatePresence>
                {showPinPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center bg-[#1E1E1E] text-white"
                        >
                            <div className="w-16 h-16 bg-[#ED0711]/10 rounded-full flex items-center justify-center mb-6">
                                <Lock size={32} className="text-[#ED0711]" />
                            </div>
                            <h2 className="text-lg font-bold mb-2">Admin Access</h2>
                            <p className="text-xs text-gray-500 text-center mb-8">Enter PIN to unlock hidden settings</p>
                            
                            <div className="flex gap-4 mb-8">
                                {[0, 1, 2, 3].map((i) => (
                                    <div 
                                        key={i}
                                        className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-[#ED0711] border-[#ED0711]' : 'border-gray-600'} ${pinError ? 'bg-red-500 border-red-500 animate-shake' : ''}`}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 w-full">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((num, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            if (num === 'del') setPin(prev => prev.slice(0, -1));
                                            else if (num !== '') {
                                                if (pin.length < 4) {
                                                    const newPin = pin + num;
                                                    setPin(newPin);
                                                    if (newPin.length === 4) {
                                                        setTimeout(() => handlePinSubmit(newPin), 200);
                                                    }
                                                }
                                            }
                                        }}
                                        className={`h-16 rounded-2xl flex items-center justify-center text-lg font-bold active:bg-white/10 transition-colors ${num === '' ? 'pointer-events-none' : ''}`}
                                    >
                                        {num === 'del' ? <ArrowLeft size={24} /> : num}
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={() => { setShowPinPrompt(false); setPin(''); }}
                                className="mt-8 text-xs font-bold text-gray-500 uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-components

const TabButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
    <button 
        onClick={onClick} 
        className={`flex-1 py-5 text-center font-bold text-[18px] flex flex-col items-center justify-center transition-all duration-300 ${active ? 'text-[#ED0711]' : 'text-[#666666]'}`}
    >
        {label}
        <div className={`mt-2 w-full h-[3px] transition-colors duration-300 ${active ? 'bg-[#ED0711]' : 'bg-transparent'}`} />
    </button>
);

const AccountRow = ({ name, balance, accountNumber, onClick }: { 
    name: string, 
    balance: number, 
    accountNumber?: string, 
    isLast: boolean, 
    onClick: () => void,
}) => (
    <button 
        onClick={onClick} 
        className="flex flex-col py-5 w-full text-left active:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
    >
        <div className="flex items-center gap-1 mb-1">
            <p className="font-bold text-[18px] text-gray-800">{name}</p>
            <p className="text-[18px] text-gray-300 font-medium">({accountNumber?.replace('...', '') || '0000'})</p>
        </div>
        <p className="text-[18px] text-gray-900">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </button>
);

export default HomeView;
