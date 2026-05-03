import React, { useState } from 'react';
import { ArrowLeft, Moon, Bell, Shield, Smartphone, Globe, Info, ChevronRight, Server, Key } from 'lucide-react';
import { motion } from 'motion/react';

import { ScotiaAccountMap, UserSettings } from '../shared/types';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';

interface SettingsViewProps {
  accounts: ScotiaAccountMap;
  onBack: () => void;
  onAction: (action: string) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  settings?: UserSettings;
  updateSettings?: (settings: Partial<UserSettings>) => void;
  toggleAdminPanel?: () => void;
  isAdmin?: boolean;
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isToggle?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  onBack, 
  onAction,
  settings,
  updateSettings,
  toggleAdminPanel,
  isAdmin
}) => {
  const [notifications, setNotifications] = useState(true);
  
  const SettingRow = ({ icon, label, value, isToggle, onToggle, onClick }: SettingRowProps) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 text-left active:bg-gray-50 transition-colors border-b border-gray-100`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-[11px] text-gray-900">{label}</p>
        {value && <p className="text-[10px] text-gray-500">{value}</p>}
      </div>
      {isToggle !== undefined ? (
        <div 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${isToggle ? 'bg-[#ED0711]' : 'bg-gray-300'}`}
        >
          <motion.div 
            animate={{ x: isToggle ? 20 : 0 }}
            className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm" 
          />
        </div>
      ) : (
        <ChevronRight size={18} className="text-gray-400" />
      )}
    </button>
  );

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-0 z-[300] flex flex-col bg-[#F8F9FA] text-[#1A1A1A]"
    >
      {/* Header */}
      <div className="pt-12 pb-4 px-4 flex items-center justify-between border-b shrink-0 bg-white border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} className="text-gray-600" /></button>
        <div className="flex items-center gap-2">
          <ScotiaLogoSVG color="#ED0711" className="w-6 h-6" />
          <h1 className="text-[13px] font-bold text-gray-900">Settings</h1>
        </div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Profile */}
        <div className="p-4 rounded-2xl border flex items-center gap-4 shadow-sm bg-white border-gray-200">
          <div className="w-12 h-12 rounded-full bg-[#ED0711] flex items-center justify-center text-white font-bold text-lg">
            {settings?.displayName?.[0] || 'JD'}
          </div>
          <div>
            <p className="font-bold text-xs text-gray-900">{settings?.displayName || 'John Doe'}</p>
            <p className="text-[10px] text-gray-500">Member since {settings?.memberSince || '2018'}</p>
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">Admin</h2>
            <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
              <SettingRow icon={<Server size={18} className="text-red-400" />} label="Admin Panel" onClick={() => { toggleAdminPanel?.(); onAction('AdminSettings'); }} />
              <SettingRow icon={<Key size={18} className="text-[#FF3B30]" />} label="API Explorer" onClick={() => onAction('ApiExplorer')} />
            </div>
          </section>
        )}

        {/* App Settings */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">App Settings</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <SettingRow icon={<Moon size={18} className="text-indigo-400" />} label="Dark Mode" value="Always On" />
            <SettingRow icon={<Bell size={18} className="text-pink-400" />} label="Notifications" isToggle={notifications} onToggle={() => setNotifications(!notifications)} />
            <SettingRow
              icon={<Shield size={18} className="text-orange-400" />}
              label="Interac Warning"
              isToggle={settings?.interacWarningEnabled ?? true}
              onToggle={() => updateSettings?.({ interacWarningEnabled: !(settings?.interacWarningEnabled ?? true) })}
            />
            <SettingRow
              icon={<Info size={18} className="text-blue-400" />}
              label="Attention Items"
              isToggle={settings?.attentionItemsEnabled ?? true}
              onToggle={() => updateSettings?.({ attentionItemsEnabled: !(settings?.attentionItemsEnabled ?? true) })}
            />
            <SettingRow icon={<Globe size={18} className="text-blue-400" />} label="Language" value="English (Canada)" />
          </div>
        </section>

        {/* Security */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">Security</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <SettingRow icon={<Smartphone size={18} className="text-orange-400" />} label="Trusted Devices" value="1 Device" />
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2 text-gray-400">About</h2>
          <div className="rounded-2xl border overflow-hidden shadow-sm bg-white border-gray-200">
            <SettingRow icon={<Info size={18} className="text-gray-400" />} label="App Version" value="24.3.0" />
            <SettingRow icon={<Shield size={18} className="text-gray-400" />} label="Privacy Policy" />
          </div>
        </section>

        <button className="w-full py-4 text-[#ED0711] font-bold active:scale-95 transition-transform">
          Sign out
        </button>
      </div>
    </motion.div>
  );
};

export default SettingsView;
