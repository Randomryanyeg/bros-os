import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ChevronRight, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../../../utils/apiConfig';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-step-1'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        setSecurityQuestion(data.securityQuestion);
        setStep(2);
      } else {
        setError(data.message || 'Username not found');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-step-2'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answer, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Incorrect answer');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#1c1c1e] p-8 rounded-3xl border border-emerald-500/30 text-center"
        >
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
          <p className="text-gray-400 text-sm mb-8">Your account security has been updated. You can now login with your new password.</p>
          <button 
            onClick={onBack}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-4 rounded-xl font-bold text-white transition-all shadow-lg shadow-emerald-900/20"
          >
            RETURN TO LOGIN
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1c1c1e] p-8 rounded-3xl border border-white/5 shadow-2xl"
      >
        <button onClick={onBack} className="text-gray-500 hover:text-white transition-colors flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={14} /> Back to Sign In
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-600 border border-red-500/20">
              <Key size={20} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Recovery</h1>
          </div>
          <p className="text-gray-500 text-sm">Step {step} of 2: {step === 1 ? 'Verify Identity' : 'Security Check'}</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep1} 
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Account Username</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all placeholder:text-gray-700"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-medium">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <ChevronRight size={16} />}
                Continue
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleStep2} 
              className="space-y-6"
            >
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block mb-1">Security Challenge</span>
                <p className="text-white text-sm font-medium">{securityQuestion}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Your Answer</label>
                <input 
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500/50 outline-none transition-all"
                  placeholder="Enter secret answer"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-red-500/50 outline-none transition-all"
                  placeholder="Create new password"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-medium">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white hover:bg-red-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 active:scale-95"
              >
                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                Reset Password
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
