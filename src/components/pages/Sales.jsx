import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart,
  FaPlus,
  FaSearch,
  FaReceipt,
  FaTimes,
  FaPrint,
  FaCheckCircle,
  FaGasPump,

  FaUndo,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaShieldAlt,

  FaEdit,

  FaHashtag,
  FaUser,

  FaTag,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import {
  addTransaction,
  updateTransaction,
  markEmptyCylinderReturned,
  payOutstandingBalance
} from '../../features/sales/salesSlice';
import { updateCylinderStatus } from '../../features/inventory/inventorySlice';
import {
  assignCylinder,
  returnCylinder,
  updateCustomerBalance
} from '../../features/customers/customerSlice';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Sales = () => {
  const dispatch = useDispatch();

  const { transactions } = useSelector((state) => state.sales);
  const { customers } = useSelector((state) => state.customers);
  const { cylinders } = useSelector((state) => state.inventory);
  const { shops } = useSelector((state) => state.shops);

  const [activeTab, setActiveTab] = useState('registered'); // 'registered' | 'all'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending_empty' | 'pending_baqaya' | 'completed'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptTxn, setReceiptTxn] = useState(null);
  const [emptyReturnModal, setEmptyReturnModal] = useState(null);
  const [payBaqayaModal, setPayBaqayaModal] = useState(null);
  const [editModalTxn, setEditModalTxn] = useState(null);

  const [returnRegNoInput, setReturnRegNoInput] = useState('');
  const [baqayaPaymentInput, setBaqayaPaymentInput] = useState('');

  // Available filled cylinders in stock
  const availableCylinders = cylinders.filter((c) => c.status === 'stock');

  // Default state for new sale modal
  const defaultCustomer = customers[0] || null;
  const defaultCylinder = availableCylinders[0] || null;

  const [customerMode, setCustomerMode] = useState('registered'); // 'registered' | 'custom'
  const [cylinderMode, setCylinderMode] = useState('stock'); // 'stock' | 'custom'

  const [newSale, setNewSale] = useState({
    customInvoiceId: `INV-2026-00${transactions.length + 1}`,
    customerId: defaultCustomer?.id || '',
    customCustomerName: '',
    customCustomerPhone: '',
    issuedCylinderId: defaultCylinder?.id || '',
    customIssuedCylinderRegNo: 'LPG-PK-11805',
    customIssuedCylinderType: 'Domestic 11.8 kg',
    shopId: shops[0]?.id || 'SHOP-001',
    hasReturnedEmpty: true,
    returnedCylinderRegNo: 'LPG-PK-11801',
    refillAmount: 2850,
    paidAmount: 2850,
    paymentMethod: 'Cash',
  });

  const [editForm, setEditForm] = useState({
    originalId: '',
    id: '',
    customerName: '',
    issuedCylinderRegNo: '',
    returnedCylinderRegNo: '',
    totalBill: 0,
    paidAmount: 0,
    remainingBalance: 0,
    paymentMethod: 'Cash',
  });

  // Derived KPI metrics
  const registeredSalesList = transactions.filter((t) => t.isRegisteredCustomer || t.customerId);
  const totalRegisteredSalesAmount = registeredSalesList.reduce((acc, curr) => acc + Number(curr.totalBill || curr.amount || 0), 0);
  const pendingEmptyCount = registeredSalesList.filter((t) => t.emptyReturned === false).length;
  const totalOutstandingBaqaya = registeredSalesList.reduce((acc, curr) => acc + Number(curr.remainingBalance || 0), 0);
  const totalSecurityDepositsHeld = customers.reduce((acc, curr) => acc + Number(curr.securityDeposit || 0), 0);

  // Filtered transactions for Registered Tab
  const filteredRegisteredTxns = registeredSalesList.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customerName && txn.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.issuedCylinderRegNo && txn.issuedCylinderRegNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.returnedCylinderRegNo && txn.returnedCylinderRegNo.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'pending_empty') {
      matchesStatus = txn.emptyReturned === false;
    } else if (statusFilter === 'pending_baqaya') {
      matchesStatus = Number(txn.remainingBalance) > 0;
    } else if (statusFilter === 'completed') {
      matchesStatus = txn.emptyReturned === true && Number(txn.remainingBalance) === 0;
    }

    return matchesSearch && matchesStatus;
  });

  // Filtered transactions for All Invoices Tab
  const filteredAllTxns = transactions.filter((txn) => {
    return (
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customerName && txn.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (txn.cylinderType && txn.cylinderType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  // Open New Refill Modal with auto-generated ID (custom editable)
  const handleOpenNewSaleModal = () => {
    const cust = customers[0] || null;
    const cyl = availableCylinders[0] || null;
    const nextInvoiceId = `INV-2026-00${transactions.length + 1}`;

    setCustomerMode('registered');
    setCylinderMode(availableCylinders.length > 0 ? 'stock' : 'custom');

    setNewSale({
      customInvoiceId: nextInvoiceId,
      customerId: cust?.id || '',
      customCustomerName: '',
      customCustomerPhone: '',
      issuedCylinderId: cyl?.id || '',
      customIssuedCylinderRegNo: 'LPG-PK-11805',
      customIssuedCylinderType: 'Domestic 11.8 kg',
      shopId: shops[0]?.id || 'SHOP-001',
      hasReturnedEmpty: true,
      returnedCylinderRegNo: 'LPG-PK-11801',
      refillAmount: 2850,
      paidAmount: 2850,
      paymentMethod: 'Cash',
    });
    setIsModalOpen(true);
  };

  // Handle New Refill Sale Submission
  const handleSaleSubmit = (e) => {
    e.preventDefault();

    if (!newSale.customInvoiceId || !newSale.customInvoiceId.trim()) {
      toast.error('Please enter a valid Invoice ID / Bill No!');
      return;
    }

    let finalCustomerName = '';
    let finalCustomerId = null;
    let selectedCustObj = null;

    if (customerMode === 'registered') {
      selectedCustObj = customers.find((c) => c.id === newSale.customerId);
      if (!selectedCustObj) {
        toast.error('Please select a registered customer!');
        return;
      }
      finalCustomerName = selectedCustObj.name;
      finalCustomerId = selectedCustObj.id;
    } else {
      if (!newSale.customCustomerName.trim()) {
        toast.error('Please enter Custom Customer Name!');
        return;
      }
      finalCustomerName = newSale.customCustomerName.trim();
    }

    let finalIssuedRegNo = '';
    let finalIssuedType = 'Domestic 11.8 kg';
    let selectedCylObj = null;

    if (cylinderMode === 'stock') {
      selectedCylObj = cylinders.find((c) => c.id === newSale.issuedCylinderId);
      if (!selectedCylObj) {
        toast.error('Please select an available filled cylinder from stock!');
        return;
      }
      finalIssuedRegNo = selectedCylObj.serialNo || selectedCylObj.id;
      finalIssuedType = selectedCylObj.type;
    } else {
      if (!newSale.customIssuedCylinderRegNo.trim()) {
        toast.error('Please enter Custom Cylinder Reg No / Tag!');
        return;
      }
      finalIssuedRegNo = newSale.customIssuedCylinderRegNo.trim();
      finalIssuedType = newSale.customIssuedCylinderType || 'Domestic 11.8 kg';
    }

    const selectedShopObj = shops.find((s) => s.id === newSale.shopId);
    const totalBill = Number(newSale.refillAmount);
    const paid = Number(newSale.paidAmount);
    const remainingBaqaya = Math.max(0, totalBill - paid);

    const createdTxn = {
      id: newSale.customInvoiceId.trim(),
      type: 'sale',
      isRegisteredCustomer: customerMode === 'registered',
      customerId: finalCustomerId,
      customerName: finalCustomerName,
      cylinderId: selectedCylObj?.id || 'CYL-CUSTOM',
      issuedCylinderRegNo: finalIssuedRegNo,
      issuedCylinderType: finalIssuedType,
      cylinderType: finalIssuedType,
      shopId: selectedShopObj?.id || 'SHOP-001',
      shopName: selectedShopObj?.name || 'Main Central Depot',
      amount: totalBill,
      totalBill: totalBill,
      paidAmount: paid,
      remainingBalance: remainingBaqaya,
      securityDeposit: selectedCustObj ? (selectedCustObj.securityDeposit || 4500) : 0,
      emptyReturned: newSale.hasReturnedEmpty,
      returnedCylinderRegNo: newSale.hasReturnedEmpty ? (newSale.returnedCylinderRegNo || 'CYL-EMPTY-RET') : null,
      paymentMethod: newSale.paymentMethod,
      date: new Date().toISOString(),
      status: (newSale.hasReturnedEmpty && remainingBaqaya === 0) ? 'Completed' : 'Pending Balance & Empty',
    };

    // 1. Dispatch add transaction
    dispatch(addTransaction(createdTxn));

    // 2. Update cylinder status in inventory if stock selected
    if (cylinderMode === 'stock' && selectedCylObj) {
      dispatch(
        updateCylinderStatus({
          id: selectedCylObj.id,
          status: 'customer',
          customerId: finalCustomerId,
          customerName: finalCustomerName,
        })
      );
      if (finalCustomerId) {
        dispatch(
          assignCylinder({
            customerId: finalCustomerId,
            cylinderId: selectedCylObj.id,
          })
        );
      }
    }

    // 3. Update customer outstanding balance if registered
    if (finalCustomerId && remainingBaqaya > 0) {
      dispatch(
        updateCustomerBalance({
          customerId: finalCustomerId,
          amountToAdd: remainingBaqaya,
        })
      );
    }

    // 4. Update empty cylinder status in inventory if returned
    if (newSale.hasReturnedEmpty && newSale.returnedCylinderRegNo) {
      const emptyCylObj = cylinders.find((c) => c.serialNo === newSale.returnedCylinderRegNo || c.id === newSale.returnedCylinderRegNo);
      if (emptyCylObj) {
        dispatch(
          updateCylinderStatus({
            id: emptyCylObj.id,
            status: 'refill',
            customerId: null,
            customerName: null,
          })
        );
        if (finalCustomerId) {
          dispatch(
            returnCylinder({
              customerId: finalCustomerId,
              cylinderId: emptyCylObj.id,
            })
          );
        }
      }
    }

    toast.success(`Invoice ${createdTxn.id} created! Total: PKR ${totalBill.toLocaleString()} (Paid: PKR ${paid.toLocaleString()}, Baqaya: PKR ${remainingBaqaya.toLocaleString()})`);
    setIsModalOpen(false);
    setReceiptTxn(createdTxn);
  };

  // Open Edit Modal for existing sale
  const handleOpenEditModal = (txn) => {
    setEditModalTxn(txn);
    setEditForm({
      originalId: txn.id,
      id: txn.id,
      customerName: txn.customerName || '',
      issuedCylinderRegNo: txn.issuedCylinderRegNo || '',
      returnedCylinderRegNo: txn.returnedCylinderRegNo || '',
      totalBill: txn.totalBill || txn.amount || 0,
      paidAmount: txn.paidAmount ?? txn.amount ?? 0,
      remainingBalance: txn.remainingBalance || 0,
      paymentMethod: txn.paymentMethod || 'Cash',
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.id || !editForm.id.trim()) {
      toast.error('Invoice ID cannot be empty!');
      return;
    }
    if (!editForm.customerName || !editForm.customerName.trim()) {
      toast.error('Customer name cannot be empty!');
      return;
    }

    const bill = Number(editForm.totalBill);
    const paid = Number(editForm.paidAmount);
    const remaining = Math.max(0, bill - paid);

    const updatedData = {
      originalId: editForm.originalId,
      id: editForm.id.trim(),
      customerName: editForm.customerName.trim(),
      issuedCylinderRegNo: editForm.issuedCylinderRegNo.trim(),
      returnedCylinderRegNo: editForm.returnedCylinderRegNo.trim() || null,
      totalBill: bill,
      amount: bill,
      paidAmount: paid,
      remainingBalance: remaining,
      paymentMethod: editForm.paymentMethod,
      status: (editModalTxn.emptyReturned && remaining === 0) ? 'Completed' : 'Pending Balance & Empty',
    };

    dispatch(updateTransaction(updatedData));
    toast.success(`Invoice ${editForm.id} updated successfully!`);
    setEditModalTxn(null);
  };

  // Handle Receiving Empty Cylinder for Pending Transaction
  const handleConfirmReceiveEmpty = (e) => {
    e.preventDefault();
    if (!emptyReturnModal) return;

    dispatch(
      markEmptyCylinderReturned({
        txnId: emptyReturnModal.id,
        returnedCylinderRegNo: returnRegNoInput || 'CYL-RET-REC',
      })
    );

    const returnedCylObj = cylinders.find((c) => c.serialNo === returnRegNoInput || c.id === returnRegNoInput);
    if (returnedCylObj) {
      dispatch(
        updateCylinderStatus({
          id: returnedCylObj.id,
          status: 'refill',
          customerId: null,
          customerName: null,
        })
      );
      if (emptyReturnModal.customerId) {
        dispatch(
          returnCylinder({
            customerId: emptyReturnModal.customerId,
            cylinderId: returnedCylObj.id,
          })
        );
      }
    }

    toast.success(`Empty cylinder ${returnRegNoInput || ''} received successfully! Status updated.`);
    setEmptyReturnModal(null);
    setReturnRegNoInput('');
  };

  // Handle Collecting Outstanding Baqaya Payment
  const handleConfirmPayBaqaya = (e) => {
    e.preventDefault();
    if (!payBaqayaModal) return;

    const amountPaidNow = Number(baqayaPaymentInput);
    if (!amountPaidNow || amountPaidNow <= 0) {
      toast.error('Please enter a valid payment amount!');
      return;
    }

    dispatch(
      payOutstandingBalance({
        txnId: payBaqayaModal.id,
        paymentReceived: amountPaidNow,
      })
    );

    if (payBaqayaModal.customerId) {
      dispatch(
        updateCustomerBalance({
          customerId: payBaqayaModal.customerId,
          amountToAdd: -amountPaidNow,
        })
      );
    }

    toast.success(`Received PKR ${amountPaidNow.toLocaleString()} payment against invoice ${payBaqayaModal.id}!`);
    setPayBaqayaModal(null);
    setBaqayaPaymentInput('');
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Page Header (Matching Expense & Purchase design) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2.5 bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7] rounded-xl">
              <FaGasPump className="text-xl" />
            </span>
            Sales & Refill Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fully custom Invoice IDs, custom customer names, cylinder Reg Nos, refill prices & baqaya tracking
          </p>
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenNewSaleModal}
            className="btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-md shadow-[#A5D6A7]/25 transition-all whitespace-nowrap cursor-pointer"
          >
            <FaPlus className="text-xs" /> New Refill / Exchange Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards Summary (Adjusted to fit text cleanly without breaking/overflowing) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Refill Revenue */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaShoppingCart />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate" title="Refill Revenue">
              Refill Revenue
            </p>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {formatCurrency(totalRegisteredSalesAmount)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-indigo-600 font-bold truncate block mt-0.5">
              {registeredSalesList.length} Refill Exchanges
            </span>
          </div>
        </div>

        {/* Pending Baqaya */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaMoneyBillWave />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate" title="Pending Baqaya (Receivable)">
              Pending Baqaya
            </p>
            <h3 className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5 tracking-tight truncate">
              {formatCurrency(totalOutstandingBaqaya)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate block mt-0.5">
              Remaining Unpaid Balance
            </span>
          </div>
        </div>

        {/* Pending Empty Returns */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaExclamationTriangle />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate" title="Pending Empty Returns">
              Pending Empty Returns
            </p>
            <h3 className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 tracking-tight truncate">
              {pendingEmptyCount} Cylinders
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate block mt-0.5">
              Awaiting Empty Return
            </span>
          </div>
        </div>

        {/* Total Security Deposits */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shrink-0">
            <FaShieldAlt />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate" title="Total Security Deposits">
              Security Deposits
            </p>
            <h3 className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight truncate">
              {formatCurrency(totalSecurityDepositsHeld)}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate block mt-0.5">
              Held from Registered Accounts
            </span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar Container */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Tab Switchers */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${activeTab === 'registered'
                ? 'bg-[#A5D6A7] text-[#0f2912] shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>Customer Refill Invoices</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center space-x-2 ${activeTab === 'all'
                ? 'bg-[#A5D6A7] text-[#0f2912] shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>All Invoices & Transactions</span>
            </button>
          </div>

          {/* Quick Filter dropdown for Registered Tab */}
          {activeTab === 'registered' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-[#A5D6A7]/30"
              >
                <option value="all">All Refill Invoices</option>
                <option value="pending_empty">Pending Empty Return</option>
                <option value="pending_baqaya">Pending Baqaya Payment</option>
                <option value="completed">Fully Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={14} />
          <input
            type="text"
            placeholder={
              activeTab === 'registered'
                ? "Search by Customer Name, Custom Invoice ID, Issued Cylinder Reg No, Returned Empty Reg No..."
                : "Search all transactions..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7] w-full"
          />
        </div>
      </div>

      {/* Main Content View based on Tab */}
      {activeTab === 'registered' ? (
        /* CUSTOMERS REFILL & EXCHANGE TABLE */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Invoice ID</th>
                  <th className="whitespace-nowrap">Customer</th>
                  <th className="whitespace-nowrap">Security</th>
                  <th className="whitespace-nowrap">Issued Cylinder</th>
                  <th className="whitespace-nowrap">Empty Return</th>
                  <th className="whitespace-nowrap">Refill Bill</th>
                  <th className="whitespace-nowrap">Paid Amount</th>
                  <th className="whitespace-nowrap">Baqaya (Due)</th>
                  <th className="whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegisteredTxns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400 dark:text-slate-500 font-medium text-xs">
                      No refill transactions found matching search.
                    </td>
                  </tr>
                ) : (
                  filteredRegisteredTxns.map((txn) => {
                    const custObj = customers.find((c) => c.id === txn.customerId);
                    const isBaqayaPending = Number(txn.remainingBalance) > 0;

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Txn ID & Date */}
                        <td className="whitespace-nowrap">
                          <p className="font-mono text-xs font-extrabold text-[#0f2912] dark:text-[#A5D6A7] bg-[#A5D6A7]/20 px-2 py-0.5 rounded-md border border-[#A5D6A7]/40 w-fit">
                            {txn.id}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">{formatDate(txn.date)}</p>
                        </td>

                        {/* Customer Info */}
                        <td className="whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-[#A5D6A7] text-[#0f2912] flex items-center justify-center font-black text-[11px] shrink-0">
                              {(txn.customerName || 'CU').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white text-xs">{txn.customerName || 'Customer'}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{custObj?.phone || 'Custom Customer'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Security Deposit */}
                        <td className="whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <FaShieldAlt size={10} />
                            <span>{formatCurrency(txn.securityDeposit || custObj?.securityDeposit || 0)}</span>
                          </span>
                        </td>

                        {/* Issued Cylinder */}
                        <td className="whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {txn.issuedCylinderRegNo || txn.cylinderId || 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1.5">{txn.issuedCylinderType || txn.cylinderType || '11.8 kg'}</span>
                        </td>

                        {/* Empty Cylinder Return Status */}
                        <td className="whitespace-nowrap">
                          {txn.emptyReturned ? (
                            <span className="badge-premium badge-success flex items-center space-x-1 w-fit">
                              <FaCheckCircle size={10} />
                              <span>{txn.returnedCylinderRegNo || 'Returned'}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setEmptyReturnModal(txn);
                                setReturnRegNoInput('');
                              }}
                              className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-lg text-[11px] font-black flex items-center space-x-1 border border-amber-300 dark:border-amber-800/80 cursor-pointer transition-all whitespace-nowrap"
                            >
                              <FaUndo size={10} />
                              <span>Pending (Receive)</span>
                            </button>
                          )}
                        </td>

                        {/* Total Refill Bill */}
                        <td className="whitespace-nowrap font-extrabold text-slate-900 dark:text-white text-xs">
                          {formatCurrency(txn.totalBill || txn.amount || 0)}
                        </td>

                        {/* Paid Amount */}
                        <td className="whitespace-nowrap font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                          {formatCurrency(txn.paidAmount ?? txn.amount ?? 0)}
                        </td>

                        {/* Remaining Baqaya */}
                        <td className="whitespace-nowrap">
                          {isBaqayaPending ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                                {formatCurrency(txn.remainingBalance)} Due
                              </span>
                              <button
                                onClick={() => {
                                  setPayBaqayaModal(txn);
                                  setBaqayaPaymentInput(txn.remainingBalance);
                                }}
                                className="text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-2 py-0.5 rounded transition-colors cursor-pointer whitespace-nowrap shadow-sm"
                              >
                                Pay
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                              Clear (Rs 0)
                            </span>
                          )}
                        </td>

                        {/* Actions: Edit & Receipt */}
                        <td className="whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditModal(txn)}
                              className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap"
                              title="Edit Custom Invoice details"
                            >
                              <FaEdit size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setReceiptTxn(txn)}
                              className="p-1.5 bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7] hover:bg-[#A5D6A7]/30 border border-[#A5D6A7]/40 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <FaReceipt size={12} />
                              <span>Receipt</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ALL TRANSACTIONS TABLE */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="whitespace-nowrap">Txn Ref ID</th>
                  <th className="whitespace-nowrap">Type</th>
                  <th className="whitespace-nowrap">Customer</th>
                  <th className="whitespace-nowrap">Cylinder / Item</th>
                  <th className="whitespace-nowrap">Outlet</th>
                  <th className="whitespace-nowrap">Total Bill</th>
                  <th className="whitespace-nowrap">Payment</th>
                  <th className="whitespace-nowrap">Date</th>
                  <th className="whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{txn.id}</td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`badge-premium ${txn.type === 'sale' ? 'badge-success' : txn.type === 'return' ? 'badge-warning' : 'badge-info'
                          }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-semibold text-slate-900 dark:text-white text-xs">{txn.customerName || '-'}</td>
                    <td className="whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium text-xs">{txn.issuedCylinderRegNo || txn.cylinderType || '-'}</td>
                    <td className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{txn.shopName || '-'}</td>
                    <td className="whitespace-nowrap font-bold text-slate-900 dark:text-white text-xs">{formatCurrency(txn.totalBill || txn.amount || 0)}</td>
                    <td className="whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {txn.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">{formatDate(txn.date)}</td>
                    <td className="whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(txn)}
                          className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FaEdit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setReceiptTxn(txn)}
                          className="p-1.5 bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7] hover:bg-[#A5D6A7]/30 border border-[#A5D6A7]/40 rounded-lg text-xs font-bold inline-flex items-center space-x-1 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FaReceipt size={12} />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW REGISTERED REFILL SALE MODAL (FULLY CUSTOMIZABLE & THEME RESPONSIVE) */}
      {isModalOpen && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative my-auto w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#0f2912] dark:text-[#A5D6A7] flex items-center space-x-2">
                    <FaGasPump className="text-[#0f2912] dark:text-[#A5D6A7]" />
                    <span>New Refill & Exchange Invoice</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can customize the Invoice ID, Customer Name, and Cylinder Tag as needed.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSaleSubmit} className="space-y-4">
                {/* 0. Custom Invoice ID Field */}
                <div className="p-3.5 bg-[#A5D6A7]/15 dark:bg-slate-800/80 rounded-2xl border border-[#A5D6A7]/40 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-[#0f2912] dark:text-[#A5D6A7] uppercase tracking-wide flex items-center space-x-1.5">
                      <FaHashtag />
                      <span>Custom Invoice ID / Bill No</span>
                    </label>
                    <span className="text-[10px] font-extrabold text-[#0f2912] dark:text-[#A5D6A7] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-[#A5D6A7]/40 dark:border-slate-700">
                      ✨ Fully Editable
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-101, BILL-ALI-01, 2026-REF-55"
                    value={newSale.customInvoiceId}
                    onChange={(e) => setNewSale({ ...newSale, customInvoiceId: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border border-[#A5D6A7]/40 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm outline-none font-mono font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/40 focus:border-[#A5D6A7]"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    * Type any easy-to-remember Invoice ID or receipt code here.
                  </p>
                </div>

                {/* 1. Customer Selection / Custom Customer Mode Toggle */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase flex items-center space-x-1.5">
                      <FaUser className="text-[#0f2912] dark:text-[#A5D6A7]" />
                      <span>Customer Details</span>
                    </label>

                    {/* Mode Toggle pills */}
                    <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCustomerMode('registered')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${customerMode === 'registered'
                          ? 'bg-[#A5D6A7] text-[#0f2912] font-black shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        Registered Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerMode('custom')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${customerMode === 'custom'
                          ? 'bg-[#A5D6A7] text-[#0f2912] font-black shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        Custom / Walk-in Name
                      </button>
                    </div>
                  </div>

                  {customerMode === 'registered' ? (
                    <div>
                      <select
                        value={newSale.customerId}
                        onChange={(e) => setNewSale({ ...newSale, customerId: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone}) - {c.category} (Security: PKR {c.securityDeposit})
                          </option>
                        ))}
                      </select>

                      {(() => {
                        const selectedCust = customers.find((c) => c.id === newSale.customerId);
                        if (!selectedCust) return null;
                        return (
                          <div className="mt-2 p-2 bg-indigo-50/80 dark:bg-indigo-950/60 rounded-xl border border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs">
                            <span className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-1">
                              <FaShieldAlt className="text-indigo-600 dark:text-indigo-400" />
                              <span>Registered Security Deposit:</span>
                            </span>
                            <span className="font-extrabold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                              {formatCurrency(selectedCust.securityDeposit || 0)}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          Custom Customer Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chaudhry Sweets / Malik Traders / Walk-in Customer"
                          value={newSale.customCustomerName}
                          onChange={(e) => setNewSale({ ...newSale, customCustomerName: e.target.value })}
                          className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Issued Cylinder Mode Toggle */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase flex items-center space-x-1.5">
                      <FaTag className="text-[#0f2912] dark:text-[#A5D6A7]" />
                      <span>Issued Cylinder Tag / Reg No</span>
                    </label>

                    {/* Cylinder Mode Toggle pills */}
                    <div className="flex items-center space-x-1 bg-slate-200/80 dark:bg-slate-700 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCylinderMode('stock')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${cylinderMode === 'stock'
                          ? 'bg-[#A5D6A7] text-[#0f2912] font-black shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        From In-Stock List ({availableCylinders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCylinderMode('custom')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${cylinderMode === 'custom'
                          ? 'bg-[#A5D6A7] text-[#0f2912] font-black shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        Custom Tag / Reg No
                      </button>
                    </div>
                  </div>

                  {cylinderMode === 'stock' ? (
                    <div>
                      {availableCylinders.length === 0 ? (
                        <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center justify-between">
                          <span>No cylinders in stock right now! Switch to Custom Tag mode below:</span>
                          <button
                            type="button"
                            onClick={() => setCylinderMode('custom')}
                            className="bg-amber-600 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold"
                          >
                            Use Custom Tag
                          </button>
                        </div>
                      ) : (
                        <select
                          value={newSale.issuedCylinderId}
                          onChange={(e) => {
                            const cyl = cylinders.find((c) => c.id === e.target.value);
                            let ref = 2850;
                            if (cyl?.type.includes('45.4')) { ref = 9500; }
                            setNewSale({
                              ...newSale,
                              issuedCylinderId: e.target.value,
                              refillAmount: ref,
                              paidAmount: ref,
                            });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                        >
                          {availableCylinders.map((cyl) => (
                            <option key={cyl.id} value={cyl.id}>
                              Reg No: {cyl.serialNo || cyl.id} — {cyl.type} ({cyl.shopName})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          Custom Cylinder Reg No / Tag
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CYL-RED-01 / 11.8kg-CYL"
                          value={newSale.customIssuedCylinderRegNo}
                          onChange={(e) => setNewSale({ ...newSale, customIssuedCylinderRegNo: e.target.value })}
                          className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                          Cylinder Type
                        </label>
                        <select
                          value={newSale.customIssuedCylinderType}
                          onChange={(e) => setNewSale({ ...newSale, customIssuedCylinderType: e.target.value })}
                          className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer font-semibold text-slate-900 dark:text-white"
                        >
                          <option value="Domestic 11.8 kg">Domestic 11.8 kg</option>
                          <option value="Commercial 45.4 kg">Commercial 45.4 kg</option>
                          <option value="Special Commercial 35 kg">Special Commercial 35 kg</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Empty Cylinder Return Tracking */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase flex items-center space-x-1.5">
                      <FaUndo className="text-amber-500" />
                      <span>Empty Cylinder Received Back?</span>
                    </label>

                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="emptyReturnedRadio"
                          checked={newSale.hasReturnedEmpty === true}
                          onChange={() => setNewSale({ ...newSale, hasReturnedEmpty: true })}
                          className="accent-[#81C784]"
                        />
                        <span>Yes (Received)</span>
                      </label>
                      <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="emptyReturnedRadio"
                          checked={newSale.hasReturnedEmpty === false}
                          onChange={() => setNewSale({ ...newSale, hasReturnedEmpty: false })}
                          className="accent-[#81C784]"
                        />
                        <span>No (Pending Return)</span>
                      </label>
                    </div>
                  </div>

                  {newSale.hasReturnedEmpty && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                        Returned Empty Cylinder Registration No / Serial No
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LPG-PK-11801 / EMPTY-TAG-01"
                        value={newSale.returnedCylinderRegNo}
                        onChange={(e) => setNewSale({ ...newSale, returnedCylinderRegNo: e.target.value })}
                        className="mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none font-mono font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Payment Amounts & Baqaya Ledger */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                      Gas Refill Price (PKR)
                    </label>
                    <input
                      type="number"
                      value={newSale.refillAmount}
                      onChange={(e) => {
                        const amt = Number(e.target.value);
                        setNewSale({ ...newSale, refillAmount: amt, paidAmount: amt });
                      }}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">
                      Paid Amount (PKR)
                    </label>
                    <input
                      type="number"
                      value={newSale.paidAmount}
                      onChange={(e) => setNewSale({ ...newSale, paidAmount: Number(e.target.value) })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                    />
                  </div>
                </div>

                {/* Live Baqaya Summary Box */}
                {(() => {
                  const bill = Number(newSale.refillAmount || 0);
                  const paid = Number(newSale.paidAmount || 0);
                  const baqaya = Math.max(0, bill - paid);

                  return (
                    <div className="p-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl space-y-1.5 shadow-md">
                      <div className="flex justify-between text-xs font-semibold text-slate-300">
                        <span>Total Refill Bill:</span>
                        <span>{formatCurrency(bill)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-emerald-400">
                        <span>Paid Cash/Online:</span>
                        <span>{formatCurrency(paid)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold border-t border-slate-700 pt-1 text-amber-300">
                        <span>Remaining Baqaya (Due Balance):</span>
                        <span className={baqaya > 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                          {formatCurrency(baqaya)}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Payment Method */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase">Payment Method</label>
                  <select
                    value={newSale.paymentMethod}
                    onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer text-slate-900 dark:text-white focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online Bank Transfer">Online Bank Transfer</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                    <option value="Customer Ledger Credit">Customer Ledger Credit</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6"
                  >
                    Confirm & Save Invoice
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* EDIT INVOICE MODAL (FULL CUSTOMIZATION & THEME SUPPORT) */}
      {editModalTxn && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center space-x-2">
                  <FaEdit className="text-indigo-600 dark:text-indigo-400" />
                  <span>Edit Custom Invoice Details</span>
                </h3>
                <button
                  onClick={() => setEditModalTxn(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Invoice ID / Bill No (Custom Editable)
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.id}
                    onChange={(e) => setEditForm({ ...editForm, id: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-mono font-black text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Customer Name (Custom Editable)
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.customerName}
                    onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Issued Cylinder Reg No
                    </label>
                    <input
                      type="text"
                      value={editForm.issuedCylinderRegNo}
                      onChange={(e) => setEditForm({ ...editForm, issuedCylinderRegNo: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Returned Empty Reg No
                    </label>
                    <input
                      type="text"
                      value={editForm.returnedCylinderRegNo}
                      onChange={(e) => setEditForm({ ...editForm, returnedCylinderRegNo: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Total Bill (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.totalBill}
                      onChange={(e) => setEditForm({ ...editForm, totalBill: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Paid Amount (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.paidAmount}
                      onChange={(e) => setEditForm({ ...editForm, paidAmount: e.target.value })}
                      className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Method</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online Bank Transfer">Online Bank Transfer</option>
                    <option value="JazzCash / EasyPaisa">JazzCash / EasyPaisa</option>
                    <option value="Customer Ledger Credit">Customer Ledger Credit</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditModalTxn(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-5">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* QUICK RECEIVE EMPTY CYLINDER MODAL */}
      {emptyReturnModal && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center space-x-2">
                  <FaUndo className="text-amber-500" />
                  <span>Receive Pending Empty Cylinder</span>
                </h3>
                <button
                  onClick={() => setEmptyReturnModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleConfirmReceiveEmpty} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Customer <strong className="text-slate-800 dark:text-white">{emptyReturnModal.customerName}</strong> is returning their empty cylinder for Invoice #{emptyReturnModal.id}:
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Enter Empty Cylinder Registration No / Serial No
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LPG-PK-11801"
                    value={returnRegNoInput}
                    onChange={(e) => setReturnRegNoInput(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEmptyReturnModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Mark Empty Received
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* QUICK PAY BAQAYA BALANCE MODAL */}
      {payBaqayaModal && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center space-x-2">
                  <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400" />
                  <span>Receive Baqaya Payment</span>
                </h3>
                <button
                  onClick={() => setPayBaqayaModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleConfirmPayBaqaya} className="space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                  <p className="text-slate-500 dark:text-slate-400">Invoice Ref: <strong className="text-slate-800 dark:text-white">{payBaqayaModal.id}</strong></p>
                  <p className="text-slate-500 dark:text-slate-400">Customer: <strong className="text-slate-800 dark:text-white">{payBaqayaModal.customerName}</strong></p>
                  <p className="text-slate-500 dark:text-slate-400">Current Outstanding Baqaya: <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{formatCurrency(payBaqayaModal.remainingBalance)}</strong></p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Payment Received Now (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={baqayaPaymentInput}
                    onChange={(e) => setBaqayaPaymentInput(e.target.value)}
                    className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-extrabold text-emerald-600 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-[#A5D6A7]/30 focus:border-[#A5D6A7]"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setPayBaqayaModal(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary text-xs py-2 px-4">
                    Confirm Baqaya Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

      {/* PRINTABLE RECEIPT MODAL (THEME RESPONSIVE) */}
      {receiptTxn && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.25 }}
              className="relative my-auto w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-left font-sans text-slate-900 dark:text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-[#0f2912] dark:text-[#A5D6A7] bg-[#A5D6A7]/20 border border-[#A5D6A7]/40 px-2.5 py-1 rounded-lg">RECEIPT #{receiptTxn.id}</span>
                <button
                  onClick={() => setReceiptTxn(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="text-center py-4">
                <div className="w-14 h-14 bg-[#A5D6A7]/20 text-[#0f2912] dark:text-[#A5D6A7] rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-2xl border border-[#A5D6A7]/40">
                  <FaCheckCircle className="text-emerald-500" />
                </div>
                <h3 className="font-extrabold text-[#0f2912] dark:text-[#A5D6A7] text-xl">Binsuleman Enterprise</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Customer Refill & Exchange Invoice</p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-200 bg-[#A5D6A7]/10 dark:bg-slate-800/80 p-4 rounded-2xl border border-[#A5D6A7]/30 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Invoice ID:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptTxn.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptTxn.customerName || 'Walk-in'}</span>
                </div>

                {receiptTxn.securityDeposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Security Deposit Held:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(receiptTxn.securityDeposit)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Issued Cylinder (Reg No):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{receiptTxn.issuedCylinderRegNo || receiptTxn.cylinderId || '-'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Empty Returned:</span>
                  <span className={receiptTxn.emptyReturned ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'font-bold text-rose-600 dark:text-rose-400'}>
                    {receiptTxn.emptyReturned ? `Yes (${receiptTxn.returnedCylinderRegNo || 'Reg Return'})` : 'No (Pending)'}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Refill Price:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(receiptTxn.totalBill || receiptTxn.amount || 0)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Paid Amount:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(receiptTxn.paidAmount ?? receiptTxn.amount ?? 0)}</span>
                </div>

                <div className="flex justify-between text-sm pt-1 border-t border-slate-200 dark:border-slate-700 font-extrabold">
                  <span className="text-slate-700 dark:text-slate-200">Remaining Baqaya (Due):</span>
                  <span className={Number(receiptTxn.remainingBalance) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                    {formatCurrency(receiptTxn.remainingBalance || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] pt-1 text-slate-400 dark:text-slate-500">
                  <span>Date:</span>
                  <span>{formatDate(receiptTxn.date)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  onClick={() => window.print()}
                  className="btn-primary flex items-center space-x-2 text-xs w-full justify-center py-3 shadow-[#A5D6A7]/30"
                >
                  <FaPrint />
                  <span>Print Official Invoice</span>
                </button>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Sales;