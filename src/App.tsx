/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import IOSLayout from './layouts/IOSLayout';
import { BankProvider, useBank } from './shared/BankContext';
import { SocketProvider } from './shared/SocketContext';
import { AdminPanel } from './features/admin/components/AdminPanel';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Toaster } from 'sonner';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-8 text-center text-gray-900">
          <h1 className="text-xl font-bold mb-2 text-gray-900">Something went wrong</h1>
          <p className="text-gray-500 text-sm mb-8">{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#ED0711] text-white font-bold rounded-xl"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isAdminPanelVisible, theme, user, globalSettings, setAdminPanelVisible } = useBank();
  
  React.useEffect(() => {
    if (window.location.pathname.includes('/admin')) {
      setTimeout(() => {
        setAdminPanelVisible(true);
      }, 500);
    }
  }, [setAdminPanelVisible]);

  const isMaintenance = globalSettings?.general?.maintenanceMode || user?.settings?.maintenanceMode;
  const isAdmin = user?.username === 'admin' || user?.username === 'accounting@abfarms.ca';

  if (isMaintenance && !isAdmin) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center p-8 text-center text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-[#ED0711]">System Maintenance</h1>
        <p className="text-gray-600 mb-8">We are currently performing scheduled maintenance. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <IOSLayout />
      </div>
      {isAdminPanelVisible && <AdminPanel />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="h-screen w-screen bg-white overflow-hidden">
        <BankProvider>
          <SocketProvider onCommand={() => {}}>
            <AppContent />
            <PWAInstallPrompt />
            <Toaster position="top-center" />
          </SocketProvider>
        </BankProvider>
      </div>
    </ErrorBoundary>
  );
}




