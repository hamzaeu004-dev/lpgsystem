import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaStore,
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
  FaChevronRight,
  FaFire
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { path: '/purchase', label: 'Purchase', icon: <FaShoppingBag /> },
    { path: '/expense', label: 'Expense', icon: <FaWallet /> },
    { path: '/sales', label: 'Sales & Billing', icon: <FaShoppingCart /> },
    { path: '/committee-collection', label: 'Committee Collection', icon: <FaHandHoldingUsd /> },
    { path: '/shops', label: 'Shops & Outlets', icon: <FaStore /> },
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } fixed lg:relative inset-y-0 left-0 h-full transition-all duration-300 flex flex-col z-40 bg-[#7A0C00] dark:bg-[#120404] text-white border-r border-red-900/30 dark:border-red-950/60 shadow-2xl lg:shadow-md shrink-0`}
      >
        {/* Floating Outer Edge Arrow Toggle Button */}
        <button
          onClick={() => setIsOpen && setIsOpen(!isOpen)}
          title={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
          className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-white text-[#7A0C00] dark:bg-slate-800 dark:text-rose-400 border border-rose-200 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-rose-950 flex items-center justify-center shadow-lg cursor-pointer transition-all shrink-0"
        >
          {isOpen ? <FaChevronLeft size={11} /> : <FaChevronRight size={11} />}
        </button>

        {/* Header Logo / Title */}
        <div className={`relative z-10 px-4 py-4 border-b border-white/20 dark:border-red-950/80 bg-black/10 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} transition-all`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md bg-white text-[#7A0C00] dark:bg-red-950 dark:text-rose-300 dark:border dark:border-red-800/50 shrink-0 mx-auto transform transition-transform hover:scale-105">
              <FaFire className="text-[#7A0C00] dark:text-rose-400 text-lg animate-pulse" />
            </div>
            {isOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <h2 className="text-xs font-black tracking-tight text-white truncate">
                  Binsuleman Enterprise
                </h2>
                <p className="text-[10px] font-extrabold text-white/80 dark:text-rose-200/70 truncate uppercase tracking-wider">
                  LPG ERP System
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close X Button */}
          {isOpen && (
            <button
              onClick={() => setIsOpen && setIsOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-rose-200 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white transition-colors"
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
                    ? 'bg-white !text-[#7A0C00] dark:bg-red-950 dark:!text-white dark:border dark:border-red-800/60 font-black shadow-xl scale-[1.02]'
                    : 'text-white/90 dark:text-slate-300 hover:bg-white/15 dark:hover:bg-red-950/40 hover:text-white font-bold'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`text-base shrink-0 transition-colors ${
                      isActive ? '!text-[#7A0C00] dark:!text-white' : 'text-rose-100/90 dark:text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {isOpen && (
                    <span
                      className={`ml-3 text-xs tracking-wide flex-1 font-bold truncate ${
                        isActive ? '!text-[#7A0C00] dark:!text-white' : 'text-white dark:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}

                  {isOpen && item.badge && (
                    <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs shrink-0 ${
                      isActive ? 'bg-[#7A0C00] dark:bg-red-900 !text-white' : 'bg-white/25 dark:bg-slate-800 text-white'
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
        <div className="relative z-10 p-3 border-t border-white/20 dark:border-red-950/80 bg-black/10 dark:bg-black/40 transition-colors">
          {isOpen ? (
            <div className="flex items-center space-x-3 p-2.5 rounded-xl border border-white/20 dark:border-red-900/30 bg-white/10 dark:bg-red-950/30 backdrop-blur-xs shadow-md">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm bg-white text-[#7A0C00] dark:bg-red-950 dark:text-rose-200 shrink-0">
                AU
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">
                  Admin User
                </p>
                <p className="text-[10px] font-extrabold text-white/80 dark:text-slate-400 truncate">
                  Super Admin
                </p>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shrink-0 ring-4 ring-white/20 dark:ring-red-950"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-sm bg-white text-[#7A0C00] dark:bg-red-950 dark:text-rose-200">
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