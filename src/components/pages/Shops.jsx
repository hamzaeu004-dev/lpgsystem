import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStore, 
  FaPlus, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaPhoneAlt, 
  FaUser, 
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addShop } from '../../features/shops/shopSlice';
import { formatCurrency } from '../../utils/helpers';

const Shops = () => {
  const dispatch = useDispatch();
  const { shops } = useSelector((state) => state.shops);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newShop, setNewShop] = useState({
    name: '',
    location: '',
    manager: '',
    phone: '',
    totalCylinders: 50,
  });

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddShopSubmit = (e) => {
    e.preventDefault();
    if (!newShop.name || !newShop.location) {
      toast.error('Shop name and location are required!');
      return;
    }

    const createdShop = {
      id: `SHOP-00${shops.length + 1}`,
      name: newShop.name,
      location: newShop.location,
      manager: newShop.manager || 'Unassigned',
      phone: newShop.phone || '+92 300 0000000',
      totalCylinders: Number(newShop.totalCylinders) || 0,
      inStock: Number(newShop.totalCylinders) || 0,
      dispatched: 0,
      refillPending: 0,
      status: 'Active',
      monthlyRevenue: 0,
    };

    dispatch(addShop(createdShop));
    toast.success(`Shop "${newShop.name}" added successfully!`);
    setIsModalOpen(false);
    setNewShop({ name: '', location: '', manager: '', phone: '', totalCylinders: 50 });
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Shops & Retail Outlets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Manage LPG branches, branch stock allocation, and regional managers</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Search shops or managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F] w-64 transition-all"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center space-x-2 text-sm shadow-[#12544F]/25 cursor-pointer"
          >
            <FaPlus size={12} />
            <span>Add New Shop</span>
          </button>
        </div>
      </div>

      {/* Grid of Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="card-premium flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#12544F] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#12544F]/20 shrink-0">
                    <FaStore />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{shop.name}</h3>
                    <span className="font-mono text-xs text-[#12544F] dark:text-emerald-400 font-semibold">{shop.id}</span>
                  </div>
                </div>
                <span className="badge-premium badge-success">{shop.status}</span>
              </div>

              {/* Location & Manager Info */}
              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-rose-500 shrink-0" />
                  <span className="truncate">{shop.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaUser className="text-[#12544F] dark:text-emerald-400 shrink-0" />
                  <span>Manager: <strong className="text-slate-900 dark:text-white">{shop.manager}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhoneAlt className="text-emerald-500 shrink-0" />
                  <span>{shop.phone}</span>
                </div>
              </div>

              {/* Stock breakdown */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{shop.totalCylinders}</p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">In Stock</p>
                  <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{shop.inStock}</p>
                </div>
                <div className="p-2 bg-[#f0f8f7] dark:bg-indigo-950/60 rounded-xl border border-[#c2e5e2]/60 dark:border-indigo-800/60">
                  <p className="text-xs text-[#12544F] dark:text-indigo-300 font-medium">Dispatched</p>
                  <p className="text-base font-extrabold text-[#12544F] dark:text-indigo-300 mt-0.5">{shop.dispatched}</p>
                </div>
              </div>
            </div>

            {/* Footer Revenue */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Monthly Revenue:</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {formatCurrency(shop.monthlyRevenue || 0)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Shop Modal */}
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
                  <FaStore className="text-[#12544F] dark:text-emerald-400" />
                  <span>Add New Shop / Outlet</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddShopSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Shop / Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. G-11 Sector Outlet"
                    value={newShop.name}
                    onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Location Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Commercial Plaza, G-11, Islamabad"
                    value={newShop.location}
                    onChange={(e) => setNewShop({ ...newShop, location: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Manager Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bilal Hassan"
                      value={newShop.manager}
                      onChange={(e) => setNewShop({ ...newShop, manager: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+92 300 0000000"
                      value={newShop.phone}
                      onChange={(e) => setNewShop({ ...newShop, phone: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Initial Cylinder Allocation</label>
                  <input
                    type="number"
                    min="0"
                    value={newShop.totalCylinders}
                    onChange={(e) => setNewShop({ ...newShop, totalCylinders: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                  />
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
                    Create Shop Branch
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

export default Shops;