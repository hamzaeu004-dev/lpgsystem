import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaCoins,
  FaHistory,
  FaCheckCircle,
  FaTimes,
  FaPhoneAlt,
  FaExclamationCircle,
  FaCalendarDay,
  FaPrint,
  FaHandHoldingUsd,
  FaUserPlus,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaTrashAlt,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// ---------- Shared UI helpers ----------
const fmt = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

const TONE = {
  emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  rose: { icon: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  amber: { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  blue: { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  indigo: { icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400', text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-500', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  slate: { icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', text: 'text-slate-500 dark:text-slate-400', bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' }
};

const StatCard = ({ icon: Icon, label, value, hint, tone = 'slate' }) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-3.5 min-w-0">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 ${TONE[tone].icon}`}>
      <Icon />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 tracking-tight tabular-nums break-words">{value}</p>
      {hint && <p className={`text-[11px] font-semibold mt-0.5 ${TONE[tone].text}`}>{hint}</p>}
    </div>
  </div>
);

const Badge = ({ tone = 'slate', icon: Icon, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${TONE[tone].badge}`}>
    {Icon && <Icon className="text-[9px]" />}
    {children}
  </span>
);

const Progress = ({ value, max, tone = 'emerald' }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="h-1.5 flex-1 min-w-[80px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${TONE[tone].bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="py-14 px-6 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-lg mb-3">
      <Icon />
    </div>
    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

const inputCls =
  'w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#7A0C00] focus:ring-2 focus:ring-[#7A0C00]/15 transition';

const toolbarInputCls =
  'w-full sm:w-auto px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 outline-none focus:border-[#7A0C00] focus:ring-2 focus:ring-[#7A0C00]/15 transition';

const Field = ({ label, required, children }) => (
  <label className="block">
    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
      {required && <span className="text-rose-500"> *</span>}
    </span>
    {children}
  </label>
);

const Modal = ({ title, subtitle, icon: Icon, onClose, children, maxWidth = 'max-w-md', closeOnBackdrop = false }) =>
  createPortal(
    <div
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full ${maxWidth} shadow-2xl my-auto text-slate-900 dark:text-white`}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[#7A0C00]/10 text-[#7A0C00] dark:bg-[#7A0C00]/30 dark:text-red-300 flex items-center justify-center shrink-0">
                <Icon />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-black truncate">{title}</h3>
              {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-1 text-slate-400 rounded-lg cursor-pointer shrink-0"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );

const ModalActions = ({ onCancel, submitLabel }) => (
  <div className="flex items-center justify-end gap-2.5 pt-4 mt-1 border-t border-slate-100 dark:border-slate-800">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
    >
      Cancel
    </button>
    <button type="submit" className="btn-primary !px-5 !py-2.5 !text-xs !font-black cursor-pointer">
      {submitLabel}
    </button>
  </div>
);

const thCls = 'px-5 py-3 whitespace-nowrap font-bold';
const tdCls = 'px-5 py-3.5 whitespace-nowrap align-middle';

const CommitteeCollection = () => {
  // Main view tab: 'members' | 'history' | 'owner_lenden'
  const [activeTab, setActiveTab] = useState('members');

  // Committee Member Status Filter: 'All' | 'Paid' | 'Pending' | 'Completed'
  const [statusFilter, setStatusFilter] = useState('All');

  // Owner Loan Filters: Type ('All' | 'Borrowed' | 'Lent'), Status ('All' | 'Active' | 'Cleared')
  const [ownerTypeFilter, setOwnerTypeFilter] = useState('All');
  const [ownerStatusFilter, setOwnerStatusFilter] = useState('All');

  // Search query
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state for Committee
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Modals state for Owner Personal Ledger
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isOwnerTxnModalOpen, setIsOwnerTxnModalOpen] = useState(false);
  const [selectedOwnerParty, setSelectedOwnerParty] = useState(null);
  const [selectedPartyHistory, setSelectedPartyHistory] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // --- LocalStorage Helpers ---

  // Load committee members
  const loadSavedMembers = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_committee_members');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load committee members from localStorage', e);
    }
    return [];
  };

  // Load committee collections
  const loadSavedCollections = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_committee_collections');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load committee collections from localStorage', e);
    }
    return [];
  };

  // Load Owner Personal Ledger Parties
  const loadSavedOwnerParties = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_owner_lenden_parties');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load owner ledger parties from localStorage', e);
    }
    return [
      {
        id: 1,
        name: "Haji Rafiq Sahib (Personal Loan)",
        phone: "0300-4455667",
        type: "Borrowed", // Owner took money
        initialAmount: 500000,
        totalReturned: 200000,
        date: "2026-08-15",
        notes: "Emergency personal loan taken for business expansion",
        status: "Active"
      },
      {
        id: 2,
        name: "Chaudhry Akram (Partner)",
        phone: "0321-8899001",
        type: "Lent", // Owner gave money
        initialAmount: 300000,
        totalReturned: 150000,
        date: "2026-09-01",
        notes: "Personal loan given for commercial cylinder batch",
        status: "Active"
      }
    ];
  };

  // Load Owner Personal Ledger History Logs
  const loadSavedOwnerHistory = () => {
    try {
      const saved = localStorage.getItem('lpg_erp_owner_lenden_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load owner ledger history from localStorage', e);
    }
    return [
      {
        id: "OLD-1001",
        partyId: 1,
        partyName: "Haji Rafiq Sahib (Personal Loan)",
        txnType: "Pay_Back",
        amount: 200000,
        date: "2026-09-01",
        paymentMode: "Bank Transfer",
        notes: "First partial repayment sent via bank"
      },
      {
        id: "OLD-1002",
        partyId: 2,
        partyName: "Chaudhry Akram (Partner)",
        txnType: "Receive_Back",
        amount: 150000,
        date: "2026-09-05",
        paymentMode: "Cash",
        notes: "First installment received back"
      }
    ];
  };

  // State Declarations
  const [members, setMembers] = useState(loadSavedMembers);
  const [collections, setCollections] = useState(loadSavedCollections);
  const [ownerParties, setOwnerParties] = useState(loadSavedOwnerParties);
  const [ownerHistory, setOwnerHistory] = useState(loadSavedOwnerHistory);

  // Persistence Updaters
  const updateMembersState = (newMembers) => {
    setMembers(newMembers);
    try {
      localStorage.setItem('lpg_erp_committee_members', JSON.stringify(newMembers));
    } catch (e) {
      console.error('Failed to save committee members', e);
    }
  };

  const updateCollectionsState = (newCollections) => {
    setCollections(newCollections);
    try {
      localStorage.setItem('lpg_erp_committee_collections', JSON.stringify(newCollections));
    } catch (e) {
      console.error('Failed to save committee collections', e);
    }
  };

  const updateOwnerPartiesState = (newParties) => {
    setOwnerParties(newParties);
    try {
      localStorage.setItem('lpg_erp_owner_lenden_parties', JSON.stringify(newParties));
    } catch (e) {
      console.error('Failed to save owner ledger parties', e);
    }
  };

  const updateOwnerHistoryState = (newHistory) => {
    setOwnerHistory(newHistory);
    try {
      localStorage.setItem('lpg_erp_owner_lenden_history', JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to save owner ledger history', e);
    }
  };

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

  // Owner Personal Form States
  const [ownerPartyForm, setOwnerPartyForm] = useState({
    name: '',
    phone: '',
    type: 'Borrowed', // 'Borrowed' | 'Lent'
    amount: '',
    date: todayStr,
    notes: ''
  });

  const [ownerTxnForm, setOwnerTxnForm] = useState({
    amount: '',
    date: todayStr,
    paymentMode: 'Cash',
    notes: ''
  });

  // --- Actions for Committee ---
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

    updateCollectionsState([newCollection, ...collections]);

    updateMembersState(
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
    setSelectedReceipt(newCollection);
  };

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

    updateMembersState([...members, newMember]);
    toast.success(`New Member (${newMember.name}) added!`);
    setIsMemberModalOpen(false);
    setMemberForm({ name: '', phone: '', monthlyAmount: '', totalTarget: '' });
  };

  // --- Actions for Owner Personal Ledger ---
  const handleAddOwnerParty = (e) => {
    e.preventDefault();
    if (!ownerPartyForm.name || !ownerPartyForm.amount) {
      toast.error('Please enter Contact Name and Amount');
      return;
    }

    const amountNum = parseFloat(ownerPartyForm.amount);
    const newParty = {
      id: Date.now(),
      name: ownerPartyForm.name,
      phone: ownerPartyForm.phone || 'N/A',
      type: ownerPartyForm.type, // 'Borrowed' | 'Lent'
      initialAmount: amountNum,
      totalReturned: 0,
      date: ownerPartyForm.date || todayStr,
      notes: ownerPartyForm.notes || '',
      status: 'Active'
    };

    updateOwnerPartiesState([newParty, ...ownerParties]);
    toast.success(`Personal record added for ${newParty.name}`);
    setIsOwnerModalOpen(false);
    setOwnerPartyForm({
      name: '',
      phone: '',
      type: 'Borrowed',
      amount: '',
      date: todayStr,
      notes: ''
    });
  };

  const handleRecordOwnerTxn = (e) => {
    e.preventDefault();
    if (!selectedOwnerParty || !ownerTxnForm.amount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(ownerTxnForm.amount);
    const updatedReturned = selectedOwnerParty.totalReturned + amountNum;
    const isCleared = updatedReturned >= selectedOwnerParty.initialAmount;

    // Determine Txn Type Label
    const txnType = selectedOwnerParty.type === 'Borrowed' ? 'Pay_Back' : 'Receive_Back';

    const newTxn = {
      id: `OLD-${1000 + ownerHistory.length + 1}`,
      partyId: selectedOwnerParty.id,
      partyName: selectedOwnerParty.name,
      txnType,
      amount: amountNum,
      date: ownerTxnForm.date || todayStr,
      paymentMode: ownerTxnForm.paymentMode,
      notes: ownerTxnForm.notes || (txnType === 'Pay_Back' ? 'Loan Repayment Sent' : 'Loan Repayment Received')
    };

    updateOwnerHistoryState([newTxn, ...ownerHistory]);

    // Update Party Status and totalReturned
    updateOwnerPartiesState(
      ownerParties.map((p) => {
        if (p.id === selectedOwnerParty.id) {
          return {
            ...p,
            totalReturned: updatedReturned,
            status: isCleared ? 'Cleared' : 'Active'
          };
        }
        return p;
      })
    );

    toast.success(
      txnType === 'Pay_Back'
        ? `Paid back Rs. ${amountNum.toLocaleString()} to ${selectedOwnerParty.name}`
        : `Received back Rs. ${amountNum.toLocaleString()} from ${selectedOwnerParty.name}`
    );

    setIsOwnerTxnModalOpen(false);
    setSelectedOwnerParty(null);
    setOwnerTxnForm({ amount: '', date: todayStr, paymentMode: 'Cash', notes: '' });
  };

  const handleDeleteOwnerParty = (partyId) => {
    if (window.confirm('Are you sure you want to delete this personal loan record?')) {
      const updated = ownerParties.filter((p) => p.id !== partyId);
      updateOwnerPartiesState(updated);
      toast.success('Record deleted successfully');
    }
  };

  // --- Computations for Committee ---
  const todayCollections = collections.filter((c) => c.date === todayStr);
  const todayCollectedAmount = todayCollections.reduce((sum, c) => sum + c.amount, 0);
  const totalCollectedAllTime = collections.reduce((sum, c) => sum + c.amount, 0);

  const membersWithCalculatedStatus = members.map((m) => {
    const paidInSept = collections
      .filter((c) => c.memberId === m.id && c.date.startsWith(todayStr.slice(0, 7)))
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

  const displayedMembers = membersWithCalculatedStatus.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);

    if (statusFilter === 'Paid') return matchSearch && m.isPaid;
    if (statusFilter === 'Pending') return matchSearch && !m.isPaid && m.status !== 'Completed';
    if (statusFilter === 'Completed') return matchSearch && m.status === 'Completed';
    return matchSearch;
  });

  const displayedCollections = collections.filter(
    (c) =>
      c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.receivedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Computations for Owner Personal Ledger ---
  const totalBorrowedInitial = ownerParties
    .filter((p) => p.type === 'Borrowed')
    .reduce((sum, p) => sum + p.initialAmount, 0);

  const totalBorrowedReturned = ownerParties
    .filter((p) => p.type === 'Borrowed')
    .reduce((sum, p) => sum + p.totalReturned, 0);

  const totalPayableRemaining = Math.max(0, totalBorrowedInitial - totalBorrowedReturned);

  const totalLentInitial = ownerParties
    .filter((p) => p.type === 'Lent')
    .reduce((sum, p) => sum + p.initialAmount, 0);

  const totalLentReturned = ownerParties
    .filter((p) => p.type === 'Lent')
    .reduce((sum, p) => sum + p.totalReturned, 0);

  const totalReceivableRemaining = Math.max(0, totalLentInitial - totalLentReturned);

  const displayedOwnerParties = ownerParties.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = ownerTypeFilter === 'All' || p.type === ownerTypeFilter;
    const matchStatus = ownerStatusFilter === 'All' || p.status === ownerStatusFilter;

    return matchSearch && matchType && matchStatus;
  });

  const openNewCollection = () => {
    setCollectionForm({
      memberId: '',
      amount: '',
      receivedBy: 'Admin (Ali)',
      paymentMode: 'Cash',
      date: todayStr,
      notes: ''
    });
    setIsCollectModalOpen(true);
  };

  const closeOwnerTxnModal = () => {
    setIsOwnerTxnModalOpen(false);
    setSelectedOwnerParty(null);
  };

  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const TABS = [
    { id: 'members', label: 'Members', icon: FaUsers, count: members.length },
    { id: 'history', label: 'Collections', icon: FaHistory, count: collections.length },
    { id: 'owner_lenden', label: 'Owner Ledger', icon: FaWallet, count: ownerParties.length }
  ];

  const LIST_META = {
    members: { title: 'Committee Members', count: displayedMembers.length },
    history: { title: 'Collection History', count: displayedCollections.length },
    owner_lenden: { title: 'Owner Personal Ledger', count: displayedOwnerParties.length }
  };

  const selectedPartyTxns = selectedPartyHistory
    ? ownerHistory.filter((h) => h.partyId === selectedPartyHistory.id)
    : [];

  return (
    <div className="w-full space-y-5 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Committee &amp; Owner Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Member dues, monthly collections and the owner's personal loan records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {activeTab === 'owner_lenden' ? (
            <button
              onClick={() => setIsOwnerModalOpen(true)}
              className="btn-primary flex-1 md:flex-initial gap-2 !px-5 !py-2.5 !text-xs !font-black whitespace-nowrap"
            >
              <FaPlus className="text-[10px]" /> Add Loan Record
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm whitespace-nowrap cursor-pointer"
              >
                <FaUserPlus /> Add Member
              </button>
              <button
                onClick={openNewCollection}
                className="btn-primary flex-1 md:flex-initial gap-2 !px-5 !py-2.5 !text-xs !font-black whitespace-nowrap"
              >
                <FaPlus className="text-[10px]" /> Record Payment
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        {TABS.map(({ id, label, icon: Icon, count }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${active
                ? 'bg-[#7A0C00] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
                }`}
            >
              <Icon className="hidden sm:block" />
              {label}
              <span
                className={`min-w-[20px] px-1.5 py-px rounded-md text-[10px] font-black tabular-nums ${active
                  ? 'bg-white/20 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      {activeTab === 'owner_lenden' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={FaArrowDown} tone="amber" label="Total Borrowed" value={fmt(totalBorrowedInitial)} hint={`Paid back ${fmt(totalBorrowedReturned)}`} />
          <StatCard icon={FaExclamationCircle} tone="rose" label="Remaining Payable" value={fmt(totalPayableRemaining)} hint="Owner still has to pay" />
          <StatCard icon={FaArrowUp} tone="blue" label="Total Lent" value={fmt(totalLentInitial)} hint={`Received back ${fmt(totalLentReturned)}`} />
          <StatCard icon={FaWallet} tone="emerald" label="Remaining Receivable" value={fmt(totalReceivableRemaining)} hint="Owner still has to receive" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard icon={FaCalendarDay} tone="emerald" label="Today's Collection" value={fmt(todayCollectedAmount)} hint={`${todayCollections.length} ${todayCollections.length === 1 ? 'entry' : 'entries'} today`} />
          <StatCard icon={FaCheckCircle} tone="blue" label="Paid This Month" value={`${paidCount} / ${members.length}`} hint={currentMonthLabel} />
          <StatCard icon={FaExclamationCircle} tone="rose" label="Pending Dues" value={`${unpaidCount} ${unpaidCount === 1 ? 'member' : 'members'}`} hint={`${fmt(totalPendingBalance)} outstanding`} />
          <StatCard icon={FaCoins} tone="indigo" label="Total Collected" value={fmt(totalCollectedAllTime)} hint="All-time" />
        </div>
      )}

      {/* List card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">{LIST_META[activeTab].title}</h2>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 tabular-nums">
              {LIST_META[activeTab].count}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full lg:w-auto">
            {activeTab === 'members' && (
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={toolbarInputCls}>
                <option value="All">All members ({members.length})</option>
                <option value="Paid">Paid ({paidCount})</option>
                <option value="Pending">Pending ({unpaidCount})</option>
                <option value="Completed">Completed</option>
              </select>
            )}

            {activeTab === 'owner_lenden' && (
              <>
                <select value={ownerTypeFilter} onChange={(e) => setOwnerTypeFilter(e.target.value)} className={toolbarInputCls}>
                  <option value="All">All types</option>
                  <option value="Borrowed">Borrowed (taken)</option>
                  <option value="Lent">Lent (given)</option>
                </select>
                <select value={ownerStatusFilter} onChange={(e) => setOwnerStatusFilter(e.target.value)} className={toolbarInputCls}>
                  <option value="All">All status</option>
                  <option value="Active">Balance pending</option>
                  <option value="Cleared">Cleared</option>
                </select>
              </>
            )}

            <div className="relative w-full sm:w-64">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder={activeTab === 'history' ? 'Search receipt, member, staff…' : 'Search name, phone…'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${toolbarInputCls} sm:w-full pl-9`}
              />
            </div>
          </div>
        </div>

        {/* View 1: Members */}
        {activeTab === 'members' &&
          (displayedMembers.length === 0 ? (
            <EmptyState
              icon={FaUsers}
              title={members.length === 0 ? 'No committee members yet' : 'No matching members'}
              text={members.length === 0 ? 'Add your first member to start tracking monthly committee dues.' : 'Try a different search or filter.'}
              action={
                members.length === 0 && (
                  <button onClick={() => setIsMemberModalOpen(true)} className="btn-primary gap-2 !px-4 !py-2 !text-xs">
                    <FaUserPlus /> Add Member
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className={thCls}>Member</th>
                    <th className={`${thCls} hidden lg:table-cell`}>Monthly Due</th>
                    <th className={thCls}>This Month</th>
                    <th className={`${thCls} hidden xl:table-cell`}>Paid / Target</th>
                    <th className={`${thCls} text-right`}>Balance</th>
                    <th className={`${thCls} text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#7A0C00]/10 text-[#7A0C00] dark:bg-[#7A0C00]/30 dark:text-red-300 font-black flex items-center justify-center text-xs shrink-0 uppercase">
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <FaPhoneAlt className="text-[8px]" /> {m.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`${tdCls} hidden lg:table-cell font-bold text-slate-900 dark:text-white tabular-nums`}>{fmt(m.monthlyAmount)}</td>
                      <td className={tdCls}>
                        {m.status === 'Completed' ? (
                          <Badge tone="indigo" icon={FaCheckCircle}>Completed</Badge>
                        ) : m.isPaid ? (
                          <Badge tone="emerald" icon={FaCheckCircle}>Paid</Badge>
                        ) : (
                          <Badge tone="rose">Pending</Badge>
                        )}
                      </td>
                      <td className={`${tdCls} hidden xl:table-cell min-w-[200px]`}>
                        <p className="tabular-nums">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(m.totalPaid)}</span>
                          <span className="text-slate-400"> of {fmt(m.totalTarget)}</span>
                        </p>
                        <Progress value={m.totalPaid} max={m.totalTarget} tone={m.status === 'Completed' ? 'indigo' : 'emerald'} />
                      </td>
                      <td className={`${tdCls} text-right font-black tabular-nums ${m.pendingBalance > 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {fmt(m.pendingBalance)}
                      </td>
                      <td className={`${tdCls} text-right`}>
                        <button
                          onClick={() => handleQuickCollect(m)}
                          disabled={m.status === 'Completed'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                        >
                          <FaHandHoldingUsd /> Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* View 2: Collection history */}
        {activeTab === 'history' &&
          (displayedCollections.length === 0 ? (
            <EmptyState
              icon={FaHistory}
              title={collections.length === 0 ? 'No collections recorded' : 'No matching records'}
              text={collections.length === 0 ? 'Payments you record will show up here with a printable receipt.' : 'Try a different search.'}
              action={
                collections.length === 0 &&
                members.length > 0 && (
                  <button onClick={openNewCollection} className="btn-primary gap-2 !px-4 !py-2 !text-xs">
                    <FaPlus className="text-[10px]" /> Record Payment
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className={thCls}>Receipt #</th>
                    <th className={thCls}>Date</th>
                    <th className={thCls}>Member</th>
                    <th className={`${thCls} hidden md:table-cell`}>Mode</th>
                    <th className={`${thCls} hidden lg:table-cell`}>Received By</th>
                    <th className={`${thCls} text-right`}>Amount</th>
                    <th className={`${thCls} text-right`}>Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayedCollections.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className={`${tdCls} font-black text-slate-900 dark:text-white font-mono`}>{c.id}</td>
                      <td className={`${tdCls} text-slate-500 tabular-nums`}>{c.date}</td>
                      <td className={`${tdCls} font-bold text-slate-900 dark:text-white`}>{c.memberName}</td>
                      <td className={`${tdCls} hidden md:table-cell`}>
                        <Badge>{c.paymentMode}</Badge>
                      </td>
                      <td className={`${tdCls} hidden lg:table-cell text-slate-500`}>{c.receivedBy}</td>
                      <td className={`${tdCls} text-right font-black text-emerald-600 dark:text-emerald-400 tabular-nums`}>{fmt(c.amount)}</td>
                      <td className={`${tdCls} text-right`}>
                        <button
                          onClick={() => setSelectedReceipt(c)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
                          title="View & print receipt"
                        >
                          <FaPrint /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

        {/* View 3: Owner ledger */}
        {activeTab === 'owner_lenden' &&
          (displayedOwnerParties.length === 0 ? (
            <EmptyState
              icon={FaWallet}
              title={ownerParties.length === 0 ? 'No loan records yet' : 'No matching records'}
              text={ownerParties.length === 0 ? 'Track money the owner borrowed or lent personally.' : 'Try a different search or filter.'}
              action={
                ownerParties.length === 0 && (
                  <button onClick={() => setIsOwnerModalOpen(true)} className="btn-primary gap-2 !px-4 !py-2 !text-xs">
                    <FaPlus className="text-[10px]" /> Add Loan Record
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className={thCls}>Party</th>
                    <th className={thCls}>Type</th>
                    <th className={`${thCls} hidden xl:table-cell`}>Settled / Amount</th>
                    <th className={`${thCls} text-right`}>Balance</th>
                    <th className={`${thCls} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {displayedOwnerParties.map((p) => {
                    const remaining = Math.max(0, p.initialAmount - p.totalReturned);
                    const isBorrowed = p.type === 'Borrowed';
                    const cleared = p.status === 'Cleared';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className={`${tdCls} max-w-[320px]`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 ${isBorrowed ? TONE.amber.icon : TONE.blue.icon}`}>
                              {isBorrowed ? <FaArrowDown /> : <FaArrowUp />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <FaPhoneAlt className="text-[8px]" /> {p.phone}
                                <span className="text-slate-300 dark:text-slate-600">•</span> {p.date}
                              </p>
                              {p.notes && (
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={p.notes}>
                                  {p.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={tdCls}>
                          {isBorrowed ? (
                            <Badge tone="amber" icon={FaArrowDown}>Borrowed</Badge>
                          ) : (
                            <Badge tone="blue" icon={FaArrowUp}>Lent</Badge>
                          )}
                        </td>
                        <td className={`${tdCls} hidden xl:table-cell min-w-[200px]`}>
                          <p className="tabular-nums">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(p.totalReturned)}</span>
                            <span className="text-slate-400"> of {fmt(p.initialAmount)}</span>
                          </p>
                          <Progress value={p.totalReturned} max={p.initialAmount} tone={cleared ? 'emerald' : isBorrowed ? 'amber' : 'blue'} />
                        </td>
                        <td className={`${tdCls} text-right`}>
                          {cleared || remaining === 0 ? (
                            <Badge tone="emerald" icon={FaCheckCircle}>Cleared</Badge>
                          ) : (
                            <>
                              <p className={`font-black tabular-nums ${isBorrowed ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {fmt(remaining)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{isBorrowed ? 'To pay' : 'To receive'}</p>
                            </>
                          )}
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <div className="inline-flex items-center gap-1.5">
                            {!cleared && (
                              <button
                                onClick={() => {
                                  setSelectedOwnerParty(p);
                                  setOwnerTxnForm({ amount: remaining.toString(), date: todayStr, paymentMode: 'Cash', notes: '' });
                                  setIsOwnerTxnModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-xs cursor-pointer"
                              >
                                {isBorrowed ? 'Pay Back' : 'Receive'}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedPartyHistory(p)}
                              className="p-2 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-700 cursor-pointer"
                              title="View ledger history"
                              aria-label="View ledger history"
                            >
                              <FaHistory />
                            </button>
                            <button
                              onClick={() => handleDeleteOwnerParty(p.id)}
                              className="p-2 rounded-lg text-slate-400 border border-slate-200 dark:border-slate-700 cursor-pointer"
                              title="Delete record"
                              aria-label="Delete record"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      {/* ---------- MODALS ---------- */}

      {/* Record committee payment */}
      {isCollectModalOpen && (
        <Modal title="Record Committee Payment" subtitle="Saves the payment and opens a printable receipt" icon={FaHandHoldingUsd} onClose={() => setIsCollectModalOpen(false)}>
          <form onSubmit={handleRecordCollection} className="space-y-4">
            <Field label="Member" required>
              <select
                value={collectionForm.memberId}
                onChange={(e) => {
                  const mId = e.target.value;
                  const mObj = members.find((x) => x.id === parseInt(mId));
                  setCollectionForm({
                    ...collectionForm,
                    memberId: mId,
                    amount: mObj ? mObj.monthlyAmount.toString() : collectionForm.amount
                  });
                }}
                className={`${inputCls} font-semibold`}
                required
              >
                <option value="">Choose member…</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — due {fmt(m.monthlyAmount)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Amount received (Rs.)" required>
              <input
                type="number"
                min="1"
                placeholder="e.g. 10000"
                value={collectionForm.amount}
                onChange={(e) => setCollectionForm({ ...collectionForm, amount: e.target.value })}
                className={`${inputCls} font-black tabular-nums`}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date">
                <input type="date" value={collectionForm.date} onChange={(e) => setCollectionForm({ ...collectionForm, date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Payment mode">
                <select value={collectionForm.paymentMode} onChange={(e) => setCollectionForm({ ...collectionForm, paymentMode: e.target.value })} className={inputCls}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </Field>
            </div>

            <Field label="Notes / reference">
              <input
                type="text"
                placeholder="e.g. Monthly installment"
                value={collectionForm.notes}
                onChange={(e) => setCollectionForm({ ...collectionForm, notes: e.target.value })}
                className={inputCls}
              />
            </Field>

            <ModalActions onCancel={() => setIsCollectModalOpen(false)} submitLabel="Save & Print Receipt" />
          </form>
        </Modal>
      )}

      {/* Add committee member */}
      {isMemberModalOpen && (
        <Modal title="Add Committee Member" subtitle="Target defaults to 6 × monthly due if left empty" icon={FaUserPlus} onClose={() => setIsMemberModalOpen(false)}>
          <form onSubmit={handleAddMember} className="space-y-4">
            <Field label="Full name" required>
              <input
                type="text"
                placeholder="e.g. Muhammad Aslam"
                value={memberForm.name}
                onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                className={`${inputCls} font-semibold`}
                required
              />
            </Field>

            <Field label="Phone number">
              <input
                type="text"
                placeholder="e.g. 0300-1234567"
                value={memberForm.phone}
                onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                className={inputCls}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Monthly due (Rs.)" required>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 10000"
                  value={memberForm.monthlyAmount}
                  onChange={(e) => setMemberForm({ ...memberForm, monthlyAmount: e.target.value })}
                  className={`${inputCls} font-semibold tabular-nums`}
                  required
                />
              </Field>
              <Field label="Total target (Rs.)">
                <input
                  type="number"
                  min="1"
                  placeholder={memberForm.monthlyAmount ? String(parseFloat(memberForm.monthlyAmount) * 6) : 'e.g. 60000'}
                  value={memberForm.totalTarget}
                  onChange={(e) => setMemberForm({ ...memberForm, totalTarget: e.target.value })}
                  className={`${inputCls} font-semibold tabular-nums`}
                />
              </Field>
            </div>

            <ModalActions onCancel={() => setIsMemberModalOpen(false)} submitLabel="Add Member" />
          </form>
        </Modal>
      )}

      {/* View & print committee receipt */}
      {selectedReceipt && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReceipt(null);
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <div onClick={(e) => e.stopPropagation()} className="relative my-auto w-full max-w-sm">
            <div
              id="thermal-receipt-printable"
              className="bg-white text-black p-5 rounded-lg shadow-2xl text-xs border border-slate-300 w-full max-w-[320px] mx-auto select-text leading-tight"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <div className="text-center font-bold text-[10px] tracking-widest">=================================</div>
              <div className="text-center space-y-0.5 my-1">
                <h2 className="text-base font-black tracking-tighter uppercase">BINSULEMAN ENTERPRISE</h2>
                <p className="text-[10px] font-black uppercase tracking-wider">COMMITTEE SAVINGS LOGISTICS</p>
                <p className="text-[9px] font-bold">Main Depot • Helpline: 0300-1111111</p>
              </div>
              <div className="text-center font-bold text-[10px] tracking-widest">=================================</div>

              <div className="text-center my-1.5">
                <span className="border-2 border-black px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-black text-white">
                  COLLECTION VOUCHER RECEIPT
                </span>
              </div>

              <div className="space-y-1 text-[11px] my-2">
                {[
                  ['VOUCHER NO', selectedReceipt.id],
                  ['DATE', selectedReceipt.date],
                  ['MEMBER NAME', selectedReceipt.memberName],
                  ['REC BY STAFF', selectedReceipt.receivedBy],
                  ['PAY METHOD', selectedReceipt.paymentMode]
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="font-bold whitespace-nowrap">{k}:</span>
                    <span className="font-black uppercase text-right">{v}</span>
                  </div>
                ))}
              </div>

              <div className="my-1 border-b-2 border-black"></div>

              <div className="my-2 border-2 border-black p-2 space-y-1 text-[11px]">
                <div className="flex justify-between font-black text-xs">
                  <span>AMOUNT RECEIVED:</span>
                  <span className="text-sm">Rs. {selectedReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold pt-1 border-t border-dashed border-black">
                  <span>STATUS:</span>
                  <span className="font-black">[ PAYMENT CONFIRMED ]</span>
                </div>
              </div>

              <div className="text-center font-bold text-[10px] tracking-widest my-1">=================================</div>

              <div className="text-center space-y-1 pt-0.5">
                <p className="text-[10px] font-black uppercase tracking-wider">*** THANK YOU FOR YOUR CONTRIBUTION ***</p>
                <p className="text-[8px] font-bold">Powered by Binsuleman LPG ERP v2.0</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2.5 select-none">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button onClick={() => window.print()} className="btn-primary gap-2 !px-5 !py-2.5 !text-xs !font-black">
                <FaPrint /> Print Receipt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add owner loan record */}
      {isOwnerModalOpen && (
        <Modal title="Add Owner Loan Record" subtitle="Personal money borrowed or lent by the owner" icon={FaWallet} onClose={() => setIsOwnerModalOpen(false)}>
          <form onSubmit={handleAddOwnerParty} className="space-y-4">
            <div>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Type<span className="text-rose-500"> *</span>
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: 'Borrowed', label: 'Borrowed', sub: 'Owner took money', icon: FaArrowDown, active: 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200' },
                  { value: 'Lent', label: 'Lent', sub: 'Owner gave money', icon: FaArrowUp, active: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200' }
                ].map(({ value, label, sub, icon: Icon, active }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOwnerPartyForm({ ...ownerPartyForm, type: value })}
                    className={`p-3 rounded-xl border-2 text-left cursor-pointer ${ownerPartyForm.type === value
                      ? active
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-black">
                      <Icon /> {label}
                    </span>
                    <span className="block text-[11px] font-medium opacity-80 mt-0.5">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Contact / party name" required>
              <input
                type="text"
                placeholder="e.g. Haji Rafiq Sahib"
                value={ownerPartyForm.name}
                onChange={(e) => setOwnerPartyForm({ ...ownerPartyForm, name: e.target.value })}
                className={`${inputCls} font-semibold`}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={ownerPartyForm.phone}
                  onChange={(e) => setOwnerPartyForm({ ...ownerPartyForm, phone: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Amount (Rs.)" required>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 100000"
                  value={ownerPartyForm.amount}
                  onChange={(e) => setOwnerPartyForm({ ...ownerPartyForm, amount: e.target.value })}
                  className={`${inputCls} font-black tabular-nums`}
                  required
                />
              </Field>
            </div>

            <Field label="Date">
              <input type="date" value={ownerPartyForm.date} onChange={(e) => setOwnerPartyForm({ ...ownerPartyForm, date: e.target.value })} className={inputCls} />
            </Field>

            <Field label="Reason / notes">
              <textarea
                rows="2"
                placeholder="e.g. Borrowed for emergency stock purchase"
                value={ownerPartyForm.notes}
                onChange={(e) => setOwnerPartyForm({ ...ownerPartyForm, notes: e.target.value })}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <ModalActions onCancel={() => setIsOwnerModalOpen(false)} submitLabel="Save Record" />
          </form>
        </Modal>
      )}

      {/* Pay back / receive back */}
      {isOwnerTxnModalOpen && selectedOwnerParty && (
        <Modal
          title={selectedOwnerParty.type === 'Borrowed' ? 'Pay Back Loan' : 'Receive Loan Return'}
          subtitle={selectedOwnerParty.name}
          icon={FaCoins}
          onClose={closeOwnerTxnModal}
        >
          <form onSubmit={handleRecordOwnerTxn} className="space-y-4">
            <div className="grid grid-cols-3 rounded-xl border border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-center">
              {[
                ['Amount', fmt(selectedOwnerParty.initialAmount), 'text-slate-900 dark:text-white'],
                ['Settled', fmt(selectedOwnerParty.totalReturned), 'text-emerald-600 dark:text-emerald-400'],
                ['Balance', fmt(Math.max(0, selectedOwnerParty.initialAmount - selectedOwnerParty.totalReturned)), 'text-rose-600 dark:text-rose-400']
              ].map(([k, v, cls]) => (
                <div key={k} className="px-2 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                  <p className={`text-xs font-black mt-0.5 tabular-nums ${cls}`}>{v}</p>
                </div>
              ))}
            </div>

            <Field label={selectedOwnerParty.type === 'Borrowed' ? 'Amount paying back (Rs.)' : 'Amount receiving back (Rs.)'} required>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={ownerTxnForm.amount}
                onChange={(e) => setOwnerTxnForm({ ...ownerTxnForm, amount: e.target.value })}
                className={`${inputCls} font-black tabular-nums`}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Date">
                <input type="date" value={ownerTxnForm.date} onChange={(e) => setOwnerTxnForm({ ...ownerTxnForm, date: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Payment mode">
                <select value={ownerTxnForm.paymentMode} onChange={(e) => setOwnerTxnForm({ ...ownerTxnForm, paymentMode: e.target.value })} className={inputCls}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online App">Online App</option>
                </select>
              </Field>
            </div>

            <Field label="Notes / reference">
              <input
                type="text"
                placeholder="e.g. Partial repayment"
                value={ownerTxnForm.notes}
                onChange={(e) => setOwnerTxnForm({ ...ownerTxnForm, notes: e.target.value })}
                className={inputCls}
              />
            </Field>

            <ModalActions onCancel={closeOwnerTxnModal} submitLabel="Confirm Entry" />
          </form>
        </Modal>
      )}

      {/* Owner party ledger history */}
      {selectedPartyHistory && (
        <Modal
          title={`${selectedPartyHistory.name} — Ledger`}
          subtitle={`${selectedPartyHistory.type === 'Borrowed' ? 'Borrowed (taken)' : 'Lent (given)'} • ${selectedPartyHistory.phone}`}
          icon={FaFileInvoiceDollar}
          onClose={() => setSelectedPartyHistory(null)}
          maxWidth="max-w-2xl"
          closeOnBackdrop
        >
          <div className="grid grid-cols-3 rounded-xl border border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700 text-center mb-4">
            {[
              ['Amount', fmt(selectedPartyHistory.initialAmount), 'text-slate-900 dark:text-white'],
              ['Settled', fmt(selectedPartyHistory.totalReturned), 'text-emerald-600 dark:text-emerald-400'],
              ['Balance', fmt(Math.max(0, selectedPartyHistory.initialAmount - selectedPartyHistory.totalReturned)), 'text-rose-600 dark:text-rose-400']
            ].map(([k, v, cls]) => (
              <div key={k} className="px-2 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                <p className={`text-sm font-black mt-0.5 tabular-nums ${cls}`}>{v}</p>
              </div>
            ))}
          </div>

          <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-700">
            {selectedPartyTxns.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">No repayment transactions recorded yet.</p>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Mode</th>
                    <th className="px-3 py-2.5 text-right">Amount</th>
                    <th className="px-3 py-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedPartyTxns.map((h) => (
                    <tr key={h.id}>
                      <td className="px-3 py-2.5 whitespace-nowrap tabular-nums">{h.date}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {h.txnType === 'Pay_Back' ? <Badge tone="amber">Paid back</Badge> : <Badge tone="blue">Received</Badge>}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{h.paymentMode}</td>
                      <td className="px-3 py-2.5 text-right font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap tabular-nums">{fmt(h.amount)}</td>
                      <td className="px-3 py-2.5 text-slate-500">{h.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <FaPrint /> Print Statement
            </button>
            <button
              onClick={() => setSelectedPartyHistory(null)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CommitteeCollection;
