import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaPrint } from "react-icons/fa";
import {
  FaShoppingBag,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaStore,
  FaBuilding,
  FaPhoneAlt,
  FaEdit,
  FaEye,
  FaPlus,
  FaGasPump
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Purchase = () => {
  // Main view tab: 'purchases' | 'stock' | 'suppliers'
  const [activeTab, setActiveTab] = useState('purchases');

  // Branch filter: 'All' | 'Main Branch' | 'Branch 1'
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Search Query
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Editing state
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);

  const todayStr = '2026-09-04';

  // Helper to load suppliers from localStorage
  const loadSavedSuppliers = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_suppliers_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(s => !['Shell LPG Bottling Plant', 'Parco Gas Terminal', 'Burshane LPG Pakistan', 'PSO Gas Distributor'].includes(s.name));
      }
    } catch (e) {
      console.error('Failed to load suppliers from localStorage', e);
    }
    return [];
  };

  // Helper to load purchases from localStorage
  const loadSavedPurchases = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_purchases_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load purchases from localStorage', e);
    }
    return [];
  };

  // Registered Suppliers List
  const [suppliers, setSuppliers] = useState(loadSavedSuppliers);

  // Purchase Invoices Records
  const [purchases, setPurchases] = useState(loadSavedPurchases);

  // Save suppliers to localStorage when changed
  const updateSuppliersState = (newSuppliers) => {
    setSuppliers(newSuppliers);
    try {
      localStorage.setItem('lpg_erp_suppliers_data', JSON.stringify(newSuppliers));
    } catch (e) {
      console.error('Failed to save suppliers to localStorage', e);
    }
  };

  // Save purchases to localStorage when changed
  const updatePurchasesState = (newPurchases) => {
    setPurchases(newPurchases);
    try {
      localStorage.setItem('lpg_erp_purchases_data', JSON.stringify(newPurchases));
    } catch (e) {
      console.error('Failed to save purchases to localStorage', e);
    }
  };

  // Form state for creating/editing purchase invoices
  const [purchaseForm, setPurchaseForm] = useState({
    branch: 'Branch 1',
    supplierId: '',
    paymentStatus: 'Paid',
    paymentMode: 'Bank Transfer',
    date: todayStr,
    notes: '',
    items: [
      { size: '11 kg', regNo: '20', qty: 1, unitPrice: 2900 }
    ]
  });

  // New Supplier Form State
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    phone: '',
    location: ''
  });

  // Calculate row metrics
  const getItemMetrics = (item) => {
    const qty = parseInt(item.qty) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const kg = parseFloat(item.size) || 11;
    return {
      qty,
      unitPrice,
      lineWeight: qty * kg,
      lineTotal: qty * unitPrice
    };
  };

  // Calculate grand totals for form items
  const getFormTotals = (items) => {
    return items.reduce(
      (acc, item) => {
        const m = getItemMetrics(item);
        acc.totalQty += m.qty;
        acc.totalWeight += m.lineWeight;
        acc.totalAmount += m.lineTotal;
        return acc;
      },
      { totalQty: 0, totalWeight: 0, totalAmount: 0 }
    );
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...purchaseForm.items];
    updated[index] = { ...updated[index], [field]: value };
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  // Open Create Purchase Modal
  const handleOpenCreateModal = () => {
    setEditingPurchase(null);
    setPurchaseForm({
      branch: 'Branch 1',
      supplierId: suppliers.length > 0 ? String(suppliers[0].id) : '',
      paymentStatus: 'Paid',
      paymentMode: 'Bank Transfer',
      date: todayStr,
      notes: '',
      items: [
        { size: '11 kg', regNo: '20', qty: 1, unitPrice: 2900 }
      ]
    });
    setIsPurchaseModalOpen(true);
  };

  // Open Edit Purchase Modal
  const handleOpenEditModal = (p) => {
    setEditingPurchase(p);
    const existingSupplier = suppliers.find((s) => s.name === p.supplierName);
    setPurchaseForm({
      branch: p.branch || 'Branch 1',
      supplierId: existingSupplier ? String(existingSupplier.id) : '',
      paymentStatus: p.paymentStatus || 'Paid',
      paymentMode: p.paymentMode || 'Bank Transfer',
      date: p.date || todayStr,
      notes: p.notes || '',
      items: p.items && p.items.length > 0
        ? p.items.map((i) => ({ size: i.size, regNo: i.regNo, qty: i.qty, unitPrice: i.unitPrice }))
        : [{ size: '11 kg', regNo: '20', qty: 1, unitPrice: 2900 }]
    });
    setIsPurchaseModalOpen(true);
  };

  // Submit Purchase (Create or Update)
  const handleRecordPurchase = (e) => {
    e.preventDefault();

    if (!purchaseForm.supplierId) {
      toast.error('Please select a Supplier!');
      return;
    }

    if (!purchaseForm.items || purchaseForm.items.length === 0) {
      toast.error('Please add at least one cylinder line item!');
      return;
    }

    const processedItems = purchaseForm.items.map((item) => {
      const m = getItemMetrics(item);
      return {
        size: item.size,
        regNo: item.regNo,
        qty: m.qty,
        unitPrice: m.unitPrice,
        lineWeight: m.lineWeight,
        lineTotal: m.lineTotal
      };
    });

    const totals = getFormTotals(purchaseForm.items);

    if (totals.totalQty <= 0) {
      toast.error('Total quantity of cylinders must be greater than 0!');
      return;
    }

    const selectedSupplier = suppliers.find((s) => s.id === parseInt(purchaseForm.supplierId));
    if (!selectedSupplier) return;

    if (editingPurchase) {
      // Update existing purchase invoice
      const updatedPurchases = purchases.map((p) => {
        if (p.id === editingPurchase.id) {
          return {
            ...p,
            date: purchaseForm.date,
            branch: purchaseForm.branch,
            supplierName: selectedSupplier.name,
            items: processedItems,
            totalQty: totals.totalQty,
            totalWeight: totals.totalWeight,
            totalAmount: totals.totalAmount,
            paymentStatus: purchaseForm.paymentStatus,
            paymentMode: purchaseForm.paymentMode,
            notes: purchaseForm.notes || 'Cylinder stock purchase'
          };
        }
        return p;
      });

      updatePurchasesState(updatedPurchases);
      toast.success(`Purchase Invoice #${editingPurchase.id} updated successfully!`);
    } else {
      // Create new purchase invoice
      const newId = `INV-PUR-${500 + purchases.length + 1}`;
      const newPurchase = {
        id: newId,
        date: purchaseForm.date,
        branch: purchaseForm.branch,
        supplierName: selectedSupplier.name,
        items: processedItems,
        totalQty: totals.totalQty,
        totalWeight: totals.totalWeight,
        totalAmount: totals.totalAmount,
        paymentStatus: purchaseForm.paymentStatus,
        paymentMode: purchaseForm.paymentMode,
        notes: purchaseForm.notes || 'Cylinder stock purchase'
      };

      updatePurchasesState([newPurchase, ...purchases]);

      // Update supplier total purchased
      updateSuppliersState(
        suppliers.map((s) =>
          s.id === selectedSupplier.id ? { ...s, totalPurchased: (s.totalPurchased || 0) + totals.totalQty } : s
        )
      );

      toast.success(`Purchase recorded for ${purchaseForm.branch}! Invoice #${newId}`);
    }

    setIsPurchaseModalOpen(false);
    setEditingPurchase(null);
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

    updateSuppliersState([...suppliers, newSupplier]);
    toast.success(`Supplier (${newSupplier.name}) registered successfully!`);
    setIsSupplierModalOpen(false);
    setSupplierForm({ name: '', phone: '', location: '' });
  };

  // Compute stock stats per branch, cylinder size (11kg, 15kg, 45kg) and reg no (20, 22)
  const getBranchStockBreakdown = (branchName) => {
    const branchInvoices = purchases.filter((p) => branchName === 'All' || p.branch === branchName);

    const sizes = ['11 kg', '15 kg', '45 kg'];
    const summary = {};
    sizes.forEach((s) => {
      summary[s] = { '20': 0, '22': 0, totalQty: 0, totalWeight: 0 };
    });

    let overallQty = 0;
    let overallWeight = 0;

    branchInvoices.forEach((p) => {
      (p.items || []).forEach((item) => {
        const sz = item.size || '11 kg';
        const reg = item.regNo || '20';
        const qty = item.qty || 0;
        const wt = item.lineWeight || (qty * (parseFloat(sz) || 11));

        if (!summary[sz]) {
          summary[sz] = { '20': 0, '22': 0, totalQty: 0, totalWeight: 0 };
        }
        if (!summary[sz][reg]) summary[sz][reg] = 0;

        summary[sz][reg] += qty;
        summary[sz].totalQty += qty;
        summary[sz].totalWeight += wt;

        overallQty += qty;
        overallWeight += wt;
      });
    });

    return { summary, overallQty, overallWeight };
  };

  const branch1Stock = getBranchStockBreakdown('Branch 1');
  const mainBranchStock = getBranchStockBreakdown('Main Branch');

  // Filtered Purchases for Display Table
  const filteredPurchases = purchases.filter((p) => {
    const itemMatch = (p.items || []).some(
      (i) => i.size.toLowerCase().includes(searchTerm.toLowerCase()) || i.regNo.includes(searchTerm)
    );

    const matchSearch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemMatch;

    const matchBranch = selectedBranch === 'All' || p.branch === selectedBranch;

    return matchSearch && matchBranch;
  });

  return (
    <div className="w-full space-y-6 min-h-full">
      {/* 1. Clean Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FaShoppingBag className="text-[#DF301C]" /> Purchase & Stock Intake
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage cylinder purchases by Size (11 kg, 15 kg, 45 kg) and Reg No (20 & 22). Auto-calculates total cylinders, weight (kg), and bill amount.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all whitespace-nowrap cursor-pointer shadow-xs"
          >
            <FaPlus className="text-[10px]" /> Add Supplier
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-white text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-[#7A0C00] hover:text-white hover:border-[#7A0C00] dark:hover:bg-[#7A0C00] dark:hover:text-white dark:hover:border-[#7A0C00] transition-all whitespace-nowrap cursor-pointer shadow-xs"
          >
            <FaPlus className="text-[10px]" /> New Purchase Invoice
          </button>
        </div>
      </div>

      {/* 3. Main View Table & Controls Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        {/* Navigation Tabs & Search Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'purchases'
                  ? 'bg-[#7A0C00] text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Purchase Invoices
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'stock'
                  ? 'bg-[#7A0C00] text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Stock Breakdown (11k, 15k, 45k)
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'suppliers'
                  ? 'bg-[#7A0C00] text-white shadow-sm font-black'
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
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-[#7A0C00]"
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
                placeholder="Search invoice, reg, size..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00]"
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
                  <th className="px-5 py-3.5 whitespace-nowrap">Invoice #</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Date</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Branch</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Supplier</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Total Qty</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Total Weight</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Total Amount</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3.5 text-center whitespace-nowrap">Action</th>
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
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                          {p.branch === 'Branch 1' ? <FaStore className="text-[#7A0C00] dark:text-rose-400" /> : <FaBuilding className="text-blue-500" />}
                          {p.branch}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                        {p.supplierName}
                      </td>
                      <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {p.totalQty} Units
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {p.totalWeight} kg
                      </td>
                      <td className="px-5 py-3.5 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(p)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                            title="View Invoice Details & Bill"
                          >
                            <FaEye className="inline mr-1 text-[10px] text-[#7A0C00] dark:text-rose-400" /> Bill
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-800 transition-all cursor-pointer"
                            title="Edit Invoice"
                          >
                            <FaEdit className="inline mr-1 text-[10px]" /> Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-slate-400 font-semibold whitespace-nowrap">
                      No purchase records found matching search filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Detailed Stock Summary (11kg, 15kg, 45kg & Reg 20, 22) */}
        {activeTab === 'stock' && (
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FaGasPump className="text-[#DF301C]" /> Comprehensive Stock Intake Breakdown
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branch 1 Stock Summary */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FaStore className="text-[#DF301C]" /> Branch 1 Stock Summary
                  </span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 dark:bg-red-950 text-[#DF301C] whitespace-nowrap">
                      {branch1Stock.overallQty} Cylinders
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {branch1Stock.overallWeight} kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['11 kg', '15 kg', '45 kg'].map((sz) => {
                    const data = branch1Stock.summary[sz] || { '20': 0, '22': 0, totalQty: 0, totalWeight: 0 };
                    return (
                      <div key={sz} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{sz} Cylinder</span>
                          <span className="text-[10px] font-bold text-[#DF301C]">{data.totalWeight} kg</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Reg #20:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{data['20']} pcs</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Reg #22:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{data['22']} pcs</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-extrabold text-[#DF301C]">
                            <span>Subtotal:</span>
                            <span>{data.totalQty} pcs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Branch Stock Summary */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <FaBuilding className="text-blue-500" /> Main Branch Stock Summary
                  </span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {mainBranchStock.overallQty} Cylinders
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {mainBranchStock.overallWeight} kg
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['11 kg', '15 kg', '45 kg'].map((sz) => {
                    const data = mainBranchStock.summary[sz] || { '20': 0, '22': 0, totalQty: 0, totalWeight: 0 };
                    return (
                      <div key={sz} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs">{sz} Cylinder</span>
                          <span className="text-[10px] font-bold text-blue-500">{data.totalWeight} kg</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Reg #20:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{data['20']} pcs</span>
                          </div>
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>Reg #22:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{data['22']} pcs</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-extrabold text-blue-600 dark:text-blue-400">
                            <span>Subtotal:</span>
                            <span>{data.totalQty} pcs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <th className="px-5 py-3.5 whitespace-nowrap">Supplier Name</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Contact Phone</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Depot Location</th>
                  <th className="px-5 py-3.5 whitespace-nowrap">Total Supplied Stock</th>
                  <th className="px-5 py-3.5 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {s.name}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <FaPhoneAlt className="inline mr-1 text-[10px] text-slate-400" /> {s.phone}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.location}</td>
                      <td className="px-5 py-3.5 font-bold text-[#DF301C] whitespace-nowrap">
                        {s.totalPurchased || 0} Units
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 font-semibold whitespace-nowrap">
                      No suppliers registered yet. Click "+ Add Supplier" to register your first LPG supplier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Record / Edit Purchase Order */}
      {isPurchaseModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPurchaseModalOpen(false);
          }}
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FaShoppingBag className="text-[#7A0C00] dark:text-rose-400" />
                {editingPurchase ? `Edit Purchase Invoice #${editingPurchase.id}` : 'Record New Purchase'}
              </h3>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRecordPurchase} className="space-y-4">
              {/* 1. Primary Selection: Cylinder Size & Reg No */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200/60 dark:border-red-900/30 space-y-3">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FaGasPump className="text-[#7A0C00] dark:text-rose-400" /> Select Cylinder Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cylinder Size Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      1. Cylinder Size: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={purchaseForm.items[0]?.size || '11 kg'}
                      onChange={(e) => handleItemChange(0, 'size', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-black rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] shadow-xs"
                      required
                    >
                      <option value="11 kg">11 kg Cylinder</option>
                      <option value="15 kg">15 kg Cylinder</option>
                      <option value="45 kg">45 kg Cylinder</option>
                    </select>
                  </div>

                  {/* Reg No Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      2. Reg No.: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={purchaseForm.items[0]?.regNo || '20'}
                      onChange={(e) => handleItemChange(0, 'regNo', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-black rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] shadow-xs"
                      required
                    >
                      <option value="20">Reg No. 20</option>
                      <option value="22">Reg No. 22</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity (Units): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter quantity"
                      value={purchaseForm.items[0]?.qty ?? ''}
                      onChange={(e) => handleItemChange(0, 'qty', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-black rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] shadow-xs"
                      required
                    />
                  </div>

                  {/* Rate / Unit Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Rate / Cylinder Price (Rs.): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter rate per cylinder"
                      value={purchaseForm.items[0]?.unitPrice ?? ''}
                      onChange={(e) => handleItemChange(0, 'unitPrice', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-black rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] shadow-xs"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 2. Supplier, Branch, Date & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] font-semibold"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Branch: <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={purchaseForm.branch}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, branch: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] font-semibold"
                    required
                  >
                    <option value="Branch 1">Branch 1</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date:
                  </label>
                  <input
                    type="date"
                    value={purchaseForm.date}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Status:
                  </label>
                  <select
                    value={purchaseForm.paymentStatus}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, paymentStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#7A0C00] font-semibold"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending Credit">Pending Credit</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-black rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-[#7A0C00] hover:text-white hover:border-[#7A0C00] dark:hover:bg-[#7A0C00] dark:hover:text-white dark:hover:border-[#7A0C00] transition-all shadow-xs cursor-pointer"
                >
                  {editingPurchase ? 'Update Purchase' : 'Save Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Add Supplier */}
      {isSupplierModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSupplierModalOpen(false);
          }}
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Add New Supplier</span>
              </h3>
              <button
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#DF301C]"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#DF301C]"
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
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#DF301C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-[#7A0C00] hover:text-white hover:border-[#7A0C00] dark:hover:bg-[#7A0C00] dark:hover:text-white dark:hover:border-[#7A0C00] transition-all shadow-xs cursor-pointer"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 3: View Detailed Bill / Invoice Receipt */}
      {selectedInvoice && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedInvoice(null);
          }}
          className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FaShoppingBag className="text-[#7A0C00] dark:text-rose-400" /> Purchase Bill #{selectedInvoice.id}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Bill Info Card Header */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Branch:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedInvoice.branch}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Supplier:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedInvoice.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Invoice Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedInvoice.date}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold block">Payment Status:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{selectedInvoice.paymentStatus} ({selectedInvoice.paymentMode})</span>
              </div>
            </div>

            {/* Itemized Bill Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 font-black text-[10px] text-slate-600 dark:text-slate-300 uppercase">
                  <tr>
                    <th className="p-3">Cylinder Size</th>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Weight (kg)</th>
                    <th className="p-3">Rate (Rs.)</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {(selectedInvoice.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{item.size}</td>
                      <td className="p-3 font-bold text-[#7A0C00] dark:text-rose-400">Reg #{item.regNo}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{item.qty} pcs</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{item.lineWeight} kg</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">Rs. {item.unitPrice.toLocaleString()}</td>
                      <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        Rs. {item.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary Banner - Theme-matching Dark Red Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7A0C00] via-[#5C0800] to-[#400500] dark:from-[#2a0505] dark:via-[#1e0404] dark:to-[#120202] text-white flex justify-between items-center text-xs border border-red-900/40 dark:border-red-950/80 shadow-md">
              <div>
                <p className="text-[10px] font-extrabold text-rose-200/80 uppercase tracking-wider">Total Cylinders</p>
                <p className="text-sm font-black text-white mt-0.5">{selectedInvoice.totalQty} Units</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-extrabold text-rose-200/80 uppercase tracking-wider">Total Gas Weight</p>
                <p className="text-sm font-black text-rose-100 mt-0.5">{selectedInvoice.totalWeight} kg</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold text-amber-300/90 uppercase tracking-wider">Total Purchase Price</p>
                <p className="text-base font-black text-amber-300 mt-0.5">Rs. {selectedInvoice.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const inv = selectedInvoice;
                  setSelectedInvoice(null);
                  handleOpenEditModal(inv);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 text-xs font-black rounded-xl bg-white text-slate-900 border border-slate-300 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-[#7A0C00] hover:text-white hover:border-[#7A0C00] dark:hover:bg-[#7A0C00] dark:hover:text-white dark:hover:border-[#7A0C00] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FaPrint /> Print Bill
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
