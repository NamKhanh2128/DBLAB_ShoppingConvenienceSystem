import { useState, useMemo, useCallback } from "react";
import {
  Plus, Search, Clock, Users, Star, Filter, Eye, ChefHat, Trash2,
  Loader2, Lightbulb, Play, CheckCircle2, ChevronRight, ChevronLeft,
  Lock, Globe, Flame, AlertCircle, X
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { AddRecipeModal, ViewRecipeModal, FilterModal, AddMealPlanModal } from "../../components/common";
import { useRecipes, useMealPlan } from "../../hooks/useData";
import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & helpers
// ─────────────────────────────────────────────────────────────────────────────
const difficultyColors: Record<string, string> = {
  "Dễ": "var(--success)",
  "Trung bình": "var(--warning)",
  "Khó": "var(--danger)",
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  "Dễ": "🟢",
  "Trung bình": "🟡",
  "Khó": "🔴",
};

function mapRecipe(raw: any) {
  const ingredientLines: string[] = raw.CongThuc
    ? raw.CongThuc.split("\n").filter(Boolean)
    : [];
  const ingredients = ingredientLines.map((line: string) => {
    const dashIdx = line.lastIndexOf(" - ");
    if (dashIdx !== -1) {
      return { name: line.substring(0, dashIdx).trim(), quantity: line.substring(dashIdx + 3).trim() };
    }
    return { name: line.trim(), quantity: "" };
  });
  const steps: string[] = raw.HuongDan
    ? raw.HuongDan.split("\n").filter(Boolean)
    : [];
  return {
    id: raw.MaMon,
    name: raw.TenMon,
    time: `${raw.ThoiGian || 30} phút`,
    cookingTime: raw.ThoiGian || 30,
    servings: raw.KhauPhan || 4,
    image: raw.HinhAnh || "",
    difficulty: raw.DoKho || "Trung bình",
    category: raw.DanhMuc || "Khác",
    rating: raw.DiemDanhGia || 4.0,
    description: raw.MoTa || "",
    ingredients,
    steps,
    isPrivate: raw.MaNhom !== null && raw.MaNhom !== undefined,
    maNhom: raw.MaNhom,
    maNguoiTao: raw.MaNguoiTao,
    matchPercent: raw.matchPercent,
    canCook: raw.canCook,
    _raw: raw,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CookingModal — Step-by-step mode + "Đã nấu xong" trừ kho
// ─────────────────────────────────────────────────────────────────────────────
function CookingModal({
  recipe,
  onClose,
  onCook,
}: {
  recipe: ReturnType<typeof mapRecipe>;
  onClose: () => void;
  onCook: (id: number, servings: number) => Promise<any>;
}) {
  const [step, setStep] = useState(0);
  const [servings, setServings] = useState(recipe.servings);
  const [cooking, setCooking] = useState(false);
  const [done, setDone] = useState(false);
  const [cookResult, setCookResult] = useState<any>(null);
  const { success, warning, error } = useToastContext();

  const steps = recipe.steps.length > 0
    ? recipe.steps
    : ["Không có hướng dẫn nấu ăn cho công thức này."];

  const handleCook = async () => {
    setCooking(true);
    try {
      const result = await onCook(recipe.id, servings);
      setCookResult(result);
      setDone(true);
      if (result?.warning) {
        warning("⚠️ Thiếu một số nguyên liệu", result.warning);
      } else {
        success(`🍳 Đã nấu "${recipe.name}"!`, `Đã trừ ${result?.deductedCount ?? 0} nguyên liệu khỏi kho.`);
      }
    } catch (e: any) {
      error("Lỗi", e.message);
    } finally {
      setCooking(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
          <div>
            <h2 className="text-white font-black text-lg">🍳 Chế độ nấu ăn</h2>
            <p className="text-white/70 text-sm truncate max-w-[260px]">{recipe.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-smooth">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {!done ? (
            <>
              {/* Servings selector */}
              <div className="px-6 py-4 bg-[var(--card-bg)] border-b border-[var(--border-light)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 font-semibold uppercase tracking-wide">Số khẩu phần</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServings(s => Math.max(1, s - 1))}
                    className="w-8 h-8 rounded-full border-2 border-[var(--gold)] text-[var(--gold)] font-bold flex items-center justify-center hover:bg-[var(--gold)] hover:text-white transition-smooth"
                  >-</button>
                  <span className="w-10 text-center font-black text-xl text-[var(--text-dark)]">{servings}</span>
                  <button
                    onClick={() => setServings(s => Math.min(100, s + 1))}
                    className="w-8 h-8 rounded-full border-2 border-[var(--gold)] text-[var(--gold)] font-bold flex items-center justify-center hover:bg-[var(--gold)] hover:text-white transition-smooth"
                  >+</button>
                  <span className="text-sm text-[var(--text-muted)]">người</span>
                  {servings !== recipe.servings && (
                    <Badge className="ml-auto text-xs border-none" style={{ backgroundColor: "var(--warning)", color: "white" }}>
                      ×{(servings / recipe.servings).toFixed(1)} lượng NL
                    </Badge>
                  )}
                </div>
              </div>

              {/* Steps */}
              <div className="px-6 py-5">
                {/* Progress dots */}
                <div className="flex gap-1.5 mb-6 justify-center flex-wrap">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-[var(--purple-deep)]" : i < step ? "w-2 bg-[var(--success)]" : "w-2 bg-[var(--border-light)]"}`}
                    />
                  ))}
                </div>

                {/* Current step */}
                <div className="flex items-start gap-4 animate-slide-up" key={step}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg text-white" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    {step + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Bước {step + 1} / {steps.length}
                    </p>
                    <p className="text-[var(--text-dark)] font-medium leading-relaxed text-base">{steps[step]}</p>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(s => s - 1)}
                    disabled={step === 0}
                    className="flex-1 rounded-[var(--radius-sm)] border-[var(--border-light)]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />Trước
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button
                      onClick={() => setStep(s => s + 1)}
                      className="flex-1 bg-gradient-purple text-white rounded-[var(--radius-sm)]"
                    >
                      Tiếp<ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCook}
                      disabled={cooking}
                      className="flex-1 text-white font-bold rounded-[var(--radius-sm)]"
                      style={{ background: "linear-gradient(135deg, var(--success), #38a169)" }}
                    >
                      {cooking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      {cooking ? "Đang trừ kho..." : "✅ Đã nấu xong!"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Done state */
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, var(--success), #38a169)" }}>
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-black text-xl text-[var(--text-dark)] mb-2">Nấu ăn thành công! 🎉</h3>
              <p className="text-[var(--text-muted)] mb-4">
                Đã trừ <strong>{cookResult?.deductedCount ?? 0}</strong> nguyên liệu khỏi kho.
              </p>
              {cookResult?.notFoundIngredients?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left mb-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />Nguyên liệu không đủ trong kho:
                  </p>
                  <ul className="text-xs text-yellow-600 list-disc list-inside space-y-0.5">
                    {cookResult.notFoundIngredients.map((nl: string) => (
                      <li key={nl}>{nl}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={onClose} className="w-full bg-gradient-gold text-white rounded-[var(--radius-btn)]">
                Xong
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuggestModal — Gợi ý theo kho có sẵn
// ─────────────────────────────────────────────────────────────────────────────
function SuggestModal({
  suggestions,
  loading,
  onClose,
  onView,
}: {
  suggestions: ReturnType<typeof mapRecipe>[];
  loading: boolean;
  onClose: () => void;
  onView: (r: ReturnType<typeof mapRecipe>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "85vh" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]" style={{ background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" }}>
          <div>
            <h2 className="text-white font-black text-lg">💡 Gợi ý từ tủ lạnh</h2>
            <p className="text-white/80 text-sm">Công thức có thể nấu ngay với kho hiện tại</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-smooth">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)] mr-3" />
              <span className="text-[var(--text-muted)]">Đang phân tích kho...</span>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-30 mb-3" />
              <p className="font-semibold text-[var(--text-muted)]">Chưa tìm thấy gợi ý</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Thêm nguyên liệu vào kho hoặc liên kết công thức với kho</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-light)] hover:border-[var(--gold)] hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => { onView(r); onClose(); }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[var(--card-bg)] flex-shrink-0">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--text-dark)] truncate">{r.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />{r.time}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">·</span>
                      <span className="text-xs font-semibold" style={{ color: (r.matchPercent ?? 0) >= 100 ? "var(--success)" : "var(--warning)" }}>
                        {r.canCook ? "✅ Đủ nguyên liệu" : `⚠️ Đủ ${r.matchPercent ?? 0}%`}
                      </span>
                    </div>
                  </div>
                  {/* Match progress bar */}
                  <div className="w-12 text-right">
                    <div className="text-xs font-black" style={{ color: (r.matchPercent ?? 0) >= 100 ? "var(--success)" : "var(--gold)" }}>
                      {r.matchPercent ?? 0}%
                    </div>
                    <div className="w-12 h-1.5 bg-[var(--border-light)] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, r.matchPercent ?? 0)}%`, backgroundColor: (r.matchPercent ?? 0) >= 100 ? "var(--success)" : "var(--gold)" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function Recipes() {
  const { success, info, error } = useToastContext();
  const { groupId } = useAuth();
  const {
    recipes: rawRecipes, suggestions: rawSuggestions,
    loading, suggestLoading,
    addRecipe, deleteRecipe, cookRecipe, loadSuggestions,
  } = useRecipes();
  const { addMeal, loadToday } = useMealPlan();

  const recipes = useMemo(() => rawRecipes.map(mapRecipe), [rawRecipes]);
  const suggestions = useMemo(() => rawSuggestions.map(mapRecipe), [rawSuggestions]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showPrivateOnly, setShowPrivateOnly] = useState(false);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<ReturnType<typeof mapRecipe> | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<ReturnType<typeof mapRecipe> | null>(null);
  const [addToPlanRecipe, setAddToPlanRecipe] = useState<{ id: number; name: string } | null>(null);
  void info;

  const categories = useMemo(() =>
    ["Tất cả", ...Array.from(new Set(recipes.map(r => r.category)))],
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tất cả" || recipe.category === selectedCategory;
      const matchesPrivate = !showPrivateOnly || recipe.isPrivate;
      return matchesSearch && matchesCategory && matchesPrivate;
    });
  }, [recipes, searchQuery, selectedCategory, showPrivateOnly]);

  // Thống kê nhanh
  const privateCount = useMemo(() => recipes.filter(r => r.isPrivate).length, [recipes]);
  const systemCount = useMemo(() => recipes.filter(r => !r.isPrivate).length, [recipes]);

  const handleAddRecipe = async (data: any) => {
    try {
      const congThuc = Array.isArray(data.ingredients)
        ? data.ingredients
            .filter((ing: any) => ing && (ing.name || ing))
            .map((ing: any) => typeof ing === "string" ? ing : `${ing.name} - ${ing.quantity}`)
            .join("\n")
        : (data.description || "");
      const huongDan = Array.isArray(data.steps)
        ? data.steps.filter((s: any) => s).map((s: any) => typeof s === "string" ? s : (s.description || String(s))).join("\n")
        : (data.instructions || "");
      await addRecipe({
        tenMon: data.name || "Công thức mới",
        congThuc,
        huongDan,
        moTa: data.description || "",
        thoiGian: parseInt(data.cookingTime || "30"),
        khauPhan: parseInt(data.servings || "4"),
        doKho: data.difficulty || "Dễ",
        danhMuc: data.cuisine || data.category || "Khác",
      });
      success("✅ Thêm công thức thành công!", `"${data.name}" đã được lưu riêng cho gia đình bạn.`);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleDeleteRecipe = async (recipe: ReturnType<typeof mapRecipe>) => {
    if (!recipe.isPrivate) {
      error("Không thể xóa", "Đây là công thức hệ thống, không thể xóa.");
      return;
    }
    try {
      await deleteRecipe(recipe.id);
      success(`🗑️ Đã xóa "${recipe.name}"`, "Công thức đã được xóa.");
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleCookRecipe = useCallback(async (id: number, servings: number) => {
    return await cookRecipe(id, servings);
  }, [cookRecipe]);

  const handleAddToMealPlan = (recipeId: number, recipeName: string) => {
    setViewRecipe(null);
    setAddToPlanRecipe({ id: recipeId, name: recipeName });
  };

  const handleMealPlanSubmit = async (data: any) => {
    try {
      await addMeal({
        ngay: data.date || new Date().toISOString().split("T")[0],
        buoi: data.mealType === "Sáng" ? "SANG" : data.mealType === "Trưa" ? "TRUA" : data.mealType === "Phụ" ? "PHU" : "TOI",
        maMon: addToPlanRecipe?.id || 1,
        tenMon: addToPlanRecipe?.name || data.recipeName,
        ghiChu: data.notes || "",
      });
      await loadToday();
      success("✅ Đã thêm vào kế hoạch!", `"${addToPlanRecipe?.name}" đã được lên thực đơn.`);
      setAddToPlanRecipe(null);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleOpenSuggest = async () => {
    setShowSuggest(true);
    await loadSuggestions();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Công thức nấu ăn</h1>
          <p className="text-[var(--text-muted)]">
            👨‍🍳 {recipes.length} công thức —
            <span className="text-[var(--text-muted)]"> {privateCount} riêng tư</span>
            {" · "}
            <span className="text-[var(--text-muted)]">{systemCount} hệ thống</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Suggest button */}
          <Button
            variant="outline"
            className="rounded-[var(--radius-btn)] border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white transition-smooth font-semibold"
            onClick={handleOpenSuggest}
          >
            <Lightbulb className="w-4 h-4 mr-2" />Gợi ý từ kho
          </Button>
          <Button
            className="bg-gradient-gold text-white font-semibold shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-btn)] px-6 py-6"
            onClick={() => setShowAddRecipe(true)}
          >
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Thêm công thức
          </Button>
        </div>
      </div>

      {/* ── Search, Filter, Category tabs ──────────────────────────── */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Tìm kiếm theo tên, danh mục, mô tả..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth"
              onClick={() => setShowFilter(true)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category pills + Private toggle */}
          <div className="flex gap-2 flex-wrap items-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-smooth ${selectedCategory === cat ? "bg-gradient-gold text-white shadow-[var(--shadow-btn)]" : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-dark)] hover:shadow-sm"}`}
              >
                {cat}
              </button>
            ))}
            {groupId && (
              <button
                onClick={() => setShowPrivateOnly(p => !p)}
                className={`ml-auto px-4 py-1.5 rounded-full text-sm font-semibold transition-smooth flex items-center gap-1.5 ${showPrivateOnly ? "bg-[var(--purple-deep)] text-white" : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-white"}`}
              >
                <Lock className="w-3 h-3" />Của gia đình tôi
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Recipe Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--gold)] mr-3" />
          <span className="text-[var(--text-muted)]">Đang tải công thức...</span>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 mx-auto text-[var(--text-muted)] opacity-30 mb-4" />
          <p className="font-semibold text-[var(--text-muted)]">Không tìm thấy công thức</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Thử từ khóa khác hoặc thêm công thức mới</p>
          <Button className="mt-4 bg-gradient-gold text-white rounded-[var(--radius-btn)]" onClick={() => setShowAddRecipe(true)}>
            <Plus className="w-4 h-4 mr-2" />Thêm công thức mới
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="border-none shadow-[var(--shadow-card)] hover:shadow-xl transition-all rounded-[var(--radius)] overflow-hidden group cursor-pointer"
              onClick={() => setViewRecipe(recipe)}
            >
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-[var(--card-bg)] to-[var(--border-light)] flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
                <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="font-semibold border-none shadow-lg text-white text-xs" style={{ backgroundColor: difficultyColors[recipe.difficulty] || "var(--success)" }}>
                    {DIFFICULTY_EMOJI[recipe.difficulty]} {recipe.difficulty}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                  <Badge className="bg-white/90 text-[var(--text-dark)] border-none shadow-sm font-semibold text-xs">{recipe.category}</Badge>
                  {/* Privacy badge */}
                  {recipe.isPrivate ? (
                    <Badge className="text-white border-none text-xs flex items-center gap-1" style={{ backgroundColor: "var(--purple-deep)" }}>
                      <Lock className="w-2.5 h-2.5" />Riêng tư
                    </Badge>
                  ) : (
                    <Badge className="border-none text-xs flex items-center gap-1 bg-blue-500 text-white">
                      <Globe className="w-2.5 h-2.5" />Hệ thống
                    </Badge>
                  )}
                </div>

                {/* Hover actions */}
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    onClick={e => { e.stopPropagation(); setViewRecipe(recipe); }}
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4 text-[var(--purple-deep)]" />
                  </button>
                  <button
                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    onClick={e => { e.stopPropagation(); setCookingRecipe(recipe); }}
                    title="Bắt đầu nấu"
                  >
                    <Flame className="w-4 h-4 text-[var(--warning)]" />
                  </button>
                  {/* Chỉ hiện nút xóa với recipe riêng tư */}
                  {recipe.isPrivate && (
                    <button
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      onClick={e => { e.stopPropagation(); handleDeleteRecipe(recipe); }}
                      title="Xóa công thức"
                    >
                      <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card body */}
              <CardContent className="p-4">
                <h3 className="font-bold text-[var(--text-dark)] mb-2 truncate">{recipe.name}</h3>
                {recipe.description && (
                  <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{recipe.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{recipe.time}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /><span>{recipe.servings} người</span></div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-3.5 h-3.5 text-[var(--gold)] fill-[var(--gold)]" />
                    <span className="font-semibold text-[var(--gold)]">{recipe.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-gradient-purple text-white rounded-[var(--radius-sm)] hover-lift font-semibold"
                    onClick={e => { e.stopPropagation(); setViewRecipe(recipe); }}
                  >
                    <Eye className="w-4 h-4 mr-1.5" />Xem
                  </Button>
                  <Button
                    className="flex-1 text-white rounded-[var(--radius-sm)] hover-lift font-semibold"
                    style={{ background: "linear-gradient(135deg, var(--warning), #dd6b20)" }}
                    onClick={e => { e.stopPropagation(); setCookingRecipe(recipe); }}
                  >
                    <Play className="w-4 h-4 mr-1.5" />Nấu ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <AddRecipeModal isOpen={showAddRecipe} onClose={() => setShowAddRecipe(false)} onSubmit={handleAddRecipe} />
      <FilterModal isOpen={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} type="recipe" />

      {viewRecipe && (
        <ViewRecipeModal
          isOpen={!!viewRecipe}
          onClose={() => setViewRecipe(null)}
          recipe={viewRecipe}
          onAddToMealPlan={handleAddToMealPlan}
        />
      )}

      {cookingRecipe && (
        <CookingModal
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
          onCook={handleCookRecipe}
        />
      )}

      {showSuggest && (
        <SuggestModal
          suggestions={suggestions}
          loading={suggestLoading}
          onClose={() => setShowSuggest(false)}
          onView={r => setViewRecipe(r)}
        />
      )}

      {addToPlanRecipe && (
        <AddMealPlanModal
          isOpen={!!addToPlanRecipe}
          onClose={() => setAddToPlanRecipe(null)}
          onSubmit={handleMealPlanSubmit}
          initialRecipeName={addToPlanRecipe.name}
          initialRecipeId={addToPlanRecipe.id}
        />
      )}
    </div>
  );
}
