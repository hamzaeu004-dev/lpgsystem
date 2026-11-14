import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PURCHASE_CATEGORIES from '../../config/purchaseCategories';
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
  FaChevronDown,
  FaFire
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    {
      path: '/purchase',
      label: 'Purchase',
      icon: <FaShoppingBag />,
      children: PURCHASE_CATEGORIES.map((c) => ({ path: c.path, label: c.label }))
    },
    { path: '/expense', label: 'Expense', icon: <FaWallet /> },
    { path: '/sales', label: 'Sales & Billing', icon: <FaShoppingCart /> },
    { path: '/committee-collection', label: 'Committee Collection', icon: <FaHandHoldingUsd /> },
    { path: '/shops', label: 'Shops & Outlets', icon: <FaStore /> },
    { path: '/customers', label: 'Customers', icon: <FaUsers /> },
    { path: '/cylinders', label: 'Cylinder Logistics', icon: <FaGasPump /> },
    { path: '/reports', label: 'Reports', icon: <FaChartPie /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  const inSection = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  // Parent menus with children (e.g. Purchase) open automatically while you're inside them
  const [openGroups, setOpenGroups] = useState(() =>
    menuItems.filter((m) => m.children && inSection(m.path)).map((m) => m.path)
  );

  useEffect(() => {
    const current = menuItems.find((m) => m.children && inSection(m.path));
    if (current) setOpenGroups((g) => (g.includes(current.path) ? g : [...g, current.path]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (path) =>
    setOpenGroups((g) => (g.includes(path) ? g.filter((p) => p !== path) : [...g, path]));

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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-[84px]'
        } app-frame lg:!bg-none lg:bg-transparent fixed lg:relative inset-y-0 left-0 h-full transition-all duration-300 ease-in-out flex flex-col z-40 text-white shrink-0 select-none shadow-2xl lg:shadow-none`}
      >
        {/* Collapse / expand toggle */}
        <button
          onClick={() => setIsOpen && setIsOpen(!isOpen)}
          title={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
          aria-label={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
          className="hidden lg:flex absolute -right-3 top-7 z-50 w-6 h-6 rounded-full bg-white text-[#9B1C1C] dark:bg-slate-800 dark:text-red-300 items-center justify-center shadow-md cursor-pointer"
        >
          <FaChevronLeft size={10} className={`transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
        </button>

        {/* Brand */}
        <div className={`px-5 pt-6 pb-4 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-white text-[#9B1C1C] dark:bg-red-950 dark:text-red-300 flex items-center justify-center shadow-md shrink-0">
              <FaFire className="text-lg" />
            </div>
            <div
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isOpen ? 'opacity-100 max-w-[180px]' : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <p className="text-base font-semibold leading-tight text-white">Binsuleman</p>
              <p className="text-[11px] font-medium text-white/70 tracking-wide">LPG ERP System</p>
            </div>
          </div>

          {isOpen && (
            <button
              onClick={() => setIsOpen && setIsOpen(false)}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-lg text-white/80 cursor-pointer"
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>

        <div className={`mx-5 mb-4 border-b border-white/15 ${isOpen ? '' : 'mx-4'}`} />

        {/* Navigation */}
        <nav className="flex-1 pl-3 pr-0 pt-3 pb-6 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isActive = hasChildren ? inSection(item.path) : location.pathname === item.path;
            const isExpanded = hasChildren && isOpen && openGroups.includes(item.path);

            return (
              <React.Fragment key={item.path}>
                <NavLink
                  to={hasChildren ? item.children[0].path : item.path}
                  onClick={() => {
                    if (hasChildren && isOpen) {
                      setOpenGroups((g) => (g.includes(item.path) ? g : [...g, item.path]));
                    }
                    handleNavClick();
                  }}
                  aria-expanded={hasChildren ? isExpanded : undefined}
                  title={!isOpen ? item.label : undefined}
                  className={`group relative flex items-center h-11 ${
                    isOpen ? 'pl-4 pr-4' : 'justify-center pr-3'
                  } rounded-l-full whitespace-nowrap cursor-pointer transition-colors ${
                    isActive ? 'text-[#9B1C1C] dark:text-red-300' : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="nav-curve absolute inset-0 z-0"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}

                  <span className="relative z-10 text-[15px] shrink-0">{item.icon}</span>

                  <span
                    className={`relative z-10 ml-3.5 text-[13px] flex-1 truncate transition-all duration-300 ${
                      isOpen ? 'opacity-100 max-w-[170px]' : 'opacity-0 max-w-0 ml-0 pointer-events-none'
                    } ${isActive ? 'font-semibold' : 'font-medium'}`}
                  >
                    {item.label}
                  </span>

                  {hasChildren && isOpen && (
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleGroup(item.path);
                      }}
                      title={isExpanded ? 'Collapse' : 'Expand'}
                      className={`relative z-10 ml-2 p-1 rounded-md shrink-0 ${
                        isActive ? 'hover:bg-[#9B1C1C]/10' : 'hover:bg-white/15'
                      }`}
                    >
                      <FaChevronDown size={10} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </span>
                  )}
                </NavLink>

                {/* Sub-menu (only when the sidebar is expanded) */}
                {isExpanded && (
                  <div className="ml-7 mr-4 pl-3 border-l border-white/20 space-y-0.5 pt-3 pb-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={handleNavClick}
                        className={({ isActive: childActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] whitespace-nowrap transition-colors ${
                            childActive ? 'bg-white/15 text-white font-semibold' : 'text-white/75 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive: childActive }) => (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? 'bg-white' : 'bg-white/40'}`} />
                            <span className="truncate">{child.label}</span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
