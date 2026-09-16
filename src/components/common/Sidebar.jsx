import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  FaFire
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen && setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
        } fixed lg:relative inset-y-0 left-0 h-full transition-all duration-300 ease-in-out flex flex-col z-40 bg-[#7A0C00] dark:bg-[#120404] text-white border-r border-red-900/30 dark:border-red-950/60 shadow-2xl lg:shadow-md shrink-0 select-none`}
      >
        {/* Floating Outer Edge Arrow Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen && setIsOpen(!isOpen)}
          title={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
          className="absolute -right-3.5 top-5 z-50 w-7 h-7 rounded-full bg-white text-[#7A0C00] dark:bg-slate-800 dark:text-rose-400 border border-rose-200 dark:border-slate-700 hover:bg-slate-900 hover:text-white dark:hover:bg-rose-950 flex items-center justify-center shadow-lg cursor-pointer transition-colors duration-200 shrink-0"
        >
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <FaChevronLeft size={11} />
          </motion.div>
        </motion.button>

        {/* Header Logo / Title */}
        <div className={`relative z-10 px-4 py-4 border-b border-white/20 dark:border-red-950/80 bg-black/10 flex items-center ${isOpen ? 'justify-between' : 'justify-center'} transition-all duration-300 ease-in-out`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md bg-white text-[#7A0C00] dark:bg-red-950 dark:text-rose-300 dark:border dark:border-red-800/50 shrink-0 mx-auto transition-transform"
            >
              <FaFire className="text-[#7A0C00] dark:text-rose-400 text-lg animate-pulse" />
            </motion.div>

            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                isOpen
                  ? 'opacity-100 max-w-[180px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
              }`}
            >
              <h2 className="text-xs font-black tracking-tight text-white truncate">
                Binsuleman Enterprise
              </h2>
              <p className="text-[10px] font-extrabold text-white/80 dark:text-rose-200/70 truncate uppercase tracking-wider">
                LPG ERP System
              </p>
            </div>
          </div>

          {/* Mobile Close X Button */}
          <AnimatePresence>
            {isOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsOpen && setIsOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-rose-200 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <nav className="relative z-10 flex-1 p-3 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                title={!isOpen ? item.label : undefined}
                className={({ isActive: navActive }) =>
                  `group relative flex items-center ${
                    isOpen ? 'px-3.5' : 'justify-center px-0'
                  } py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-[0.97] ${
                    navActive
                      ? '!text-[#7A0C00] dark:!text-white font-black shadow-md'
                      : 'text-white/90 dark:text-slate-300 hover:bg-white/15 dark:hover:bg-red-950/40 hover:text-white font-bold'
                  }`
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute inset-0 bg-white dark:bg-red-950 border border-white/20 dark:border-red-800/60 rounded-xl z-0 shadow-md"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <span
                  className={`relative z-10 text-base shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? '!text-[#7A0C00] dark:!text-rose-300' : 'text-rose-100/90 dark:text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>

                <span
                  className={`relative z-10 ml-3 text-xs tracking-wide flex-1 font-bold truncate transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${
                    isOpen
                      ? 'opacity-100 max-w-[170px] translate-x-0'
                      : 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                  } ${isActive ? '!text-[#7A0C00] dark:!text-white' : 'text-white dark:text-slate-200'}`}
                >
                  {item.label}
                </span>

                {item.badge && (
                  <span
                    className={`relative z-10 ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs shrink-0 transition-all duration-300 ease-in-out ${
                      isOpen
                        ? 'opacity-100 scale-100'
                        : 'opacity-0 scale-0 w-0 pointer-events-none'
                    } ${
                      isActive
                        ? 'bg-[#7A0C00] dark:bg-red-900 !text-white'
                        : 'bg-white/25 dark:bg-slate-800 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;