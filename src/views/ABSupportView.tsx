import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageSquare, 
  User, 
  ArrowLeft,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useLiveAudio } from '../hooks/useLiveAudio';

interface ABSupportViewProps {
  onBack: () => void;
  theme?: 'light' | 'dark';
  userName?: string;
}

const ABSupportView: React.FC<ABSupportViewProps> = ({ onBack, theme = 'light', userName = 'User' }) => {
  const isDark = theme === 'dark';
  const [callState, setCallState] = useState<'idle' | 'incoming' | 'active' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const systemInstruction = `You are a professional AB FARMS LTD AI Support assistant. 
You are currently on a voice call with a customer named ${userName}. 
Your tone should be helpful, secure, and professional. 
Keep your responses concise as they are being read aloud in a voice call simulation.
If the user asks for sensitive actions, explain that you are an AI assistant and can guide them, but some actions require a human representative or the mobile app's secure features.`;

  const { connect, cleanup, isConnected, isSpeaking, error } = useLiveAudio(systemInstruction);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIncomingCall = () => {
    setCallState('incoming');
  };

  const handleAcceptCall = async () => {
    setCallState('active');
    setCallDuration(0);
    await connect();
  };

  const handleEndCall = () => {
    cleanup();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      onBack();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-[500] flex flex-col font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {callState === 'idle' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-8 pt-8">
            <button onClick={onBack} className="p-2 -ml-2">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">AB Support</h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="w-32 h-32 bg-[#ED0711] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(237,7,17,0.3)]">
              <ShieldCheck size={64} className="text-white" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">AI Support Assistant</h2>
              <p className="text-gray-500 max-w-[280px]">Get instant help with your banking needs through our secure AI voice support.</p>
            </div>

            <button 
              onClick={handleIncomingCall}
              className="w-full py-4 bg-[#ED0711] text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
              <Phone size={24} />
              Request Support Call
            </button>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start">
              <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                This AI-powered call is secure and encrypted. For your protection, do not share your PIN or full password during this call.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Call Screen */}
      <AnimatePresence>
        {callState === 'incoming' && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-0 z-[600] bg-white flex flex-col items-center justify-between py-20 px-10"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-[#ED0711] rounded-full flex items-center justify-center mb-4">
                <Phone size={48} className="text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">AB FARMS LTD</h2>
              <p className="text-emerald-600 font-medium tracking-widest uppercase text-sm">Incoming AI Support Call</p>
            </div>

            <div className="w-full flex justify-between items-center px-4">
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={handleEndCall}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <PhoneOff size={32} className="text-white" />
                </button>
                <span className="text-sm font-medium text-gray-500">Decline</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={handleAcceptCall}
                  className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                >
                  <Phone size={32} className="text-white" />
                </button>
                <span className="text-sm font-medium text-gray-500">Accept</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Screen */}
      <AnimatePresence>
        {callState === 'active' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[600] bg-white flex flex-col items-center justify-between py-16 px-8"
          >
            <div className="flex flex-col items-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">AB AI Support</h2>
              <p className="text-gray-500 font-mono text-lg">{formatTime(callDuration)}</p>
            </div>

            <div className="flex-1 w-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-48 h-48 rounded-full border-2 border-[#ED0711]/20 flex items-center justify-center relative mb-12">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-[#ED0711]/5"
                />
                <div className="w-32 h-32 bg-[#ED0711] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(237,7,17,0.2)] z-10">
                  <User size={64} className="text-white" />
                </div>
              </div>

              <div className="min-h-[120px] max-w-[300px]">
                {!isConnected ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2 justify-center">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-[#ED0711] rounded-full" />
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-[#ED0711] rounded-full" />
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-[#ED0711] rounded-full" />
                    </div>
                    <p className="text-gray-500 text-sm">Connecting to secure voice channel...</p>
                  </div>
                ) : error ? (
                  <p className="text-red-600 text-sm">{error}</p>
                ) : isSpeaking ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-1 justify-center h-8 items-center">
                      {[...Array(5)].map((_, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: ['20%', '100%', '20%'] }} 
                          transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.1 }} 
                          className="w-1.5 bg-[#ED0711] rounded-full" 
                        />
                      ))}
                    </div>
                    <p className="text-emerald-600 text-sm font-medium">AI is speaking...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mic size={24} className="text-gray-900" />
                    </div>
                    <p className="text-gray-500 text-sm">Listening...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full space-y-12">
              <div className="grid grid-cols-3 gap-8">
                <CallActionBtn icon={isMuted ? <MicOff size={28} /> : <Mic size={28} />} label={isMuted ? "Unmute" : "Mute"} active={isMuted} onClick={() => setIsMuted(!isMuted)} />
                <CallActionBtn icon={<MessageSquare size={28} />} label="Keypad" onClick={() => {}} />
                <CallActionBtn icon={isSpeaker ? <Volume2 size={28} /> : <VolumeX size={28} />} label="Speaker" active={isSpeaker} onClick={() => setIsSpeaker(!isSpeaker)} />
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleEndCall}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                >
                  <PhoneOff size={32} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Ended Screen */}
      <AnimatePresence>
        {callState === 'ended' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[700] bg-white flex flex-col items-center justify-center"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Call Ended</h2>
            <p className="text-gray-500">Thank you for using AB Support</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CallActionBtn = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group"
  >
    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 group-active:bg-gray-200'}`}>
      {icon}
    </div>
    <span className="text-xs font-medium text-gray-500">{label}</span>
  </button>
);

export default ABSupportView;
