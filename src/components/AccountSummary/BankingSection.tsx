import React from 'react';
import { ScotiaAccount } from '../../shared/types';
import { ChevronRightIcon } from '../ScotiaIcons';

interface BankingSectionProps {
    theme: 'light' | 'dark';
    entries: [string, ScotiaAccount][];
    isExpanded: boolean;
    onToggle: () => void;
    onSelect: (name: string) => void;
    total: number;
}

const BankingSection: React.FC<BankingSectionProps> = ({ entries, isExpanded, onToggle, onSelect }) => {
    // Force white background for "account overview" as requested
    return (
        <div className="bg-white border-gray-200 rounded-[12px] border p-4 shadow-sm">
            <button onClick={onToggle} className="flex items-center justify-between w-full mb-4">
                <span className="font-bold text-[14px] text-[#ED0711]">Banking ({entries.length})</span>
                <ChevronRightIcon size={20} color="#ED0711" className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isExpanded && (
                <div className="space-y-4">
                    {entries.map(([name, acc], index) => (
                        <button 
                            key={name} 
                            onClick={() => onSelect(name)} 
                            className={`flex flex-col w-full text-left active:opacity-60 transition-opacity pb-4 ${index !== entries.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <div className="flex items-center gap-1">
                                <p className="font-bold text-[14px] text-gray-900">{name}</p>
                                <p className="text-[14px] text-gray-400">({acc.accountNumber || '0000'})</p>
                            </div>
                            <p className="font-bold text-[14px] text-gray-900 mt-1">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </button>
                    ))}
                    <button className="text-[#ED0711] text-[14px] font-medium pt-2">
                        View more (3)
                    </button>
                </div>
            )}
        </div>
    );
};

export default BankingSection;
