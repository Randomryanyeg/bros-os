import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minus, Square, Bell, Smile, Paperclip } from 'lucide-react'; // Bell for Nudge
import { useSocket } from '../shared/SocketContext';
import { useBank } from '../shared/BankContext';
import { motion } from 'motion/react';

export const SupportChat: React.FC<{ 
  isAdmin?: boolean; 
  targetSocketId?: string;
  onClose?: () => void;
  isOpen?: boolean;
}> = ({ isAdmin, targetSocketId, onClose, isOpen }) => {
  const [messages, setMessages] = useState<{ sender: string; text: string; timestamp: number; isNudge?: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isNudging, setIsNudging] = useState(false);
  const { socket, sendCommand } = useSocket();
  const { user } = useBank();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleChatMessage = (data: { from: string; message: string; to?: string; isNudge?: boolean }) => {
      const isRelevant = isAdmin 
        ? (data.from === targetSocketId || data.to === targetSocketId)
        : (data.from === 'admin' || data.from === user?.username);

      if (isRelevant) {
        if (data.isNudge) {
          triggerNudge(data.from === 'admin' ? 'Support' : data.from, false);
          return;
        }

        const newMsg = { 
          sender: data.from === 'admin' ? 'Support' : (data.from === user?.username ? 'You' : data.from), 
          text: data.message, 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, newMsg]);
        
        if (!isOpen && !isAdmin && data.from === 'admin') {
          window.dispatchEvent(new CustomEvent('scotia_notification', { 
            detail: { 
              title: 'MSN: Support', 
              message: data.message,
              type: 'chat'
            } 
          }));
        }
      }
    };

    socket.on('chat_message', handleChatMessage);
    return () => { socket.off('chat_message', handleChatMessage); };
  }, [socket, isOpen, isAdmin, targetSocketId, user?.username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const triggerNudge = (sender: string, isLocal: boolean) => {
    setIsNudging(true);
    setMessages(prev => [...prev, { 
      sender: 'System', 
      text: `${sender} just sent you a nudge!`, 
      timestamp: Date.now(),
      isNudge: true 
    }]);
    
    // Play sound if you want, but sticking to visual for now
    setTimeout(() => setIsNudging(false), 500);
  };

  const sendMessage = (isNudge = false) => {
    if (!isNudge && !input.trim()) return;
    
    const payload = isNudge ? { isNudge: true, message: '' } : { message: input };

    if (isAdmin && targetSocketId) {
      sendCommand(targetSocketId, 'chat_message', payload);
      if (isNudge) {
        triggerNudge('You', true);
      } else {
        setMessages(prev => [...prev, { sender: 'You', text: input, timestamp: Date.now() }]);
      }
    } else if (!isAdmin && socket) {
      socket.emit('chat_message', { from: user?.username || 'User', ...payload });
      if (isNudge) {
        triggerNudge('You', true);
      } else {
        setMessages(prev => [...prev, { sender: 'You', text: input, timestamp: Date.now() }]);
      }
    }
    if (!isNudge) setInput('');
  };

  if (!isOpen && !isAdmin) return null;

  return (
    <motion.div 
      animate={isNudging ? {
        x: [0, -10, 10, -10, 10, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : {}}
      transition={{ duration: 0.4 }}
      className={`fixed inset-0 bg-[#f0f0f0] z-[2000] flex flex-col font-sans ${isAdmin ? 'relative h-full' : ''}`}
    >
      {/* MSN Window Header */}
      <div className="bg-gradient-to-r from-[#003399] via-[#0066cc] to-[#003399] text-white flex items-center justify-between px-3 py-2 shrink-0 pt-10 sm:pt-2">
        <div className="flex items-center gap-2">
          {/* MSN Icon (Simulated) */}
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center p-0.5">
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: '#0066cc' }}>
                  <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10,10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z M11,7h2v2h-2V7z M11,11h2v6h-2V11z"/>
              </svg>
          </div>
          <span className="text-sm font-medium tracking-tight">Support - Conversation</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/20 transition-colors"><Minus size={14} /></button>
          <button className="p-1 hover:bg-white/20 transition-colors"><Square size={12} /></button>
          {!isAdmin && (
            <button onClick={onClose} className="p-1 bg-[#cc3333] hover:bg-[#ff3333] transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* User Status Bar */}
      <div className="bg-[#e0eaf3] p-3 border-b border-[#abd0e8] flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-white rounded-lg border border-[#abd0e8] p-1 overflow-hidden">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Support" 
              alt="Display Pic" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* MSN Green Man Icon */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#e0eaf3] flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-[#003399] leading-none mb-1">Scotia Support (Online)</h3>
          <p className="text-[11px] text-[#5c85ad] italic">"We're here to help you with your banking needs!"</p>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-white custom-scrollbar">
        <div className="text-center py-2 mb-2 border-b border-gray-100">
          <p className="text-[11px] text-gray-400">Conversation started on {new Date().toLocaleDateString()}</p>
        </div>
        
        {messages.length === 0 && (
          <p className="text-[11px] text-blue-600 font-medium italic animate-pulse">Support is typing...</p>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.isNudge ? 'items-center my-2' : 'items-start'}`}>
            {msg.isNudge ? (
              <div className="bg-[#fff9c4] border border-[#fbc02d] px-4 py-1 rounded text-[11px] text-[#7f6d00] font-bold">
                {msg.text}
              </div>
            ) : (
              <div className="flex gap-2 max-w-full">
                <span className={`text-[12px] font-bold shrink-0 ${msg.sender === 'You' ? 'text-[#8B5CF6]' : 'text-[#0066cc]'}`}>
                  {msg.sender}:
                </span>
                <span className="text-[12px] text-gray-800 break-words">
                  {msg.text}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input / Toolbar Area */}
      <div className="bg-[#e0eaf3] border-t border-[#abd0e8] p-2 flex flex-col gap-2 pb-10 sm:pb-2">
        {/* MSN Toolbar icons */}
        <div className="flex items-center gap-3 px-2 border-b border-[#abd0e8]/50 pb-2">
          <button className="text-[#5c85ad] hover:text-[#003399] transition-colors"><Smile size={18} /></button>
          <button className="text-[#5c85ad] hover:text-[#003399] transition-colors"><Paperclip size={18} /></button>
          <button 
            onClick={() => sendMessage(true)}
            className="text-[#5c85ad] hover:text-[#003399] transition-colors flex items-center gap-1 group"
            title="Send a Nudge"
          >
            <Bell size={18} className="group-hover:animate-shake" />
            <span className="text-[10px] font-bold uppercase hidden sm:inline">Nudge</span>
          </button>
        </div>

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 p-2 bg-white border border-[#abd0e8] rounded text-[13px] h-12 focus:outline-none resize-none"
            placeholder="Type a message..."
          />
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim()}
            className="bg-gradient-to-b from-[#f0f0f0] to-[#d0d0d0] border border-[#abd0e8] px-4 py-2 rounded font-bold text-[13px] text-[#333] shadow-sm hover:from-white hover:to-[#e0e0e0] active:shadow-inner disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
};
