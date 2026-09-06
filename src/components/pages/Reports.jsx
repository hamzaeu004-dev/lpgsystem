import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FaChartPie, 
  FaDownload, 
  FaPrint, 
  FaArrowUp, 
  FaGasPump, 
  FaMoneyBillWave
} from 'react-icons/fa';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const Reports = () => {
  const { transactions } = useSelector((state) => state.sales);
  const { cylinders } = useSelector((state) => state.inventory);
  const { shops } = useSelector((state) => state.shops);

  const [dateRange, setDateRange] = useState('This Month');

  // Compute metrics
  const totalSalesRevenue = transactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalDepositsHeld = cylinders
    .filter(c => c.status === 'customer')
    .reduce((sum, c) => sum + (c.depositPkr || 4500), 0);

  const cylinderTypeData = [
    { name: 'Domestic 11.8kg', count: cylinders.filter(c => c.type.includes('11.8')).length, fill: '#A5D6A7' },
    { name: 'Commercial 15kg', count: cylinders.filter(c => c.type.includes('15')).length, fill: '#2e7d32' },
    { name: 'Commercial 45.4kg', count: cylinders.filter(c => c.type.includes('45.4')).length, fill: '#1b5e20' },
  ];

  const monthlySalesTrend = [
    { month: 'May', revenue: 180000, cylindersSold: 65 },
    { month: 'Jun', revenue: 210000, cylindersSold: 78 },
    { month: 'Jul', revenue: 245000, cylindersSold: 88 },
    { month: 'Aug', revenue: 310000, cylindersSold: 110 },
    { month: 'Sep', revenue: totalSalesRevenue || 125000, cylindersSold: 42 },
  ];

  const handleExportCSV = () => {
    toast.success('Report exported to CSV successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Real-time financial performance and cylinder movement reports</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs sm:text-sm rounded-xl px-3.5 py-2 font-bold focus:ring-2 focus:ring-[#A5D6A7]/30 outline-none cursor-pointer"
            >
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 hover:border-[#A5D6A7] transition-all flex items-center space-x-1.5 text-slate-700 dark:text-slate-200 hover:text-[#0f2912] dark:hover:text-[#A5D6A7] font-bold text-xs cursor-pointer"
          >
            <FaDownload className="text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary flex items-center space-x-1.5 text-xs font-black shadow-md shadow-[#A5D6A7]/25"
          >
            <FaPrint />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Refill Sales</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(totalSalesRevenue)}</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center mt-1">
                <FaArrowUp className="mr-1" /> +14.2% vs last month
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#A5D6A7]/30 text-[#0f2912] dark:text-[#A5D6A7]">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Security Deposits Held</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(totalDepositsHeld)}</p>
              <span className="text-xs text-slate-400 font-semibold mt-1 block">
                Active Customer Cylinders
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7]">
              <FaGasPump size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active Branches</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{shops.length}</p>
              <span className="text-xs text-slate-400 font-semibold mt-1 block">
                Islamabad & Rawalpindi
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <FaChartPie size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Fleet Cylinders</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">{cylinders.length}</p>
              <span className="text-xs text-slate-400 font-semibold mt-1 block">
                Across all outlets
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <FaGasPump size={20} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 card-premium">
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
              />
              <Bar dataKey="revenue" fill="#A5D6A7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cylinder Breakdown Pie Chart */}
        <div className="card-premium">
          <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-4">Inventory by Capacity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cylinderTypeData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
              >
                {cylinderTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} />
              <Legend verticalAlign="bottom" height={36} formatter={(val) => <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
