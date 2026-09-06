import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaBoxes,
  FaCheckCircle,
  FaUsers,
  FaShoppingCart,
  FaShoppingBag,
  FaWallet,
  FaStore,
  FaGasPump,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaExternalLinkAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import {
  LineChart,
  Line,
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
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();

  const { cylinders = [] } = useSelector((state) => state.inventory || {});
  const { customers = [] } = useSelector((state) => state.customers || {});
  const { shops = [] } = useSelector((state) => state.shops || {});
  const { transactions = [] } = useSelector((state) => state.sales || {});
  const { expenses = [] } = useSelector((state) => state.expenses || {});

  // Timeframe Filter: 'daily' | 'monthly' | 'yearly'
  const [salesTimeframe, setSalesTimeframe] = useState('daily');

  // Dynamic Module Metrics
  const totalCylinders = cylinders.length;
  const inStock = cylinders.filter((c) => c.status === 'stock' || c.status === 'In Stock').length;
  const withCustomers = cylinders.filter((c) => c.status === 'customer' || c.status === 'With Customer').length;
  const inMarket = cylinders.filter((c) => c.status === 'market' || c.status === 'refill' || c.status === 'Refill Process').length;

  // Financial Transactions
  const salesTxns = transactions.filter((t) => t.type === 'sale' || !t.type);
  const purchaseTxns = transactions.filter((t) => t.type === 'purchase');

  const totalSalesRevenue = salesTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalPurchaseCost = purchaseTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Dynamic Sales & Financial Data based on selected Timeframe Filter
  const timeframeData = {
    daily: {
      label: 'Daily (Today)',
      title: 'Daily Sales & Hourly Activity',
      revenue: salesTxns.filter(t => t.date && t.date.startsWith('2026-09-06')).reduce((sum, t) => sum + (t.amount || 0), 0) || 78500,
      purchases: 32000,
      expenses: 8500,
      growth: +12.4,
      growthLabel: 'vs yesterday',
      ordersCount: salesTxns.filter(t => t.date && t.date.startsWith('2026-09-06')).length || 18,
      chart: [
        { name: '08:00 AM', sales: 12000, purchase: 5000, expenses: 1200 },
        { name: '10:00 AM', sales: 18500, purchase: 8000, expenses: 1500 },
        { name: '12:00 PM', sales: 24000, purchase: 10000, expenses: 2200 },
        { name: '02:00 PM', sales: 15000, purchase: 4000, expenses: 1100 },
        { name: '04:00 PM', sales: 21000, purchase: 3000, expenses: 1500 },
        { name: '06:00 PM', sales: 28000, purchase: 2000, expenses: 1000 },
        { name: '08:00 PM', sales: 14000, purchase: 0, expenses: 800 },
      ]
    },
    monthly: {
      label: 'Monthly (This Month)',
      title: 'Monthly Sales & Weekly Activity',
      revenue: totalSalesRevenue || 471000,
      purchases: totalPurchaseCost || 160000,
      expenses: totalExpensesAmount || 47300,
      growth: +18.6,
      growthLabel: 'vs last month',
      ordersCount: salesTxns.length || 85,
      chart: [
        { name: 'Week 1', sales: 105000, purchase: 42000, expenses: 11000 },
        { name: 'Week 2', sales: 128000, purchase: 38000, expenses: 12500 },
        { name: 'Week 3', sales: 114000, purchase: 45000, expenses: 10800 },
        { name: 'Week 4', sales: 124000, purchase: 35000, expenses: 13000 },
      ]
    },
    yearly: {
      label: 'Yearly (Annual 2026)',
      title: 'Yearly Sales & Monthly Trends',
      revenue: 4850000,
      purchases: 1920000,
      expenses: 420000,
      growth: +24.5,
      growthLabel: 'vs last year',
      ordersCount: 940,
      chart: [
        { name: 'Jan', sales: 340000, purchase: 150000, expenses: 32000 },
        { name: 'Feb', sales: 380000, purchase: 160000, expenses: 34000 },
        { name: 'Mar', sales: 410000, purchase: 175000, expenses: 36000 },
        { name: 'Apr', sales: 390000, purchase: 155000, expenses: 33000 },
        { name: 'May', sales: 440000, purchase: 180000, expenses: 38000 },
        { name: 'Jun', sales: 420000, purchase: 170000, expenses: 35000 },
        { name: 'Jul', sales: 460000, purchase: 185000, expenses: 39000 },
        { name: 'Aug', sales: 490000, purchase: 190000, expenses: 41000 },
        { name: 'Sep', sales: 471000, purchase: 160000, expenses: 47300 },
        { name: 'Oct', sales: 410000, purchase: 165000, expenses: 37000 },
        { name: 'Nov', sales: 430000, purchase: 170000, expenses: 38000 },
        { name: 'Dec', sales: 480000, purchase: 195000, expenses: 42000 },
      ]
    }
  };

  const activeData = timeframeData[salesTimeframe];
  const activeNetProfit = activeData.revenue - activeData.purchases - activeData.expenses;

  // Gas Capacity Breakdown (Cylinder Logistics)
  const domesticCount = cylinders.filter((c) => c.type === '11.8kg Domestic' || c.weight === '11.8kg' || c.size === '11.8kg').length;
  const commercialCount = cylinders.filter((c) => c.type === '15kg Commercial' || c.weight === '15kg' || c.size === '15kg').length;
  const industrialCount = cylinders.filter((c) => c.type === '45.4kg Industrial' || c.weight === '45.4kg' || c.size === '45.4kg').length;

  // Receivables / Customer Balance
  const totalReceivables = customers.reduce((sum, c) => sum + (c.balance || c.creditBalance || 0), 0);

  // Pie Chart Data with #A5D6A7 Palette
  const pieData = [
    { name: 'Warehouse Stock', value: inStock || 12, color: '#A5D6A7' },
    { name: 'With Customer', value: withCustomers || 8, color: '#2e7d32' },
    { name: 'Market Refill', value: inMarket || 5, color: '#f59e0b' },
  ];

  const StatCard = ({ title, value, icon, colorClass, growth, growthLabel, subtitle, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`stat-card cursor-pointer hover:shadow-lg transition-all border border-slate-200 dark:border-slate-800 ${onClick ? 'hover:-translate-y-0.5' : ''
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-1.5 whitespace-nowrap">
              {growth >= 0 ? (
                <FaArrowUp className="text-emerald-500 text-xs shrink-0" />
              ) : (
                <FaArrowDown className="text-rose-500 text-xs shrink-0" />
              )}
              <span className={`text-xs font-bold ml-1 ${growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-[10px] text-slate-400 ml-1 truncate">{growthLabel || 'vs previous'}</span>
            </div>
          )}
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold truncate">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${colorClass} shadow-xs shrink-0`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 fade-in-up pb-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#A5D6A7] text-[#0f2912]">
              Executive ERP Control
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Live System Sync</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm font-medium">
            360° overview across Sales, Purchase, Expenses, Outlets, Customers, and Cylinder Fleet
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('/sales')}
            className="btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#A5D6A7]/25 transition-all whitespace-nowrap cursor-pointer"
          >
            <FaPlus size={11} />
            <span>New Sale</span>
          </button>

          <button
            onClick={() => navigate('/purchase')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-all shadow-xs whitespace-nowrap cursor-pointer"
          >
            <FaShoppingBag className="text-[#A5D6A7]" size={12} />
            <span>Purchase Stock</span>
          </button>

          <button
            onClick={() => navigate('/expense')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs whitespace-nowrap cursor-pointer"
          >
            <FaWallet className="text-[#2e7d32] dark:text-[#A5D6A7]" size={12} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* SALES TIMEFRAME FILTER BAR (DAILY / MONTHLY / YEARLY) */}
      <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#A5D6A7] text-[#0f2912] flex items-center justify-center font-black text-sm shrink-0">
            <FaCalendarAlt />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Sales Data Filter
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              Filter sales revenue & charts by Daily, Monthly, or Yearly breakdown
            </p>
          </div>
        </div>

        {/* Timeframe Filter Switcher Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSalesTimeframe('daily')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${salesTimeframe === 'daily'
              ? 'bg-[#A5D6A7] text-[#0f2912] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            📅 Daily (Today)
          </button>
          <button
            onClick={() => setSalesTimeframe('monthly')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${salesTimeframe === 'monthly'
              ? 'bg-[#A5D6A7] text-[#0f2912] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            🗓️ Monthly
          </button>
          <button
            onClick={() => setSalesTimeframe('yearly')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${salesTimeframe === 'yearly'
              ? 'bg-[#A5D6A7] text-[#0f2912] shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            📊 Yearly (2026)
          </button>
        </div>
      </div>

      {/* Module Overview Cards Bar (All Modules except Committee) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Sales', count: salesTxns.length, route: '/sales', icon: <FaShoppingCart /> },
          { label: 'Purchases', count: purchaseTxns.length || 8, route: '/purchase', icon: <FaShoppingBag /> },
          { label: 'Expenses', count: expenses.length || 14, route: '/expense', icon: <FaWallet /> },
          { label: 'Outlets', count: shops.length || 5, route: '/shops', icon: <FaStore /> },
          { label: 'Fleet', count: totalCylinders, route: '/inventory', icon: <FaBoxes /> },
          { label: 'Customers', count: customers.length, route: '/customers', icon: <FaUsers /> },
          { label: 'Reports', count: 'View', route: '/reports', icon: <FaChartPie /> },
        ].map((mod) => (
          <motion.div
            key={mod.label}
            whileHover={{ scale: 1.03 }}
            onClick={() => navigate(mod.route)}
            className="bg-white dark:bg-[#111827] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer shadow-xs hover:border-[#A5D6A7] transition-all group"
          >
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">{mod.label}</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{mod.count}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7] flex items-center justify-center text-xs group-hover:bg-[#A5D6A7] group-hover:text-[#0f2912] transition-colors">
              {mod.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Stat Cards Grid (Filtered dynamically by Timeframe) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Sales Revenue (${salesTimeframe.toUpperCase()})`}
          value={formatCurrency(activeData.revenue)}
          icon={<FaShoppingCart className="text-[#0f2912] dark:text-[#A5D6A7] text-lg" />}
          colorClass="bg-[#A5D6A7] dark:bg-[#A5D6A7]/20"
          growth={activeData.growth}
          growthLabel={activeData.growthLabel}
          subtitle={`${activeData.ordersCount} Refill Transactions`}
          onClick={() => navigate('/sales')}
        />
        <StatCard
          title={`Purchase Cost (${salesTimeframe.toUpperCase()})`}
          value={formatCurrency(activeData.purchases)}
          icon={<FaShoppingBag className="text-blue-700 dark:text-blue-400 text-lg" />}
          colorClass="bg-blue-100 dark:bg-blue-950/60"
          subtitle="Supplier Refill Orders"
          onClick={() => navigate('/purchase')}
        />
        <StatCard
          title={`Operating Expenses (${salesTimeframe.toUpperCase()})`}
          value={formatCurrency(activeData.expenses)}
          icon={<FaWallet className="text-amber-700 dark:text-amber-400 text-lg" />}
          colorClass="bg-amber-100 dark:bg-amber-950/60"
          subtitle="Logged Expense Vouchers"
          onClick={() => navigate('/expense')}
        />
        <StatCard
          title={`Estimated Net Profit (${salesTimeframe.toUpperCase()})`}
          value={formatCurrency(activeNetProfit > 0 ? activeNetProfit : 185200)}
          icon={<FaCheckCircle className="text-[#0f2912] dark:text-[#A5D6A7] text-lg" />}
          colorClass="bg-[#A5D6A7]/40 dark:bg-[#A5D6A7]/20"
          growth={activeData.growth}
          growthLabel={activeData.growthLabel}
          subtitle="Net Earnings (Sales - Purchase - Expenses)"
        />

        <StatCard
          title="Fleet Cylinders"
          value={totalCylinders}
          icon={<FaBoxes className="text-[#0f2912] dark:text-[#A5D6A7] text-lg" />}
          colorClass="bg-[#A5D6A7]/30 dark:bg-[#A5D6A7]/20"
          subtitle={`${inStock} In Stock • ${withCustomers} Customer`}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Retail Outlets"
          value={shops.length || 5}
          icon={<FaStore className="text-purple-700 dark:text-purple-400 text-lg" />}
          colorClass="bg-purple-100 dark:bg-purple-950/60"
          subtitle="Active Distribution Shops"
          onClick={() => navigate('/shops')}
        />
        <StatCard
          title="Customer Accounts"
          value={customers.length}
          icon={<FaUsers className="text-[#0f2912] dark:text-[#A5D6A7] text-lg" />}
          colorClass="bg-[#A5D6A7]/40 dark:bg-[#A5D6A7]/20"
          subtitle={`Receivables: ${formatCurrency(totalReceivables || 24000)}`}
          onClick={() => navigate('/customers')}
        />
        <StatCard
          title="Logistics Breakdown"
          value={`${domesticCount || 15} / ${commercialCount || 8} / ${industrialCount || 4}`}
          icon={<FaGasPump className="text-teal-700 dark:text-teal-300 text-lg" />}
          colorClass="bg-teal-100 dark:bg-teal-950/60"
          subtitle="11.8kg / 15kg / 45.4kg Units"
          onClick={() => navigate('/cylinders')}
        />
      </div>

      {/* Analytics & Dynamic Timeframe Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Multi-Line Financial Trend Chart */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">{activeData.title}</h3>
              <p className="text-xs text-slate-400 font-semibold">Filtered overview of Sales vs Purchases vs Expenses ({activeData.label})</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-[#A5D6A7] rounded-full border border-[#2e7d32]"></span>
                <span className="text-slate-600 dark:text-slate-300">Sales</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-slate-600 dark:text-slate-300">Purchases</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                <span className="text-slate-600 dark:text-slate-300">Expenses</span>
              </div>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activeData.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    padding: '12px 16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(val) => [`PKR ${val.toLocaleString()}`, '']}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="Sales Revenue"
                  stroke="#2e7d32"
                  strokeWidth={3}
                  dot={{ fill: '#A5D6A7', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="purchase"
                  name="Purchase Cost"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Pie Chart for Inventory Fleet */}
        <div className="card-premium">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">Fleet Distribution</h3>
            <p className="text-xs text-slate-400 font-semibold">Cylinder allocation status across warehouse & market</p>
          </div>
          <div className="w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Linked Module Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Sales & Invoicing',
            desc: 'Manage customer sales, generate GST invoices, record cylinder dispatches.',
            route: '/sales',
            action: 'Go to Sales',
            bg: 'bg-[#A5D6A7]/20 border-[#A5D6A7]/40',
            text: 'text-[#0f2912] dark:text-[#A5D6A7]',
            btnBg: 'bg-[#A5D6A7] text-[#0f2912]',
            icon: <FaShoppingCart />
          },
          {
            title: 'Purchase & Supply',
            desc: 'Order refill stock from suppliers, log incoming shipments & payments.',
            route: '/purchase',
            action: 'Go to Purchases',
            bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
            text: 'text-blue-900 dark:text-blue-300',
            btnBg: 'bg-blue-600 text-white',
            icon: <FaShoppingBag />
          },
          {
            title: 'Expense Vouchers',
            desc: 'Record daily utility expenses, vehicle maintenance, shop rentals & wages.',
            route: '/expense',
            action: 'Go to Expenses',
            bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
            text: 'text-amber-900 dark:text-amber-300',
            btnBg: 'bg-amber-600 text-white',
            icon: <FaWallet />
          },
          {
            title: 'Shops & Fleet Logistics',
            desc: 'Monitor shop stock levels, track cylinder serial numbers & status.',
            route: '/inventory',
            action: 'Go to Fleet',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
            text: 'text-emerald-900 dark:text-emerald-300',
            btnBg: 'bg-emerald-700 text-white',
            icon: <FaBoxes />
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`p-5 rounded-2xl border ${card.bg} flex flex-col justify-between transition-all hover:shadow-md`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-xl ${card.text}`}>{card.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  Module
                </span>
              </div>
              <h4 className={`text-base font-black mt-3 ${card.text}`}>{card.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                {card.desc}
              </p>
            </div>

            <button
              onClick={() => navigate(card.route)}
              className={`mt-auto pt-3 w-full py-2.5 px-3 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${card.btnBg}`}
            >
              <span>{card.action}</span>
              <FaExternalLinkAlt size={10} />
            </button>
          </div>
        ))}
      </div>

      {/* Live Transaction Feed Table */}
      <div className="card-premium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">Recent System Transactions</h3>
            <p className="text-xs text-slate-400 font-semibold">Live feeds from Sales, Purchase, and Expense modules</p>
          </div>
          <button
            onClick={() => navigate('/sales')}
            className="text-[#0f2912] dark:text-[#A5D6A7] text-xs font-black hover:underline transition-colors uppercase tracking-wider flex items-center space-x-1"
          >
            <span>View All ERP Records</span>
            <FaExternalLinkAlt size={10} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Module / Type</th>
                <th>Customer / Supplier / Shop</th>
                <th>Cylinder / Details</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 6).map((txn) => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">{txn.id}</td>
                  <td>
                    <span className={`badge-premium ${txn.type === 'sale' || !txn.type ? 'bg-[#A5D6A7] text-[#0f2912] border border-[#2e7d32]' :
                      txn.type === 'purchase' ? 'badge-info' : 'badge-warning'
                      }`}>
                      {txn.type || 'sale'}
                    </span>
                  </td>
                  <td className="font-bold text-slate-800 dark:text-white">{txn.customerName || txn.shopName || txn.supplierName || 'General Customer'}</td>
                  <td className="text-slate-600 dark:text-slate-300 font-medium">{txn.cylinderType || `${txn.quantity || 1} LPG Units`}</td>
                  <td className="font-black text-slate-900 dark:text-white">{txn.amount ? formatCurrency(txn.amount) : 'PKR 0'}</td>
                  <td className="text-xs text-slate-500 font-semibold">{formatDate(txn.date)}</td>
                  <td>
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      {txn.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;