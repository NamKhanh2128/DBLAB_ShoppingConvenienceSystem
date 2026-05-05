import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, ChefHat, Trash2, Sparkles, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { AddMealPlanModal, GenerateMealPlanModal, ViewRecipeModal } from "../../components/common";
import { useMealPlan } from "../../hooks/useData";

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const mealTimes = ["Sáng", "Trưa", "Tối"];

const buoiMap: Record<string, string> = { "Sáng": "SANG", "Trưa": "TRUA", "Tối": "TOI", "Phụ": "PHU" };
const buoiRevMap: Record<string, string> = { "SANG": "Sáng", "TRUA": "Trưa", "TOI": "Tối", "PHU": "Phụ" };

// Build grid from API data
function buildGrid(meals: any[]): Record<string, Record<string, any>> {
  const grid: Record<string, Record<string, any>> = {};
  weekDays.forEach(d => {
    grid[d] = {};
    mealTimes.forEach(t => { grid[d][t] = null; });
  });
  meals.forEach(meal => {
    const ngay = new Date(meal.Ngay);
    const dow = ngay.getDay(); // 0=Sun, 1=Mon...
    const dayKeys = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const dayKey = dayKeys[dow];
    const timeKey = buoiRevMap[meal.Buoi] || meal.Buoi;
    if (grid[dayKey] && timeKey) {
      grid[dayKey][timeKey] = { name: meal.TenMon || "Món ăn", emoji: "🍽️", id: meal.MaKH };
    }
  });
  return grid;
}

const suggestedDishes = [
  { name: "Canh chua cá lóc", emoji: "🐟", time: "30 phút", difficulty: "Dễ" },
  { name: "Gà kho gừng", emoji: "🍗", time: "25 phút", difficulty: "Dễ" },
  { name: "Thịt kho tàu", emoji: "🥩", time: "45 phút", difficulty: "Trung bình" },
  { name: "Canh rau muống", emoji: "🥬", time: "15 phút", difficulty: "Dễ" },
];

