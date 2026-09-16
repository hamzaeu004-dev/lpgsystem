import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding,
  FaTags,
  FaBell,
  FaLock,
  FaSave,
  FaUserPlus,
  FaUserCheck,
  FaUserShield,
  FaKey,
  FaTimes,
  FaShieldAlt,
  FaStore,
  FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  getUsers,
  createNewUser,
  toggleUserStatus,
  resetUserPassword,
  getCurrentUser
} from '../../utils/authHelper';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const currentUser = getCurrentUser();

  // Users State
  const [users, setUsers] = useState(getUsers);

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [resetPassModalUser, setResetPassModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Form State for new user creation
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'Cashier',
    outlet: 'Main Central Depot',
    phone: '',
  });

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Binsuleman Enterprise LPG ERP',
    tagline: 'Safe, Reliable LPG Supply & Logistics across Pakistan',
    phone: '+92 300 1111111',
    email: 'info@binsuleman.com',
    ntn: '7482910-4',
    address: 'Plant #1, Industrial Sector, Pakistan',
  });

  const [rates, setRates] = useState({
    domesticRefill: 2850,
    domesticDeposit: 4500,
    comm15kgRefill: 3600,
    comm15kgDeposit: 6000,
    comm45kgRefill: 9500,
    comm45kgDeposit: 15000,
  });

  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    dueReturnsAlert: true,
    dailyEmailSummary: false,
    smsAlertsToCustomers: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('System settings saved successfully!');
  };

  // Handle New User Creation Submission (Super Admin only)
  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.username || !newUserForm.password) {
      toast.error('Please fill in Full Name, Username, and Password!');
      return;
    }

    try {
      const created = createNewUser(newUserForm);
      setUsers(getUsers());
      toast.success(`New login created for ${created.name} (${created.role})!`);
      setIsAddUserModalOpen(false);
      setNewUserForm({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'Cashier',
        outlet: 'Main Central Depot',
        phone: '',
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Toggle Active/Inactive Status
  const handleToggleStatus = (userId, isSuperAdmin) => {
    try {
      const updated = toggleUserStatus(userId);
      setUsers(updated);
      toast.success('User access status updated!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    if (!resetPassModalUser || !newPasswordInput.trim()) {
      toast.error('Please enter a valid new password!');
      return;
    }

    try {
      const updated = resetUserPassword(resetPassModalUser.id, newPasswordInput.trim());
      setUsers(updated);
      toast.success(`Password for ${resetPassModalUser.username} updated successfully!`);
      setResetPassModalUser(null);
      setNewPasswordInput('');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Manage ERP business profile, cylinder refill tariffs, and user login permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="card-premium h-fit space-y-2 p-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'general'
                ? 'bg-[#7A0C00] text-white font-black shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <FaBuilding size={16} />
            <span>Company Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'tariffs'
                ? 'bg-[#7A0C00] text-white font-black shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <FaTags size={16} />
            <span>Tariffs & Security Deposits</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'notifications'
                ? 'bg-[#7A0C00] text-white font-black shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <FaBell size={16} />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'security'
                ? 'bg-[#7A0C00] text-white font-black shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <FaLock size={16} />
            <span>User Accounts & Logins</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 card-premium">
          {activeTab === 'general' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Company Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Tagline / Motto</label>
                  <input
                    type="text"
                    value={companyInfo.tagline}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Official Email</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary flex items-center space-x-2 text-xs py-2.5 px-5">
                  <FaSave />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'tariffs' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Cylinder Rates & Deposits (PKR)</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Domestic 11.8 kg</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Refill Price (PKR)</label>
                      <input
                        type="number"
                        value={rates.domesticRefill}
                        onChange={(e) => setRates({ ...rates, domesticRefill: Number(e.target.value) })}
                        className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Security Deposit (PKR)</label>
                      <input
                        type="number"
                        value={rates.domesticDeposit}
                        onChange={(e) => setRates({ ...rates, domesticDeposit: Number(e.target.value) })}
                        className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Commercial 45.4 kg</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Refill Price (PKR)</label>
                      <input
                        type="number"
                        value={rates.comm45kgRefill}
                        onChange={(e) => setRates({ ...rates, comm45kgRefill: Number(e.target.value) })}
                        className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Security Deposit (PKR)</label>
                      <input
                        type="number"
                        value={rates.comm45kgDeposit}
                        onChange={(e) => setRates({ ...rates, comm45kgDeposit: Number(e.target.value) })}
                        className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary flex items-center space-x-2 text-xs py-2.5 px-5">
                  <FaSave />
                  <span>Update Tariffs</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Notification Preferences</h2>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Low Stock Alert Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alert when a shop has fewer than 10 cylinders remaining</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.lowStockAlerts}
                    onChange={(e) => setNotifications({ ...notifications, lowStockAlerts: e.target.checked })}
                    className="w-5 h-5 accent-[#7A0C00] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Customer Due Returns Warning</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Flag customers holding cylinders for more than 30 days</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.dueReturnsAlert}
                    onChange={(e) => setNotifications({ ...notifications, dueReturnsAlert: e.target.checked })}
                    className="w-5 h-5 accent-[#7A0C00] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SUPER ADMIN USER & ROLE MANAGEMENT */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FaUserShield className="text-[#7A0C00] dark:text-rose-400" />
                    <span>User Accounts & Access Control</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Super Admin creates & manages login credentials for all branch managers and cashiers.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="btn-primary text-xs font-black py-2.5 px-4 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <FaUserPlus />
                  <span>Create New User Login</span>
                </button>
              </div>

              {/* Security Info Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7A0C00]/10 text-[#7A0C00] dark:bg-red-950/80 dark:text-rose-400 flex items-center justify-center font-bold text-base">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">Active Session: {currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Role: {currentUser.role} • Outlet: {currentUser.outlet}</p>
                  </div>
                </div>
                <span className="badge-premium badge-success">Logged In</span>
              </div>

              {/* Users List Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="table-premium">
                    <thead>
                      <tr>
                        <th className="whitespace-nowrap">User ID</th>
                        <th className="whitespace-nowrap">Full Name & Email</th>
                        <th className="whitespace-nowrap">Username</th>
                        <th className="whitespace-nowrap">Role</th>
                        <th className="whitespace-nowrap">Assigned Outlet</th>
                        <th className="whitespace-nowrap">Status</th>
                        <th className="whitespace-nowrap text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="font-mono text-xs font-extrabold text-slate-800 dark:text-white whitespace-nowrap">{u.id}</td>
                          <td className="whitespace-nowrap">
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                          </td>
                          <td className="font-mono text-xs font-bold text-[#7A0C00] dark:text-rose-400 whitespace-nowrap">
                            @{u.username}
                          </td>
                          <td className="whitespace-nowrap">
                            <span className={`badge-premium ${u.isSuperAdmin ? 'badge-danger' : u.role === 'Manager' ? 'badge-info' : 'badge-warning'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{u.outlet}</td>
                          <td className="whitespace-nowrap">
                            <span className={`badge-premium ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setResetPassModalUser(u);
                                  setNewPasswordInput('');
                                }}
                                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer"
                                title="Reset User Password"
                              >
                                <FaKey size={10} />
                                <span>Reset Pass</span>
                              </button>

                              {!u.isSuperAdmin && (
                                <button
                                  onClick={() => handleToggleStatus(u.id, u.isSuperAdmin)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                                    u.status === 'Active'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200'
                                  }`}
                                >
                                  {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE NEW USER LOGIN (SUPER ADMIN ONLY) */}
      {isAddUserModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <FaUserPlus className="text-[#7A0C00] dark:text-rose-400" />
                  <span>Create New User Credentials</span>
                </h3>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Ali"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Username <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. usman"
                      value={newUserForm.username}
                      onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Assign password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Assigned Role</label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Operator">Operator</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Branch Outlet</label>
                    <select
                      value={newUserForm.outlet}
                      onChange={(e) => setNewUserForm({ ...newUserForm, outlet: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="Main Central Depot">Main Central Depot</option>
                      <option value="Blue Area Branch">Blue Area Branch</option>
                      <option value="G-9 Commercial Outlet">G-9 Commercial Outlet</option>
                      <option value="All Outlets & Depots">All Outlets & Depots</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Official Email / Phone</label>
                  <input
                    type="email"
                    placeholder="e.g. usman@binsuleman.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-5 text-xs font-black shadow-md cursor-pointer">
                    Save New User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPassModalUser && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <FaKey className="text-amber-500" />
                  <span>Reset Password for @{resetPassModalUser.username}</span>
                </h3>
                <button
                  onClick={() => setResetPassModalUser(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Enter New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#7A0C00]/20"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setResetPassModalUser(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary py-2 px-5 text-xs font-black">
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Settings;
