
import { useState, useCallback } from 'react';
import { AIService } from '../utils/aiService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  options?: ChatOption[];
}

export interface ChatOption {
  label: string;
  id: string;
}

export const useNeuralChat = (type: string, initialPrompt: string, context: Record<string, unknown>) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [stage, setStage] = useState<'chat' | 'queue' | 'confirming_pin'>('chat');

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        text: m.text
      }));

      let fullResponse = '';
      const stream = AIService.getChatStream(text, history, context);
      
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp: new Date()
      }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullResponse } : m));
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, context]);

  const enterQueue = useCallback(() => {
    setStage('queue');
    setTimeout(() => {
      setStage('chat');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        text: "You are now connected to Agent Sarah.",
        timestamp: new Date()
      }]);
    }, 3000);
  }, []);

  const confirmIdentity = useCallback(() => {
    setStage('confirming_pin');
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    sendMessage,
    stage,
    enterQueue,
    confirmIdentity
  };
};
