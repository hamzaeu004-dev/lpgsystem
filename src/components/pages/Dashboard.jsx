import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBoxes,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
  FaGasPump,
  FaPlus,
  FaReceipt,
  FaShoppingBag,
  FaShoppingCart,
  FaStore,
  FaUsers,
  FaWallet,
  FaArrowRight
} from 'react-icons/fa';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { Badge, EmptyState, Panel, StatCard, fmt, tdCls, thCls } from '../common/ui';

// ---------- Date helpers ----------
// Dates come in as ISO strings (sales, expenses) or plain 'YYYY-MM-DD' (purchases).
const toDate = (value) => {
  if (!value) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PERIODS = {
  today: {
    label: 'Today',
    inRange: (d, now) => d.toDateString() === now.toDateString(),
    buckets: () => ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    bucketOf: (d) => Math.floor(d.getHours() / 3),
    chartHint: 'Every 3 hours today'
  },
  month: {
    label: 'This Month',
    inRange: (d, now) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(),
    buckets: (now) => {
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: Math.ceil(days / 7) }, (_, i) => `${i * 7 + 1}–${Math.min(days, i * 7 + 7)}`);
    },
    bucketOf: (d) => Math.floor((d.getDate() - 1) / 7),
    chartHint: 'By week of the month (days)'
  },
  year: {
    label: 'This Year',
    inRange: (d, now) => d.getFullYear() === now.getFullYear(),
    buckets: () => MONTHS,
    bucketOf: (d) => d.getMonth(),
    chartHint: 'By month'
  }
};

const SERIES = [
  { key: 'sales', label: 'Sales', color: '#C62828' },
  { key: 'purchases', label: 'Purchases', color: '#3b82f6' },
  { key: 'expenses', label: 'Expenses', color: '#f59e0b' }
];

const FLEET_SEGMENTS = [
  { key: 'stock', label: 'In stock', color: '#10b981', match: (s) => s === 'stock' || s === 'In Stock' },
  { key: 'customer', label: 'With customers', color: '#6366f1', match: (s) => s === 'customer' || s === 'With Customer' },
  { key: 'refill', label: 'Refill / market', color: '#f59e0b', match: (s) => s === 'refill' || s === 'market' || s === 'Refill Process' }
];

