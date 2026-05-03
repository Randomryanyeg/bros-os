import React from 'react';
import { ChevronDownIcon } from '../../components/ScotiaIcons';

interface SelectionCardProps {
    label: string;
    value?: string;
    subtext?: string;
    onClick: () => void;
    empty?: boolean;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ label, value, subtext, onClick, empty = false }) => (
    <div onClick={onClick} className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 flex justify-between items-center active:bg-[#2c2c2e] transition-all cursor-pointer shadow-xl">
        <div className="flex-1 min-w-0">
            <p className="text-zinc-500 font-black text-[11px] uppercase tracking-widest mb-2">{label}</p>
            {empty ? (
                <p className="text-zinc-600 text-[16px] font-bold">Select {label.toLowerCase()}</p>
            ) : (
                <>
                    <p className={`font-black text-[17px] tracking-tight truncate ${value ? 'text-white' : 'text-zinc-600'}`}>{value}</p>
                    {subtext && <p className="text-zinc-500 text-[13px] mt-1 font-medium">{subtext}</p>}
                </>
            )}
        </div>
        <div className="bg-white/5 p-2.5 rounded-full ml-4">
            <ChevronDownIcon color="#ED0711" size={20} />
        </div>
    </div>
);

export default SelectionCard;