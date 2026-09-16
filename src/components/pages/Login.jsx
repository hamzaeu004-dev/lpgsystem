import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaFire,
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaShieldAlt,
  FaStore,
  FaUserCog
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authenticateUser, getUsers } from '../../utils/authHelper';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const usersList = getUsers();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Please enter both Username and Password!');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const loggedUser = authenticateUser(username, password);
        toast.success(`Welcome back, ${loggedUser.name}! (${loggedUser.role})`);
        
        if (onLoginSuccess) {
          onLoginSuccess(loggedUser);
        }
        
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.message || 'Login failed. Please check credentials.');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  // Quick Demo Login Button Handler
  const handleQuickDemoLogin = (demoUser) => {
    setUsername(demoUser.username);
    setPassword(demoUser.password);
    
    try {
      const loggedUser = authenticateUser(demoUser.username, demoUser.password);
      toast.success(`Logged in as ${loggedUser.name} (${loggedUser.role})`);
      
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }
      
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0f19] text-white relative overflow-hidden p-4 select-none">
      {/* Dynamic Background Ambient Light Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#7A0C00]/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E62A15]/15 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#111827]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7A0C00] text-white flex items-center justify-center text-2xl shadow-lg shadow-[#7A0C00]/40 border border-red-800/50">
            <FaFire className="animate-pulse text-rose-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
            Binsuleman Enterprise
          </h1>
          <p className="text-xs font-bold text-rose-400/90 uppercase tracking-widest">
            LPG ERP Logistics & Billing System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="text"
                required
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#7A0C00]/40 focus:border-[#7A0C00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs font-bold text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#7A0C00]/40 focus:border-[#7A0C00]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          {/* Super Admin Notice */}
          <div className="p-3 bg-[#7A0C00]/15 rounded-xl border border-red-900/40 text-[11px] text-rose-200 flex items-start space-x-2">
            <FaShieldAlt className="text-rose-400 text-sm shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Super Admin Control:</strong> Only Super Admin can manage & create logins for branch staff, managers, and cashiers.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#7A0C00]/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <FaSignInAlt className="text-sm" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In to ERP Dashboard'}</span>
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
            Quick Demo Accounts (Click to Test):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {usersList.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickDemoLogin(u)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left text-[10px] transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-1 font-bold text-white group-hover:text-rose-300 truncate">
                  {u.isSuperAdmin ? <FaUserCog className="text-rose-400 text-[10px]" /> : <FaStore className="text-slate-400 text-[10px]" />}
                  <span className="truncate">{u.username}</span>
                </div>
                <div className="text-[9px] text-slate-400 truncate mt-0.5">{u.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500">
          Software by Binsuleman LPG ERP v2.0 • Secure Authentication
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
