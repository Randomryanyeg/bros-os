
import React from 'react';
import { ScotiaAccountMap } from '../shared/types';
import { GiftIcon, TransferIcon } from './ScotiaIcons';
import * as ScotiaIcons from './ScotiaIcons';
const ActivityIcon = ScotiaIcons.ActivityIcon;

interface UpdatesViewProps {
  accounts: ScotiaAccountMap;
  onAction?: (action: string) => void;
}

const UpdatesView: React.FC<UpdatesViewProps> = ({ onAction }) => {
  const updates = [
    { title: "Recent Transfer", desc: "Sent $50.00 to John Doe", icon: TransferIcon, color: "text-blue-500" },
    { title: "Account Activity", desc: "Purchase at Save-On-Foods: $45.20", icon: ActivityIcon, color: "text-green-500" },
    { title: "Special Offer", desc: "Get 5x Scene+ points on gas purchases.", icon: GiftIcon, color: "text-[#ED0711]" },
    { title: "Security Alert", desc: "New login detected on iPhone 15.", icon: ActivityIcon, color: "text-yellow-500" }
  ];

  return (
    <div className="px-6 py-6 space-y-4 animate-in fade-in">
        <h3 className="text-white font-bold text-lg mb-2">Recent Activity</h3>
        <button className="bg-[#ED0711] text-white w-full rounded-2xl py-3 font-bold text-sm shadow-lg mb-4">
            Sign Up Now
        </button>
        {updates.map((upd) => (
            <button onClick={() => onAction?.(upd.title)} key={upd.title} className="bg-[#1E1E1E] w-full rounded-2xl border border-white/10 p-4 flex gap-4 text-left shadow-sm active:scale-[0.98] transition-all">
                <div className="w-12 h-12 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0">
                    <upd.icon size={24} className={upd.color} />
                </div>
                <div className="flex-1">
                    <h4 className="text-white font-bold text-[15px] mb-1">{upd.title}</h4>
                    <p className="text-gray-400 text-[13px] leading-tight">{upd.desc}</p>
                </div>
            </button>
        ))}
    </div>
  );
};

export default UpdatesView;
