import React from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Lock, 
  ShoppingCart, 
  Copy, 
  Star, 
  MessageSquare, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';
import { UserSettings } from '../shared/types';
import { User as UserType } from '../shared/BankContext';

interface MoreViewProps {
  onSignOut: () => void;
  onAction: (action: string) => void;
  theme?: 'light' | 'dark';
  interacWarningEnabled?: boolean;
  setInteracWarningEnabled?: (enabled: boolean) => void;
  updateSettings?: (settings: Partial<UserSettings>) => void;
  currentUser?: UserType;
  onBack?: () => void;
  toggleAdminPanel?: () => void;
}

const MoreView: React.FC<MoreViewProps> = ({ 
  onSignOut, 
  onAction
}) => {
  const menuItems = [
    { label: 'Profile and settings', icon: <Settings size={22} className="text-[#6B7280]" />, action: 'profile_settings' },
    { label: 'Privacy and security', icon: <Lock size={22} className="text-[#0ea5e9]" />, action: 'security_privacy', isNew: true },
    { label: 'Products and services', icon: <ShoppingCart size={22} className="text-[#db2777]" />, action: 'products_services' },
    { label: 'Saved applications', icon: <Copy size={22} className="text-[#0284c7]" />, action: 'saved_applications' },
    { label: 'Get to know the app', icon: <Star size={22} className="text-[#eab308]" />, action: 'get_to_know' },
    { label: 'Contact us', icon: <MessageSquare size={22} className="text-[#334155]" />, action: 'contact_us' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex flex-col font-sans bg-white text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-6 flex items-center justify-between shrink-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] z-10">
        <ScotiaLogoSVG color="#ED0711" className="w-8 h-8" />
        <h1 className="text-[16px] font-bold tracking-tight text-gray-900">More</h1>
        <button className="p-1">
          <HelpCircle size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
        <div className="bg-white mt-6">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onAction(item.action)}
              className="w-full flex items-center px-8 py-4 bg-white active:bg-gray-50 transition-colors"
            >
              <div className="w-10 flex justify-start">
                {item.icon}
              </div>
              <span className="flex-1 text-left text-[16px] text-[#333333]">{item.label}</span>
              {item.isNew && (
                <span className="mr-4 bg-[#C2185B] text-white text-[11px] font-bold px-2 py-1 rounded-md">NEW</span>
              )}
              <ChevronRight size={20} className="text-[#9333ea]" />
            </button>
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="px-8 mt-6">
          <button 
            onClick={onSignOut}
            className="w-full py-3.5 rounded-lg border border-[#ED0711] text-[#ED0711] font-bold text-[16px] flex items-center justify-center active:bg-[#ED0711]/10 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Device Info */}
        <div className="px-8 mt-auto mb-24 pt-12">
          <p className="text-[16px] text-gray-500 mb-1"><span className="font-bold text-gray-600">Model:</span> iphone 8</p>
          <p className="text-[16px] text-gray-500 mb-1"><span className="font-bold text-gray-600">OS Version:</span> 10</p>
          <p className="text-[16px] text-gray-500"><span className="font-bold text-gray-600">App Version:</span> 20.9.2</p>
        </div>
      </div>
    </motion.div>
  );
};

export default MoreView;
