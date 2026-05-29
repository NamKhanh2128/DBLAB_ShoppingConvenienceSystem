// Base API configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Token helpers (Lưu trữ Access Token trong localStorage ở localhost để việc tải lại trang không bị out nick)
let memoryToken: string | null = null;
export const getToken = (): string | null => {
  return memoryToken || localStorage.getItem('accessToken');
};
export const setToken = (token: string) => { 
  memoryToken = token; 
  localStorage.setItem('accessToken', token);
};
export const removeToken = () => { 
  memoryToken = null; 
  localStorage.removeItem('accessToken');
};

export const getUser = () => {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
};
export const setUser = (user: any) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Cơ chế xử lý làm mới song song (Concurrent Refreshing)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

async function handleRefresh(): Promise<string | null> {
  try {
    // Gọi API làm mới, cookie refreshToken (HttpOnly) tự động được đính kèm bởi trình duyệt
    const res = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    const newToken = data.data.token;
    setToken(newToken);
    return newToken;
  } catch (err) {
    removeToken();
    removeUser();
    return null;
  }
}

// Base fetch wrapper
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  let res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  // Tự động làm mới token ngầm (Silent Refresh) nếu bị lỗi 401 Unauthorized
  if (res.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await handleRefresh();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
      } else {
        localStorage.removeItem('groupId');
        window.location.href = '/login?expired=true';
        throw new Error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }

    // Chờ cho đến khi tiến trình refresh đầu tiên hoàn tất
    const retryPromise = new Promise<string>((resolve) => {
      subscribeTokenRefresh((newToken) => resolve(newToken));
    });

    const newToken = await retryPromise;
    const retryHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${newToken}`,
      ...((options.headers as Record<string, string>) || {}),
    };
    
    res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: retryHeaders });
  }

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

  /**
   * Hoàn thành mua sắm + tự động nhập toàn bộ items đã mua vào kho tủ lạnh.
   */
  completeAndRestock: (listId: number) =>
    request<{ success: boolean; data: { total: number; addedToInventory: number; mergedWithExisting: number; message: string } }>(
      `/shopping/lists/${listId}/complete-and-restock`,
      { method: 'POST' }
    ),

  /**
   * Gom nhóm tất cả items trùng tên+đơn vị trong một danh sách.
   */
  mergeDuplicates: (listId: number) =>
    request<{ success: boolean; data: { mergedCount: number; message: string } }>(
      `/shopping/lists/${listId}/merge-duplicates`,
      { method: 'POST' }
    ),
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

  getLogs: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/inventory/${groupId}/logs`),
};

// ────────────────────────────────────────────────
// RECIPES
// ────────────────────────────────────────────────
export const recipesApi = {
  /** Lấy tất cả công thức (system + của nhóm) */
  getAll: (groupId?: number) =>
    request<{ success: boolean; data: any[] }>(
      groupId ? `/recipes?groupId=${groupId}` : '/recipes'
    ),

  /** Lấy chi tiết một công thức kèm nguyên liệu */
  getOne: (id: number, groupId?: number) =>
    request<{ success: boolean; data: any }>(
      groupId ? `/recipes/${id}?groupId=${groupId}` : `/recipes/${id}`
    ),

  /** Tạo công thức mới (gắn với nhóm) */
  create: (data: any) =>
    request<{ success: boolean; data: any }>(
      '/recipes',
      { method: 'POST', body: JSON.stringify(data) }
    ),

  /** Cập nhật công thức */
  update: (id: number, data: any) =>
    request(`/recipes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  /** Xóa công thức (chỉ recipe của nhóm) */
  remove: (id: number) =>
    request(`/recipes/${id}`, { method: 'DELETE' }),

  /**
   * "Đã nấu xong" — tự động trừ nguyên liệu trong kho.
   * @param soKhauPhan  Số khẩu phần thực tế nấu
   * @param maNhom      ID nhóm gia đình (để biết kho nào cần trừ)
   */
  cook: (id: number, soKhauPhan: number, maNhom: number) =>
    request<{ success: boolean; data: { deductedCount: number; notFoundIngredients: string[]; warning: string | null } }>(
      `/recipes/${id}/cook`,
      { method: 'POST', body: JSON.stringify({ soKhauPhan, maNhom }) }
    ),

  /**
   * Gợi ý công thức dựa trên nguyên liệu có sẵn trong kho.
   */
  suggest: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/recipes/suggest?groupId=${groupId}`),
};

// ────────────────────────────────────────────────
// MEAL PLAN
// ────────────────────────────────────────────────
export const mealPlanApi = {
  // Send local date to avoid UTC vs UTC+7 mismatch on the server
  getToday: (groupId: number) => {
    const n = new Date();
    const localDate = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
    return request<{ success: boolean; data: any[] }>(`/meal-plan/today?groupId=${groupId}&clientDate=${localDate}`);
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

  checkIngredients: (maMon: number, soKhauPhan: number, groupId: number) =>
    request<{ success: boolean; data: { enough: boolean; details: any[] } }>(
      `/meal-plan/check-ingredients?maMon=${maMon}&soKhauPhan=${soKhauPhan}&groupId=${groupId}`
    ),

  addMissingToShopping: (maMon: number, soKhauPhan: number, groupId: number) =>
    request<{ success: boolean; data: { success: boolean; listId: number } }>(
      '/meal-plan/add-missing-to-shopping',
      { method: 'POST', body: JSON.stringify({ maMon, soKhauPhan, groupId }) }
    ),

  copyMealPlan: (groupId: number, fromStart: string, fromEnd: string, toStart: string) =>
    request<{ success: boolean; data: null }>(
      '/meal-plan/copy-range',
      { method: 'POST', body: JSON.stringify({ groupId, fromStart, fromEnd, toStart }) }
    ),
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

  transferLeadership: (groupId: number, newLeaderId: number) =>
    request(`/family/${groupId}/transfer-leadership`, {
      method: 'PUT',
      body: JSON.stringify({ newLeaderId }),
    }),

  updateInfo: (groupId: number, data: { name: string; description: string | null; lastSeenUpdatedAt: string }) =>
    request<{ success: boolean; data: any }>(`/family/${groupId}/info`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getNotifications: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/family/${groupId}/notifications`),
};

// ────────────────────────────────────────────────
// REPORTS
// ────────────────────────────────────────────────
export const reportsApi = {
  getAll: (groupId: number) =>
    request<{ success: boolean; data: any[] }>(`/reports?groupId=${groupId}`),

  getSummary: (groupId: number, timezoneOffset?: number, startDate?: string, endDate?: string) => {
    let url = `/reports/summary?groupId=${groupId}`;
    if (timezoneOffset !== undefined) url += `&timezoneOffset=${timezoneOffset}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return request<{ success: boolean; data: any }>(url);
  },
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

  getAuditLogs: () =>
    request<{ success: boolean; data: any[] }>('/admin/audit-logs'),

  cleanupFakeUsers: () =>
    request<{ success: boolean; data: any }>('/admin/cleanup-fake-users', { method: 'POST' }),
};
