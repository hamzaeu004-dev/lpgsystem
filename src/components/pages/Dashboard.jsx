import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaBoxes, 
  FaCheckCircle, 
  FaUsers, 
  FaShoppingCart,
  FaArrowUp,
  FaArrowDown,
  FaPlus,
  FaGasPump
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

  const { cylinders } = useSelector((state) => state.inventory);
  const { customers } = useSelector((state) => state.customers);
  const { shops } = useSelector((state) => state.shops);
  const { transactions } = useSelector((state) => state.sales);

  // Dynamic Metrics
  const totalCylinders = cylinders.length;
  const inStock = cylinders.filter((c) => c.status === 'stock').length;
  const withCustomers = cylinders.filter((c) => c.status === 'customer').length;
  const inMarket = cylinders.filter((c) => c.status === 'market' || c.status === 'refill').length;

  const totalRevenue = transactions
    .filter((t) => t.type === 'sale')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const chartData = [
    { name: 'Mon', sales: 14, returns: 3 },
    { name: 'Tue', sales: 22, returns: 4 },
    { name: 'Wed', sales: 18, returns: 2 },
    { name: 'Thu', sales: 28, returns: 5 },
    { name: 'Fri', sales: 35, returns: 7 },
    { name: 'Sat', sales: 25, returns: 4 },
    { name: 'Sun', sales: 12, returns: 2 },
  ];

  const pieData = [
    { name: 'In Stock', value: inStock || 1, color: '#10b981' },
    { name: 'With Customer', value: withCustomers || 1, color: '#0f172a' },
    { name: 'In Market / Refill', value: inMarket || 1, color: '#f59e0b' },
  ];

  const StatCard = ({ title, value, icon, colorClass, growth, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-1.5">
              {growth >= 0 ? (
                <FaArrowUp className="text-emerald-500 text-xs" />
              ) : (
                <FaArrowDown className="text-rose-500 text-xs" />
              )}
              <span className={`text-xs font-semibold ml-1 ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-xs text-slate-400 ml-1">vs last month</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} shadow-md`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">Real-time LPG fleet, inventory, sales, and retail performance</p>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => navigate('/sales')}
            className="btn-primary flex items-center space-x-2 text-xs font-bold"
          >
            <span>+ New Sale</span>
          </button>
          
          <button 
            onClick={() => navigate('/inventory')}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <span>Manage Fleet</span>
          </button>

          <button 
            onClick={() => navigate('/customers')}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <span>Customers</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cylinders"
          value={totalCylinders}
          icon={<FaBoxes className="text-[#12544F] dark:text-emerald-400 text-lg" />}
          colorClass="bg-[#12544F]/10 dark:bg-[#12544F]/20"
          subtitle={`${shops.length} Retail Outlets`}
        />
        <StatCard
          title="In Stock"
          value={inStock}
          icon={<FaCheckCircle className="text-[#12544F] dark:text-emerald-400 text-lg" />}
          colorClass="bg-[#12544F]/10 dark:bg-[#12544F]/20"
          growth={8.5}
        />
        <StatCard
          title="With Customers"
          value={withCustomers}
          icon={<FaUsers className="text-[#12544F] dark:text-emerald-400 text-lg" />}
          colorClass="bg-[#12544F]/10 dark:bg-[#12544F]/20"
          subtitle={`${customers.length} Registered Accounts`}
        />
        <StatCard
          title="Refill Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<FaShoppingCart className="text-[#12544F] dark:text-emerald-400 text-lg" />}
          colorClass="bg-[#12544F]/10 dark:bg-[#12544F]/20"
          growth={14.2}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Weekly Cylinder Activity</h3>
              <p className="text-xs text-slate-400">Sales vs Customer Returns</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-slate-900 rounded-full"></span>
                <span className="text-slate-600">Sales</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-rose-400 rounded-full"></span>
                <span className="text-slate-600">Returns</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                  padding: '12px 16px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#0f172a" 
                strokeWidth={3}
                dot={{ fill: '#0f172a', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="returns" 
                stroke="#f43f5e" 
                strokeWidth={3}
                dot={{ fill: '#f43f5e', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card-premium">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800">Fleet Status Breakdown</h3>
            <p className="text-xs text-slate-400">Distribution across network</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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
                  background: 'white', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-xs font-medium text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Live Transaction Feed</h3>
            <p className="text-xs text-slate-400">Latest sales, refills, and cylinder returns</p>
          </div>
          <button 
            onClick={() => navigate('/sales')}
            className="text-slate-900 text-xs font-bold hover:underline transition-colors uppercase tracking-wider"
          >
            View All Transactions →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Customer / Shop</th>
                <th>Cylinder</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((txn) => (
                <tr key={txn.id}>
                  <td className="font-mono text-xs text-slate-600">{txn.id}</td>
                  <td>
                    <span className={`badge-premium ${
                      txn.type === 'sale' ? 'badge-success' :
                      txn.type === 'return' ? 'badge-warning' :
                      txn.type === 'purchase' ? 'badge-info' : 'badge-brand'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-800">{txn.customerName || txn.shopName || '-'}</td>
                  <td className="text-slate-600">{txn.cylinderType || `${txn.quantity || 1} units`}</td>
                  <td className="font-semibold text-slate-800">{txn.amount ? formatCurrency(txn.amount) : 'PKR 0'}</td>
                  <td className="text-xs text-slate-500">{formatDate(txn.date)}</td>
                  <td>
                    <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
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