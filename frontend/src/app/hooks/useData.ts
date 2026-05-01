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
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [res, expRes] = await Promise.all([
        inventoryApi.getAll(groupId),
        inventoryApi.getExpiring(groupId),
      ]);
      setItems(res.data || []);
      setExpiring(expRes.data || []);
    } catch (e) {
      console.error('Inventory load error:', e);
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

  return { items, expiring, loading, addItem, updateItem, deleteItem, reload: load };
}

// ────────────────────────────────────────────────
// SHOPPING HOOK
// ────────────────────────────────────────────────
export function useShopping() {
  const { groupId } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [items, setItems] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(false);

  const loadLists = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await shoppingApi.getLists(groupId);
      setLists(res.data || []);
    } catch (e) {
      console.error('Shopping lists load error:', e);
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

  return { lists, items, loading, loadLists, loadItems, createList, deleteList, addItem, toggleItem, updateItem, deleteItem };
}

// ────────────────────────────────────────────────
// MEAL PLAN HOOK
// ────────────────────────────────────────────────
export function useMealPlan() {
  const { groupId } = useAuth();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [weekMeals, setWeekMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadToday = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await mealPlanApi.getToday(groupId);
      setTodayMeals(res.data || []);
    } catch (e) {
      console.error('Meal plan load error:', e);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const loadWeek = useCallback(async (start: string, end: string) => {
    if (!groupId) return;
    try {
      const res = await mealPlanApi.getByDateRange(groupId, start, end);
      setWeekMeals(res.data || []);
    } catch (e) {
      console.error('Meal plan week load error:', e);
    }
  }, [groupId]);

  useEffect(() => { loadToday(); }, [loadToday]);

  const addMeal = async (data: any) => {
    await mealPlanApi.create({ ...data, maNhom: groupId });
    await loadToday();
  };

  const removeMeal = async (id: number) => {
    await mealPlanApi.remove(id);
    await loadToday();
  };

  return { todayMeals, weekMeals, loading, loadToday, loadWeek, addMeal, removeMeal };
}

// ────────────────────────────────────────────────
// RECIPES HOOK
// ────────────────────────────────────────────────
export function useRecipes() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recipesApi.getAll();
      setRecipes(res.data || []);
    } catch (e) {
      console.error('Recipes load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addRecipe = async (data: any) => {
    await recipesApi.create(data);
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

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe, reload: load };
}

// ────────────────────────────────────────────────
// REPORTS HOOK
// ────────────────────────────────────────────────
export function useReports() {
  const { groupId } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [repRes, sumRes] = await Promise.all([
        reportsApi.getAll(groupId),
        reportsApi.getSummary(groupId),
      ]);
      setReports(repRes.data || []);
      setSummary(sumRes.data);
    } catch (e) {
      console.error('Reports load error:', e);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  return { reports, summary, loading, reload: load };
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
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);

    Promise.all([
      inventoryApi.getAll(groupId),
      inventoryApi.getExpiring(groupId),
      shoppingApi.getLists(groupId),
      reportsApi.getSummary(groupId),
    ]).then(([inv, exp, lists, summary]) => {
      const allLists = lists.data || [];
      const totalItems = allLists.reduce((s: number, l: any) => s + (l.TongMon || 0), 0);
      const doneItems = allLists.reduce((s: number, l: any) => s + (l.DaMuaCount || 0), 0);
      setStats({
        inventoryCount: (inv.data || []).length,
        expiringCount: (exp.data || []).length,
        shoppingListCount: totalItems,
        shoppingDoneCount: doneItems,
        totalSpend: summary.data?.TongChiPhi || 0,
      });
    }).catch(e => console.error('Dashboard stats error:', e))
      .finally(() => setLoading(false));
  }, [groupId]);

  return { stats, loading };
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
