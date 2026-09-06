import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaStore,
  FaBoxes,
  FaShoppingBag,
  FaShoppingCart,
  FaWallet,
  FaHandHoldingUsd,
  FaUsers,
  FaGasPump,
  FaCog,
  FaChartPie,
  FaTimes,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/purchase', label: 'Purchase', icon: <FaShoppingBag /> },
    { path: '/expense', label: 'Expense', icon: <FaWallet /> },
    { path: '/sales', label: 'Sales & Billing', icon: <FaShoppingCart />, badge: 3 },
    { path: '/committee-collection', label: 'Committee Collection', icon: <FaHandHoldingUsd /> },
    { path: '/shops', label: 'Shops & Outlets', icon: <FaStore /> },
    { path: '/inventory', label: 'Inventory Fleet', icon: <FaBoxes /> },
    { path: '/customers', label: 'Customers', icon: <FaUsers /> },
    { path: '/cylinders', label: 'Cylinder Logistics', icon: <FaGasPump /> },
    { path: '/reports', label: 'Reports', icon: <FaChartPie /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  const handleNavClick = () => {
    // On small screens, close sidebar drawer when a nav link is clicked
    if (window.innerWidth < 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen && setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } fixed lg:relative inset-y-0 left-0 h-full transition-all duration-300 flex flex-col z-40 border-r bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-xl lg:shadow-sm shrink-0`}
      >
        {/* Floating Outer Edge Arrow Toggle Button */}
        <button
          onClick={() => setIsOpen && setIsOpen(!isOpen)}
          title={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
          className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#A5D6A7] hover:!text-[#0f2912] dark:hover:!text-[#0f2912] hover:border-[#A5D6A7] flex items-center justify-center shadow-md cursor-pointer transition-all shrink-0"
        >
          {isOpen ? <FaChevronLeft size={11} /> : <FaChevronRight size={11} />}
        </button>

        {/* Header Logo / Title */}
        <div className={`relative z-10 px-4 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} transition-all`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm bg-[#A5D6A7] !text-[#0f2912] shrink-0 mx-auto">
              BE
            </div>
            {isOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <h2 className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                  Binsuleman Enterprise
                </h2>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                  LPG ERP System
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close X Button */}
          {isOpen && (
            <button
              onClick={() => setIsOpen && setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              title={!isOpen ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  isOpen ? 'px-3.5' : 'justify-center'
                } py-2.5 rounded-xl transition-all duration-200 relative whitespace-nowrap ${
                  isActive
                    ? 'bg-[#A5D6A7] !text-[#0f2912] dark:!text-[#0f2912] font-black shadow-md shadow-[#A5D6A7]/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white font-bold'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`text-base shrink-0 ${
                      isActive
                        ? '!text-[#0f2912] dark:!text-[#0f2912]'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {isOpen && (
                    <span
                      className={`ml-3 text-xs tracking-wide flex-1 font-bold truncate ${
                        isActive ? '!text-[#0f2912] dark:!text-[#0f2912]' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {isOpen && item.badge && (
                    <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs shrink-0 ${
                      isActive ? 'bg-[#0f2912] !text-[#A5D6A7]' : 'bg-[#A5D6A7] !text-[#0f2912]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="relative z-10 p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 transition-colors">
          {isOpen ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-xs bg-[#A5D6A7] text-[#0f2912] shrink-0">
                AU
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                  Super Admin
                </p>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-xs bg-[#A5D6A7] text-[#0f2912]">
                AU
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;