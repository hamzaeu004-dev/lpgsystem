import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaShoppingBag,

  FaSearch,

  FaCheckCircle,
  FaClock,
  FaTimes,
  FaPrint,
  FaStore,

  FaBuilding,
  FaPhoneAlt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Purchase = () => {
  // Main view tab: 'purchases' | 'stock' | 'suppliers'
  const [activeTab, setActiveTab] = useState('purchases');

  // Branch filter: 'All' | 'Main Branch' | 'Branch 1'
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Search Query
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const todayStr = '2026-09-04';

  // Registered Suppliers List
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'Shell LPG Bottling Plant', phone: '051-4433221', location: 'Rawalpindi Plant', totalPurchased: 450, status: 'Active' },
    { id: 2, name: 'Parco Gas Terminal', phone: '042-9988776', location: 'Multan Road', totalPurchased: 600, status: 'Active' },
    { id: 3, name: 'Burshane LPG Pakistan', phone: '021-3554433', location: 'Port Qasim Terminal', totalPurchased: 240, status: 'Active' },
    { id: 4, name: 'PSO Gas Distributor', phone: '051-8877665', location: 'Islamabad Depot', totalPurchased: 180, status: 'Active' }
  ]);

  // Purchase Invoices Records
  const [purchases, setPurchases] = useState([
    {
      id: 'INV-PUR-501',
      date: todayStr,
      branch: 'Branch 1',
      supplierName: 'Shell LPG Bottling Plant',
      no20Qty: 80,
      no22Qty: 40,
      unitPrice: 2900,
      totalAmount: 348000,
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer',
      notes: 'Branch 1 direct delivery intake'
    },
    {
      id: 'INV-PUR-502',
      date: '2026-09-03',
      branch: 'Main Branch',
      supplierName: 'Parco Gas Terminal',
      no20Qty: 120,
      no22Qty: 60,
      unitPrice: 2900,
      totalAmount: 522000,
      paymentStatus: 'Paid',
      paymentMode: 'Cash',
      notes: 'Bulk stock for main yard'
    },
    {
      id: 'INV-PUR-503',
      date: '2026-09-01',
      branch: 'Branch 1',
      supplierName: 'Burshane LPG Pakistan',
      no20Qty: 50,
      no22Qty: 30,
      unitPrice: 2900,
      totalAmount: 232000,
      paymentStatus: 'Pending Credit',
      paymentMode: 'Credit (Pay Later)',
      notes: '7 Days credit invoice'
    }
  ]);

  // New Purchase Form State
  const [purchaseForm, setPurchaseForm] = useState({
    branch: 'Branch 1',
    supplierId: '',
    no20Qty: '',
    no22Qty: '',
    unitPrice: 2900,
    paymentStatus: 'Paid',
    paymentMode: 'Bank Transfer',
    date: todayStr,
    notes: ''
  });

  // New Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    location: ''
  });

  // Submit New Purchase
  const handleRecordPurchase = (e) => {
    e.preventDefault();
    const qty20 = parseInt(purchaseForm.no20Qty) || 0;
    const qty22 = parseInt(purchaseForm.no22Qty) || 0;
    const rate = parseFloat(purchaseForm.unitPrice) || 2900;

    if (qty20 === 0 && qty22 === 0) {
      toast.error('Please enter quantity for either No. 20 or No. 22 Regulator cylinders!');
      return;
    }

    if (!purchaseForm.supplierId) {
      toast.error('Please select a Supplier!');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === parseInt(purchaseForm.supplierId));
    if (!selectedSupplier) return;

    const totalQty = qty20 + qty22;
    const totalCost = totalQty * rate;
    const newId = `INV-PUR-${500 + purchases.length + 1}`;

    const newPurchase = {
      id: newId,
      date: purchaseForm.date,
      branch: purchaseForm.branch,
      supplierName: selectedSupplier.name,
      no20Qty: qty20,
      no22Qty: qty22,
      unitPrice: rate,
      totalAmount: totalCost,
      paymentStatus: purchaseForm.paymentStatus,
      paymentMode: purchaseForm.paymentMode,
      notes: purchaseForm.notes || 'Cylinder stock purchase'
    };

    setPurchases([newPurchase, ...purchases]);

    // Update supplier total purchased
    setSuppliers(
      suppliers.map((s) =>
        s.id === selectedSupplier.id ? { ...s, totalPurchased: s.totalPurchased + totalQty } : s
      )
    );

    toast.success(`Purchase recorded for ${purchaseForm.branch}! Invoice #${newId}`);
    setIsPurchaseModalOpen(false);

    // Reset Form
    setPurchaseForm({
      branch: 'Branch 1',
      supplierId: '',
      no20Qty: '',
      no22Qty: '',
      unitPrice: 2900,
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer',
      date: todayStr,
      notes: ''
    });
  };

  // Submit New Supplier
  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!supplierForm.name) {
      toast.error('Supplier name is required!');
      return;
    }

    const newSupplier = {
      id: suppliers.length + 1,
      name: supplierForm.name,
      phone: supplierForm.phone || 'N/A',
      location: supplierForm.location || 'N/A',
      totalPurchased: 0,
      status: 'Active'
    };

    setSuppliers([...suppliers, newSupplier]);
    toast.success(`Supplier (${newSupplier.name}) registered successfully!`);
    setIsSupplierModalOpen(false);
    setSupplierForm({ name: '', phone: '', location: '' });
  };

  // Computations for Stock
  const branch1Purchases = purchases.filter((p) => p.branch === 'Branch 1');
  const branch1No20 = branch1Purchases.reduce((sum, p) => sum + p.no20Qty, 0);
  const branch1No22 = branch1Purchases.reduce((sum, p) => sum + p.no22Qty, 0);
  // const branch1TotalCost = branch1Purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  const mainBranchPurchases = purchases.filter((p) => p.branch === 'Main Branch');
  const mainBranchNo20 = mainBranchPurchases.reduce((sum, p) => sum + p.no20Qty, 0);
  const mainBranchNo22 = mainBranchPurchases.reduce((sum, p) => sum + p.no22Qty, 0);
  // const mainBranchTotalCost = mainBranchPurchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Filtered Purchases for Display Table
  const filteredPurchases = purchases.filter((p) => {
    const matchSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchTerm.toLowerCase());

    const matchBranch = selectedBranch === 'All' || p.branch === selectedBranch;

    return matchSearch && matchBranch;
  });

  return (
    <div className="w-full space-y-6 min-h-full">
      {/* 1. Clean Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Purchase Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track cylinder stock intake (No. 20 & No. 22) for Main Branch and Branch 1.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap"
          >
            + Add Supplier
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#12544F] hover:bg-[#0d3f3b] text-white font-bold text-xs shadow-md shadow-[#12544F]/20 transition-all whitespace-nowrap"
          >
            + New Purchase
          </button>
        </div>
      </div>

      {/* 2. Main View Table & Controls Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        {/* Navigation Tabs & Search Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'purchases'
                ? 'bg-white dark:bg-slate-900 text-[#12544F] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Purchase Invoices
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'stock'
                ? 'bg-white dark:bg-slate-900 text-[#12544F] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Stock Summary (#20 & #22)
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'suppliers'
                ? 'bg-white dark:bg-slate-900 text-[#12544F] dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Suppliers ({suppliers.length})
            </button>
          </div>

          {/* Search & Branch Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {activeTab === 'purchases' && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="All">All Outlets</option>
                <option value="Main Branch">Main Branch</option>
                <option value="Branch 1">Branch 1</option>
              </select>
            )}

            <div className="relative w-full sm:w-60">
              <FaSearch className="absolute left-3 top-3 text-xs text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* View 1: Invoices Table */}
        {activeTab === 'purchases' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">Invoice #</th>
                  <th className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th className="px-5 py-3 whitespace-nowrap">Branch</th>
                  <th className="px-5 py-3 whitespace-nowrap">Supplier</th>
                  <th className="px-5 py-3 whitespace-nowrap">#20 Reg Qty</th>
                  <th className="px-5 py-3 whitespace-nowrap">#22 Reg Qty</th>
                  <th className="px-5 py-3 whitespace-nowrap">Total Amount</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.id}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{p.date}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                          {p.branch === 'Branch 1' ? <FaStore className="text-[10px]" /> : <FaBuilding className="text-[10px]" />}
                          {p.branch}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.supplierName}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {p.no20Qty} Units
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {p.no22Qty} Units
                      </td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {p.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {p.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                            <FaCheckCircle className="text-[9px]" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                            <FaClock className="text-[9px]" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(p)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 transition-all"
                        >
                          <FaPrint className="inline mr-1 text-[10px]" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-slate-400 font-semibold whitespace-nowrap">
                      No purchase records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Simple Stock Summary */}
        {activeTab === 'stock' && (
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Current Available Stock Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch 1 Stock Summary */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FaStore className="text-indigo-500" /> Branch 1 Stock
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    {branch1No20 + branch1No22} Total Units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 font-semibold">No. 20 Regulator</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{branch1No20} Units</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 font-semibold">No. 22 Regulator</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{branch1No22} Units</p>
                  </div>
                </div>
              </div>

              {/* Main Branch Stock Summary */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FaBuilding className="text-blue-500" /> Main Branch Stock
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {mainBranchNo20 + mainBranchNo22} Total Units
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 font-semibold">No. 20 Regulator</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{mainBranchNo20} Units</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 font-semibold">No. 22 Regulator</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{mainBranchNo22} Units</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Suppliers Directory */}
        {activeTab === 'suppliers' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-bold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3 whitespace-nowrap">Supplier Name</th>
                  <th className="px-5 py-3 whitespace-nowrap">Contact Phone</th>
                  <th className="px-5 py-3 whitespace-nowrap">Depot Location</th>
                  <th className="px-5 py-3 whitespace-nowrap">Total Supplied Stock</th>
                  <th className="px-5 py-3 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      <FaPhoneAlt className="inline mr-1 text-[10px] text-slate-400" /> {s.phone}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.location}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {s.totalPurchased} Units
                    </td>
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Record New Purchase Order */}
      {isPurchaseModalOpen && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaShoppingBag className="text-indigo-500" /> New Stock Purchase
              </h3>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRecordPurchase} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Branch: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={purchaseForm.branch}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold"
                    required
                  >
                    <option value="Branch 1">Branch 1</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold"
                    required
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. 20 Regulator Qty:
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={purchaseForm.no20Qty}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, no20Qty: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No. 22 Regulator Qty:
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={purchaseForm.no22Qty}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, no22Qty: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Price (Rs.):
                  </label>
                  <input
                    type="number"
                    value={purchaseForm.unitPrice}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status:
                  </label>
                  <select
                    value={purchaseForm.paymentStatus}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending Credit">Pending Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes:
                </label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={purchaseForm.notes}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#12544F] hover:bg-[#0d3f3b] text-white shadow-md"
                >
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Add Supplier */}
      {isSupplierModalOpen && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Add Supplier</span>
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier Name: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shell LPG Plant"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#12544F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 051-4433221"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#12544F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Depot Location:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rawalpindi Plant"
                  value={supplierForm.location}
                  onChange={(e) => setSupplierForm({ ...supplierForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#12544F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#12544F] hover:bg-[#0d3f3b] text-white shadow-md"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 3: View Invoice */}
      {selectedInvoice && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Invoice #{selectedInvoice.id}</span>
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Branch:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.branch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Supplier:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">No. 20 Reg Qty:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.no20Qty} Units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">No. 22 Reg Qty:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedInvoice.no22Qty} Units</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Total Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Rs. {selectedInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Status:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedInvoice.paymentStatus}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#12544F] hover:bg-[#0d3f3b] text-white shadow-md flex items-center gap-1.5"
              >
                <FaPrint /> Print
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Purchase;
