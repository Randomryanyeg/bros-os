
import React from 'react';
import { ScotiaLogoSVG, BackIcon } from './ScotiaIcons';
import { ScotiaAccount, ScotiaTransaction } from '../shared/types';

interface StatementViewProps {
  accountName: string;
  account: ScotiaAccount;
  onClose: () => void;
  displayName?: string;
  annualIncome?: number;
}

const StatementView: React.FC<StatementViewProps> = ({ accountName, account, onClose, displayName, annualIncome }) => {
  return (
    <div className="absolute inset-0 z-[400] bg-white flex flex-col animate-in fade-in overflow-hidden h-full">
      <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <button onClick={onClose} className="p-1"><BackIcon color="#333" size={20}/></button>
        <span className="text-gray-900 font-bold text-[12px] uppercase tracking-widest">Account Statement</span>
        <button className="text-[#ED0711] font-bold text-[12px] uppercase tracking-widest">Share</button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 text-black font-sans no-scrollbar bg-white">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              {/* Clean logo, colored for white background context */}
              <ScotiaLogoSVG color="#ED0711" className="w-10 h-10" />
              <span className="text-[#ED0711] font-black text-2xl tracking-tighter">Scotiabank</span>
            </div>
            <p className="text-[10px] font-bold text-gray-800">10088 102 Avenue NW</p>
            <p className="text-[10px] font-bold text-gray-800">Edmonton, AB T5J 2Z1</p>
          </div>
          <div className="text-right">
            <h2 className="text-[18px] font-black uppercase tracking-tight text-gray-300">Monthly Statement</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase">OCT 01, 2024 - OCT 31, 2024</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 flex justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Account Holder</p>
            <p className="text-[14px] font-black uppercase tracking-tight">{displayName || 'JENNIFER EDWARDS'}</p>
            <p className="text-[11px] text-gray-500 font-medium">{accountName}</p>
            {annualIncome && (
              <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">Annual Income: ${annualIncome.toLocaleString()}</p>
            )}
          </div>
          <div className="text-right space-y-1">
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Closing Balance</p>
             <p className="text-2xl font-black tracking-tight">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="space-y-4">
           {account.history.length === 0 ? (
             <div className="text-center py-10 text-gray-500 text-sm italic">
               No transactions available yet. Try making a transfer or a deposit to get started.
             </div>
           ) : (
             <>
               <div className="grid grid-cols-4 text-[9px] font-black text-gray-400 uppercase border-b border-gray-100 pb-2 tracking-widest">
                  <span className="col-span-1">Date</span>
                  <span className="col-span-2">Description</span>
                  <span className="col-span-1 text-right">Amount</span>
               </div>
               {account.history.slice(0, 18).map((tx: ScotiaTransaction) => (
                 <div key={tx.id} className="grid grid-cols-4 text-[10px] font-medium border-b border-gray-50 py-2.5">
                    <span className="col-span-1 text-gray-400 font-bold">{tx.date}</span>
                    <span className="col-span-2 font-bold truncate uppercase text-gray-800">{tx.description}</span>
                    <span className={`col-span-1 text-right font-black ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                       {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                 </div>
               ))}
             </>
           )}
        </div>

        <div className="pt-12 text-center text-[9px] text-gray-300 font-bold leading-relaxed uppercase tracking-widest">
           This statement is an electronically generated research record.<br/>
           Scotiabank is a registered trademark of The Bank of Nova Scotia.
        </div>
      </div>
    </div>
  );
};

export default StatementView;
