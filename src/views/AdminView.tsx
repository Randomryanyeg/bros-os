import React, { useState, useEffect } from 'react';
import TopHeader from '../components/TopHeader';
import { Save, RefreshCw } from 'lucide-react';
import { io } from 'socket.io-client';
import { AdminUser } from '../shared/types';

import DeploymentDashboard from './DeploymentDashboard';
import { SupportChat } from '../components/SupportChat';

interface AdminViewProps {
  onClose: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onClose }) => {
  const [, setConfig] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [configText, setConfigText] = useState('');

  const [activeTab, setActiveTab] = useState<'config' | 'users' | 'smtp' | 'logs' | 'deploy' | 'sessions'>('config');
  const [smtpResult, setSmtpResult] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<Record<string, unknown> | null>(null);
  const [newUser, setNewUser] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const getAdminToken = () => new URLSearchParams(window.location.search).get('token') || 'projectsarah';

  useEffect(() => {
    const socket = io();
    socket.on('user_updated', (data: { username: string; type: string }) => {
        showStatus('success', `User ${data.username} was ${data.type}`);
        fetchUsers();
    });
    
    fetchConfig();
    fetchLogs();
    fetchUsers();
    fetchSessions();
    fetchHealth();
    
    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHealth = async () => {
    try {
        const res = await fetch(`/api/admin/health?token=${getAdminToken()}`);
        if (res.ok) setHealth(await res.json());
    } catch (e) {
        console.error("Failed to load health", e);
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users.php?token=${getAdminToken()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/admin/sessions.php?token=${getAdminToken()}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  };

  const fetchLogs = async () => {
    try {
        const res = await fetch(`/api/admin/mailer/logs.php?token=${getAdminToken()}`);
        if (res.ok) {
            const data = await res.json();
            setLogs(data.logs || []);
        }
    } catch (e) {
        console.error("Failed to load logs", e);
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/admin/global-settings?token=${getAdminToken()}`);
        if (res.ok) {
            const data = await res.json();
            setConfig(data);
            setConfigText(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Failed to load config", e);
    } finally {
        setLoading(false);
    }
  };

  const testSmtp = async () => {
    setSmtpResult({ loading: true });
    try {
        const res = await fetch(`/api/admin/mailer/status.php?token=${getAdminToken()}`);
        const data = await res.json();
        setSmtpResult(data);
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        setSmtpResult({ success: false, error: errorMessage });
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
    fetchUsers();
    fetchSessions();
    fetchHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
      try {
          const parsed = JSON.parse(configText);
          setJsonError(null);
          setSaving(true);
          
          const res = await fetch(`/api/config.php?token=${getAdminToken()}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsed)
          });
          
          if (res.ok) {
              showStatus('success', "Configuration Saved Successfully");
              fetchConfig();
          } else {
              showStatus('error', "Failed to save configuration");
          }
      } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          setJsonError(errorMessage);
      } finally {
          setSaving(false);
      }
  };

  const deleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    
    try {
        const res = await fetch(`/api/admin/users/delete?token=${getAdminToken()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        if (res.ok) {
            showStatus('success', "User deleted successfully");
        } else {
            showStatus('error', "Failed to delete user");
        }
    } catch (e) {
        console.error("Delete user error", e);
        showStatus('error', "Failed to delete user");
    }
  };

  return (
    <div className="absolute inset-0 z-[600] bg-white flex flex-col h-full animate-in slide-up">
      <TopHeader onBack={onClose} title="System Config" />
      
      {status && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[800] px-6 py-3 rounded-full shadow-2xl font-bold animate-in slide-down ${status.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {status.message}
        </div>
      )}

      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['config', 'users', 'smtp', 'logs', 'deploy', 'sessions'] as const).map((tab) => (
                <button 
                    key={tab}
                    onClick={() => {
                        setActiveTab(tab);
                        if (tab === 'sessions') fetchSessions();
                    }}
                    className={`px-4 py-2 rounded-lg font-bold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {activeTab === 'users' && (
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-black">User Management</h2>
                    <button 
                        onClick={() => setNewUser({
                            username: '',
                            password: '',
                            enabled: true,
                            accounts: {
                                'Chequing': { balance: 1000, type: 'banking', points: 0, history: [] },
                                'Savings': { balance: 5000, type: 'banking', points: 0, history: [] }
                            },
                            settings: {
                                transferLimit: 1000,
                                dailyLimit: 3000,
                                overdraftLimit: 500,
                                interacWarningEnabled: true
                            }
                        })}
                        className="px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
                    >
                        + Add User
                    </button>
                </div>

                <div className="flex-1 overflow-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">User</th>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Status</th>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Approval</th>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Total Balance</th>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Limits</th>
                                <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const accounts = (user.accounts || {}) as Record<string, { balance?: number }>;
                                const totalBalance = Object.values(accounts).reduce((sum: number, acc) => sum + (acc.balance || 0), 0);
                                return (
                                    <tr key={user.username} className="hover:bg-gray-50">
                                        <td className="p-3 border-b">
                                            <div className="font-bold text-black">{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.password}</div>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {user.enabled !== false ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${user.isApproved ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {user.isApproved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-3 border-b font-mono text-sm">
                                            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 border-b text-xs">
                                            <div>Transfer: ${user.settings?.transferLimit || 0}</div>
                                            <div>Daily: ${user.settings?.dailyLimit || 0}</div>
                                        </td>
                                        <td className="p-3 border-b">
                                            <div className="flex gap-2">
                                                {!user.isApproved && (
                                                    <button 
                                                        onClick={async () => {
                                                            const res = await fetch(`/api/admin/users/surgical-update?token=${getAdminToken()}`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ username: user.username, updates: { isApproved: true } })
                                                            });
                                                            if (res.ok) {
                                                                showStatus('success', "User approved successfully");
                                                            } else {
                                                                showStatus('error', "Failed to approve user");
                                                            }
                                                        }}
                                                        className="text-green-600 font-bold hover:underline"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setEditingUser({ ...user })}
                                                    className="text-blue-600 font-bold hover:underline"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user.username)}
                                                    className="text-red-600 font-bold hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Edit User Modal */}
                {(editingUser || newUser) && (
                    <div className="absolute inset-0 z-[700] bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-xl font-black">{newUser ? 'Add New User' : 'Edit User'}</h3>
                                <button onClick={() => { setEditingUser(null); setNewUser(null); }} className="text-gray-400 hover:text-black">✕</button>
                            </div>
                            <div className="p-6 overflow-auto space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        value={editingUser?.username || newUser?.username || ''}
                                        onChange={(e) => {
                                            if (newUser) setNewUser({ ...newUser, username: e.target.value });
                                            else setEditingUser({ ...editingUser, username: e.target.value });
                                        }}
                                        disabled={!!editingUser}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        value={editingUser?.password || newUser?.password || ''}
                                        onChange={(e) => {
                                            if (newUser) setNewUser({ ...newUser, password: e.target.value });
                                            else setEditingUser({ ...editingUser, password: e.target.value });
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="user-enabled"
                                        checked={(editingUser || newUser)?.enabled !== false}
                                        onChange={(e) => {
                                            if (newUser) setNewUser({ ...newUser, enabled: e.target.checked });
                                            else setEditingUser({ ...editingUser, enabled: e.target.checked });
                                        }}
                                    />
                                    <label htmlFor="user-enabled" className="text-sm font-bold">Account Enabled</label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="attention-items"
                                        checked={(editingUser || newUser)?.settings?.attentionItemsEnabled === true}
                                        onChange={(e) => {
                                            const updated = { ...(editingUser || newUser) };
                                            if (!updated.settings) updated.settings = {};
                                            updated.settings.attentionItemsEnabled = e.target.checked;
                                            if (newUser) setNewUser(updated);
                                            else setEditingUser(updated);
                                        }}
                                    />
                                    <label htmlFor="attention-items" className="text-sm font-bold">Attention Items Enabled</label>
                                </div>
                                
                                <div className="border-t pt-4">
                                    <h4 className="font-bold mb-2 flex justify-between items-center">
                                        Accounts & Balances
                                        <button 
                                            onClick={() => {
                                                const name = prompt("Account name?");
                                                if (name) {
                                                    const updated = JSON.parse(JSON.stringify(editingUser || newUser)) as Record<string, unknown>;
                                                    if (!updated.accounts) updated.accounts = {};
                                                    (updated.accounts as Record<string, Record<string, unknown>>)[name] = { balance: 0, type: 'banking', points: 0, history: [] };
                                                    if (newUser) setNewUser(updated as unknown as AdminUser);
                                                    else setEditingUser(updated as unknown as AdminUser);
                                                }
                                            }}
                                            className="text-xs bg-gray-200 px-2 py-1 rounded"
                                        >
                                            + Add
                                        </button>
                                    </h4>
                                    {Object.entries((editingUser || newUser)?.accounts || {}).map(([name, acc]) => {
                                        const account = acc as { balance?: number };
                                        return (
                                            <div key={name} className="flex items-center gap-2 mb-2">
                                                <div className="flex-1 text-sm">{name}</div>
                                                <input 
                                                    type="number" 
                                                    className="w-32 p-2 bg-gray-100 rounded-lg text-right font-mono"
                                                    value={account.balance}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const updated = JSON.parse(JSON.stringify(editingUser || newUser)) as Record<string, unknown>;
                                                        if (updated.accounts) {
                                                            (updated.accounts as Record<string, Record<string, unknown>>)[name].balance = val;
                                                        }
                                                        if (newUser) setNewUser(updated as unknown as AdminUser);
                                                        else setEditingUser(updated as unknown as AdminUser);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-bold mb-2">Limits</h4>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm">Transfer Limit ($)</label>
                                        <input 
                                            type="number" 
                                            className="w-32 p-2 bg-gray-100 rounded-lg text-right font-mono"
                                            value={(editingUser || newUser)?.settings?.transferLimit || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                const updated = { ...(editingUser || newUser) };
                                                updated.settings.transferLimit = val;
                                                if (newUser) setNewUser(updated);
                                                else setEditingUser(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm">Daily e-Transfer Limit ($)</label>
                                        <input 
                                            type="number" 
                                            className="w-32 p-2 bg-gray-100 rounded-lg text-right font-mono"
                                            value={(editingUser || newUser)?.settings?.dailyLimit || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                const updated = { ...(editingUser || newUser) };
                                                updated.settings.dailyLimit = val;
                                                if (newUser) setNewUser(updated);
                                                else setEditingUser(updated);
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm">Overdraft Limit ($)</label>
                                        <input 
                                            type="number" 
                                            className="w-32 p-2 bg-gray-100 rounded-lg text-right font-mono"
                                            value={(editingUser || newUser)?.settings?.overdraftLimit || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                const updated = { ...(editingUser || newUser) };
                                                updated.settings.overdraftLimit = val;
                                                if (newUser) setNewUser(updated);
                                                else setEditingUser(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t flex gap-3">
                                <button 
                                    onClick={() => { setEditingUser(null); setNewUser(null); }}
                                    className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={async () => {
                                        const userToSave = editingUser || newUser;
                                        const endpoint = newUser ? `/api/admin/users/create?token=${getAdminToken()}` : `/api/admin/users/surgical-update?token=${getAdminToken()}`;
                                        const res = await fetch(endpoint, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(newUser ? userToSave : { username: userToSave.username, updates: userToSave })
                                        });
                                        if (res.ok) {
                                            showStatus('success', "User saved successfully");
                                            setEditingUser(null);
                                            setNewUser(null);
                                            fetchConfig();
                                        } else {
                                            showStatus('error', "Failed to save user");
                                        }
                                    }}
                                    className="flex-1 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Save User
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
        {activeTab === 'sessions' && (
            <div className="flex-1 overflow-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">User</th>
                            <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">IP</th>
                            <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Path</th>
                            <th className="p-3 border-b font-bold text-xs uppercase text-gray-500">Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session.id} className="hover:bg-gray-50">
                                <td className="p-3 border-b font-bold text-black">{session.username}</td>
                                <td className="p-3 border-b font-mono text-sm">{session.ip}</td>
                                <td className="p-3 border-b text-sm">{session.currentPath}</td>
                                <td className="p-3 border-b text-sm">{new Date(session.lastSeen).toLocaleTimeString()}</td>
                                <td className="p-3 border-b">
                                    <button 
                                        onClick={() => setSelectedChat(session.id)}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Chat
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {selectedChat && (
                    <SupportChat isAdmin targetSocketId={selectedChat} />
                )}
            </div>
        )}
        {activeTab === 'config' && (
            <>
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Uptime</div>
                        <div className="font-mono text-lg">{health ? (Number(health.uptime) / 60).toFixed(2) + 'm' : 'Loading...'}</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Memory RSS</div>
                        <div className="font-mono text-lg">{health ? (Number((health.memory as Record<string, unknown>).rss) / 1024 / 1024).toFixed(2) + 'MB' : 'Loading...'}</div>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black text-black">Server Configuration</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                const url = `${window.location.origin}${window.location.pathname}?token=${getAdminToken()}`;
                                navigator.clipboard.writeText(url);
                                showStatus('success', "Admin link copied to clipboard");
                            }}
                            className="px-4 py-2 bg-gray-100 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm"
                        >
                            Copy Admin Link
                        </button>
                        <button onClick={() => { fetchConfig(); fetchHealth(); }} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={handleSave} disabled={saving || !!jsonError} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Config'}
                        </button>
                    </div>
                </div>

                {jsonError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-mono">
                        JSON Error: {jsonError}
                    </div>
                )}

                <div className="flex-1 relative border border-zinc-300 rounded-xl overflow-hidden shadow-inner">
                    <textarea 
                        className="w-full h-full p-4 font-mono text-sm bg-zinc-50 text-zinc-800 resize-none focus:outline-none"
                        value={configText}
                        onChange={(e) => {
                            setConfigText(e.target.value);
                            try {
                                JSON.parse(e.target.value);
                                setJsonError(null);
                            } catch (err: unknown) {
                                const errorMessage = err instanceof Error ? err.message : String(err);
                                setJsonError(errorMessage);
                            }
                        }}
                        spellCheck={false}
                    />
                </div>
            </>
        )}

        {activeTab === 'smtp' && (
            <div className="flex flex-col gap-4">
                <button onClick={testSmtp} className="px-4 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors">
                    Test SMTP Connection
                </button>
                {smtpResult && (
                    <div className={`p-4 rounded-lg ${smtpResult.loading ? 'bg-gray-100' : smtpResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {smtpResult.loading ? 'Testing...' : smtpResult.success ? smtpResult.message : smtpResult.error}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'logs' && (
            <div className="flex-1 overflow-auto bg-gray-50 text-gray-800 p-4 rounded-xl font-mono text-xs border border-gray-200">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1">
                        <span className="text-gray-400">[{log.timestamp}]</span> <span className="text-[#ED0711] font-bold">{log.username}</span> - <span className="text-gray-900">{log.action}</span>
                        {log.details && <pre className="text-gray-500 ml-4 mt-1 bg-white p-2 rounded border border-gray-100">{JSON.stringify(log.details, null, 2)}</pre>}
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'deploy' && (
            <div className="flex-1 -mx-6 -mb-6 overflow-hidden">
                <DeploymentDashboard />
            </div>
        )}
        
        <p className="mt-4 text-xs text-zinc-500">
            {activeTab === 'config' && 'Edit the raw JSON configuration for the server. Changes are applied immediately upon save. Ensure valid JSON syntax.'}
        </p>
      </div>
    </div>
  );
};

export default AdminView;
