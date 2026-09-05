import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUserPlus, 
  FaSearch, 
  FaPhoneAlt, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaGasPump, 
  FaUndo, 
  FaTimes 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addCustomer, returnCylinder } from '../../features/customers/customerSlice';
import { updateCylinderStatus } from '../../features/inventory/inventorySlice';
import { formatCurrency } from '../../utils/helpers';

const Customers = () => {
  const dispatch = useDispatch();

  const { customers } = useSelector((state) => state.customers);
  const { cylinders } = useSelector((state) => state.inventory);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [returnModal, setReturnModal] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    cnic: '',
    address: '',
    category: 'Domestic',
    securityDeposit: 4500,
  });

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.cnic.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Customer name and phone number are required!');
      return;
    }

    const created = {
      id: `CUST-00${customers.length + 1}`,
      name: newCustomer.name,
      phone: newCustomer.phone,
      cnic: newCustomer.cnic || '37405-0000000-0',
      address: newCustomer.address || 'Islamabad / Rawalpindi',
      category: newCustomer.category,
      activeCylindersCount: 0,
      assignedCylinders: [],
      securityDeposit: Number(newCustomer.securityDeposit) || 4500,
      balance: 0,
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0],
    };

    dispatch(addCustomer(created));
    toast.success(`Customer "${newCustomer.name}" registered successfully!`);
    setIsModalOpen(false);
    setNewCustomer({ name: '', phone: '', cnic: '', address: '', category: 'Domestic', securityDeposit: 4500 });
  };

  const handleConfirmReturnCylinder = (cust, cylId) => {
    dispatch(returnCylinder({ customerId: cust.id, cylinderId: cylId }));

    dispatch(
      updateCylinderStatus({
        id: cylId,
        status: 'stock',
        customerId: null,
        customerName: null,
      })
    );

    toast.success(`Cylinder ${cylId} returned from ${cust.name} back to In-Stock inventory!`);
    setReturnModal(null);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Customer Directory</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage customer accounts, assigned cylinders, and security deposits</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search by Name, Phone, CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F] w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 text-sm shadow-[#12544F]/25 cursor-pointer"
          >
            <FaUserPlus size={14} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => (
          <motion.div
            key={cust.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card-premium flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#12544F] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#12544F]/20 shrink-0">
                    {cust.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{cust.name}</h3>
                    <span className="font-mono text-xs text-[#12544F] dark:text-emerald-400 font-semibold">{cust.id}</span>
                  </div>
                </div>
                <span
                  className={`badge-premium ${
                    cust.category === 'Commercial' ? 'badge-purple' : 'badge-info'
                  }`}
                >
                  {cust.category}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-center space-x-2">
                  <FaPhoneAlt className="text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white">{cust.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaIdCard className="text-[#12544F] dark:text-emerald-400 shrink-0" />
                  <span>CNIC: {cust.cnic}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-rose-500 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              {/* Active Cylinders held */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaGasPump className="text-[#12544F] dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active Cylinders Held:</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{cust.activeCylindersCount || 0} units</span>
              </div>
            </div>

            {/* Actions & Deposits */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Security Deposit</p>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{formatCurrency(cust.securityDeposit || 0)}</p>
              </div>

              {cust.activeCylindersCount > 0 ? (
                <button
                  onClick={() => setReturnModal(cust)}
                  className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/80 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FaUndo size={11} />
                  <span>Return Cylinder</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">No Cylinder Due</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Customer Modal - RENDERED IN DOCUMENT BODY PORTAL */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative my-auto w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FaUserPlus className="text-[#12544F] dark:text-emerald-400" />
                  <span>Register New Customer</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Bilal"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Mobile Phone Number</label>
                    <input
                      type="text"
                      required
                      placeholder="+92 300 1234567"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">CNIC Number</label>
                    <input
                      type="text"
                      placeholder="37405-1234567-1"
                      value={newCustomer.cnic}
                      onChange={(e) => setNewCustomer({ ...newCustomer, cnic: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="House / Shop address, Sector, City"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Category</label>
                    <select
                      value={newCustomer.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const dep = cat === 'Commercial' ? 15000 : 4500;
                        setNewCustomer({ ...newCustomer, category: cat, securityDeposit: dep });
                      }}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    >
                      <option value="Domestic">Domestic</option>
                      <option value="Commercial">Commercial (Hotel/Bakery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Initial Security Deposit (PKR)</label>
                    <input
                      type="number"
                      value={newCustomer.securityDeposit}
                      onChange={(e) => setNewCustomer({ ...newCustomer, securityDeposit: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Register Customer Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Return Cylinder Workflow Modal - RENDERED IN DOCUMENT BODY PORTAL */}
      {returnModal && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center space-x-2">
                  <FaUndo className="text-amber-500" />
                  <span>Receive Cylinder Return</span>
                </h3>
                <button
                  onClick={() => setReturnModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select which cylinder <strong className="text-slate-900 dark:text-white">{returnModal.name}</strong> is returning back to stock:
                </p>

                {returnModal.assignedCylinders.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No assigned cylinder IDs recorded for this account.</p>
                ) : (
                  <div className="space-y-2">
                    {returnModal.assignedCylinders.map((cylId) => {
                      const cylObj = cylinders.find((c) => c.id === cylId);
                      return (
                        <div
                          key={cylId}
                          className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{cylObj?.serialNo || cylId}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{cylObj?.type || 'Domestic Cylinder'}</p>
                          </div>
                          <button
                            onClick={() => handleConfirmReturnCylinder(returnModal, cylId)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Mark Returned
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setReturnModal(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Customers;