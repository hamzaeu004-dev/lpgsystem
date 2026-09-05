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
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
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

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } h-full transition-all duration-300 flex flex-col relative z-20 border-r bg-white dark:bg-[#111827] text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-sm shrink-0`}
    >
      {/* Header Logo / Title */}
      <div className="relative z-10 px-4 py-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm bg-[#12544F] text-white shrink-0">
            BE
          </div>
          {isOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h2 className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                Binsuleman Enterprise
              </h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate">
                LPG ERP System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="relative z-10 flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${
                isOpen ? 'px-3.5' : 'justify-center'
              } py-2.5 rounded-xl transition-all duration-200 relative whitespace-nowrap ${
                isActive
                  ? 'bg-[#12544F] text-white font-black shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white font-bold'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`text-base shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>

                {isOpen && (
                  <span className="ml-3 text-xs tracking-wide flex-1 font-bold truncate">
                    {item.label}
                  </span>
                )}

                {isOpen && item.badge && (
                  <span className="ml-auto bg-[#12544F] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm shrink-0">
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
          <div className="flex items-center space-x-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm bg-[#12544F] text-white shrink-0">
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
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm bg-[#12544F] text-white">
              AU
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;