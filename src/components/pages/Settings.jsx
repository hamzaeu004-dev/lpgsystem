import React, { useState } from 'react';
import { 
  FaBuilding, 
  FaTags, 
  FaBell, 
  FaLock, 
  FaSave 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Premier LPG Gas Distributors',
    tagline: 'Safe, Reliable LPG Supply across Twin Cities',
    phone: '+92 51 555 9900',
    email: 'info@premierlpg.pk',
    ntn: '7482910-4',
    address: 'Plot 45, I-9/3 Industrial Sector, Islamabad',
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

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Manage ERP business profile, cylinder refill tariffs, and notifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="card-premium h-fit space-y-2 p-3">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-[#f2f9f3] dark:bg-[#A5D6A7]/15 text-[#0f2912] dark:text-[#A5D6A7] font-bold border border-[#cde9cf] dark:border-[#A5D6A7]/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FaBuilding size={16} />
            <span>Company Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('tariffs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'tariffs'
                ? 'bg-[#f2f9f3] dark:bg-[#A5D6A7]/15 text-[#0f2912] dark:text-[#A5D6A7] font-bold border border-[#cde9cf] dark:border-[#A5D6A7]/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FaTags size={16} />
            <span>Tariffs & Security Deposits</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#f2f9f3] dark:bg-[#A5D6A7]/15 text-[#0f2912] dark:text-[#A5D6A7] font-bold border border-[#cde9cf] dark:border-[#A5D6A7]/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FaBell size={16} />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'security'
                ? 'bg-[#f2f9f3] dark:bg-[#A5D6A7]/15 text-[#0f2912] dark:text-[#A5D6A7] font-bold border border-[#cde9cf] dark:border-[#A5D6A7]/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FaLock size={16} />
            <span>Security & Permissions</span>
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
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Tagline / Motto</label>
                  <input
                    type="text"
                    value={companyInfo.tagline}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, tagline: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Official Email</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">NTN / Tax Registration</label>
                  <input
                    type="text"
                    value={companyInfo.ntn}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, ntn: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Headquarters Address</label>
                  <input
                    type="text"
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="btn-primary flex items-center space-x-2">
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
                <button type="submit" className="btn-primary flex items-center space-x-2">
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
                    className="w-5 h-5 accent-[#2e7d32] rounded cursor-pointer"
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
                    className="w-5 h-5 accent-[#2e7d32] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700/60">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">SMS Invoice to Customer</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Automatically send receipt SMS upon sale transaction completion</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsAlertsToCustomers}
                    onChange={(e) => setNotifications({ ...notifications, smsAlertsToCustomers: e.target.checked })}
                    className="w-5 h-5 accent-[#2e7d32] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">User & Role Management</h2>
              <div className="p-4 bg-[#f2f9f3] dark:bg-[#A5D6A7]/15 rounded-2xl border border-[#cde9cf] dark:border-[#A5D6A7]/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#0f2912] dark:text-[#A5D6A7] text-sm">Role Based Access Control (RBAC)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Super Admin, Branch Manager, and Cashier permission presets enabled.</p>
                </div>
                <span className="badge-premium badge-brand">Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
