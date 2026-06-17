import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryApi, shoppingApi, mealPlanApi, recipesApi, reportsApi, adminApi } from '../services/api';

// ────────────────────────────────────────────────
// INVENTORY HOOK
// ────────────────────────────────────────────────
export function useInventory() {
  const { groupId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [expiring, setExpiring] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const [res, expRes, logsRes] = await Promise.all([
        inventoryApi.getAll(groupId),
        inventoryApi.getExpiring(groupId),
        inventoryApi.getLogs(groupId),
      ]);
      setItems(res.data || []);
      setExpiring(expRes.data || []);
      setLogs(logsRes.data || []);
    } catch (e: any) {
      console.error('Inventory load error:', e);
      setError(e.message || 'Lỗi tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const addItem = async (data: any) => {
    await inventoryApi.add({ ...data, maNhom: groupId });
    await load();
  };

  const updateItem = async (id: number, data: any) => {
    await inventoryApi.update(id, data);
    await load();
  };

  const deleteItem = async (id: number) => {
    await inventoryApi.remove(id);
    await load();
  };

  return { items, expiring, logs, loading, error, addItem, updateItem, deleteItem, reload: load };
}

// ────────────────────────────────────────────────
// SHOPPING HOOK
// ────────────────────────────────────────────────
export function useShopping() {
  const { groupId } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [items, setItems] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await shoppingApi.getLists(groupId);
      setLists(res.data || []);
    } catch (e: any) {
      console.error('Shopping lists load error:', e);
      setError(e.message || 'Lỗi tải danh sách mua sắm');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { loadLists(); }, [loadLists]);

  const loadItems = async (listId: number) => {
    try {
      const res = await shoppingApi.getItems(listId);
      setItems(prev => ({ ...prev, [listId]: res.data || [] }));
      return res.data || [];
    } catch (e) {
      console.error('Shopping items load error:', e);
      return [];
    }
  };

  const createList = async (ghiChu?: string) => {
    if (!groupId) return;
    await shoppingApi.createList(groupId, ghiChu);
    await loadLists();
  };

  const deleteList = async (id: number) => {
    await shoppingApi.deleteList(id);
    await loadLists();
  };

  const addItem = async (listId: number, data: any) => {
    await shoppingApi.addItem(listId, data);
    await loadItems(listId);
  };

  const toggleItem = async (listId: number, itemId: number, done: boolean) => {
    await shoppingApi.toggleItem(itemId, done);
    await loadItems(listId);
  };

  const updateItem = async (listId: number, itemId: number, data: any) => {
    await shoppingApi.updateItem(itemId, data);
    await loadItems(listId);
  };

  const deleteItem = async (listId: number, itemId: number) => {
    await shoppingApi.deleteItem(itemId);
    await loadItems(listId);
  };

  /** Hoàn thành mua sắm + tự động nhập kho toàn bộ items đã mua */
  const completeAndRestock = async (listId: number) => {
    const res = await shoppingApi.completeAndRestock(listId);
    await loadLists();
    await loadItems(listId);
    return res.data;
  };

  /** Gom nhóm items trùng tên+đơn vị trong danh sách */
  const mergeDuplicates = async (listId: number) => {
    const res = await shoppingApi.mergeDuplicates(listId);
    await loadItems(listId);
    return res.data;
  };

  return {
    lists, items, loading, error,
    loadLists, loadItems,
    createList, deleteList,
    addItem, toggleItem, updateItem, deleteItem,
    completeAndRestock, mergeDuplicates,
  };
}

