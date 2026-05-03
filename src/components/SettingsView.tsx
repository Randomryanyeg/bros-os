
import React from 'react';
import { ChevronRightIcon } from './ScotiaIcons';
import { ScotiaAccountMap } from '../shared/types';
import TopHeader from './TopHeader';

interface SettingsViewProps {
  accounts: ScotiaAccountMap;
  onBack: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleAdminPanel: () => void;
  isAdmin: boolean;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  accounts, 
  onBack,
  theme,
  setTheme,
  settings,
  updateSettings,
  toggleAdminPanel,
  isAdmin
}) => {
  const senderName = settings.accountHolderName || settings.phpmailerSenderName || 'Interac e-Transfer';

  return (
    <div className="flex-1 flex flex-col bg-black animate-in slide-up h-full">
      <TopHeader onBack={onBack} title="Settings" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-24 bg-black">
          <div className="bg-zinc-900 rounded-[24px] p-6 border border-white/5 shadow-lg flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#ED0711] flex items-center justify-center text-white font-bold text-xl">
                  {senderName[0]}
              </div>
              <div>
                  <p className="text-white font-bold text-lg">{senderName}</p>
                  <p className="text-zinc-500 text-xs mt-1">Last sign in: Today</p>
              </div>
          </div>

          <div className="space-y-3">
              <h3 className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest px-2">App Preferences</h3>
              <div className="bg-zinc-900 rounded-[20px] overflow-hidden border border-white/5 divide-y divide-white/5">
                  <div className="p-5 flex justify-between items-center">
                      <p className="text-white font-bold text-sm">Dark Mode</p>
                      <button 
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className={`w-12 h-6 rounded-full p-1 transition-all ${theme === 'dark' ? 'bg-[#ED0711]' : 'bg-zinc-700'}`}
                      >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                  </div>
                  <button 
                      onClick={() => window.dispatchEvent(new CustomEvent('trigger-pwa-install'))}
                      className="w-full p-5 flex justify-between items-center text-left active:bg-white/5 transition-all"
                  >
                      <div>
                          <p className="text-white font-bold text-sm">Install Mobile App</p>
                          <p className="text-zinc-500 text-xs mt-1">Add Scotiabank to your home screen</p>
                      </div>
                      <ChevronRightIcon color="#ED0711" size={14} />
                  </button>
              </div>
          </div>

          <div className="space-y-3">
              <h3 className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest px-2">Personal Information</h3>
              <div className="bg-zinc-900 rounded-[20px] overflow-hidden border border-white/5 divide-y divide-white/5">
                  <div className="p-5 flex justify-between items-center">
                      <div className="flex-1">
                          <p className="text-white font-bold text-sm">Account Holder Name</p>
                          <input 
                              type="text" 
                              value={settings.accountHolderName || ''} 
                              onChange={e => updateSettings({ accountHolderName: e.target.value })} 
                              className="bg-transparent text-zinc-400 text-xs mt-1 outline-none w-full font-medium placeholder-zinc-600"
                              placeholder="Enter Legal Name"
                          />
                      </div>
                      <ChevronRightIcon color="#555" size={14} />
                  </div>
                  <div className="p-5 flex justify-between items-center border-t border-white/5">
                      <div className="flex-1">
                          <p className="text-white font-bold text-sm">Email Display Name</p>
                          <input 
                              type="text" 
                              value={settings.phpmailerSenderName || ''} 
                              onChange={e => updateSettings({ phpmailerSenderName: e.target.value })} 
                              className="bg-transparent text-zinc-400 text-xs mt-1 outline-none w-full font-medium placeholder-zinc-600"
                              placeholder="Enter Display Name"
                          />
                      </div>
                      <ChevronRightIcon color="#555" size={14} />
                  </div>
                  <button className="w-full p-5 flex justify-between items-center text-left active:bg-white/5 transition-all">
                      <div>
                          <p className="text-white font-bold text-sm">Address</p>
                          <p className="text-zinc-500 text-xs mt-1">{settings.address || '123 Jasper Ave, Edmonton AB'}</p>
                      </div>
                      <ChevronRightIcon color="#555" size={14} />
                  </button>
              </div>
          </div>

          <div className="space-y-3">
              <h3 className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest px-2">Account Management</h3>
              <div className="bg-zinc-900 rounded-[20px] overflow-hidden border border-white/5 divide-y divide-white/5">
                  {Object.keys(accounts).map(name => (
                      <div key={name} className="p-5 flex justify-between items-center border-t border-white/5 bg-zinc-900/50">
                          <div className="flex-1">
                              <p className="text-white font-bold text-sm">{name}</p>
                              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-1">Display Balance</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-white font-bold">$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={accounts[name].balance} 
                                onChange={() => {
                                  // This would need a prop to update balance, but for now we'll just show it
                                  // In a real app, we'd call onAdjustBalance
                                }} 
                                className="bg-transparent text-white font-bold text-right outline-none w-24 focus:border-b focus:border-[#ED0711]" 
                            />
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {isAdmin && (
            <div className="space-y-3">
                <h3 className="text-zinc-500 font-bold text-[11px] uppercase tracking-widest px-2">Admin Settings</h3>
                <div className="bg-zinc-900 rounded-[20px] overflow-hidden border border-white/5 divide-y divide-white/5">
                    <button 
                        onClick={toggleAdminPanel}
                        className="w-full p-5 flex justify-between items-center text-left active:bg-white/5 transition-all"
                    >
                        <div>
                            <p className="text-white font-bold text-sm">Open Admin Panel</p>
                            <p className="text-zinc-500 text-xs mt-1">Access global system controls and logs</p>
                        </div>
                        <ChevronRightIcon color="#ED0711" size={14} />
                    </button>
                    <div className="p-5 flex justify-between items-center">
                        <p className="text-white font-bold text-sm">Maintenance Mode</p>
                        <button 
                            onClick={() => updateSettings({ maintenanceMode: !settings.maintenanceMode })}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${settings.maintenanceMode ? 'bg-[#ED0711]' : 'bg-zinc-700'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default SettingsView;
