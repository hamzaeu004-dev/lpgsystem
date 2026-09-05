import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaSearch, 
  FaGasPump, 
  FaTimes 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { addCylinder, updateCylinderStatus } from '../../features/inventory/inventorySlice';
import { formatCurrency } from '../../utils/helpers';

const Inventory = () => {
  const dispatch = useDispatch();
  const { cylinders } = useSelector((state) => state.inventory);
  const { shops } = useSelector((state) => state.shops);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedShop, setSelectedShop] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newCylinder, setNewCylinder] = useState({
    serialNo: '',
    type: 'Domestic 11.8 kg',
    weightKg: 11.8,
    tareWeightKg: 13.5,
    shopId: shops[0]?.id || 'SHOP-001',
    depositPkr: 4500,
  });

  const filteredCylinders = cylinders.filter((cyl) => {
    const matchesSearch =
      cyl.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cyl.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cyl.customerName && cyl.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || cyl.status === selectedStatus;
    const matchesShop = selectedShop === 'all' || cyl.shopId === selectedShop;

    return matchesSearch && matchesStatus && matchesShop;
  });

  const handleAddCylinderSubmit = (e) => {
    e.preventDefault();
    if (!newCylinder.serialNo) {
      toast.error('Cylinder Serial Number is required!');
      return;
    }

    const shopObj = shops.find((s) => s.id === newCylinder.shopId);

    const created = {
      id: `CYL-2026-0${cylinders.length + 1}`,
      serialNo: newCylinder.serialNo,
      type: newCylinder.type,
      weightKg: Number(newCylinder.weightKg),
      tareWeightKg: Number(newCylinder.tareWeightKg),
      shopId: newCylinder.shopId,
      shopName: shopObj?.name || 'Main Central Depot',
      status: 'stock',
      customerId: null,
      customerName: null,
      depositPkr: Number(newCylinder.depositPkr) || 4500,
      lastRefillDate: new Date().toISOString().split('T')[0],
    };

    dispatch(addCylinder(created));
    toast.success(`Cylinder ${newCylinder.serialNo} added to stock!`);
    setIsModalOpen(false);
    setNewCylinder({
      serialNo: '',
      type: 'Domestic 11.8 kg',
      weightKg: 11.8,
      tareWeightKg: 13.5,
      shopId: shops[0]?.id || 'SHOP-001',
      depositPkr: 4500,
    });
  };

  const handleStatusChange = (cylId, newStatus) => {
    dispatch(updateCylinderStatus({ id: cylId, status: newStatus }));
    toast.success(`Cylinder status updated to "${newStatus}"`);
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventory & Fleet Control</h1>
          <p className="text-slate-500 mt-1 text-sm">Real-time LPG Cylinder tracking by serial number, weight, status, and shop location</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 text-sm shadow-[#12544F]/25 cursor-pointer"
        >
          <FaPlus size={12} />
          <span>Add New Cylinder / Stock</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by Serial #, Type, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F] w-full"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="stock">In Stock</option>
            <option value="customer">With Customer</option>
            <option value="market">In Market</option>
            <option value="refill">Refill Pending</option>
          </select>

          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="all">All Outlets</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card-premium p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Cylinder Capacity</th>
                <th>Shop Outlet</th>
                <th>Status</th>
                <th>Assigned Customer</th>
                <th>Security Deposit</th>
                <th>Last Refill</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCylinders.map((cyl) => (
                <tr key={cyl.id}>
                  <td className="font-mono text-sm font-bold text-slate-800 flex items-center space-x-2">
                    <FaGasPump className="text-[#12544F]" />
                    <span>{cyl.serialNo}</span>
                  </td>
                  <td className="text-slate-700 font-medium">{cyl.type}</td>
                  <td className="text-slate-600">{cyl.shopName}</td>
                  <td>
                    <span
                      className={`badge-premium ${
                        cyl.status === 'stock'
                          ? 'badge-success'
                          : cyl.status === 'customer'
                          ? 'badge-info'
                          : cyl.status === 'refill'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {cyl.status === 'stock' && 'In Stock'}
                      {cyl.status === 'customer' && 'With Customer'}
                      {cyl.status === 'refill' && 'Refill Pending'}
                      {cyl.status === 'market' && 'In Market'}
                    </span>
                  </td>
                  <td className="font-semibold text-slate-800">
                    {cyl.customerName ? cyl.customerName : <span className="text-slate-300 font-normal">Unassigned</span>}
                  </td>
                  <td className="font-bold text-slate-800">{formatCurrency(cyl.depositPkr)}</td>
                  <td className="text-xs text-slate-500">{cyl.lastRefillDate || '-'}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      {cyl.status !== 'stock' && (
                        <button
                          onClick={() => handleStatusChange(cyl.id, 'stock')}
                          title="Mark as In Stock"
                          className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200 dark:border-emerald-800/80 rounded-lg text-xs font-bold transition-colors"
                        >
                          To Stock
                        </button>
                      )}
                      {cyl.status !== 'refill' && (
                        <button
                          onClick={() => handleStatusChange(cyl.id, 'refill')}
                          title="Send for Refill"
                          className="p-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs font-bold transition-colors"
                        >
                          To Refill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal - RENDERED IN DOCUMENT BODY PORTAL */}
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
                  <FaGasPump className="text-[#12544F] dark:text-emerald-400" />
                  <span>Register New Cylinder Stock</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleAddCylinderSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Cylinder Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LPG-PK-11899"
                    value={newCylinder.serialNo}
                    onChange={(e) => setNewCylinder({ ...newCylinder, serialNo: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Cylinder Category</label>
                    <select
                      value={newCylinder.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        let weight = 11.8;
                        let dep = 4500;
                        if (val.includes('15')) { weight = 15.0; dep = 6000; }
                        if (val.includes('45.4')) { weight = 45.4; dep = 15000; }
                        setNewCylinder({ ...newCylinder, type: val, weightKg: weight, depositPkr: dep });
                      }}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    >
                      <option value="Domestic 11.8 kg">Domestic 11.8 kg</option>
                      <option value="Commercial 15.0 kg">Commercial 15.0 kg</option>
                      <option value="Commercial 45.4 kg">Commercial 45.4 kg</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Assigned Outlet</label>
                    <select
                      value={newCylinder.shopId}
                      onChange={(e) => setNewCylinder({ ...newCylinder, shopId: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    >
                      {shops.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Gas Net Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newCylinder.weightKg}
                      onChange={(e) => setNewCylinder({ ...newCylinder, weightKg: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#12544F]/20 focus:border-[#12544F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Security Deposit (PKR)</label>
                    <input
                      type="number"
                      value={newCylinder.depositPkr}
                      onChange={(e) => setNewCylinder({ ...newCylinder, depositPkr: e.target.value })}
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
                    Save to Stock
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

export default Inventory;