
import React from 'react';
import { getApiUrl } from '../utils/apiConfig';
import { Check } from 'lucide-react';

import { useBank } from '../shared/BankContext';

interface LoginFlowProps {
  stage: string;
  username: string;
  setUsername: (u: string) => void;
  password: string;
  setPassword: (p: string) => void;
  onContinue: () => void;
  onSignIn: (u?: string, p?: string) => void; 
  onSwitchAccount: () => void;
  onForgotPassword?: () => void;
  rememberMe?: boolean;
  onToggleRememberMe?: () => void;
  isLoading?: boolean;
  error?: string | null;
  theme: 'light' | 'dark';
}

const LoginFlow: React.FC<LoginFlowProps> = ({ 
  stage, username, setUsername, password, setPassword, 
  onContinue, onSignIn, onSwitchAccount, onForgotPassword, rememberMe = false, onToggleRememberMe, isLoading, error, theme
}) => {
  const { toggleAdminPanel } = useBank();
  const isDark = theme === 'dark';
  const lastTapTime = React.useRef(0);
  const tapCounterRef = React.useRef(0);
  
  const handleLogoTap = () => {
      const now = Date.now();
      if (now - lastTapTime.current > 1000) {
          tapCounterRef.current = 1;
      } else {
          tapCounterRef.current += 1;
          if (tapCounterRef.current >= 5) {
              toggleAdminPanel();
              tapCounterRef.current = 0;
          }
      }
      lastTapTime.current = now;
  };

  const [localRememberMe, setLocalRememberMe] = React.useState(rememberMe);
  const [loginFailed, setLoginFailed] = React.useState(false);
  const [resetStage, setResetStage] = React.useState<'none' | 'username' | 'security_word' | 'new_password' | 'success' | 'signup_username' | 'signup_password' | 'signup_personal' | 'signup_contact' | 'signup_address' | 'signup_employment' | 'signup_security' | 'signup_account' | 'signup_success'>('none');
  const [resetUsername, setResetUsername] = React.useState('');
  const [signupUsernameInput, setSignupUsernameInput] = React.useState('');
  const [signupPasswordInput, setSignupPasswordInput] = React.useState('');
  const [signupFirstName, setSignupFirstName] = React.useState('');
  const [signupLastName, setSignupLastName] = React.useState('');
  const [signupEmail, setSignupEmail] = React.useState('');
  const [signupPhone, setSignupPhone] = React.useState('');
  const [signupAddress, setSignupAddress] = React.useState('');
  const [signupWorkplace, setSignupWorkplace] = React.useState('');
  const [signupIncome, setSignupIncome] = React.useState('');
  const [signupSecurityQuestion, setSignupSecurityQuestion] = React.useState('');
  const [signupSecurityAnswer, setSignupSecurityAnswer] = React.useState('');
  const [signupAccountType, setSignupAccountType] = React.useState('Checking');
  const [securityWordInput, setSecurityWordInput] = React.useState('');
  const [newPasswordInput, setNewPasswordInput] = React.useState('');
  const [resetError, setResetError] = React.useState<string | null>(null);
  const [dismissedError, setDismissedError] = React.useState(false);

  const effectiveRememberMe = onToggleRememberMe ? rememberMe : localRememberMe;

  const handleToggleRememberMe = () => {
    if (onToggleRememberMe) {
      onToggleRememberMe();
    } else {
      setLocalRememberMe(!localRememberMe);
    }
  };

  React.useEffect(() => {
    if (error) {
        setLoginFailed(true);
        setDismissedError(false);
    }
  }, [error]);

  const handleContinue = () => {
    onContinue();
  };

  const secureStorage = {
    set: (key: string, value: unknown) => {
        const str = JSON.stringify(value);
        localStorage.setItem(key, btoa(str));
    },
    get: (key: string) => {
        const val = localStorage.getItem(key);
        if (!val) return null;
        try {
            return JSON.parse(atob(val));
        } catch {
            return null;
        }
    },
    remove: (key: string) => localStorage.removeItem(key)
  };

  const handlePasswordLogin = async () => {
    console.log('--- SIGN IN BUTTON CLICKED ---');
    console.log('Login attempt started for username:', username);
    console.log('Is loading:', isLoading);
    // Simulate login success
    if (username && password) {
        if (effectiveRememberMe) {
            secureStorage.set('rememberedUser', { username, password });
        } else {
            // Clear credentials if remember me is not set
            secureStorage.remove('rememberedUser');
        }
        console.log('Calling onSignIn with:', username, 'and password present:', !!password);
        onSignIn(username, password);
    } else {
        console.log('Login failed: username or password missing');
    }
  };

  const handleResetPassword = async () => {
    if (resetStage === 'username') {
        if (resetUsername) {
            try {
                const response = await fetch(getApiUrl(`/api/check_user.php?username=${resetUsername}`));
                const data = await response.json();
                if (data.exists) {
                    setResetStage('security_word');
                    setResetError(null);
                } else {
                    setResetError('THIS USERNAME IS NOT REGISTRERDD');
                }
            } catch (_e) {
                setResetError('Error checking user');
            }
        } else {
            setResetError('Please enter your username');
        }
    } else if (resetStage === 'security_word') {
        try {
            const response = await fetch(getApiUrl('/api/check_security_answer'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: resetUsername, answer: securityWordInput })
            });
            const data = await response.json();
            if (data.isCorrect) {
                setResetStage('new_password');
                setResetError(null);
            } else {
                setResetError('Incorrect security word');
            }
        } catch (_e) {
            setResetError('Error verifying security word');
        }
    } else if (resetStage === 'new_password') {
        if (newPasswordInput.length >= 6) {
            // Update password logic
            fetch(getApiUrl('/api/user/update?token=projectsarah'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: resetUsername, data: { password: newPasswordInput } })
            });

            setResetStage('success');
            setResetError(null);
            setTimeout(() => {
                setResetStage('none');
                onSwitchAccount(); // Go back to start
            }, 2000);
        } else {
            setResetError('Password must be at least 6 characters');
        }
    } else if (resetStage === 'signup_username') {
        if (signupUsernameInput.length >= 3) {
            setResetStage('signup_password');
            setResetError(null);
        } else {
            setResetError('Username must be at least 3 characters');
        }
    } else if (resetStage === 'signup_password') {
        if (signupPasswordInput.length >= 6) {
            setResetStage('signup_personal');
            setResetError(null);
        } else {
            setResetError('Password must be at least 6 characters');
        }
    } else if (resetStage === 'signup_personal') {
        if (signupFirstName.trim() && signupLastName.trim()) {
            setResetStage('signup_contact');
            setResetError(null);
        } else {
            setResetError('Please enter first and last name');
        }
    } else if (resetStage === 'signup_contact') {
        if (signupEmail.includes('@') && signupPhone.length >= 10) {
            setResetStage('signup_address');
            setResetError(null);
        } else {
            setResetError('Please enter a valid email and phone number');
        }
    } else if (resetStage === 'signup_address') {
        if (signupAddress.trim()) {
            setResetStage('signup_employment');
            setResetError(null);
        } else {
            setResetError('Please enter your home address');
        }
    } else if (resetStage === 'signup_employment') {
        if (signupWorkplace.trim() && signupIncome.trim()) {
            setResetStage('signup_security');
            setResetError(null);
        } else {
            setResetError('Please enter workplace and annual income');
        }
    } else if (resetStage === 'signup_security') {
        if (signupSecurityQuestion.trim() && signupSecurityAnswer.trim()) {
            setResetStage('signup_account');
            setResetError(null);
        } else {
            setResetError('Please enter a security question and answer');
        }
    } else if (resetStage === 'signup_account') {
        // Register user logic
        fetch(getApiUrl('/api/auth/register.php?token=projectsarah'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: signupUsernameInput, 
                password: signupPasswordInput,
                firstName: signupFirstName,
                lastName: signupLastName,
                email: signupEmail,
                phone: signupPhone,
                address: signupAddress,
                workplace: signupWorkplace,
                income: signupIncome,
                securityQuestion: signupSecurityQuestion,
                securityAnswer: signupSecurityAnswer,
                accountType: signupAccountType
            })
        }).then(async (res) => {
            if (res.ok) {
                setResetStage('signup_success');
                setResetError(null);
                setTimeout(() => {
                    setResetStage('none');
                    setUsername(signupUsernameInput);
                    setSignupUsernameInput('');
                    setSignupPasswordInput('');
                    setSignupFirstName('');
                    setSignupLastName('');
                    setSignupEmail('');
                    setSignupPhone('');
                    setSignupAddress('');
                    setSignupWorkplace('');
                    setSignupIncome('');
                    setSignupSecurityQuestion('');
                    setSignupSecurityAnswer('');
                    setSignupAccountType('Checking');
                    onSwitchAccount(); // Switch to start login
                }, 2000);
            } else {
                const data = await res.json();
                setResetError(data.message || 'Signup failed');
            }
        }).catch(() => {
            setResetError('Network error');
        });
    }
  };

  const displayUsername = username;

  return (
    <div className={`h-full w-full ${isDark ? 'bg-[#121212]' : 'bg-white'} flex flex-col px-8 pt-12 pb-12`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center justify-center">
            <img 
              src="https://www.scotiabank.com/content/dam/scotiabank/images/logos/2019/scotiabank-logo-red-desktop-Height25px.svg" 
              alt="Scotiabank Logo" 
              className="h-6 w-auto object-contain cursor-pointer"
              referrerPolicy="no-referrer"
              onClick={handleLogoTap}
            />
        </div>
        <button 
          onClick={() => setResetStage('signup_username')}
          className={`w-8 h-8 rounded-full border opacity-20 hover:opacity-100 transition-opacity ${isDark ? 'border-white text-white' : 'border-zinc-400 text-zinc-400'} flex items-center justify-center text-lg cursor-pointer`}
        >
          ?
        </button>
      </div>
      
      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Login Form - Pinned to Bottom */}
      <div className="w-full flex flex-col gap-6">
        {resetStage !== 'none' ? (
          <div className="flex flex-col gap-6">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {resetStage.startsWith('signup') ? 'Sign Up' : 'Reset Password'}
            </h2>
            
            {resetStage === 'username' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Enter Username"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'security_word' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Security Word"
                        value={securityWordInput}
                        onChange={(e) => setSecurityWordInput(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'new_password' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="password" 
                        placeholder="New Password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'success' && (
                <div className="text-green-500 font-medium text-center py-4">
                    Password reset successful! Redirecting...
                </div>
            )}

            {resetStage === 'signup_username' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Choose a Username"
                        value={signupUsernameInput}
                        onChange={(e) => setSignupUsernameInput(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'signup_password' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="password" 
                        placeholder="Choose a Password"
                        value={signupPasswordInput}
                        onChange={(e) => setSignupPasswordInput(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'signup_personal' && (
                <div className="flex flex-col gap-4">
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="First Name"
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Last Name"
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                </div>
            )}

            {resetStage === 'signup_contact' && (
                <div className="flex flex-col gap-4">
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="email" 
                            placeholder="Email Address"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="tel" 
                            placeholder="Phone Number"
                            value={signupPhone}
                            onChange={(e) => setSignupPhone(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                </div>
            )}

            {resetStage === 'signup_address' && (
                <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                    <input 
                        type="text" 
                        placeholder="Home Address"
                        value={signupAddress}
                        onChange={(e) => setSignupAddress(e.target.value)}
                        className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                    />
                </div>
            )}

            {resetStage === 'signup_employment' && (
                <div className="flex flex-col gap-4">
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Workplace / Employer"
                            value={signupWorkplace}
                            onChange={(e) => setSignupWorkplace(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Annual Income"
                            value={signupIncome}
                            onChange={(e) => setSignupIncome(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                </div>
            )}

            {resetStage === 'signup_security' && (
                <div className="flex flex-col gap-4">
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Security Question"
                            value={signupSecurityQuestion}
                            onChange={(e) => setSignupSecurityQuestion(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                    <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
                        <input 
                            type="text" 
                            placeholder="Security Answer"
                            value={signupSecurityAnswer}
                            onChange={(e) => setSignupSecurityAnswer(e.target.value)}
                            className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
                        />
                    </div>
                </div>
            )}

            {resetStage === 'signup_account' && (
                <div className="flex flex-col gap-4">
                    <p className={`text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>Select Account Type:</p>
                    <div className="flex flex-col gap-2">
                        {['Checking', 'Savings', 'Both', 'Credit'].map((type) => (
                            <label key={type} className={`flex items-center gap-3 p-3 rounded-lg border ${signupAccountType === type ? 'border-[#ED0711] bg-[#ED0711]/5' : 'border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="accountType" 
                                    value={type} 
                                    checked={signupAccountType === type}
                                    onChange={(e) => setSignupAccountType(e.target.value)}
                                    className="text-[#ED0711]"
                                />
                                <span className={isDark ? 'text-white' : 'text-gray-900'}>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {resetStage === 'signup_success' && (
                <div className="text-yellow-500 font-medium text-center py-4">
                    Account submitted! Please wait for admin approval before logging in.
                </div>
            )}

            {resetError && <div className="text-red-500 text-sm">{resetError}</div>}

            <div className="flex gap-3">
                <button 
                    onClick={() => setResetStage('none')}
                    className={`flex-1 py-4 rounded-xl font-bold text-lg ${isDark ? 'bg-zinc-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                    Cancel
                </button>
                {resetStage !== 'success' && resetStage !== 'signup_success' && (
                    <button 
                        onClick={handleResetPassword}
                        className="flex-1 py-4 bg-[#ED0711] text-white rounded-xl font-bold text-lg shadow-lg"
                    >
                        {resetStage === 'signup_account' ? 'Create Account' : 'Continue'}
                    </button>
                )}
            </div>
          </div>
        ) : stage === 'login_user' ? (
          <>
            <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
              <div className="text-[#8B5CF6]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Username or card number"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleRememberMe}
                className={`w-5 h-5 rounded border flex items-center justify-center ${effectiveRememberMe ? 'bg-[#ED0711] border-[#ED0711]' : 'border-gray-400'}`}
              >
                {effectiveRememberMe && <Check size={14} color="white" strokeWidth={3} />}
              </button>
              <span className={`text-[14px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Remember me</span>
            </div>

            <button 
              onClick={handleContinue}
              disabled={!username || isLoading}
              className="w-full py-4 bg-[#ED0711] text-white rounded-xl font-bold text-lg shadow-lg mt-4 disabled:opacity-50"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            {/* Username Field (Read-only in PIN stage) */}
            <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
              <div className="text-[#8B5CF6]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className={`flex-1 text-lg font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                {displayUsername}
              </div>
              <button onClick={onSwitchAccount} className="text-[#8B5CF6]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Password Field */}
            <div className="relative border-b border-gray-400 py-3 flex items-center gap-3">
            <div className="text-[#8B5CF6]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            </div>
            <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className={`flex-1 bg-transparent border-none outline-none text-lg ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`}
            />
            </div>

            {/* Forgot Link */}
            {loginFailed && (
                <button 
                    onClick={onForgotPassword}
                    className="text-[#ED0711] text-[14px] font-bold text-left"
                >
                    Forgot your username or password?
                </button>
            )}
            
            {!loginFailed && (
                <div className="flex justify-between items-center mt-2">
                    <button 
                        onClick={onForgotPassword}
                        className="text-[#ED0711] text-[14px] font-bold"
                    >
                        Forgot info?
                    </button>
                </div>
            )}

            {error && !dismissedError && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
                    <div className={`${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-white text-black'} rounded-2xl p-6 w-[300px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-200`}>
                        <h3 className="text-lg font-bold mb-2">Login Failed</h3>
                        <p className="text-sm opacity-80 mb-6">{error || 'Invalid credentials'}</p>
                        <button 
                            onClick={() => { setDismissedError(true); }}
                            className="text-[#ED0711] font-bold w-full py-2 border-t border-gray-200/20"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button 
                onClick={handlePasswordLogin}
                disabled={isLoading}
                className="w-full py-4 bg-[#ED0711] text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50"
              >
                Sign In
              </button>
            </div>
          </>
        ) }
      </div>
    </div>
  );
};

export default LoginFlow;
