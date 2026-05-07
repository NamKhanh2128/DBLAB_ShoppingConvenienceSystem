// Base API configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Token helpers
export const getToken = (): string | null => localStorage.getItem('token');
export const setToken = (token: string) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const setUser = (user: any) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Base fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Lỗi hệ thống');
  }
  return data;
}

// ────────────────────────────────────────────────
// AUTH
// ────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; data: { user: any; token: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),

  register: (hoTen: string, email: string, password: string) =>
    request<{ success: boolean; data: any }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ hoTen, email, password }) }
    ),

  me: () => request<{ success: boolean; data: any }>('/auth/me'),
};

// ────────────────────────────────────────────────
// USERS (Profile, Password)
// ────────────────────────────────────────────────
export const usersApi = {
  updateProfile: (data: { hoTen?: string; email?: string; soDienThoai?: string; bio?: string }) =>
    request<{ success: boolean; data: any }>(
      '/users/profile',
      { method: 'PUT', body: JSON.stringify(data) }
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>(
      '/users/change-password',
      { method: 'PUT', body: JSON.stringify(data) }
    ),
};

// ────────────────────────────────────────────────
// SHOPPING
// ────────────────────────────────────────────────
export const shoppingApi = {
  getLists: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/shopping/lists?groupId=${groupId}`),

  createList: (maNhom: number, ghiChu?: string) =>
    request<{ success: boolean; data: any }>(
      '/shopping/lists',
      { method: 'POST', body: JSON.stringify({ maNhom, ghiChu }) }
    ),

  updateStatus: (id: number, trangThai: string) =>
    request('/shopping/lists/' + id + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ trangThai }),
    }),

  deleteList: (id: number) =>
    request('/shopping/lists/' + id, { method: 'DELETE' }),

  getItems: (listId: number) =>
    request<{ success: boolean; data: any[] }>(`/shopping/lists/${listId}/items`),

  addItem: (listId: number, item: any) =>
    request<{ success: boolean; data: any }>(
      `/shopping/lists/${listId}/items`,
      { method: 'POST', body: JSON.stringify(item) }
    ),

  toggleItem: (itemId: number, done: boolean) =>
    request(`/shopping/items/${itemId}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ done }),
    }),

  updateItem: (itemId: number, data: any) =>
    request(`/shopping/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (itemId: number) =>
    request(`/shopping/items/${itemId}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// INVENTORY
// ────────────────────────────────────────────────
export const inventoryApi = {
  getAll: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/inventory?groupId=${groupId}`),

  getExpiring: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/inventory/expiring?groupId=${groupId}`),

  add: (data: any) =>
    request<{ success: boolean; data: any }>(
      '/inventory',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  update: (id: number, data: any) =>
    request(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id: number) =>
    request(`/inventory/${id}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// RECIPES
// ────────────────────────────────────────────────
export const recipesApi = {
  getAll: () => request<{ success: boolean; data: any[] }>('/recipes'),
  getOne: (id: number) => request<{ success: boolean; data: any }>(`/recipes/${id}`),
  create: (data: any) =>
    request<{ success: boolean; data: any }>(
      '/recipes',
      { method: 'POST', body: JSON.stringify(data) }
    ),
  update: (id: number, data: any) =>
    request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: number) =>
    request(`/recipes/${id}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// MEAL PLAN
// ────────────────────────────────────────────────
export const mealPlanApi = {
  // Send local date to avoid UTC vs UTC+7 mismatch on the server
  getToday: (groupId: number) => {
    const n = new Date();
    const localDate = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
    return request<{ success: boolean; data: any[] }>(`/meal-plan/today?groupId=${groupId}&date=${localDate}`);
  },

  getByDateRange: (groupId: number, start: string, end: string) =>
    request<{ success: boolean; data: any[] }>(
      `/meal-plan?groupId=${groupId}&start=${start}&end=${end}`
    ),

  create: (data: any) =>
    request<{ success: boolean; data: any }>(
      '/meal-plan',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  remove: (id: number) =>
    request(`/meal-plan/${id}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// FAMILY
// ────────────────────────────────────────────────
export const familyApi = {
  getMyFamilies: () =>
    request<{ success: boolean; data: any[] }>('/family/me'),

  getMembers: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/family/${groupId}/members`),

  getInvites: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/family/${groupId}/invites`),

  generateInvite: (groupId: number, maxUses?: number) =>
    request<{ success: boolean; data: any }>(
      `/family/${groupId}/invites`,
      { method: 'POST', body: JSON.stringify({ maxUses: maxUses ?? 1 }) }
    ),

  revokeInvite: (groupId: number, inviteId: number) =>
    request(`/family/${groupId}/invites/${inviteId}`, { method: 'DELETE' }),

  joinFamily: (inviteCode: string) =>
    request<{ success: boolean; data: any }>(
      '/family/join',
      { method: 'POST', body: JSON.stringify({ inviteCode }) }
    ),

  create: (name: string) =>
    request<{ success: boolean; data: any }>(
      '/family',
      { method: 'POST', body: JSON.stringify({ name }) }
    ),

  addMember: (groupId: number, userId: number) =>
    request(`/family/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  removeMember: (groupId: number, userId: number) =>
    request(`/family/${groupId}/members/${userId}`, { method: 'DELETE' }),
};

// ────────────────────────────────────────────────
// REPORTS
// ────────────────────────────────────────────────
export const reportsApi = {
  getAll: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/reports?groupId=${groupId}`),

  getSummary: (groupId: number) =>
    request<{ success: boolean; data: any }>(`/reports/summary?groupId=${groupId}`),
};

// ────────────────────────────────────────────────
// ADMIN
// ────────────────────────────────────────────────
export const adminApi = {
  getDashboard: () =>
    request<{ success: boolean; data: any }>('/admin/dashboard'),

  getUsers: () =>
    request<{ success: boolean; data: any[] }>('/admin/users'),

  updateStatus: (id: number, status: string) =>
    request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  updateRole: (id: number, role: string) =>
    request(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id: number) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),
};