export function MealPlan() {
  const { success, info, warning, error } = useToastContext();
  const { todayMeals, weekMeals, loading, loadToday, loadWeek, addMeal, removeMeal } = useMealPlan();

  const [weekOffset, setWeekOffset] = useState(0);
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, any>>>({});
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [addingTo, setAddingTo] = useState<{ day: string; time: string } | null>(null);
  const [preselectedRecipe, setPreselectedRecipe] = useState("");
  const [viewingMeal, setViewingMeal] = useState<any>(null);

  const fetchMealPlans = async () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() + mondayOffset + weekOffset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const data = await loadWeek(fmt(start), fmt(end));
    const todayKey = now.toISOString().split('T')[0];
    const todayItems = (data || []).filter((item: any) => {
      const itemDate = new Date(item.Ngay).toISOString().split('T')[0];
      return itemDate === todayKey;
    });
    return { data: data || [], todayItems };
  };

  useEffect(() => {
    fetchMealPlans().then(({ todayItems }) => {
      loadToday();
      if (todayItems.length === 0 && weekOffset === 0) {
        return;
      }
    });
  }, [weekOffset]);

  useEffect(() => {
    setMealPlan(buildGrid(weekMeals));
  }, [weekMeals]);

  const totalMeals = Object.values(mealPlan).reduce((sum, day) =>
    sum + Object.values(day).filter(Boolean).length, 0
  );
  const totalSlots = weekDays.length * mealTimes.length;

  const handleAddMeal = async (data: any) => {
    const mealName = data.recipeName;
    if (!mealName) {
      warning("Vui lòng chọn món ăn", "Bạn cần chọn món ăn trước khi thêm.");
      return;
    }
    try {
      const selectedDate = data.date || new Date().toISOString().split('T')[0];
      await addMeal({
        ngay: selectedDate,
        buoi: buoiMap[data.mealType] || (addingTo ? buoiMap[addingTo.time] : "TOI") || "TOI",
        maMon: data.recipeId || 1,
        tenMon: mealName,
        ghiChu: data.notes || data.note || "",
      });
      await fetchMealPlans();
      await loadToday();
      success("✅ Thêm bữa ăn thành công!", `"${mealName}" đã được lên kế hoạch.`);
      setAddingTo(null);
      setShowAddMeal(false);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleRemoveMeal = async (day: string, time: string, mealName: string, id?: number) => {
    try {
      if (id) {
        await removeMeal(id);
        await fetchMealPlans();
        await loadToday();
      }
      success(`🗑️ Đã xóa "${mealName}"`, `Đã xóa khỏi bữa ${time} ${day}.`);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleGenerate = async (data: any) => {
    await fetchMealPlans();
    await loadToday();
    success("🤖 Tạo thực đơn thành công!", "Thực đơn tuần đã được tạo tự động.");
    setShowGenerate(false);
  };

  const handleAddSuggestedDish = (day: string, time: string, dishName?: string) => {
    setAddingTo({ day, time });
    setPreselectedRecipe(dishName || "");
    setShowAddMeal(true);
  };

  const handleClickMeal = (meal: any, day: string, time: string) => {
    setViewingMeal({
      name: meal.name,
      time: `${time} ${day}`,
      description: `Bữa ${time.toLowerCase()} ngon miệng cho cả gia đình`,
      servings: 4, cookingTime: "30 phút", difficulty: "Trung bình",
      ingredients: ["Nguyên liệu 1", "Nguyên liệu 2"],
      steps: ["Bước 1: Chuẩn bị nguyên liệu", "Bước 2: Chế biến", "Bước 3: Phục vụ"],
    });
    info(`${meal.emoji} ${meal.name}`, `Bữa ${time.toLowerCase()} ${day}`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Kế hoạch bữa ăn</h1>
          <p className="text-[var(--text-muted)]">
            {loading ? "Đang tải..." : `Lên thực đơn cho cả tuần — ${totalMeals}/${totalSlots} bữa đã lên kế hoạch 🗓️`}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button variant="outline" className="border-[var(--purple-deep)] text-[var(--purple-deep)] hover:bg-[var(--purple-deep)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth" onClick={() => setWeekOffset(weekOffset - 1)}>
            Tuần trước
          </Button>
          <Button variant="outline" className="border-[var(--purple-deep)] text-[var(--purple-deep)] hover:bg-[var(--purple-deep)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth" onClick={() => setWeekOffset(weekOffset + 1)}>
            Tuần sau
          </Button>
          <Button variant="outline" className="border-[var(--purple-deep)] text-[var(--purple-deep)] hover:bg-[var(--purple-deep)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth" onClick={() => setShowGenerate(true)}>
            <Sparkles className="w-4 h-4 mr-2" />Tạo tự động
          </Button>
          <Button className="bg-gradient-purple text-white font-semibold shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-btn)] px-6 py-6" onClick={() => { setAddingTo(null); setShowAddMeal(true); }}>
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Thêm bữa ăn
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--purple-deep)] mr-3" />
          <span className="text-[var(--text-muted)]">Đang tải kế hoạch bữa ăn...</span>
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] overflow-hidden">
        <CardHeader className="bg-gradient-purple text-white py-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <CalendarIcon className="w-5 h-5" />
            Tuần này
            <Badge className="ml-auto bg-white/20 text-white border-none">{totalMeals}/{totalSlots} bữa</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th className="p-4 text-left font-semibold text-[var(--text-muted)] w-20 text-sm">Buổi</th>
                  {weekDays.map((day) => (
                    <th key={day} className="p-3 text-center font-bold text-[var(--text-dark)] min-w-[130px] text-sm">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mealTimes.map((time) => (
                  <tr key={time} className="border-b border-[var(--border-light)] last:border-none">
                    <td className="p-4 font-semibold text-[var(--text-muted)] text-sm">{time}</td>
                    {weekDays.map((day) => {
                      const meal = mealPlan[day]?.[time];
                      return (
                        <td key={`${day}-${time}`} className="p-2">
                          {meal ? (
                            <div
                              className="bg-[var(--card-bg)] p-3 rounded-[var(--radius-sm)] border-2 border-[var(--border-purple)] hover:border-[var(--gold)] hover:shadow-md transition-smooth cursor-pointer group relative"
                              onClick={() => handleClickMeal(meal, day, time)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{meal.emoji}</span>
                                <span className="text-sm font-semibold text-[var(--text-dark)] truncate">{meal.name}</span>
                              </div>
                              <button
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--danger-light)] text-[var(--danger)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); handleRemoveMeal(day, time, meal.name, meal.id); }}
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="w-full p-3 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border-purple)] hover:border-[var(--purple-deep)] hover:bg-[var(--card-bg)] transition-smooth text-[var(--text-muted)] hover:text-[var(--purple-deep)] group"
                              onClick={() => handleAddSuggestedDish(day, time)}
                            >
                              <Plus className="w-4 h-4 mx-auto group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Dishes */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-[var(--text-dark)] flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[var(--food-orange)]" />Gợi ý món ăn
              </CardTitle>
              <Badge className="bg-[var(--gold-light)]/50 text-[var(--gold)] border-none font-semibold">AI</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedDishes.map((dish, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--card-bg)] hover:bg-white hover:shadow-md rounded-[var(--radius-sm)] transition-smooth group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dish.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-dark)]">{dish.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{dish.time} • {dish.difficulty}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-gradient-gold text-white rounded-[var(--radius-sm)] hover-lift font-semibold opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleAddSuggestedDish("", "", dish.name)}>
                  Thêm
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's meals quick view */}
        <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-black text-[var(--text-dark)] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--gold)]" />Bữa ăn hôm nay
              </CardTitle>
              <Badge className="bg-[var(--success-light)] text-[var(--success)] border-none font-semibold">
                {todayMeals.length} bữa
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayMeals.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] py-4 text-sm">Chưa có kế hoạch bữa ăn hôm nay</p>
            ) : (
              todayMeals.map((meal: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
                  <span className="text-2xl">🍽️</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[var(--text-dark)]">{meal.TenMon || "Món ăn"}</p>
                    <p className="text-xs text-[var(--text-muted)]">{buoiRevMap[meal.Buoi] || meal.Buoi}</p>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full rounded-[var(--radius-sm)] border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white font-semibold transition-smooth" onClick={() => setShowAddMeal(true)}>
              <Plus className="w-4 h-4 mr-2" />Thêm bữa hôm nay
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddMealPlanModal
        isOpen={showAddMeal}
        onClose={() => { setShowAddMeal(false); setAddingTo(null); setPreselectedRecipe(""); }}
        onSubmit={handleAddMeal}
        onSuccess={async () => { await fetchMealPlans(); await loadToday(); }}
        initialRecipeName={preselectedRecipe}
      />
      <GenerateMealPlanModal isOpen={showGenerate} onClose={() => setShowGenerate(false)} onGenerate={handleGenerate} />
      {viewingMeal && <ViewRecipeModal isOpen={!!viewingMeal} onClose={() => setViewingMeal(null)} recipe={viewingMeal} />}
    </div>
  );
}