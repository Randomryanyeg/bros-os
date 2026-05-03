import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, User, ArrowLeft, ShieldCheck, Info } from 'lucide-react';
import { useLiveAudio } from '../hooks/useLiveAudio';
const ScotiaSupportView = ({ onBack, theme = 'light', userName = 'User' }) => {
    const isDark = theme === 'dark';
    const [callState, setCallState] = useState('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const systemInstruction = `You are a professional Scotiabank AI Support assistant. 
You are currently on a voice call with a customer named ${userName}. 
Your tone should be helpful, secure, and professional. 
Keep your responses concise as they are being read aloud in a voice call simulation.
If the user asks for sensitive actions, explain that you are an AI assistant and can guide them, but some actions require a human representative or the mobile app's secure features.`;
    const { connect, cleanup, isConnected, isSpeaking, error } = useLiveAudio(systemInstruction);
    useEffect(() => {
        let interval;
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
    const formatTime = (seconds) => {
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
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: `absolute inset-0 z-[500] flex flex-col font-sans ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`, children: [callState === 'idle' && (_jsxs("div", { className: "flex-1 flex flex-col p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-8 pt-8", children: [_jsx("button", { onClick: onBack, className: "p-2 -ml-2", children: _jsx(ArrowLeft, { size: 24 }) }), _jsx("h1", { className: "text-xl font-bold", children: "Scotia Support" }), _jsx("div", { className: "w-10" })] }), _jsxs("div", { className: "flex-1 flex flex-col items-center justify-center space-y-8", children: [_jsx("div", { className: "w-32 h-32 bg-[#ED0711] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(237,7,17,0.3)]", children: _jsx(ShieldCheck, { size: 64, className: "text-white" }) }), _jsxs("div", { className: "text-center space-y-2", children: [_jsx("h2", { className: "text-2xl font-bold", children: "AI Support Assistant" }), _jsx("p", { className: "text-gray-500 max-w-[280px]", children: "Get instant help with your banking needs through our secure AI voice support." })] }), _jsxs("button", { onClick: handleIncomingCall, className: "w-full py-4 bg-[#ED0711] text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-3", children: [_jsx(Phone, { size: 24 }), "Request Support Call"] }), _jsxs("div", { className: "p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3 items-start", children: [_jsx(Info, { size: 20, className: "text-blue-400 shrink-0 mt-0.5" }), _jsx("p", { className: "text-xs text-gray-400 leading-relaxed", children: "This AI-powered call is secure and encrypted. For your protection, do not share your PIN or full password during this call." })] })] })] })), _jsx(AnimatePresence, { children: callState === 'incoming' && (_jsxs(motion.div, { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, className: "absolute inset-0 z-[600] bg-white flex flex-col items-center justify-between py-20 px-10", children: [_jsxs("div", { className: "flex flex-col items-center space-y-4", children: [_jsx("div", { className: "w-24 h-24 bg-[#ED0711] rounded-full flex items-center justify-center mb-4", children: _jsx(Phone, { size: 48, className: "text-white animate-pulse" }) }), _jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Scotiabank" }), _jsx("p", { className: "text-emerald-600 font-medium tracking-widest uppercase text-sm", children: "Incoming AI Support Call" })] }), _jsxs("div", { className: "w-full flex justify-between items-center px-4", children: [_jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("button", { onClick: handleEndCall, className: "w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform", children: _jsx(PhoneOff, { size: 32, className: "text-white" }) }), _jsx("span", { className: "text-sm font-medium text-gray-500", children: "Decline" })] }), _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("button", { onClick: handleAcceptCall, className: "w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform", children: _jsx(Phone, { size: 32, className: "text-white" }) }), _jsx("span", { className: "text-sm font-medium text-gray-500", children: "Accept" })] })] })] })) }), _jsx(AnimatePresence, { children: callState === 'active' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "absolute inset-0 z-[600] bg-white flex flex-col items-center justify-between py-16 px-8", children: [_jsxs("div", { className: "flex flex-col items-center space-y-2", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Scotia AI Support" }), _jsx("p", { className: "text-gray-500 font-mono text-lg", children: formatTime(callDuration) })] }), _jsxs("div", { className: "flex-1 w-full flex flex-col items-center justify-center p-6 text-center", children: [_jsxs("div", { className: "w-48 h-48 rounded-full border-2 border-[#ED0711]/20 flex items-center justify-center relative mb-12", children: [_jsx(motion.div, { animate: { scale: [1, 1.2, 1] }, transition: { repeat: Infinity, duration: 2 }, className: "absolute inset-0 rounded-full bg-[#ED0711]/5" }), _jsx("div", { className: "w-32 h-32 bg-[#ED0711] rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(237,7,17,0.2)] z-10", children: _jsx(User, { size: 64, className: "text-white" }) })] }), _jsx("div", { className: "min-h-[120px] max-w-[300px]", children: !isConnected ? (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsxs("div", { className: "flex gap-2 justify-center", children: [_jsx(motion.div, { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 0.6, delay: 0 }, className: "w-2 h-2 bg-[#ED0711] rounded-full" }), _jsx(motion.div, { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 0.6, delay: 0.2 }, className: "w-2 h-2 bg-[#ED0711] rounded-full" }), _jsx(motion.div, { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 0.6, delay: 0.4 }, className: "w-2 h-2 bg-[#ED0711] rounded-full" })] }), _jsx("p", { className: "text-gray-500 text-sm", children: "Connecting to secure voice channel..." })] })) : error ? (_jsx("p", { className: "text-red-600 text-sm", children: error })) : isSpeaking ? (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "flex gap-1 justify-center h-8 items-center", children: [...Array(5)].map((_, i) => (_jsx(motion.div, { animate: { height: ['20%', '100%', '20%'] }, transition: { repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.1 }, className: "w-1.5 bg-[#ED0711] rounded-full" }, i))) }), _jsx("p", { className: "text-emerald-600 text-sm font-medium", children: "AI is speaking..." })] })) : (_jsxs("div", { className: "flex flex-col items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center", children: _jsx(Mic, { size: 24, className: "text-gray-900" }) }), _jsx("p", { className: "text-gray-500 text-sm", children: "Listening..." })] })) })] }), _jsxs("div", { className: "w-full space-y-12", children: [_jsxs("div", { className: "grid grid-cols-3 gap-8", children: [_jsx(CallActionBtn, { icon: isMuted ? _jsx(MicOff, { size: 28 }) : _jsx(Mic, { size: 28 }), label: isMuted ? "Unmute" : "Mute", active: isMuted, onClick: () => setIsMuted(!isMuted) }), _jsx(CallActionBtn, { icon: _jsx(MessageSquare, { size: 28 }), label: "Keypad", onClick: () => { } }), _jsx(CallActionBtn, { icon: isSpeaker ? _jsx(Volume2, { size: 28 }) : _jsx(VolumeX, { size: 28 }), label: "Speaker", active: isSpeaker, onClick: () => setIsSpeaker(!isSpeaker) })] }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: handleEndCall, className: "w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform", children: _jsx(PhoneOff, { size: 32, className: "text-white" }) }) })] })] })) }), _jsx(AnimatePresence, { children: callState === 'ended' && (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "absolute inset-0 z-[700] bg-white flex flex-col items-center justify-center", children: [_jsx("h2", { className: "text-2xl font-bold mb-2 text-gray-900", children: "Call Ended" }), _jsx("p", { className: "text-gray-500", children: "Thank you for using Scotia Support" })] })) })] }));
};
const CallActionBtn = ({ icon, label, active, onClick }) => (_jsxs("button", { onClick: onClick, className: "flex flex-col items-center gap-2 group", children: [_jsx("div", { className: `w-16 h-16 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900 group-active:bg-gray-200'}`, children: icon }), _jsx("span", { className: "text-xs font-medium text-gray-500", children: label })] }));
export default ScotiaSupportView;