// ────────────────────────────────────────────────
// MEAL PLAN HOOK
// ────────────────────────────────────────────────
export function useMealPlan() {
  const { groupId } = useAuth();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [weekMeals, setWeekMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadToday = useCallback(async () => {
    if (!groupId) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await mealPlanApi.getToday(groupId);
      const data = res.data || [];
      setTodayMeals(data);
      return data;
    } catch (e: any) {
      console.error('Meal plan load error:', e);
      setError(e.message || 'Lỗi tải kế hoạch bữa ăn');
      return [];
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const loadWeek = useCallback(async (start: string, end: string) => {
    if (!groupId) return [];
    try {
      const res = await mealPlanApi.getByDateRange(groupId, start, end);
      const data = res.data || [];
      setWeekMeals(data);
      return data;
    } catch (e) {
      console.error('Meal plan week load error:', e);
      return [];
    }
  }, [groupId]);

  useEffect(() => { loadToday(); }, [loadToday]);

  const addMeal = async (data: any) => {
    await mealPlanApi.create({ ...data, maNhom: groupId });
    return await loadToday();
  };

  const removeMeal = async (id: number) => {
    await mealPlanApi.remove(id);
    await loadToday();
  };

  return { todayMeals, weekMeals, loading, error, loadToday, loadWeek, addMeal, removeMeal, setTodayMeals, setWeekMeals };
}

// ────────────────────────────────────────────────
// RECIPES HOOK
// ────────────────────────────────────────────────
export function useRecipes() {
  const { groupId } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Truyền groupId để lấy cả system recipes + recipes riêng của nhóm
      const res = await recipesApi.getAll(groupId ?? undefined);
      setRecipes(res.data || []);
    } catch (e: any) {
      console.error('Recipes load error:', e);
      setError(e.message || 'Lỗi tải công thức nấu ăn');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const addRecipe = async (data: any) => {
    // Tự động gắn maNhom vào body khi tạo
    await recipesApi.create({ ...data, maNhom: groupId });
    await load();
  };

  const updateRecipe = async (id: number, data: any) => {
    await recipesApi.update(id, data);
    await load();
  };

  const deleteRecipe = async (id: number) => {
    await recipesApi.remove(id);
    await load();
  };

  /** Đánh dấu "Đã nấu xong" → tự động trừ kho */
  const cookRecipe = async (id: number, soKhauPhan: number) => {
    if (!groupId) throw new Error('Chưa chọn nhóm gia đình');
    const res = await recipesApi.cook(id, soKhauPhan, groupId);
    return res.data;
  };

  /** Gợi ý công thức theo nguyên liệu có sẵn trong kho */
  const loadSuggestions = async () => {
    if (!groupId) return;
    setSuggestLoading(true);
    try {
      const res = await recipesApi.suggest(groupId);
      setSuggestions(res.data || []);
    } catch (e) {
      console.error('Suggestions load error:', e);
    } finally {
      setSuggestLoading(false);
    }
  };

  return {
    recipes, suggestions, loading, suggestLoading, error,
    addRecipe, updateRecipe, deleteRecipe,
    cookRecipe, loadSuggestions,
    reload: load,
  };
}

// ────────────────────────────────────────────────
// REPORTS HOOK
// ────────────────────────────────────────────────
export function useReports() {
  const { groupId } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{ startDate?: string; endDate?: string }>({});

  const load = useCallback(async (customFilters?: { startDate?: string; endDate?: string }) => {
    if (!groupId) return;
    setLoading(true);
    const activeFilters = customFilters || filters;
    try {
      const tzOffset = new Date().getTimezoneOffset();
      const [repRes, sumRes] = await Promise.all([
        reportsApi.getAll(groupId),
        reportsApi.getSummary(groupId, tzOffset, activeFilters.startDate, activeFilters.endDate),
      ]);
      setReports(repRes.data || []);
      setSummary(sumRes.data);
    } catch (e) {
      console.error('Reports load error:', e);
    } finally {
      setLoading(false);
    }
  }, [groupId, filters]);

  useEffect(() => {
    load();
  }, [groupId, load]);

  const applyFilters = async (newFilters: { startDate?: string; endDate?: string }) => {
    setFilters(newFilters);
    await load(newFilters);
  };

  return { reports, summary, loading, reload: load, applyFilters, filters };
}

// ────────────────────────────────────────────────
// DASHBOARD STATS HOOK
// ────────────────────────────────────────────────
export function useDashboardStats() {
  const { groupId } = useAuth();
  const [stats, setStats] = useState({
    inventoryCount: 0,
    expiringCount: 0,
    shoppingListCount: 0,
    shoppingDoneCount: 0,
    totalSpend: 0,
    expenseTrend: [] as any[],
    categorySpend: [] as any[],
  });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [inv, exp, lists, summary] = await Promise.all([
        inventoryApi.getAll(groupId),
        inventoryApi.getExpiring(groupId),
        shoppingApi.getLists(groupId),
        reportsApi.getSummary(groupId),
      ]);
      const allLists = lists.data || [];
      const totalItems = allLists.reduce((s: number, l: any) => s + (l.TongMon || 0), 0);
      const doneItems = allLists.reduce((s: number, l: any) => s + (l.DaMuaCount || 0), 0);
      const summaryData = summary.data || {};
      setStats({
        inventoryCount: (inv.data || []).length,
        expiringCount: (exp.data || []).length,
        shoppingListCount: totalItems,
        shoppingDoneCount: doneItems,
        totalSpend: summaryData.TongChiPhi || 0,
        expenseTrend: summaryData.expenseTrend || [],
        categorySpend: summaryData.categorySpend || [],
      });
    } catch (e) {
      console.error('Dashboard stats error:', e);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, reload: load };
}

// ────────────────────────────────────────────────
// ADMIN HOOK
// ────────────────────────────────────────────────
export function useAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [dashStats, setDashStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (e) {
      console.error('Admin users load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await adminApi.getDashboard();
      setDashStats(res.data);
    } catch (e) {
      console.error('Admin dashboard load error:', e);
    }
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await adminApi.updateStatus(id, status);
    await loadUsers();
  };

  const updateRole = async (id: number, role: string) => {
    await adminApi.updateRole(id, role);
    await loadUsers();
  };

  const deleteUser = async (id: number) => {
    await adminApi.deleteUser(id);
    await loadUsers();
  };

  return { users, dashStats, loading, loadUsers, loadDashboard, updateStatus, updateRole, deleteUser };
}
