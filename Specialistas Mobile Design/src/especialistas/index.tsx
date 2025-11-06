import React, { useState } from 'react';
import Dashboard from './dashboard';
import CallRequests from './call-requests';
import Sessions from './sessions';
import UserHistory from './user-history';
import Statistics from './statistics';
import Settings from './settings';

export default function EspecialistasApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calls' | 'sessions' | 'history' | 'stats' | 'settings'>('dashboard');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
      {currentView === 'calls' && <CallRequests onNavigate={setCurrentView} />}
      {currentView === 'sessions' && <Sessions onNavigate={setCurrentView} />}
      {currentView === 'history' && <UserHistory onNavigate={setCurrentView} />}
      {currentView === 'stats' && <Statistics onNavigate={setCurrentView} />}
      {currentView === 'settings' && <Settings onNavigate={setCurrentView} />}
    </div>
  );
}