import React, { useState } from 'react';
import { FaBars, FaBell, FaSun, FaMoon } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ toggleSidebar }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const notifications = [
    { id: 1, title: 'New Sale Completed', message: 'Ali Ahmed purchased cylinder LPG-PK-11802', time: '5 min ago' },
    { id: 2, title: 'Low Stock Warning', message: 'Blue Area Branch has only 5 cylinders remaining', time: '1 hour ago' },
    { id: 3, title: 'Cylinder Returned', message: 'Sara Khan returned cylinder LPG-PK-11804', time: '3 hours ago' },
  ];

  return (
    <header className="bg-white dark:bg-[#111827] sticky top-0 z-30 px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-all cursor-pointer"
        >
          <FaBars size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Single Global Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all cursor-pointer border shadow-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {isDark ? (
            <>
              <FaSun className="text-amber-400 text-sm" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <FaMoon className="text-indigo-600 text-sm" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <FaBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#111827]"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif, index) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>

        {/* User Account Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-white">Admin User</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Super Administrator</p>
          </div>
          <div className="w-9 h-9 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md">
            AU
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;