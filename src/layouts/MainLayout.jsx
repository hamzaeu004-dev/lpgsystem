import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-[#0b0f19] transition-colors duration-300 overflow-hidden relative">
      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;