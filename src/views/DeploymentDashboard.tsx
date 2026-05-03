import React, { useState, useEffect, useRef } from 'react';
import { Play, Terminal, CheckCircle2, XCircle, Loader2, Server, Database, Globe, Shield, RefreshCw, Trash2, StopCircle } from 'lucide-react';
import { useSocket } from '../shared/SocketContext';

interface DeployStep {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'success' | 'error';
  icon: React.ReactNode;
}

const INITIAL_STEPS: DeployStep[] = [
  { id: 'kill', name: 'Cleanup Ports', description: 'Kill processes on 3000, 8000, 5432, 6379, 8080', status: 'idle', icon: <StopCircle size={18} /> },
  { id: 'fix', name: 'Fix Dependencies', description: 'Create compatible package.json for frontend', status: 'idle', icon: <RefreshCw size={18} /> },
  { id: 'build', name: 'Build React App', description: 'Install deps and run npm build', status: 'idle', icon: <Globe size={18} /> },
  { id: 'docker', name: 'Docker Config', description: 'Generate docker-compose.yml and Dockerfiles', status: 'idle', icon: <Database size={18} /> },
  { id: 'containers', name: 'Start Containers', description: 'Run docker-compose up -d', status: 'idle', icon: <Server size={18} /> },
  { id: 'wait', name: 'Wait for Services', description: 'Check health endpoints for backend and frontend', status: 'idle', icon: <Shield size={18} /> },
];

const DeploymentDashboard: React.FC = () => {
  const { socket, sendCommand } = useSocket();
  const [steps, setSteps] = useState<DeployStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<{ type: 'stdout' | 'stderr' | 'system'; text: string; timestamp: string }[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleOutput = (data: { type: 'stdout' | 'stderr' | 'exit'; data?: string; code?: number }) => {
      if (data.type === 'exit') {
        setIsDeploying(false);
        setLogs(prev => [...prev, { type: 'system', text: `Deployment finished with code ${data.code}`, timestamp: new Date().toLocaleTimeString() }]);
        return;
      }

      if (data.data) {
        setLogs(prev => [...prev, { type: data.type as 'stdout' | 'stderr' | 'system', text: data.data!, timestamp: new Date().toLocaleTimeString() }]);
        
        // Update step status based on output
        const output = data.data.toLowerCase();
        if (output.includes('cleaning up ports')) updateStepStatus('kill', 'running');
        if (output.includes('fixing react dependencies')) updateStepStatus('fix', 'running');
        if (output.includes('building react typescript application')) updateStepStatus('build', 'running');
        if (output.includes('creating docker configuration')) updateStepStatus('docker', 'running');
        if (output.includes('starting docker containers')) updateStepStatus('containers', 'running');
        if (output.includes('waiting for services')) updateStepStatus('wait', 'running');

        if (output.includes('created compatible package.json')) updateStepStatus('fix', 'success');
        if (output.includes('react app built successfully')) updateStepStatus('build', 'success');
        if (output.includes('docker configuration created')) updateStepStatus('docker', 'success');
        if (output.includes('containers started successfully')) updateStepStatus('containers', 'success');
        if (output.includes('backend is ready')) updateStepStatus('wait', 'success');
      }
    };

    socket.on('deploy_output', handleOutput);
    return () => {
      socket.off('deploy_output', handleOutput);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const updateStepStatus = (id: string, status: DeployStep['status']) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleDeploy = (command: string = '') => {
    if (!socket) return;
    setIsDeploying(true);
    setLogs([{ type: 'system', text: `Starting deployment: ${command || 'full'}`, timestamp: new Date().toLocaleTimeString() }]);
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'idle' })));
    
    sendCommand('system', 'deploy', { args: command ? [command] : [] });
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="flex flex-col h-full bg-[#F4F4F4] text-gray-600 font-sans">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <Server className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">OS Simulator</h1>
            <p className="text-xs text-gray-500 font-mono">DEPLOYMENT_DASHBOARD_V1.0.4</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleDeploy('rebuild')}
            disabled={isDeploying}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-bold text-sm transition-all disabled:opacity-50 border border-gray-200"
          >
            <RefreshCw size={16} className={isDeploying ? "animate-spin" : ""} />
            Rebuild
          </button>
          <button 
            onClick={() => handleDeploy()}
            disabled={isDeploying}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-black text-sm transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            <Play size={16} fill="currentColor" />
            RUN DEPLOY
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Steps */}
        <div className="w-full lg:w-80 border-r border-gray-200 bg-white p-6 overflow-y-auto no-scrollbar">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Pipeline Steps</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={step.id} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-[-16px] w-[2px] bg-gray-100" />
                )}
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                    step.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                    step.status === 'running' ? 'bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse' :
                    step.status === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
                    'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {step.status === 'running' ? <Loader2 size={20} className="animate-spin" /> : step.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${step.status === 'idle' ? 'text-gray-400' : 'text-gray-900'}`}>{step.name}</span>
                      {step.status === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                      {step.status === 'error' && <XCircle size={14} className="text-red-500" />}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Uptime</span>
                <span className="text-gray-900 font-mono">12:43:02</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">Memory</span>
                <span className="text-gray-900 font-mono">42%</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-500">CPU</span>
                <span className="text-gray-900 font-mono">12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Terminal */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deployment Logs</span>
            </div>
            <button 
              onClick={clearLogs}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              title="Clear Logs"
            >
              <Trash2 size={16} />
            </button>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 font-mono text-[12px] leading-relaxed no-scrollbar bg-gray-950"
          >
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50">
                <Terminal size={48} strokeWidth={1} className="mb-4" />
                <p className="text-sm">No logs to display. Start a deployment to see output.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-4 group">
                    <span className="text-gray-600 shrink-0 select-none opacity-50 group-hover:opacity-100 transition-opacity">[{log.timestamp}]</span>
                    <span className={`${
                      log.type === 'stderr' ? 'text-red-400' : 
                      log.type === 'system' ? 'text-blue-400 font-bold' : 
                      'text-gray-400'
                    } whitespace-pre-wrap break-all`}>
                      {log.text}
                    </span>
                  </div>
                ))}
                {isDeploying && (
                  <div className="flex gap-4 animate-pulse">
                    <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-gray-500">_</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Terminal Controls Overlay */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 text-[10px] font-bold text-gray-500 flex items-center gap-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${isDeploying ? 'bg-blue-500 animate-ping' : 'bg-gray-300'}`} />
              {isDeploying ? 'DEPLOYING...' : 'IDLE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentDashboard;
