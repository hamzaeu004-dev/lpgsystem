export const CYLINDER_STATUS = {
  STOCK: 'stock',
  MARKET: 'market',
  CUSTOMER: 'customer',
};

export const CYLINDER_STATUS_LABELS = {
  [CYLINDER_STATUS.STOCK]: 'In Stock',
  [CYLINDER_STATUS.MARKET]: 'In Market',
  [CYLINDER_STATUS.CUSTOMER]: 'With Customer',
};

export const CYLINDER_STATUS_COLORS = {
  [CYLINDER_STATUS.STOCK]: '#22c55e',
  [CYLINDER_STATUS.MARKET]: '#eab308',
  [CYLINDER_STATUS.CUSTOMER]: '#3b82f6',
};

export const TRANSACTION_TYPES = {
  SALE: 'sale',
  PURCHASE: 'purchase',
  RETURN: 'return',
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};