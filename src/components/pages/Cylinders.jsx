import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaUserCheck, 
  FaStore, 
  FaRedo
} from 'react-icons/fa';

const Cylinders = () => {
  const { cylinders = [] } = useSelector((state) => state.inventory || {});

  const inStockCount = cylinders.filter((c) => c.status === 'stock').length;
  const withCustomerCount = cylinders.filter((c) => c.status === 'customer').length;
  const inMarketCount = cylinders.filter((c) => c.status === 'market').length;
  const refillPendingCount = cylinders.filter((c) => c.status === 'refill').length;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cylinder Status Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Real-time status tracking for LPG Cylinder units</p>
        </div>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">In Stock (Depot)</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{inStockCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ready for sale / refill</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
              <FaCheckCircle />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">With Customers</p>
              <p className="text-3xl font-black text-[#7A0C00] dark:text-rose-400 mt-1">{withCustomerCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Active customer rentals</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-[#7A0C00] dark:text-rose-400 flex items-center justify-center text-xl font-bold">
              <FaUserCheck />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">In Market / Outlets</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{inMarketCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Dispatched to retail</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold">
              <FaStore />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-premium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">Refill Pending</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{refillPendingCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Empty cylinder batch</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold">
              <FaRedo />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cylinders;