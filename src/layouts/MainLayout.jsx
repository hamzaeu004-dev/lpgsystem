import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Green frame; the sidebar sits directly on it and the page lives in a rounded panel
    <div className="app-frame flex h-screen w-full overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 min-w-0 h-full p-2 sm:p-3 lg:pl-0 lg:py-4 lg:pr-4">
        <div className="app-panel h-full flex flex-col overflow-hidden rounded-[22px] lg:rounded-[30px] shadow-2xl shadow-black/20">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 pb-6 pt-2 space-y-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