const loadPurchases = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_purchases_data');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const compact = (n) => {
  const abs = Math.abs(n);
  if (abs >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${+(n / 1000).toFixed(1)}k`;
  return String(n);
};

const TYPE_BADGE = { Sale: 'emerald', Purchase: 'blue', Expense: 'amber' };

const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme() || {};

  const { cylinders = [] } = useSelector((state) => state.inventory || {});
  const { customers = [] } = useSelector((state) => state.customers || {});
  const { shops = [] } = useSelector((state) => state.shops || {});
  const { transactions = [] } = useSelector((state) => state.sales || {});
  const { expenses = [] } = useSelector((state) => state.expenses || {});
  const purchases = useMemo(loadPurchases, []);

  const [period, setPeriod] = useState('today');
  const now = useMemo(() => new Date(), []);

  // Normalise every money movement into one list: { kind, id, party, amount, date }
  const entries = useMemo(() => {
    const list = [];
    transactions
      .filter((t) => t.type === 'sale' || !t.type)
      .forEach((t) =>
        list.push({
          kind: 'Sale',
          id: t.id,
          party: t.customerName || 'Walk-in customer',
          detail: t.issuedCylinderType || t.cylinderType || 'Gas refill',
          amount: Number(t.totalBill ?? t.amount ?? 0),
          date: toDate(t.date),
          route: '/sales'
        })
      );
    purchases.forEach((p) =>
      list.push({
        kind: 'Purchase',
        id: p.id,
        party: p.supplierName || 'Supplier',
        detail: `${p.totalQty || 0} cylinders`,
        amount: Number(p.totalAmount || 0),
        date: toDate(p.date),
        route: '/purchase'
      })
    );
    expenses.forEach((e) =>
      list.push({
        kind: 'Expense',
        id: e.id,
        party: e.paidTo || e.title || 'Expense',
        detail: e.category || e.title || '',
        amount: Number(e.amount || 0),
        date: toDate(e.date),
        route: '/expense'
      })
    );
    return list.filter((x) => x.date);
  }, [transactions, purchases, expenses]);

  const cfg = PERIODS[period];

  const { totals, counts, chart } = useMemo(() => {
    const labels = cfg.buckets(now);
    const rows = labels.map((name) => ({ name, sales: 0, purchases: 0, expenses: 0 }));
    const t = { sales: 0, purchases: 0, expenses: 0 };
    const c = { sales: 0, purchases: 0, expenses: 0 };
    const keyOf = { Sale: 'sales', Purchase: 'purchases', Expense: 'expenses' };

    entries.forEach((x) => {
      if (!cfg.inRange(x.date, now)) return;
      const k = keyOf[x.kind];
      t[k] += x.amount;
      c[k] += 1;
      const row = rows[cfg.bucketOf(x.date)];
      if (row) row[k] += x.amount;
    });
    return { totals: t, counts: c, chart: rows };
  }, [entries, cfg, now]);

  const netProfit = totals.sales - totals.purchases - totals.expenses;
  const hasChartData = totals.sales + totals.purchases + totals.expenses > 0;

  // Operations
  const fleet = FLEET_SEGMENTS.map((s) => ({ ...s, value: cylinders.filter((c) => s.match(c.status)).length }));
  const fleetTotal = cylinders.length;
  const sizeCount = (w) => cylinders.filter((c) => Number(c.weightKg) === w || c.type?.includes(String(w))).length;
  const sizes = [
    { label: '11.8 kg', value: sizeCount(11.8) },
    { label: '15 kg', value: sizeCount(15) },
    { label: '45.4 kg', value: sizeCount(45.4) }
  ];
  const pendingBaqaya = transactions.reduce((sum, t) => sum + Number(t.remainingBalance || 0), 0);
  const pendingEmpties = transactions.filter((t) => (t.type === 'sale' || !t.type) && !t.emptyReturned).length;

  const recent = useMemo(() => [...entries].sort((a, b) => b.date - a.date).slice(0, 8), [entries]);

  const gridStroke = isDark ? '#1f2937' : '#e2e8f0';
  const axisColor = isDark ? '#64748b' : '#94a3b8';
  const tooltipStyle = {
    background: isDark ? '#0b0f19' : '#ffffff',
    border: `1px solid ${isDark ? '#1f2937' : '#e2e8f0'}`,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
  };

  const todayLabel = now.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{todayLabel}</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Sales, purchases, expenses and cylinder fleet at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/expense')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer"
          >
            <FaWallet /> Add Expense
          </button>
          <button
            onClick={() => navigate('/purchase')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer"
          >
            <FaShoppingBag /> Purchase Stock
          </button>
          <button onClick={() => navigate('/sales')} className="btn-primary flex-1 sm:flex-initial gap-2 !px-5 !py-2.5 !text-xs !font-black whitespace-nowrap">
            <FaPlus className="text-[10px]" /> New Sale
          </button>
        </div>
      </div>

      {/* Period switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
          {Object.entries(PERIODS).map(([id, p]) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap cursor-pointer ${period === id ? 'bg-[#9B1C1C] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          Figures below are for <span className="font-bold text-slate-700 dark:text-slate-200">{cfg.label.toLowerCase()}</span>.
        </p>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard to="/sales" icon={FaShoppingCart} tone="emerald" label="Sales revenue" value={fmt(totals.sales)} hint={`${counts.sales} ${counts.sales === 1 ? 'sale' : 'sales'}`} />
        <StatCard to="/purchase" icon={FaShoppingBag} tone="blue" label="Purchase cost" value={fmt(totals.purchases)} hint={`${counts.purchases} ${counts.purchases === 1 ? 'invoice' : 'invoices'}`} />
        <StatCard to="/expense" icon={FaWallet} tone="amber" label="Expenses" value={fmt(totals.expenses)} hint={`${counts.expenses} ${counts.expenses === 1 ? 'voucher' : 'vouchers'}`} />
        <StatCard
          icon={netProfit >= 0 ? FaCheckCircle : FaExclamationCircle}
          tone={netProfit >= 0 ? 'emerald' : 'rose'}
          label="Net profit"
          value={`${netProfit < 0 ? '−' : ''}${fmt(Math.abs(netProfit))}`}
          valueClass={netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : undefined}
          hint="Sales − purchases − expenses"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel
          className="xl:col-span-2"
          title="Money in & out"
          subtitle={cfg.chartHint}
          action={
            <div className="flex flex-wrap items-center gap-3">
              {SERIES.map((s) => (
                <span key={s.key} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>
          }
        >
          {hasChartData ? (
            <div className="h-[280px] -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart} barGap={2} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} width={48} />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(148,163,184,0.15)' }}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: isDark ? '#e2e8f0' : '#0f172a', fontWeight: 800, marginBottom: 4 }}
                    formatter={(val, name) => [fmt(val), SERIES.find((s) => s.key === name)?.label || name]}
                  />
                  {SERIES.map((s) => (
                    <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={FaChartLine}
              title={`No activity ${period === 'today' ? 'today' : `this ${period}`}`}
              text="Sales, purchases and expenses you record will be charted here."
            />
          )}
        </Panel>

        <Panel title="Cylinder fleet" subtitle="Where every cylinder is right now" action={<Link to="/cylinders" className="text-[11px] font-bold text-[#9B1C1C] dark:text-red-300 hover:underline whitespace-nowrap">View fleet</Link>}>
          {fleetTotal === 0 ? (
            <EmptyState icon={FaBoxes} title="No cylinders yet" text="Add cylinders to see how your fleet is distributed." />
          ) : (
            <>
              <div className="relative h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={fleet} dataKey="value" nameKey="label" innerRadius={58} outerRadius={80} paddingAngle={3} stroke="none">
                      {fleet.map((s) => (
                        <Cell key={s.key} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{fleetTotal}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">cylinders</span>
                </div>
              </div>
              <ul className="mt-3 space-y-2">
                {fleet.map((s) => (
                  <li key={s.key} className="flex items-center gap-2.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                    <span className="flex-1 font-semibold text-slate-600 dark:text-slate-300">{s.label}</span>
                    <span className="font-black text-slate-900 dark:text-white tabular-nums">{s.value}</span>
                    <span className="w-10 text-right text-[11px] font-semibold text-slate-400 tabular-nums">
                      {Math.round((s.value / fleetTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      {/* Operations snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard to="/sales" icon={FaReceipt} tone="rose" label="Pending baqaya" value={fmt(pendingBaqaya)} hint={`${pendingEmpties} empty ${pendingEmpties === 1 ? 'cylinder' : 'cylinders'} not returned`} />
        <StatCard to="/customers" icon={FaUsers} tone="indigo" label="Customers" value={customers.length} hint="Registered accounts" />
        <StatCard to="/shops" icon={FaStore} tone="slate" label="Outlets" value={shops.length} hint="Shops & depots" />
        <StatCard to="/cylinders" icon={FaGasPump} tone="emerald" label="Cylinder sizes" value={sizes.map((s) => s.value).join(' / ')} hint={sizes.map((s) => s.label).join(' / ')} />
      </div>

      {/* Recent activity */}
      <Panel title="Recent activity" subtitle="Latest sales, purchases and expenses" bodyClass="">
        {recent.length === 0 ? (
          <EmptyState icon={FaReceipt} title="Nothing recorded yet" text="New sales, purchase invoices and expense vouchers will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className={thCls}>Reference</th>
                  <th className={thCls}>Type</th>
                  <th className={thCls}>Party</th>
                  <th className={`${thCls} hidden md:table-cell`}>Details</th>
                  <th className={`${thCls} hidden sm:table-cell`}>Date</th>
                  <th className={`${thCls} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {recent.map((x) => (
                  <tr key={`${x.kind}-${x.id}`} onClick={() => navigate(x.route)} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className={`${tdCls} font-mono font-bold text-slate-900 dark:text-white`}>{x.id}</td>
                    <td className={tdCls}>
                      <Badge tone={TYPE_BADGE[x.kind]}>{x.kind}</Badge>
                    </td>
                    <td className={`${tdCls} font-semibold text-slate-900 dark:text-white max-w-[200px] truncate`}>{x.party}</td>
                    <td className={`${tdCls} hidden md:table-cell text-slate-500 max-w-[220px] truncate`}>{x.detail}</td>
                    <td className={`${tdCls} hidden sm:table-cell text-slate-500 tabular-nums`}>
                      {x.date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className={`${tdCls} text-right font-black tabular-nums ${x.kind === 'Sale' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      {x.kind === 'Sale' ? '+' : '−'}
                      {fmt(x.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link to="/sales" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#9B1C1C] dark:text-red-300 hover:underline">
                Open sales <FaArrowRight className="text-[9px]" />
              </Link>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default Dashboard;
