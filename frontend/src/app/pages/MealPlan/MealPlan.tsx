import { useState, useEffect, useCallback } from "react";
import { 
  Plus, Calendar as CalendarIcon, ChefHat, Trash2, Sparkles, 
  ShoppingCart, Loader2, ChevronLeft, ChevronRight, Copy, 
  AlertTriangle, CheckCircle, Info, HelpCircle, Users, Clock, Eye 
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { AddMealPlanModal, GenerateMealPlanModal, ViewRecipeModal } from "../../components/common";
import { useMealPlan } from "../../hooks/useData";
import { mealPlanApi, recipesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const mealTimes = ["Sáng", "Trưa", "Tối"];

const buoiMap: Record<string, string> = { "Sáng": "SANG", "Trưa": "TRUA", "Tối": "TOI" };
const buoiRevMap: Record<string, string> = { "SANG": "Sáng", "TRUA": "Trưa", "TOI": "Tối" };

// Helper format date local
const fmtDateLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function MealPlan() {
  const { success, info, warning, error } = useToastContext();
  const { groupId, user } = useAuth();
  const { todayMeals, weekMeals, loading, loadToday, loadWeek, addMeal, removeMeal } = useMealPlan();

  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [addingTo, setAddingTo] = useState<{ day: string; time: string; date: string } | null>(null);
  const [preselectedRecipe, setPreselectedRecipe] = useState("");
  const [viewingMeal, setViewingMeal] = useState<any>(null);

  // Active weekly dates range state
  const [currentWeekRange, setCurrentWeekRange] = useState({ start: "", end: "", days: [] as { label: string; dateStr: string; date: Date }[] });

  // Ingredient analysis state
  const [selectedMealForCheck, setSelectedMealForCheck] = useState<any | null>(null);
  const [ingAnalysis, setIngAnalysis] = useState<any | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Weekly Range Copier Modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyOffset, setCopyOffset] = useState(-1); // default copy from last week (-1)

  // Compute active week range
  const computeWeekRange = useCallback(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon ...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

    const daysList = [];
    const dayKeys = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      daysList.push({
        label: dayKeys[i],
        dateStr: fmtDateLocal(d),
        date: d
      });
    }

    setCurrentWeekRange({
      start: fmtDateLocal(monday),
      end: fmtDateLocal(daysList[6].date),
      days: daysList
    });
  }, [weekOffset]);

  useEffect(() => {
    computeWeekRange();
  }, [computeWeekRange]);

  const fetchMealPlans = useCallback(async () => {
    if (!currentWeekRange.start || !currentWeekRange.end) return;
    try {
      await Promise.all([
        loadWeek(currentWeekRange.start, currentWeekRange.end),
        loadToday(),
      ]);
    } catch (e) {
      console.error("Failed to load meal plans:", e);
    }
  }, [currentWeekRange, loadWeek, loadToday]);

  useEffect(() => {
    fetchMealPlans();
  }, [fetchMealPlans]);

  // Enriched Grid Map from weekMeals
  const mealGrid = useMemo(() => {
    const grid: Record<string, Record<string, any>> = {};
    currentWeekRange.days.forEach(day => {
      grid[day.dateStr] = {};
      mealTimes.forEach(t => { grid[day.dateStr][t] = null; });
    });

    weekMeals.forEach(meal => {
      const ngayStr = meal.Ngay ? meal.Ngay.split('T')[0] : "";
      const timeKey = buoiRevMap[meal.Buoi] || meal.Buoi;
      if (grid[ngayStr] && timeKey) {
        grid[ngayStr][timeKey] = meal;
      }
    });
    return grid;
  }, [weekMeals, currentWeekRange]);

  const handleAddMeal = async (data: any) => {
    const mealName = data.recipeName;
    if (!mealName) {
      warning('Vui lòng chọn món ăn', 'Bạn cần chọn món ăn trước khi thêm.');
      return;
    }
    try {
      const selectedDate = data.date || (addingTo ? addingTo.date : fmtDateLocal(new Date()));
      
      // Chặn thêm kế hoạch bữa ăn trong quá khứ ở phía client
      const d = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() < today.getTime()) {
        warning('Ngày không hợp lệ', 'Không thể lên thực đơn cho các ngày trong quá khứ.');
        return;
      }

      await addMeal({
        ngay: selectedDate,
        buoi: buoiMap[data.mealType] || (addingTo ? buoiMap[addingTo.time] : 'TOI') || 'TOI',
        maMon: data.recipeId || null,
        soKhauPhan: Number(data.servings || 4),
        ghiChu: data.notes || '',
      });

      await fetchMealPlans();
      success('✅ Lên kế hoạch bữa ăn thành công!', `"${mealName}" đã được lên lịch.`);
      setAddingTo(null);
      setShowAddMeal(false);
    } catch (e: any) { 
      error('Lỗi lên thực đơn', e.message || 'Món ăn đã tồn tại hoặc ngày/giờ không khả dụng.'); 
    }
  };

  const handleRemoveMeal = async (meal: any) => {
    if (!meal.MaKeHoach) {
      error('Không thể xóa', 'Không tìm thấy mã kế hoạch bữa ăn.');
      return;
    }
    try {
      await removeMeal(meal.MaKeHoach);
      await fetchMealPlans();
      success(`🗑️ Đã xóa món ăn`, `Đã xóa kế hoạch khỏi thực đơn.`);
      if (selectedMealForCheck?.MaKeHoach === meal.MaKeHoach) {
        setSelectedMealForCheck(null);
        setIngAnalysis(null);
      }
    } catch (e: any) { error('Lỗi xóa thực đơn', e.message); }
  };

  const handleSelectMealForCheck = async (meal: any) => {
    setSelectedMealForCheck(meal);
    if (!meal.MaMon) {
      setIngAnalysis(null);
      return;
    }
    setLoadingAnalysis(true);
    try {
      const res = await mealPlanApi.checkIngredients(meal.MaMon, meal.SoKhauPhan || 4, groupId || 0);
      setIngAnalysis(res.data);
    } catch (e) {
      console.error("Ingredients check error:", e);
      setIngAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleAddMissingToShoppingList = async () => {
    if (!selectedMealForCheck) return;
    try {
      const res = await mealPlanApi.addMissingToShopping(
        selectedMealForCheck.MaMon,
        selectedMealForCheck.SoKhauPhan || 4,
        groupId || 0
      );
      success("🛒 Mua sắm siêu tốc thành công!", res.message);
      // Re-trigger check to update UI
      handleSelectMealForCheck(selectedMealForCheck);
    } catch (e: any) {
      error("Lỗi đồng bộ mua sắm", e.message || "Không thể đẩy nguyên liệu.");
    }
  };

  const handleCopyWeek = async () => {
    if (!groupId) return;
    try {
      // Calculate target starting Monday of current view
      const toMonday = currentWeekRange.start;
      
      // Calculate starting Monday of the source week
      const fromMondayDate = new Date(toMonday);
      fromMondayDate.setDate(fromMondayDate.getDate() + (copyOffset * 7));
      const fromMonday = fmtDateLocal(fromMondayDate);

      // Source end date is +6 days
      const fromSundayDate = new Date(fromMondayDate);
      fromSundayDate.setDate(fromSundayDate.getDate() + 6);
      const fromSunday = fmtDateLocal(fromSundayDate);

      await mealPlanApi.copyMealPlan(groupId, fromMonday, fromSunday, toMonday);
      await fetchMealPlans();
      success("📋 Sao chép thành công!", "Toàn bộ thực đơn tuần đã được nhân bản sang tuần hiện tại.");
      setShowCopyModal(false);
    } catch (e: any) {
      error("Lỗi sao chép", e.message || "Không thể nhân bản kế hoạch.");
    }
  };

  const handleGenerate = async (_data: any) => {
    await fetchMealPlans();
    success('🤖 Tạo tự động thành công!', 'Kế hoạch ăn uống của tuần đã được chuẩn bị.');
    setShowGenerate(false);
  };

  const handleAddSlotClick = (day: { label: string; dateStr: string }, time: string) => {
    // Chặn thêm kế hoạch quá khứ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(day.dateStr).getTime() < today.getTime()) {
      warning("Không thể lên thực đơn", "Không được lập kế hoạch ăn uống cho thời điểm trong quá khứ.");
      return;
    }
    setAddingTo({ day: day.label, time, date: day.dateStr });
    setPreselectedRecipe("");
    setShowAddMeal(true);
  };

  const totalMealsCount = weekMeals.length;
  const totalSlotsCount = 21; // 7 days * 3 shifts

  return (
    <div className="space-y-6 animate-slide-up pb-10">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border-light)] pb-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] tracking-tight mb-1 flex items-center gap-2">
            Kế hoạch bữa ăn <span className="text-xl">🗓️</span>
          </h1>
          <p className="text-[var(--text-muted)] text-sm font-medium">
            {loading ? "Đang đồng bộ..." : `Thực đơn dinh dưỡng tuần — ${totalMealsCount}/${totalSlotsCount} bữa ăn lên lịch`}
          </p>
        </div>
        
        {/* Navigation Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white border border-[var(--border-light)] rounded-xl p-1 flex items-center gap-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--purple-deep)] hover:bg-[var(--purple-deep)]/5"
              onClick={() => { setWeekOffset(prev => prev - 1); setSelectedMealForCheck(null); }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-8 text-xs font-bold text-[var(--purple-deep)] hover:bg-[var(--purple-deep)]/5 px-2.5"
              onClick={() => { setWeekOffset(0); setSelectedMealForCheck(null); }}
              disabled={weekOffset === 0}
            >
              Tuần hiện tại
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[var(--purple-deep)] hover:bg-[var(--purple-deep)]/5"
              onClick={() => { setWeekOffset(prev => prev + 1); setSelectedMealForCheck(null); }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowCopyModal(true)}
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            Sao chép tuần
          </Button>

          <Button 
            variant="outline" 
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
            onClick={() => setShowGenerate(true)}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
            Tạo tự động
          </Button>

          <Button 
            className="bg-gradient-purple text-white font-bold shadow-md hover-lift rounded-[var(--radius-btn)] py-2 px-4 text-xs"
            onClick={() => { setAddingTo(null); setShowAddMeal(true); }}
          >
            <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
            Thêm bữa ăn
          </Button>
        </div>
      </div>

      {/* ─── MAIN GRID ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =================================================================
            CỘT TRÁI (BẢNG LỊCH TUẦN CHI TIẾT): Thiết kế trực quan, mượt mà
           ================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] overflow-hidden bg-white">
            <CardHeader className="bg-gradient-purple text-white py-4 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white text-sm font-black">
                <CalendarIcon className="w-4 h-4" />
                Tuần: {currentWeekRange.start.split('-').reverse().join('/')} ~ {currentWeekRange.end.split('-').reverse().join('/')}
              </CardTitle>
              <Badge className="bg-white/20 text-white border-none text-[10px] font-bold">
                {totalMealsCount} bữa / Tuần
              </Badge>
            </CardHeader>
            
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-light)] bg-gray-50/50">
                    <th className="p-4 text-left font-bold text-[var(--text-muted)] w-20 uppercase tracking-wider">Buổi</th>
                    {currentWeekRange.days.map((day) => {
                      const todayStr = fmtDateLocal(new Date());
                      const isToday = day.dateStr === todayStr;
                      return (
                        <th key={day.dateStr} className={`p-3 text-center min-w-[130px] border-l border-[var(--border-light)] ${isToday ? "bg-[var(--purple-deep)]/5" : ""}`}>
                          <div className="font-black text-sm text-[var(--text-dark)]">{day.label}</div>
                          <div className={`text-[10px] font-semibold mt-0.5 ${isToday ? "text-[var(--purple-deep)] font-bold" : "text-gray-400"}`}>
                            {day.date.getDate()}/{day.date.getMonth() + 1}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {mealTimes.map((time) => (
                    <tr key={time} className="border-b border-[var(--border-light)] last:border-none">
                      <td className="p-4 font-black text-gray-500 uppercase tracking-wider">{time}</td>
                      {currentWeekRange.days.map((day) => {
                        const meal = mealGrid[day.dateStr]?.[time];
                        const todayStr = fmtDateLocal(new Date());
                        const isToday = day.dateStr === todayStr;
                        const isPast = new Date(day.dateStr).getTime() < new Date(todayStr).getTime();

                        return (
                          <td key={`${day.dateStr}-${time}`} className={`p-2 border-l border-[var(--border-light)] ${isToday ? "bg-[var(--purple-deep)]/5" : ""}`}>
                            {meal ? (
                              <div
                                onClick={() => handleSelectMealForCheck(meal)}
                                className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative group ${
                                  selectedMealForCheck?.MaKeHoach === meal.MaKeHoach
                                    ? "bg-[var(--purple-deep)]/5 border-[var(--purple-deep)] shadow-sm"
                                    : "bg-[var(--card-bg)] border-transparent hover:border-[var(--purple-deep)]/30 hover:shadow"
                                }`}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-base flex-shrink-0">🍲</span>
                                  <span className="font-bold text-[var(--text-dark)] truncate block flex-grow">
                                    {meal.TenMon}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1 text-[8px] text-[var(--text-muted)] font-semibold mt-2.5">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{meal.SoKhauPhan || 4} suất</span>
                                </div>

                                {meal.MaMon === null && (
                                  <Badge className="bg-red-50 text-red-600 border border-red-200 mt-2 text-[8px] font-bold py-0 px-1 rounded-sm w-full block text-center truncate">
                                    🚫 Công thức đã bị xóa
                                  </Badge>
                                )}

                                {/* Delete button on hover */}
                                <button
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm transition-opacity hover:bg-red-200"
                                  onClick={(e) => { e.stopPropagation(); handleRemoveMeal(meal); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={isPast}
                                className={`w-full p-3.5 rounded-xl border border-dashed border-gray-300 flex items-center justify-center transition-all ${
                                  isPast 
                                    ? "opacity-30 cursor-not-allowed bg-gray-100/50" 
                                    : "hover:border-[var(--purple-deep)] hover:bg-[var(--purple-deep)]/5 text-gray-400 hover:text-[var(--purple-deep)]"
                                }`}
                                onClick={() => handleAddSlotClick(day, time)}
                              >
                                <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>

        {/* =================================================================
            CỘT PHẢI (CHI TIẾT & PHÂN TÍCH KHO): So khớp tủ lạnh realtime, mua sắm
           ================================================================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Detailed analysis feed */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-[var(--border-light)] bg-gradient-to-r from-[var(--purple-deep)]/5 to-[var(--purple-deep)]/10">
              <CardTitle className="text-xs font-bold text-[var(--text-dark)] uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[var(--purple-deep)]" />
                <span>Chi tiết & Đối chiếu kho thực phẩm</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              {!selectedMealForCheck ? (
                <div className="text-center py-14 text-[var(--text-muted)]">
                  <div className="text-4xl mb-2">💡</div>
                  <p className="font-bold text-xs text-[var(--text-dark)] leading-normal">Chọn một bữa ăn trong lịch tuần</p>
                  <p className="text-[10px] leading-relaxed mt-1.5 px-3">
                    Hệ thống sẽ lập tức quét tủ lạnh và tủ đông để tính toán số nguyên liệu còn thiếu và đề xuất đi chợ.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs text-[var(--text-dark)]">
                  
                  {/* Quick Card Summary */}
                  <div className="bg-[var(--card-bg)] rounded-xl p-3.5 space-y-2 border border-[var(--border-light)] relative">
                    <div className="absolute top-3.5 right-3.5 text-2xl">🍲</div>
                    <h3 className="font-black text-sm text-[var(--purple-deep)] pr-6">{selectedMealForCheck.TenMon}</h3>
                    
                    <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] font-semibold">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {selectedMealForCheck.SoKhauPhan || 4} khẩu phần ăn
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 bg-[var(--purple-deep)]/5 text-[var(--purple-deep)] px-1.5 py-0.5 rounded-sm">
                        {buoiRevMap[selectedMealForCheck.Buoi] || selectedMealForCheck.Buoi}
                      </span>
                    </div>

                    {selectedMealForCheck.GhiChu && (
                      <p className="text-[10px] text-gray-500 font-semibold italic border-t border-gray-200/50 pt-2 mt-1">
                        👉 {selectedMealForCheck.GhiChu}
                      </p>
                    )}
                  </div>

                  {/* Pantry check results */}
                  <div className="space-y-3.5">
                    <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                      Đối chiếu tủ lạnh thực tế
                    </span>

                    {loadingAnalysis ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-[var(--purple-deep)]" />
                        <span className="ml-2 font-bold text-[10px] text-[var(--text-muted)]">Đang quét kho...</span>
                      </div>
                    ) : !selectedMealForCheck.MaMon ? (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-[10px] font-semibold leading-relaxed">
                        ⚠️ Món ăn này được thêm thủ công hoặc công thức gốc đã bị xóa khỏi hệ thống, do đó không thể quét các thành phần nguyên liệu chi tiết.
                      </div>
                    ) : !ingAnalysis || ingAnalysis.details.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] py-4 text-center">
                        Công thức này chưa được gán bất kỳ nguyên liệu chi tiết nào.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ingAnalysis.details.map((ing: any, i: number) => {
                          const needStr = `${ing.soLuongCan} ${ing.donVi}`;
                          const availableStr = `${ing.soLuongKho} ${ing.donVi}`;

                          return (
                            <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-[11px] text-[var(--text-dark)] truncate">{ing.tenThucPham}</p>
                                <p className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5">
                                  Cần dùng: {needStr} | Có trong kho: {availableStr}
                                </p>
                              </div>
                              
                              <div className="flex-shrink-0">
                                {ing.isEnough ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[8px] py-0.5 px-1.5 flex items-center gap-0.5">
                                    <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                                    Đủ
                                  </Badge>
                                ) : (
                                  <Badge className="bg-orange-50 text-orange-700 border-none font-bold text-[8px] py-0.5 px-1.5 flex items-center gap-0.5 animate-pulse">
                                    <AlertTriangle className="w-2.5 h-2.5 text-orange-600" />
                                    Thiếu {ing.thieu} {ing.donVi}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Proactive actions */}
                        <div className="pt-2">
                          {ingAnalysis.enough ? (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-[10px] font-semibold leading-relaxed flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>Tuyệt vời! Tủ lạnh nhà bạn có đầy đủ các nguyên liệu cần thiết để chuẩn bị cho bữa ăn này.</span>
                            </div>
                          ) : (
                            <Button
                              onClick={handleAddMissingToShoppingList}
                              className="w-full bg-gradient-to-r from-orange-500 to-[#EA580C] text-white font-bold py-2.5 shadow-md hover-lift rounded-xl flex items-center justify-center gap-1.5 text-[10px]"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Tự động đi chợ (Thêm đồ thiếu vào giỏ)
                            </Button>
                          )}
                        </div>

                      </div>
                    )}

                  </div>

                </div>
              )}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <AddMealPlanModal
        isOpen={showAddMeal}
        onClose={() => { setShowAddMeal(false); setAddingTo(null); setPreselectedRecipe(''); }}
        onSubmit={handleAddMeal}
        onSuccess={fetchMealPlans}
        initialRecipeName={preselectedRecipe}
      />
      
      <GenerateMealPlanModal isOpen={showGenerate} onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} />
      
      {/* Range Copy Modal (Visual Premium) */}
      <ConfirmDialog
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        onConfirm={handleCopyWeek}
        title="Sao chép thực đơn tuần?"
        message={
          <div className="space-y-3.5 text-xs text-[var(--text-dark)] p-1 text-left">
            <p className="font-semibold text-gray-500">
              Nhân bản toàn bộ các món ăn đã lập lịch từ tuần trước sang tuần này để tránh phải khai báo lặp lại:
            </p>
            <div className="bg-[var(--card-bg)] border rounded-xl p-3 space-y-2">
              <label className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Chọn nguồn sao chép</label>
              <select
                value={copyOffset}
                onChange={(e) => setCopyOffset(Number(e.target.value))}
                className="w-full h-9 bg-white border border-[var(--border-light)] rounded-[var(--radius-sm)] px-2 font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--purple-deep)]"
              >
                <option value={-1}>⏪ Tuần trước (1 tuần trước)</option>
                <option value={-2}>⏮️ 2 tuần trước</option>
                <option value={-3}>⏮️ 3 tuần trước</option>
              </select>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              * Hệ thống tự động bù trừ ngày tương ứng. Các kế hoạch cũ sẽ không bị xóa trừ khi có trùng lặp.
            </p>
          </div>
        }
        confirmText="Bắt đầu sao chép"
        cancelText="Hủy bỏ"
        type="default"
      />

    </div>
  );
}