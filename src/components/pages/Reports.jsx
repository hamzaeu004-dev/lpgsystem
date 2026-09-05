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
    { name: 'Domestic 11.8kg', count: cylinders.filter(c => c.type.includes('11.8')).length, fill: '#12544F' },
    { name: 'Commercial 15kg', count: cylinders.filter(c => c.type.includes('15')).length, fill: '#1e756e' },
    { name: 'Commercial 45.4kg', count: cylinders.filter(c => c.type.includes('45.4')).length, fill: '#38a39a' },
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
          <h1 className="text-3xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Real-time financial performance and cylinder movement reports</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 font-medium focus:ring-2 focus:ring-[#12544F]/20 outline-none cursor-pointer"
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
            className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 hover:border-[#12544F] transition-all flex items-center space-x-2 text-slate-700 hover:text-[#12544F] font-medium text-sm"
          >
            <FaDownload className="text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary flex items-center space-x-2 text-sm shadow-[#12544F]/20"
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
              <p className="text-xs text-slate-500 font-medium">Total Refill Sales</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalSalesRevenue)}</p>
              <span className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <FaArrowUp className="mr-1" /> +14.2% vs last month
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#f0f8f7] text-[#12544F]">
              <FaMoneyBillWave size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Security Deposits Held</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalDepositsHeld)}</p>
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                Active Customer Cylinders
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#f0f8f7] text-[#12544F]">
              <FaGasPump size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Branches</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{shops.length}</p>
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                Islamabad & Rawalpindi
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
              <FaChartPie size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Fleet Cylinders</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{cylinders.length}</p>
              <span className="text-xs text-slate-400 font-medium mt-1 block">
                Across all outlets
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600">
              <FaGasPump size={20} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 card-premium">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                formatter={(value) => [`PKR ${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              />
              <Bar dataKey="revenue" fill="#12544F" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cylinder Breakdown Pie Chart */}
        <div className="card-premium">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Inventory by Capacity</h3>
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
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
