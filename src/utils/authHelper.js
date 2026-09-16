// Initial Default Users List for LPG ERP System
const DEFAULT_USERS = [
  {
    id: 'USR-001',
    name: 'Ali Ahmed (Super Admin)',
    username: 'admin',
    email: 'admin@binsuleman.com',
    password: 'admin123',
    role: 'Super Admin',
    outlet: 'All Outlets & Depots',
    phone: '0300-1111111',
    status: 'Active',
    createdAt: '2026-01-01',
    isSuperAdmin: true,
  },
  {
    id: 'USR-002',
    name: 'Rizwan Shah (Branch Manager)',
    username: 'rizwan',
    email: 'rizwan@binsuleman.com',
    password: 'user123',
    role: 'Manager',
    outlet: 'Main Central Depot',
    phone: '0300-2222222',
    status: 'Active',
    createdAt: '2026-02-15',
    isSuperAdmin: false,
  },
  {
    id: 'USR-003',
    name: 'Hamza Khan (Cashier)',
    username: 'hamza',
    email: 'hamza@binsuleman.com',
    password: 'user123',
    role: 'Cashier',
    outlet: 'Blue Area Branch',
    phone: '0300-3333333',
    status: 'Active',
    createdAt: '2026-03-01',
    isSuperAdmin: false,
  },
];

// 1. Get all system users from localStorage
export const getUsers = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_system_users');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
  }
  // Initialize default users if none found
  localStorage.setItem('lpg_erp_system_users', JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
};

// 2. Save users to localStorage
export const saveUsers = (users) => {
  try {
    localStorage.setItem('lpg_erp_system_users', JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

// 3. Get currently active logged-in user
export const getCurrentUser = () => {
  try {
    const saved = localStorage.getItem('lpg_erp_active_user');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load active user', e);
  }
  // Default to Super Admin if not set
  const defaultAdmin = DEFAULT_USERS[0];
  localStorage.setItem('lpg_erp_active_user', JSON.stringify(defaultAdmin));
  return defaultAdmin;
};

// 4. Set currently active logged-in user
export const setCurrentUser = (user) => {
  try {
    localStorage.setItem('lpg_erp_active_user', JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set active user', e);
  }
};

// 5. Authenticate / Login User
export const authenticateUser = (usernameInput, passwordInput) => {
  const users = getUsers();
  const cleanUsername = usernameInput.trim().toLowerCase();
  
  const user = users.find(
    (u) =>
      (u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername) &&
      u.password === passwordInput
  );

  if (!user) {
    throw new Error('Invalid Username / Email or Password!');
  }

  if (user.status !== 'Active') {
    throw new Error('Your account has been deactivated by Super Admin!');
  }

  setCurrentUser(user);
  return user;
};

// 6. Super Admin: Add New User
export const createNewUser = (userData) => {
  const users = getUsers();
  const cleanUsername = userData.username.trim().toLowerCase();

  // Check for duplicate username
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    throw new Error(`Username "${userData.username}" already exists!`);
  }

  const newUser = {
    id: `USR-${100 + users.length + 1}`,
    name: userData.name.trim(),
    username: cleanUsername,
    email: userData.email ? userData.email.trim().toLowerCase() : `${cleanUsername}@binsuleman.com`,
    password: userData.password,
    role: userData.role || 'Cashier',
    outlet: userData.outlet || 'Main Central Depot',
    phone: userData.phone || 'N/A',
    status: 'Active',
    createdAt: new Date().toISOString().split('T')[0],
    isSuperAdmin: userData.role === 'Super Admin',
  };

  const updatedUsers = [newUser, ...users];
  saveUsers(updatedUsers);
  return newUser;
};

// 7. Super Admin: Toggle User Active/Inactive Status
export const toggleUserStatus = (userId) => {
  const users = getUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      if (u.isSuperAdmin) throw new Error('Cannot deactivate primary Super Admin account!');
      return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

// 8. Super Admin: Reset User Password
export const resetUserPassword = (userId, newPassword) => {
  const users = getUsers();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, password: newPassword };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
};

// 9. Logout
export const logoutUser = () => {
  localStorage.removeItem('lpg_erp_active_user');
};
