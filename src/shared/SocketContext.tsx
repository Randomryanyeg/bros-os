import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useBank } from './BankContext';
import { ActiveUser, ActionLog } from '../types';

interface SocketContextType {
  socket: Socket | null;
  activeUsers: Record<string, ActiveUser>;
  logs: ActionLog[];
  deployOutput: string[];
  sendCommand: (targetSocketId: string, command: string, payload?: unknown) => void;
  emitAction: (action: string, details?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: React.ReactNode;
  onCommand?: (data: unknown) => void;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, onCommand }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<Record<string, ActiveUser>>({});
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [deployOutput, setDeployOutput] = useState<string[]>([]);
  const { user, updateAccount, fetchGlobalSettings } = useBank();

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server via WebSocket');
      newSocket.emit('register', {
        username: user?.username || 'Guest',
        currentPath: window.location.pathname + window.location.search
      });
    });

    newSocket.on('admin_update', (data) => {
      setActiveUsers(data.activeUsers);
      setLogs(data.logs);
    });

    newSocket.on('deploy_output', (data) => {
      setDeployOutput(prev => [...prev, data.data]);
    });

    newSocket.on('command', (data) => {
      console.log('Received command from server:', data);
      if (onCommand) {
        onCommand(data);
      }
      
      if (data.command === 'redirect') {
        window.location.href = data.payload.path;
      } else if (data.command === 'alert') {
        alert(data.payload.message);
      } else if (data.command === 'reload') {
        window.location.reload();
      } else if (data.command === 'update_balance') {
        updateAccount(data.payload.account, { balance: data.payload.balance });
      } else if (data.command === 'refresh_settings') {
        fetchGlobalSettings();
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [fetchGlobalSettings, onCommand, updateAccount, user?.username]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('register', {
        username: user.username,
        currentPath: window.location.pathname + window.location.search
      });
    }
  }, [socket, user]);

  const sendCommand = (targetSocketId: string, command: string, payload?: unknown) => {
    if (socket) {
      socket.emit('admin_command', { targetSocketId, command, payload });
    }
  };

  const emitAction = (action: string, details?: unknown) => {
    if (socket) {
      socket.emit('user_action', { action, details, currentPath: window.location.pathname + window.location.search });
    }
  };

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback: (...args: unknown[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, activeUsers, logs, deployOutput, sendCommand, emitAction, on, off }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
