import { format } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy hh:mm a');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const generateId = () => {
  return `LPG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

export const getStatusBadge = (status) => {
  const badges = {
    stock: 'bg-green-100 text-green-800',
    market: 'bg-yellow-100 text-yellow-800',
    customer: 'bg-blue-100 text-blue-800',
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
};