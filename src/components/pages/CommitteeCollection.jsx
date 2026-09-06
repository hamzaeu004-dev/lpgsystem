import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaHandHoldingUsd,
  FaPlus,
  FaSearch,
  FaUsers,
  FaCoins,
  FaHistory,
  FaUserPlus,
  FaCheckCircle,
  FaTimes,
  FaPrint,
  FaUserCheck,
  FaPhoneAlt,
  FaCalendarDay,
  FaExclamationCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CommitteeCollection = () => {
  // Main view tab: 'members' | 'history'
  const [activeTab, setActiveTab] = useState('members');

  // Member Status Filter: 'All' | 'Paid' | 'Pending' | 'Completed'
  const [statusFilter, setStatusFilter] = useState('All');

  // Search query
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const todayStr = '2026-09-04';

  // Members State
  const [members, setMembers] = useState([
    { id: 1, name: 'Tariq Mahmood', phone: '0300-1234567', monthlyAmount: 10000, totalTarget: 60000, totalPaid: 30000, status: 'Active' },
    { id: 2, name: 'Muhammad Usman', phone: '0321-7654321', monthlyAmount: 10000, totalTarget: 60000, totalPaid: 60000, status: 'Completed' },
    { id: 3, name: 'Rashid Ali', phone: '0333-9876543', monthlyAmount: 5000, totalTarget: 30000, totalPaid: 15000, status: 'Active' },
    { id: 4, name: 'Haji Bilal Ahmed', phone: '0312-5554433', monthlyAmount: 15000, totalTarget: 90000, totalPaid: 45000, status: 'Active' },
    { id: 5, name: 'Zubair Khan', phone: '0345-1122334', monthlyAmount: 10000, totalTarget: 60000, totalPaid: 10000, status: 'Active' },
    { id: 6, name: 'Kamran Akmal', phone: '0301-9988776', monthlyAmount: 10000, totalTarget: 60000, totalPaid: 0, status: 'Active' }
  ]);

  // Collections Log History State
  const [collections, setCollections] = useState([
    { id: 'COM-1004', date: todayStr, memberId: 4, memberName: 'Haji Bilal Ahmed', amount: 15000, receivedBy: 'Manager (Hamza)', paymentMode: 'Bank Transfer', notes: 'September installment' },
    { id: 'COM-1003', date: '2026-09-03', memberId: 3, memberName: 'Rashid Ali', amount: 5000, receivedBy: 'Admin (Ali)', paymentMode: 'Cash', notes: 'Counter cash' },
    { id: 'COM-1002', date: '2026-09-02', memberId: 2, memberName: 'Muhammad Usman', amount: 10000, receivedBy: 'Cashier (Rizwan)', paymentMode: 'EasyPaisa', notes: 'TRX: 98421049' },
    { id: 'COM-1001', date: '2026-09-01', memberId: 1, memberName: 'Tariq Mahmood', amount: 10000, receivedBy: 'Admin (Ali)', paymentMode: 'Cash', notes: 'Full payment' }
  ]);

  // Forms State
  const [collectionForm, setCollectionForm] = useState({
    memberId: '',
    amount: '',
    receivedBy: 'Admin (Ali)',
    paymentMode: 'Cash',
    date: todayStr,
    notes: ''
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    monthlyAmount: '',
    totalTarget: ''
  });

  // Open Record Payment Modal for specific member
  const handleQuickCollect = (member) => {
    setCollectionForm({
      memberId: member.id.toString(),
      amount: member.monthlyAmount.toString(),
      receivedBy: 'Admin (Ali)',
      paymentMode: 'Cash',
      date: todayStr,
      notes: ''
    });
    setIsCollectModalOpen(true);
  };

  // Submit Collection Entry
  const handleRecordCollection = (e) => {
    e.preventDefault();
    if (!collectionForm.memberId || !collectionForm.amount) {
      toast.error('Please select a member and enter amount');
      return;
    }

    const selectedMember = members.find((m) => m.id === parseInt(collectionForm.memberId));
    if (!selectedMember) return;

    const amountNum = parseFloat(collectionForm.amount);
    const newId = `COM-${1000 + collections.length + 1}`;

    const newCollection = {
      id: newId,
      date: collectionForm.date,
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount: amountNum,
      receivedBy: collectionForm.receivedBy,
      paymentMode: collectionForm.paymentMode,
      notes: collectionForm.notes || 'Committee Collection'
    };

    setCollections([newCollection, ...collections]);

    // Update member total paid & status
    setMembers(
      members.map((m) => {
        if (m.id === selectedMember.id) {
          const updatedPaid = m.totalPaid + amountNum;
          return {
            ...m,
            totalPaid: updatedPaid,
            status: updatedPaid >= m.totalTarget ? 'Completed' : 'Active'
          };
        }
        return m;
      })
    );

    toast.success(`Payment recorded successfully! Receipt #${newId}`);
    setIsCollectModalOpen(false);
  };

  // Submit New Member
  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberForm.name || !memberForm.monthlyAmount) {
      toast.error('Please fill in Member Name and Monthly Amount');
      return;
    }

    const monthlyNum = parseFloat(memberForm.monthlyAmount);
    const targetNum = memberForm.totalTarget ? parseFloat(memberForm.totalTarget) : monthlyNum * 6;

    const newMember = {
      id: members.length + 1,
      name: memberForm.name,
      phone: memberForm.phone || 'N/A',
      monthlyAmount: monthlyNum,
      totalTarget: targetNum,
      totalPaid: 0,
      status: 'Active'
    };

    setMembers([...members, newMember]);
    toast.success(`New Member (${newMember.name}) added!`);
    setIsMemberModalOpen(false);
    setMemberForm({ name: '', phone: '', monthlyAmount: '', totalTarget: '' });
  };

  // --- Computations ---
  const todayCollections = collections.filter((c) => c.date === todayStr);
  const todayCollectedAmount = todayCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalCollectedAllTime = collections.reduce((sum, c) => sum + c.amount, 0);

  const membersWithCalculatedStatus = members.map((m) => {
    const paidInSept = collections
      .filter((c) => c.memberId === m.id && c.date.startsWith('2026-09'))
      .reduce((sum, c) => sum + c.amount, 0);

    const isPaid = paidInSept >= m.monthlyAmount || m.status === 'Completed';
    const pendingBalance = Math.max(0, m.totalTarget - m.totalPaid);

    return {
      ...m,
      isPaid,
      pendingBalance
    };
  });

  const paidCount = membersWithCalculatedStatus.filter((m) => m.isPaid).length;
  const unpaidCount = membersWithCalculatedStatus.filter((m) => !m.isPaid).length;
  const totalPendingBalance = membersWithCalculatedStatus.reduce((sum, m) => sum + m.pendingBalance, 0);

  // Filtered members
  const displayedMembers = membersWithCalculatedStatus.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);

    if (statusFilter === 'Paid') return matchSearch && m.isPaid;
    if (statusFilter === 'Pending') return matchSearch && !m.isPaid && m.status !== 'Completed';
    if (statusFilter === 'Completed') return matchSearch && m.status === 'Completed';
    return matchSearch;
  });

  // Filtered collections
  const displayedCollections = collections.filter(
    (c) =>
      c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.receivedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6 min-h-full">
      {/* 1. Page Header (Full Width) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Committee Collection
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Track member contributions, monthly dues, staff collections, and payment receipts.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm whitespace-nowrap"
          >
            + Add Member
          </button>
          <button
            onClick={() => {
              setCollectionForm({
                memberId: '',
                amount: '',
                receivedBy: 'Admin (Ali)',
                paymentMode: 'Cash',
                date: todayStr,
                notes: ''
              });
              setIsCollectModalOpen(true);
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#A5D6A7] hover:bg-[#81C784] text-[#0f2912] font-black text-xs shadow-md shadow-[#A5D6A7]/20 transition-all whitespace-nowrap"
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* 2. Specific Stat Cards Only (Full Width Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Today's Collection */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
            <FaCalendarDay />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Today's Collection
            </p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              Rs. {todayCollectedAmount.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold truncate block mt-0.5">{todayCollections.length} Entries Today</span>
          </div>
        </div>

        {/* Paid Members */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold shrink-0">
            <FaCheckCircle />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Paid Members
            </p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {paidCount} Members
            </h3>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold truncate block mt-0.5">Current Month Paid</span>
          </div>
        </div>

        {/* Pending Members */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-rose-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shrink-0">
            <FaExclamationCircle />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Pending Dues
            </p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              {unpaidCount} Members
            </h3>
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold truncate block mt-0.5">
              Rs. {totalPendingBalance.toLocaleString()} Outstanding
            </span>
          </div>
        </div>

        {/* Total Funds Collected */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold shrink-0">
            <FaCoins />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              Total Fund Collected
            </p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 tracking-tight truncate">
              Rs. {totalCollectedAllTime.toLocaleString()}
            </h3>
            <span className="text-[10px] text-slate-400 font-bold truncate block mt-0.5">All-time Accumulation</span>
          </div>
        </div>
      </div>

      {/* 3. Main Full-Width Table View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full">
        {/* Navigation & Search Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main 2 View Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'members'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaUsers /> Member Directory & Dues
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaHistory /> Collection History
            </button>
          </div>

          {/* Status Filter & Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {activeTab === 'members' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-500"
              >
                <option value="All">All Members ({members.length})</option>
                <option value="Paid">Paid ({paidCount})</option>
                <option value="Pending">Pending Dues ({unpaidCount})</option>
                <option value="Completed">Completed</option>
              </select>
            )}

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-3 text-xs text-slate-400" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* View 1: Member Table */}
        {activeTab === 'members' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-extrabold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 whitespace-nowrap">Member Name</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Monthly Due</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Current Month Status</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Total Paid</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Pending Balance</th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {displayedMembers.length > 0 ? (
                  displayedMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs flex-shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                              {m.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <FaPhoneAlt className="text-[8px]" /> {m.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        Rs. {m.monthlyAmount.toLocaleString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {m.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                            Completed
                          </span>
                        ) : m.isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <FaCheckCircle className="text-[10px]" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {m.totalPaid.toLocaleString()}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Target: Rs. {m.totalTarget.toLocaleString()}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold whitespace-nowrap">
                        {m.pendingBalance > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            Rs. {m.pendingBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-xs">Rs. 0 (Nil)</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {!m.isPaid && m.status !== 'Completed' ? (
                          <button
                            onClick={() => handleQuickCollect(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-[#A5D6A7] hover:bg-[#81C784] text-[#0f2912] shadow-sm transition-all"
                          >
                            <FaPlus className="text-[9px]" /> Collect Payment
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickCollect(m)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                          >
                            Add Extra
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 whitespace-nowrap">
                      No matching members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: History Table */}
        {activeTab === 'history' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase font-extrabold text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5 whitespace-nowrap">Receipt #</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Date</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Member Name</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Amount Paid</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Received By (Staff)</th>
                  <th className="px-6 py-3.5 whitespace-nowrap">Payment Method</th>
                  <th className="px-6 py-3.5 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {displayedCollections.length > 0 ? (
                  displayedCollections.map((col) => (
                    <tr
                      key={col.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {col.id}
                      </td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {col.date} {col.date === todayStr && <span className="ml-1 text-[10px] text-emerald-500 font-bold">(Today)</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {col.memberName}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        Rs. {col.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50">
                          <FaUserCheck className="text-[10px]" /> {col.receivedBy}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {col.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedReceipt(col)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 transition-all"
                        >
                          <FaPrint className="text-xs" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 whitespace-nowrap">
                      No collection history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Record Payment (Full Viewport Portal Overlay) */}
      {isCollectModalOpen && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaHandHoldingUsd className="text-emerald-500" /> Record Committee Payment
              </h3>
              <button
                onClick={() => setIsCollectModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleRecordCollection} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Member: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={collectionForm.memberId}
                  onChange={(e) => setCollectionForm({ ...collectionForm, memberId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  required
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Monthly: Rs. {m.monthlyAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount Received (Rs.): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={collectionForm.amount}
                    onChange={(e) => setCollectionForm({ ...collectionForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Date:
                  </label>
                  <input
                    type="date"
                    value={collectionForm.date}
                    onChange={(e) => setCollectionForm({ ...collectionForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Received By (Staff Member): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={collectionForm.receivedBy}
                  onChange={(e) => setCollectionForm({ ...collectionForm, receivedBy: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  required
                >
                  <option value="Admin (Ali)">Admin (Ali)</option>
                  <option value="Cashier (Rizwan)">Cashier (Rizwan)</option>
                  <option value="Manager (Hamza)">Manager (Hamza)</option>
                  <option value="Counter Staff">Counter Staff</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Method:
                  </label>
                  <select
                    value={collectionForm.paymentMode}
                    onChange={(e) => setCollectionForm({ ...collectionForm, paymentMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Remarks / Notes:
                  </label>
                  <input
                    type="text"
                    placeholder="Optional remarks"
                    value={collectionForm.notes}
                    onChange={(e) => setCollectionForm({ ...collectionForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-[#A5D6A7] hover:bg-[#81C784] text-[#0f2912] shadow-md shadow-[#A5D6A7]/20"
                >
                  Save Payment & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 2: Add Member (Full Viewport Portal Overlay) */}
      {isMemberModalOpen && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaUserPlus className="text-emerald-500" /> Add Committee Member
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Member Full Name: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Muhammad Aslam"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Monthly Due (Rs.): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={memberForm.monthlyAmount}
                    onChange={(e) => setMemberForm({ ...memberForm, monthlyAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Target Amount:
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 60000"
                    value={memberForm.totalTarget}
                    onChange={(e) => setMemberForm({ ...memberForm, totalTarget: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black rounded-xl bg-[#A5D6A7] hover:bg-[#81C784] text-[#0f2912] shadow-md shadow-[#A5D6A7]/20"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal 3: View & Print Receipt (Full Viewport Portal Overlay) */}
      {selectedReceipt && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FaPrint className="text-emerald-500" /> Receipt #{selectedReceipt.id}
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
              >
                <FaTimes />
              </button>
            </div>

            <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  LPG ERP Committee Receipt
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Official Payment Voucher</p>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 font-bold">Receipt ID:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 font-bold">Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 font-bold">Member Name:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReceipt.memberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 font-bold">Amount Received:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">Rs. {selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 font-bold">Received By (Staff):</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedReceipt.receivedBy}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-bold">Payment Method:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.paymentMode}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 text-xs font-black rounded-xl bg-[#A5D6A7] hover:bg-[#81C784] text-[#0f2912] shadow-md shadow-[#A5D6A7]/20 flex items-center gap-2"
              >
                <FaPrint /> Print Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CommitteeCollection;
