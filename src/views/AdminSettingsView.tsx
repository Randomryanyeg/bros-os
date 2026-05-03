import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useSocket } from '../shared/SocketContext';
import { SupportChat } from '../components/SupportChat';

interface AdminSettingsViewProps {
  onBack: () => void;
}

interface UserData {
  username: string;
  [key: string]: unknown;
}

interface ActiveUser {
  id: string;
  username: string;
  [key: string]: unknown;
}

const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ onBack }) => {
  const { activeUsers, sendCommand } = useSocket();
  const [users, setUsers] = useState<UserData[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'chat'>('users');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [notice, setNotice] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users.php?token=projectsarah');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const sendNotice = (targetId: string) => {
    sendCommand(targetId, 'notice', { message: notice });
    setNotice('');
  };

  const initiateCall = (targetId: string) => {
    sendCommand(targetId, 'initiate_call', {});
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-0 z-[300] flex flex-col bg-[#F8F9FA] text-[#1A1A1A]"
    >
      <div className="pt-12 pb-4 px-4 flex items-center border-b bg-white border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2"><ArrowLeft size={24} className="text-gray-600" /></button>
        <h1 className="text-[13px] font-bold text-gray-900 ml-4">Admin C2 Panel</h1>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-[10px] font-bold ${activeTab === 'users' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
        >
          USER MANAGEMENT
        </button>
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-[10px] font-bold ${activeTab === 'chat' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
        >
          LIVE SUPPORT
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'users' && (
          <div className="space-y-4">
            <button className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
              <Plus size={16} /> ADD NEW USER
            </button>
            {users.map((u) => {
              const activeUser = Object.values(activeUsers).find((au: unknown) => (au as ActiveUser).username === u.username) as ActiveUser | undefined;
              return (
                <div key={u.username} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">{u.username}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingUser(u)} className="text-gray-400 hover:text-red-600"><RefreshCw size={16} /></button>
                      {activeUser && (
                        <button onClick={() => initiateCall(activeUser.id)} className="text-gray-400 hover:text-green-600"><MessageSquare size={16} /></button>
                      )}
                    </div>
                  </div>
                  {activeUser && (
                    <div className="flex gap-2">
                      <input 
                        value={notice}
                        onChange={(e) => setNotice(e.target.value)}
                        placeholder="Notice..."
                        className="flex-1 text-[10px] border rounded px-2"
                      />
                      <button onClick={() => sendNotice(activeUser.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-[10px]">SEND</button>
                    </div>
                  )}
                  {editingUser?.username === u.username && (
                    <div className="border-t pt-2 space-y-2">
                      <input placeholder="New Account Name" className="w-full text-[10px] border rounded p-1" />
                      <input placeholder="Add Usage" className="w-full text-[10px] border rounded p-1" />
                      <button onClick={() => setEditingUser(null)} className="w-full bg-gray-200 py-1 rounded text-[10px]">SAVE</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-200">
            <div className="p-2 border-b bg-gray-50">
              <select 
                value={selectedChatUser || ''} 
                onChange={(e) => setSelectedChatUser(e.target.value)} 
                className="w-full text-[10px] border rounded p-1"
              >
                <option value="">Select User to Chat</option>
                {Object.values(activeUsers).map((u) => (
                  <option key={(u as ActiveUser).id} value={(u as ActiveUser).id}>{(u as ActiveUser).username} ({(u as ActiveUser).id.slice(0,4)})</option>
                ))}
              </select>
            </div>
            <div className="flex-1 relative">
              {selectedChatUser ? (
                <SupportChat 
                  isAdmin={true} 
                  targetSocketId={selectedChatUser} 
                  isOpen={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  Select a user to start chatting
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminSettingsView;
