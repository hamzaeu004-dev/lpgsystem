import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaWallet,

  FaSearch,
  FaFilter,

  FaReceipt,
  FaTag,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTrash,
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaClock,
  FaBuilding

} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  addCategory,
} from '../../features/expense/expenseSlice';
import { formatCurrency } from '../../utils/helpers';

const Expense = () => {
  const dispatch = useDispatch();
  const { expenses = [], categories = [] } = useSelector((state) => state.expenses || {});
  const { shops = [] } = useSelector((state) => state.shops || {});

  // State Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, TODAY, WEEK, MONTH

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    customCategory: '',
    shopId: 'GENERAL',
    shopName: 'General / All Shops',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    paymentMethod: 'Cash',
    status: 'Paid',
    paidTo: '',
    notes: '',
  });

  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Handle Form Reset
  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      category: categories[0] || 'Transport & Fuel',
      customCategory: '',
      shopId: shops[0]?.id || 'GENERAL',
      shopName: shops[0]?.name || 'General / All Shops',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidTo: '',
      notes: '',
    });
    setEditingExpense(null);
  };

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    resetForm();
    setIsExpenseModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      customCategory: '',
      shopId: expense.shopId || 'GENERAL',
      shopName: expense.shopName || 'General / All Shops',
      date: expense.date ? format(new Date(expense.date), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      paymentMethod: expense.paymentMethod || 'Cash',
      status: expense.status || 'Paid',
      paidTo: expense.paidTo || '',
      notes: expense.notes || '',
    });
    setIsExpenseModalOpen(true);
  };

  // Submit Expense (Create / Update)
  const handleSubmitExpense = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter an expense title!');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter a valid expense amount!');
      return;
    }

    let finalCategory = formData.category;
    if (formData.category === 'NEW_CUSTOM') {
      if (!formData.customCategory.trim()) {
        toast.error('Please enter your custom category name!');
        return;
      }
      finalCategory = formData.customCategory.trim();
      dispatch(addCategory(finalCategory));
    }

    const selectedShopObj = shops.find((s) => s.id === formData.shopId);
    const shopName = selectedShopObj ? selectedShopObj.name : 'General / All Shops';

    if (editingExpense) {
      // Update
      const updatedItem = {
        ...editingExpense,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: finalCategory,
        shopId: formData.shopId,
        shopName: shopName,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        paidTo: formData.paidTo.trim(),
        notes: formData.notes.trim(),
      };
      dispatch(updateExpense(updatedItem));
      toast.success('Expense updated successfully!');
    } else {
      // Create
      const newVoucherId = `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`;
      const newItem = {
        id: newVoucherId,
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: finalCategory,
        shopId: formData.shopId,
        shopName: shopName,
        date: new Date(formData.date).toISOString(),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        paidTo: formData.paidTo.trim(),
        notes: formData.notes.trim(),
      };
      dispatch(addExpense(newItem));
      toast.success(`Expense ${newVoucherId} recorded!`);
    }

    setIsExpenseModalOpen(false);
    resetForm();
  };

  // Delete Expense
  const handleDeleteExpense = (id, title) => {
    if (window.confirm(`Are you sure you want to delete expense "${title}"?`)) {
      dispatch(deleteExpense(id));
      toast.success('Expense deleted!');
    }
  };

  // Quick Create New Category
  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    dispatch(addCategory(newCategoryInput.trim()));
    toast.success(`Category "${newCategoryInput.trim()}" added!`);
    setNewCategoryInput('');
    setIsCategoryModalOpen(false);
  };

  // Filtered Expenses Computation
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // Search
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.paidTo && item.paidTo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      // Status
      const matchesStatus =
        selectedStatus === 'ALL' || item.status === selectedStatus;

      // Date Filter
      let matchesDate = true;
      if (dateFilter === 'TODAY') {
        matchesDate = isToday(new Date(item.date));
      } else if (dateFilter === 'WEEK') {
        matchesDate = isThisWeek(new Date(item.date));
      } else if (dateFilter === 'MONTH') {
        matchesDate = isThisMonth(new Date(item.date));
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [expenses, searchTerm, selectedCategory, selectedStatus, dateFilter]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

    const todayAmount = expenses
      .filter((item) => isToday(new Date(item.date)))
      .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

    const pendingAmount = expenses
      .filter((item) => item.status === 'Pending')
      .reduce((acc, cur) => acc + (Number(cur.amount) || 0), 0);

    return {
      totalAmount,
      todayAmount,
      pendingAmount,
      categoriesCount: categories.length,
    };
  }, [expenses, categories]);

  // Export CSV Report
  const handleExportReport = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No expenses available to export');
      return;
    }

    const headers = ['Voucher ID', 'Date & Time', 'Title', 'Category', 'Shop/Depot', 'Amount (PKR)', 'Payment Method', 'Status', 'Paid To', 'Notes'];
    const rows = filteredExpenses.map((exp) => [
      exp.id,
      exp.date ? format(new Date(exp.date), 'dd/MM/yyyy hh:mm a') : '-',
      `"${(exp.title || '').replace(/"/g, '""')}"`,
      `"${(exp.category || '').replace(/"/g, '""')}"`,
      `"${(exp.shopName || '').replace(/"/g, '""')}"`,
      exp.amount,
      exp.paymentMethod || 'Cash',
      exp.status || 'Paid',
      `"${(exp.paidTo || '').replace(/"/g, '""')}"`,
      `"${(exp.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Expenses_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Expense report downloaded successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <FaWallet className="text-xl" />
            </span>
            Daily Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily operational costs, fuel/transport, salaries, rent, maintenance & dynamic expenses.
          </p>
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            Categories
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            Export CSV
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#12544F] hover:bg-[#0d3f3b] text-white font-bold text-xs shadow-md shadow-[#12544F]/20 transition-all"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaMoneyBillWave />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Total Expenses</p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {formatCurrency(stats.totalAmount)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate block mt-0.5">All Time Record</span>
          </div>
        </div>

        {/* Today Expenses */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaCalendarAlt />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Today's Expense</p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {formatCurrency(stats.todayAmount)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-emerald-500 font-bold truncate block mt-0.5">Daily Track</span>
          </div>
        </div>

        {/* Dynamic Categories Count */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaTag />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Active Categories</p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {stats.categoriesCount} Types
            </h3>
            <span className="text-[10px] sm:text-[11px] text-purple-500 font-medium truncate block mt-0.5">Dynamic Categories</span>
          </div>
        </div>

        {/* Pending Bills */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaReceipt />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">Pending Bills</p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {formatCurrency(stats.pendingAmount)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-amber-500 font-bold truncate block mt-0.5">Unpaid Vouchers</span>
          </div>
        </div>
      </div>

      {/* Main Table & Filter Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-3.5 top-3.5 text-xs text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, voucher, paid to..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 transition-all"
            />
          </div>

          {/* Filters Bar */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <FaFilter className="text-[10px] text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Date Range Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <FaCalendarAlt className="text-[10px] text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Data Table */}
        <div className="overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto mb-4">
                <FaReceipt />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">No Expense Records Found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Selected filter ke mutabiq koi expense nahi mila. Aap naya expense "Add Expense" button daba kar shamil kar sakte hain.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4">Voucher #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Shop / Branch</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                <AnimatePresence>
                  {filteredExpenses.map((expense) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {expense.id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {expense.date ? format(new Date(expense.date), 'dd MMM yyyy, hh:mm a') : '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {expense.title}
                        </div>
                        {expense.paidTo && (
                          <span className="text-[11px] text-slate-400">
                            Paid to: <strong className="text-slate-600 dark:text-slate-300">{expense.paidTo}</strong>
                          </span>
                        )}
                        {expense.notes && (
                          <div className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5">
                            "{expense.notes}"
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                          <FaTag className="text-[9px] text-rose-500" />
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5">
                          <FaBuilding className="text-slate-400 text-[10px]" />
                          {expense.shopName || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                        {expense.paymentMethod || 'Cash'}
                      </td>
                      <td className="py-3.5 px-4">
                        {expense.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            <FaCheckCircle className="text-[9px]" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                            <FaClock className="text-[9px]" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(expense)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all"
                            title="Edit Expense"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id, expense.title)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                            title="Delete Expense"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL 1: Add / Edit Expense */}
      {isExpenseModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <FaWallet className="text-rose-500" />
                  {editingExpense ? 'Edit Expense Voucher' : 'Record New Daily Expense'}
                </h3>
                <button
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitExpense} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Title / Description <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delivery Van Fuel, Office Tea, Shop Rent"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Amount & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Amount (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 5000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expense Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium cursor-pointer"
                    >
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="NEW_CUSTOM">+ Add Custom Category...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Category Input if NEW_CUSTOM selected */}
                {formData.category === 'NEW_CUSTOM' && (
                  <div className="p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900">
                    <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                      Enter New Category Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Generator Diesel, Licensing Fee"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Shop / Depot & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shop / Branch
                    </label>
                    <select
                      value={formData.shopId}
                      onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium cursor-pointer"
                    >
                      <option value="GENERAL">General / All Shops</option>
                      {shops.map((shop) => (
                        <option key={shop.id} value={shop.id}>
                          {shop.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                {/* Payment Method & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online Bank Transfer">Online Bank Transfer</option>
                      <option value="Company Cheque">Company Cheque</option>
                      <option value="Credit / Payable">Credit / Payable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending (Unpaid)</option>
                    </select>
                  </div>
                </div>

                {/* Paid To / Vendor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To / Receiver Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electric Supply Co, Mechanics Shop, Driver Name"
                    value={formData.paidTo}
                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Additional details regarding this expense..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                {/* Buttons */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#12544F] hover:bg-[#0d3f3b] rounded-xl shadow-md shadow-[#12544F]/20 transition-all"
                  >
                    {editingExpense ? 'Save Changes' : 'Record Expense'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body
        )}

      {/* MODAL 2: Dynamic Category Manager */}
      {isCategoryModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>Expense Categories</span>
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Form to Add Category */}
                <form onSubmit={handleCreateCategorySubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter new category name..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#12544F] font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-[#12544F] hover:bg-[#0d3f3b] rounded-xl transition-all"
                  >
                    Add
                  </button>
                </form>

                {/* List of existing categories */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Active Categories ({categories.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {categories.map((cat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <span className="flex items-center gap-2">
                          <FaTag className="text-[10px] text-rose-500" />
                          {cat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Expense;
