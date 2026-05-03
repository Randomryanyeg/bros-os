
import React, { useEffect } from 'react';
import { ChevronRightIcon, InfoIcon, InteracLogoNew } from './ScotiaIcons';
import TopHeader from './TopHeader';

interface DashboardViewProps {
  user: { name: string; username: string };
}

const DashboardView: React.FC<DashboardViewProps> = ({ user }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('trigger-pwa-install'));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  const theme = 'dark';
  const onETransfer = () => console.log('E-transfer');
  const onChat = () => console.log('Chat');
  const onNotification = () => console.log('Notification');
  const bgClass = 'bg-black';
  const textClass = 'text-white';
  const subTextClass = 'text-zinc-500';
  const cardBgClass = 'bg-[#1c1c1e]';
  const cardBorderClass = 'border-white/5';
  const sectionBgClass = 'bg-[#0c0c0e]';
  const iconBgClass = 'bg-[#1c1c1e]';
  const iconBorderClass = 'border-white/10';

  return (
    <div className={`flex-1 flex flex-col ${bgClass} overflow-hidden h-full`}>
      <TopHeader theme={theme} title="Move money" onChat={onChat} onNotification={onNotification} />

      <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-6">
        {/* Quick Actions */}
        <div className="px-6 pb-6">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.15em]">Quick actions</span>
                    <InfoIcon size={14} color="#333" />
                </div>
                <button className="text-[#0071EB] font-bold text-[12px] active:opacity-60 transition-opacity">Hide actions</button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
                <div className={`w-[210px] shrink-0 ${cardBgClass} border ${cardBorderClass} rounded-[20px] shadow-sm flex flex-col relative overflow-hidden group`}>
                    <button className={`absolute top-3 right-3 w-7 h-7 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'} flex items-center justify-center active:opacity-60 transition-colors z-10`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#666' : '#999'} strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                    <div className="p-5 flex-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Interac</p>
                        <p className={`${textClass} font-bold text-[14px] leading-tight mb-5 line-clamp-2`}>{user.name || 'Abagail June Carruthers'}</p>
                        <p className={`${subTextClass} text-[11px] font-medium`}>Last sent: <span className={`${textClass} font-bold`}>Jul 27</span></p>
                    </div>
                    <button onClick={onETransfer} className={`w-full py-4 border-t ${cardBorderClass} text-[#3b82f6] font-black text-[12px] active:opacity-60 transition-all uppercase tracking-wider`}>Send</button>
                </div>

                <div className={`w-[210px] shrink-0 ${cardBgClass} border ${cardBorderClass} rounded-[20px] shadow-sm flex flex-col relative overflow-hidden group`}>
                    <button className={`absolute top-3 right-3 w-7 h-7 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'} flex items-center justify-center active:opacity-60 transition-colors z-10`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#666' : '#999'} strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                    <div className="p-5 flex-1">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Pay bills</p>
                        <p className={`${textClass} font-bold text-[14px] leading-tight mb-5 line-clamp-2`}>Rogers communications</p>
                        <p className={`${subTextClass} text-[11px] font-medium`}>Last paid: <span className={`${textClass} font-bold`}>Jul 27</span></p>
                    </div>
                    <button className={`w-full py-4 border-t ${cardBorderClass} text-[#3b82f6] font-black text-[12px] active:opacity-60 transition-all uppercase tracking-wider`}>Pay</button>
                </div>
            </div>
        </div>

        <div className={`h-[10px] ${sectionBgClass} w-full border-y ${cardBorderClass}`}></div>

        {/* Payments and Transfers List */}
        <div className={`px-6 py-8 ${bgClass}`}>
            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-10 px-1">Payments and transfers</h3>
            
            <div className="space-y-12">
                <button className="w-full flex items-center gap-6 group active:opacity-60 transition-all text-left">
                    <div className={`w-14 h-14 ${iconBgClass} rounded-2xl flex items-center justify-center border ${iconBorderClass} shadow-sm group-active:scale-95 transition-transform`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className={`${textClass} font-bold text-[14px] tracking-tight`}>Pay bills</p>
                        <p className={`${subTextClass} text-[12px] font-medium mt-1`}>Pay bills easily from anywhere</p>
                    </div>
                    <ChevronRightIcon color="#3b82f6" size={20} />
                </button>

                <button className="w-full flex items-center gap-6 group active:opacity-60 transition-all text-left">
                    <div className={`w-14 h-14 ${iconBgClass} rounded-2xl flex items-center justify-center border ${iconBorderClass} shadow-sm group-active:scale-95 transition-transform`}>
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/></svg>
                    </div>
                    <div className="flex-1">
                        <p className={`${textClass} font-bold text-[14px] tracking-tight`}>Transfer between accounts</p>
                        <p className={`${subTextClass} text-[12px] font-medium mt-1`}>Pay your credit card or transfer funds</p>
                    </div>
                    <ChevronRightIcon color="#3b82f6" size={20} />
                </button>

                <button onClick={onETransfer} className="w-full flex items-center gap-6 group active:opacity-60 transition-all text-left">
                    <div className={`w-14 h-14 ${theme === 'dark' ? 'bg-white/5' : 'bg-zinc-100'} rounded-2xl flex items-center justify-center relative border ${iconBorderClass} shadow-sm group-active:scale-95 transition-transform overflow-hidden`}>
                        <InteracLogoNew className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <p className={`${textClass} font-bold text-[14px] tracking-tight`}>Interac e-transfer</p>
                        <p className={`${subTextClass} text-[12px] font-medium mt-1`}>Transfer money: received in 30 mins or less</p>
                    </div>
                    <ChevronRightIcon color="#3b82f6" size={20} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
