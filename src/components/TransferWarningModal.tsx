
import React from 'react';
import { AlertIcon } from './ScotiaIcons';

const TransferWarningModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="absolute inset-0 z-[600] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
        <div className="bg-[#1c1c1e] w-full max-w-sm rounded-[32px] border border-white/10 p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#ED0711]/10 rounded-full flex items-center justify-center mb-8 text-[#ED0711] border border-[#ED0711]/20">
                    <AlertIcon size={40} color="#ED0711" />
                </div>
                <h3 className="text-white font-black text-2xl mb-4 tracking-tighter uppercase">Security Protocol</h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
                    Your Interac e-Transfer has been successfully released to the grid. The transaction is now immutable and being processed by the recipient's institution.
                </p>
                <button 
                    onClick={onClose} 
                    className="w-full py-5 bg-[#ED0711] text-white font-black rounded-2xl text-[14px] hover:bg-red-600 transition-colors uppercase tracking-widest shadow-xl shadow-red-500/10"
                >
                    Acknowledge
                </button>
            </div>
        </div>
    </div>
);

export default TransferWarningModal;
