import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGasPump,
  FaStore,
  FaExchangeAlt,
  FaCheckCircle,
  FaSearch,
  FaTimes,
  FaPlus,
  FaRedo,
  FaWeightHanging,
  FaWarehouse
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  updateCylinderStatus,
  transferCylinderBranch,
  addCylinder
} from '../../features/inventory/inventorySlice';

const Cylinders = () => {
  const dispatch = useDispatch();
  const { cylinders = [] } = useSelector((state) => state.inventory || {});
  const { shops = [] } = useSelector((state) => state.shops || {});

  // Identify Main Branch (Default SHOP-001 or shop named "Main Central Depot")
  const mainBranchObj = shops.find(
    (s) => s.id === 'SHOP-001' || s.name.toLowerCase().includes('main')
  ) || shops[0] || { id: 'SHOP-001', name: 'Main Central Depot' };

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all'); // 'all' | 'main' | 'other' | shopId
  const [weightFilter, setWeightFilter] = useState('all'); // 'all' | '11.8' | '15.0' | '45.4'
  const [statusFilter, setStatusFilter] = useState('refill'); // Default showing Empty Cylinders ('refill')

  // Transfer Modal State
  const [transferCylinder, setTransferCylinder] = useState(null);
  const [targetShopId, setTargetShopId] = useState('');

  // Register Empty Modal State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [newEmptyCylinder, setNewEmptyCylinder] = useState({
    serialNo: '',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: mainBranchObj.id,
    returnDate: new Date().toISOString().split('T')[0],
  });

  // Calculate Metrics
  const emptyCylinders = cylinders.filter((c) => c.status === 'refill');
  const emptyMainBranchCount = emptyCylinders.filter(
    (c) => c.shopId === mainBranchObj.id
  ).length;
  const emptyOtherBranchesCount = emptyCylinders.filter(
    (c) => c.shopId !== mainBranchObj.id
  ).length;

  const filledStockCount = cylinders.filter((c) => c.status === 'stock').length;
  const withCustomerCount = cylinders.filter((c) => c.status === 'customer').length;

  // Weight-wise Empty Cylinder Breakdown Matrix
  const weightCategories = [
    { label: 'Domestic 11.8 kg', weight: 11.8, tare: 13.5 },
    { label: 'Commercial 15.0 kg', weight: 15.0, tare: 16.5 },
    { label: 'Commercial 45.4 kg', weight: 45.4, tare: 42.0 },
  ];

  const getWeightBreakdown = (weightVal) => {
    const totalEmptyForWeight = emptyCylinders.filter(
      (c) => Number(c.weightKg) === weightVal || c.type.includes(String(weightVal))
    );
    const mainCount = totalEmptyForWeight.filter(
      (c) => c.shopId === mainBranchObj.id
    ).length;
    const otherCount = totalEmptyForWeight.filter(
      (c) => c.shopId !== mainBranchObj.id
    ).length;

    return {
      total: totalEmptyForWeight.length,
      main: mainCount,
      other: otherCount,
    };
  };

  // Filtered Table Data
  const filteredCylinders = cylinders.filter((cyl) => {
    // Status Filter
    if (statusFilter !== 'all' && cyl.status !== statusFilter) return false;

    // Search term match (Serial No / Reg No, Type, Shop Name)
    const searchMatch =
      cyl.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cyl.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cyl.shopName && cyl.shopName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!searchMatch) return false;

    // Weight Filter match
    if (weightFilter !== 'all') {
      const weightNum = parseFloat(weightFilter);
      const isWeightMatch =
        Number(cyl.weightKg) === weightNum || cyl.type.includes(weightFilter);
      if (!isWeightMatch) return false;
    }

    // Branch Filter match
    if (branchFilter === 'main') {
      if (cyl.shopId !== mainBranchObj.id) return false;
    } else if (branchFilter === 'other') {
      if (cyl.shopId === mainBranchObj.id) return false;
    } else if (branchFilter !== 'all') {
      if (cyl.shopId !== branchFilter) return false;
    }

    return true;
  });

  // Handlers
  const handleOpenTransferModal = (cyl) => {
    setTransferCylinder(cyl);
    // default target to Main Branch if currently at another branch, or first available shop
    const defaultTarget =
      cyl.shopId === mainBranchObj.id
        ? shops.find((s) => s.id !== mainBranchObj.id)?.id || ''
        : mainBranchObj.id;
    setTargetShopId(defaultTarget);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferCylinder || !targetShopId) {
      toast.error('Please select a valid destination branch');
      return;
    }

    const targetShop = shops.find((s) => s.id === targetShopId);
    const targetShopName = targetShop?.name || 'Selected Branch';

    dispatch(
      transferCylinderBranch({
        id: transferCylinder.id,
        targetShopId,
        targetShopName,
      })
    );

    toast.success(
      `Cylinder ${transferCylinder.serialNo} transferred to ${targetShopName}!`
    );
    setTransferCylinder(null);
  };

  const handleMarkRefilled = (cyl) => {
    dispatch(
      updateCylinderStatus({
        id: cyl.id,
        status: 'stock',
      })
    );
    toast.success(`Cylinder ${cyl.serialNo} refilled & added to Stock!`);
  };

  const handleRegisterEmptySubmit = (e) => {
    e.preventDefault();
    if (!newEmptyCylinder.serialNo) {
      toast.error('Cylinder Serial / Registration Number is required');
      return;
    }

    const shopObj = shops.find((s) => s.id === newEmptyCylinder.shopId) || mainBranchObj;

    const created = {
      id: `CYL-2026-${Date.now().toString().slice(-4)}`,
      serialNo: newEmptyCylinder.serialNo,
      type: newEmptyCylinder.type,
      weightKg: Number(newEmptyCylinder.weightKg),
      tareWeightKg: Number(newEmptyCylinder.tareWeightKg),
      shopId: shopObj.id,
      shopName: shopObj.name,
      status: 'refill', // Empty Cylinder
      customerId: null,
      customerName: null,
      depositPkr: newEmptyCylinder.weightKg > 20 ? 15000 : 4500,
      lastRefillDate: new Date().toISOString().split('T')[0],
      returnDate: newEmptyCylinder.returnDate,
    };

    dispatch(addCylinder(created));
    toast.success(`Empty Cylinder ${newEmptyCylinder.serialNo} registered at ${shopObj.name}!`);
    setIsRegisterModalOpen(false);
    setNewEmptyCylinder({
      serialNo: '',
      type: 'Domestic 11.8 kg',
      weightKg: 11.8,
      tareWeightKg: 13.5,
      shopId: mainBranchObj.id,
      returnDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-3">
            <FaGasPump className="text-[#7A0C00] dark:text-rose-400" />
            <span>Cylinder Logistics & Empty Fleet Control</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs sm:text-sm font-medium">
            Branch-wise empty cylinder tracking, capacity/weight breakdown, registration numbers, and transfer logistics
          </p>
        </div>

        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="btn-primary flex items-center space-x-2 text-sm shadow-md shadow-[#7A0C00]/25 cursor-pointer shrink-0"
        >
          <FaPlus size={12} />
          <span>Log / Return Empty Cylinder</span>
        </button>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card-premium border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Empty Fleet</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{emptyCylinders.length}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Awaiting refill / plant dispatch</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold shrink-0">
              <FaRedo />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Main Branch Empty</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{emptyMainBranchCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{mainBranchObj.name}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0">
              <FaWarehouse />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium border-l-4 border-l-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Other Branches Empty</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{emptyOtherBranchesCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Outlets & Secondary Outlets</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
              <FaStore />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-premium border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Filled / In Stock</p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{filledStockCount}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">Ready for dispatch ({withCustomerCount} rented)</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
              <FaCheckCircle />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Branch vs Other Branches Weight-Wise Distribution Matrix */}
      <div className="card-premium space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
              <FaWeightHanging className="text-[#7A0C00] dark:text-rose-400" />
              <span>Empty Cylinders Breakdown (Main Branch vs Outlets)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparison of empty cylinder units categorized by net weight capacity across Main Central Depot & Outlets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weightCategories.map((cat) => {
            const data = getWeightBreakdown(cat.weight);
            const mainPct = data.total > 0 ? Math.round((data.main / data.total) * 100) : 0;

            return (
              <div
                key={cat.weight}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Category Capacity
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {cat.label}
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-black">
                    {data.total} Empty Units
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>Main Branch ({mainBranchObj.name}):</span>
                    </span>
                    <strong className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                      {data.main} units
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span className="flex items-center space-x-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Other Branches / Outlets:</span>
                    </span>
                    <strong className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                      {data.other} units
                    </strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${mainPct}%` }}
                    className="bg-indigo-600 h-full"
                    title={`Main Branch: ${mainPct}%`}
                  ></div>
                  <div
                    style={{ width: `${100 - mainPct}%` }}
                    className="bg-amber-500 h-full"
                    title={`Other Branches: ${100 - mainPct}%`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="card-premium flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by Registration No / Serial #, Capacity, or Branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00] w-full font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="refill">🔴 Empty Cylinders (Refill Pending)</option>
            <option value="stock">🟢 Filled / In Stock</option>
            <option value="customer">🔵 With Customer</option>
            <option value="all">⚪ All Statuses</option>
          </select>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">🏢 All Locations & Branches</option>
            <option value="main">🏰 Main Branch Only ({mainBranchObj.name})</option>
            <option value="other">🏪 Other Outlets / Branches Only</option>
            {shops
              .filter((s) => s.id !== mainBranchObj.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  📍 {s.name}
                </option>
              ))}
          </select>

          {/* Weight Filter */}
          <select
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">⚖️ All Weight Capacities</option>
            <option value="11.8">Domestic (11.8 KG)</option>
            <option value="15.0">Commercial (15.0 KG)</option>
            <option value="45.4">Commercial (45.4 KG)</option>
          </select>
        </div>
      </div>

      {/* Empty Cylinder Inventory Fleet Table */}
      <div className="card-premium p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center space-x-2">
            <FaGasPump className="text-[#7A0C00] dark:text-rose-400" />
            <span>Registration Detail & Empty Fleet Directory</span>
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Showing {filteredCylinders.length} cylinders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Registration / Serial #</th>
                <th>Capacity / Type</th>
                <th>Tare Weight (Khali)</th>
                <th>Branch Location</th>
                <th>Condition / Status</th>
                <th>Return Date</th>
                <th>Logistics Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCylinders.length > 0 ? (
                filteredCylinders.map((cyl) => {
                  const isMainBranch = cyl.shopId === mainBranchObj.id;
                  const isEmpty = cyl.status === 'refill';

                  return (
                    <tr key={cyl.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Registration / Serial No */}
                      <td className="font-mono text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                          isEmpty ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          <FaGasPump size={12} />
                        </div>
                        <span className="tracking-wider">{cyl.serialNo}</span>
                      </td>

                      {/* Capacity / Type */}
                      <td className="font-bold text-slate-800 dark:text-slate-200">
                        {cyl.type}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Net: {cyl.weightKg} KG
                        </span>
                      </td>

                      {/* Tare Weight */}
                      <td className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                        {cyl.tareWeightKg ? `${cyl.tareWeightKg} KG` : '13.5 KG'}
                      </td>

                      {/* Branch Location */}
                      <td>
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-extrabold ${
                            isMainBranch
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                              : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {isMainBranch ? <FaWarehouse size={10} /> : <FaStore size={10} />}
                          <span>{cyl.shopName || (isMainBranch ? mainBranchObj.name : 'Branch Outlet')}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`badge-premium ${
                            cyl.status === 'refill'
                              ? 'badge-danger'
                              : cyl.status === 'stock'
                              ? 'badge-success'
                              : 'badge-info'
                          }`}
                        >
                          {cyl.status === 'refill' && '🔴 Empty (Refill Pending)'}
                          {cyl.status === 'stock' && '🟢 Filled In Stock'}
                          {cyl.status === 'customer' && '🔵 Rent with Customer'}
                        </span>
                      </td>

                      {/* Return Date */}
                      <td className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {cyl.returnDate || cyl.lastRefillDate || '-'}
                      </td>

                      {/* Logistics Actions */}
                      <td>
                        <div className="flex items-center space-x-2">
                          {/* Transfer Branch Button */}
                          <button
                            onClick={() => handleOpenTransferModal(cyl)}
                            title="Transfer Cylinder to Another Branch / Main Central Depot"
                            className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                          >
                            <FaExchangeAlt size={10} />
                            <span>Transfer</span>
                          </button>

                          {/* Mark Refilled Button */}
                          {cyl.status === 'refill' && (
                            <button
                              onClick={() => handleMarkRefilled(cyl)}
                              title="Mark as Refilled and return to Stock"
                              className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <FaCheckCircle size={10} />
                              <span>Refill to Stock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <FaGasPump className="mx-auto text-3xl mb-2 opacity-50" />
                    <p className="font-bold text-slate-700 dark:text-slate-300">No Cylinders Found</p>
                    <p className="text-xs">Try adjusting your search query, branch filter, or weight capacity.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Cylinder Branch Modal */}
      {transferCylinder && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <FaExchangeAlt className="text-[#7A0C00] dark:text-rose-400" />
                  <span>Transfer Empty Cylinder Branch</span>
                </h3>
                <button
                  onClick={() => setTransferCylinder(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">Cylinder Information:</p>
                  <p className="text-slate-900 dark:text-white font-mono font-extrabold text-sm">
                    {transferCylinder.serialNo} ({transferCylinder.type})
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Current Location: <strong className="text-[#7A0C00] dark:text-rose-400">{transferCylinder.shopName}</strong>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Select Destination Branch / Depot
                  </label>
                  <select
                    value={targetShopId}
                    onChange={(e) => setTargetShopId(e.target.value)}
                    className="mt-1.5 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00]"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id} disabled={s.id === transferCylinder.shopId}>
                        {s.name} {s.id === mainBranchObj.id ? '(Main Central Depot)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTransferCylinder(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Confirm Branch Transfer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* Register / Return Empty Cylinder Modal */}
      {isRegisterModalOpen && createPortal(
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
                  <FaGasPump className="text-[#7A0C00] dark:text-rose-400" />
                  <span>Log Empty Return / Register Empty Unit</span>
                </h3>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleRegisterEmptySubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Cylinder Registration / Serial Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REG-LPG-11899"
                    value={newEmptyCylinder.serialNo}
                    onChange={(e) => setNewEmptyCylinder({ ...newEmptyCylinder, serialNo: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00] font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Capacity & Weight</label>
                    <select
                      value={newEmptyCylinder.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        let weight = 11.8;
                        let tare = 13.5;
                        if (val.includes('15')) { weight = 15.0; tare = 16.5; }
                        if (val.includes('45.4')) { weight = 45.4; tare = 42.0; }
                        setNewEmptyCylinder({ ...newEmptyCylinder, type: val, weightKg: weight, tareWeightKg: tare });
                      }}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00]"
                    >
                      <option value="Domestic 11.8 kg">Domestic 11.8 kg</option>
                      <option value="Commercial 15.0 kg">Commercial 15.0 kg</option>
                      <option value="Commercial 45.4 kg">Commercial 45.4 kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Receiving Branch</label>
                    <select
                      value={newEmptyCylinder.shopId}
                      onChange={(e) => setNewEmptyCylinder({ ...newEmptyCylinder, shopId: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00]"
                    >
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.id === mainBranchObj.id ? '(Main Branch)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Empty Tare Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newEmptyCylinder.tareWeightKg}
                      onChange={(e) => setNewEmptyCylinder({ ...newEmptyCylinder, tareWeightKg: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Return Date</label>
                    <input
                      type="date"
                      value={newEmptyCylinder.returnDate}
                      onChange={(e) => setNewEmptyCylinder({ ...newEmptyCylinder, returnDate: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7A0C00]/30 focus:border-[#7A0C00]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Empty Cylinder
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

export default Cylinders;