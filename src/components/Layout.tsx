import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import ParticleBackground from './ParticleBackground';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  // Pages that don't need sidebar
  const noSidebarPages = ['/', '/login'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative">
      <ParticleBackground />
      
      {showSidebar ? (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 relative z-10">
            {children}
          </main>
        </div>
      ) : (
        <main className="relative z-10">
          {children}
        </main>
      )}
    </div>
  );
}