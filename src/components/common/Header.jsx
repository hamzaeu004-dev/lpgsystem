import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaSun, FaMoon, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Sale Completed', message: 'Ali Ahmed purchased cylinder LPG-PK-11802', time: '5 min ago', read: true },
    { id: 2, title: 'Low Stock Warning', message: 'Blue Area Branch has only 5 cylinders remaining', time: '1 hour ago', read: true },
    { id: 3, title: 'Cylinder Returned', message: 'Sara Khan returned cylinder LPG-PK-11804', time: '3 hours ago', read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle outside click dismiss for notifications popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="bg-white dark:bg-[#111827] sticky top-0 z-30 px-3 sm:px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
          Binsuleman LPG ERP
        </span>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Single Global Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-all cursor-pointer border shadow-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {isDark ? (
            <>
              <FaSun className="text-amber-400 text-sm" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <FaMoon className="text-indigo-600 dark:text-indigo-400 text-sm" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="Notifications"
          >
            <FaBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#111827]"></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        {unreadCount} Unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#0f2912] dark:text-[#A5D6A7] font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <FaCheckCircle size={10} /> All read
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notif.id)}
                      className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-colors cursor-pointer flex items-start space-x-3 ${
                        notif.read
                          ? 'bg-white dark:bg-[#111827] opacity-60'
                          : 'bg-slate-50/80 dark:bg-slate-800/50 font-medium'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{notif.title}</p>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-[#A5D6A7] rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
                      </div>
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
        <div className="flex items-center space-x-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-white">Admin User</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Super Administrator</p>
          </div>
          <div className="w-9 h-9 bg-[#A5D6A7] text-[#0f2912] rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs">
            AU
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;