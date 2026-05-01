import { useState, useMemo } from "react";
import { Plus, Search, Clock, Users, Star, Filter, Eye, ChefHat, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useToastContext } from "../../context/ToastContext";
import { AddRecipeModal, ViewRecipeModal, FilterModal } from "../../components/common";
import { useRecipes } from "../../hooks/useData";

const difficultyColors: Record<string, string> = {
  "Dễ": "var(--success)",
  "Trung bình": "var(--warning)",
  "Khó": "var(--danger)",
};

function mapRecipe(raw: any) {
  return {
    id: raw.MaMon,
    name: raw.TenMon,
    time: `${raw.ThoiGian || 30} phút`,
    cookingTime: raw.ThoiGian || 30,
    servings: raw.KhauPhan || 4,
    image: raw.HinhAnh || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    difficulty: raw.DoKho || "Trung bình",
    category: raw.DanhMuc || "Khác",
    rating: raw.DiemDanhGia || 4.0,
    description: raw.MoTa || raw.CongThuc || "",
    ingredients: [],
    steps: raw.HuongDan ? raw.HuongDan.split('\n').filter(Boolean) : [],
    _raw: raw,
  };
}

export function Recipes() {
  const { success, info, error } = useToastContext();
  const { recipes: rawRecipes, loading, addRecipe, deleteRecipe } = useRecipes();

  const recipes = useMemo(() => rawRecipes.map(mapRecipe), [rawRecipes]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewRecipe, setViewRecipe] = useState<any>(null);

  const categories = useMemo(() =>
    ["Tất cả", ...Array.from(new Set(recipes.map(r => r.category)))],
    [recipes]
  );

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Tất cả" || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, selectedCategory]);

  const handleAddRecipe = async (data: any) => {
    try {
      await addRecipe({
        tenMon: data.name || "Công thức mới",
        congThuc: data.ingredients?.join('\n') || data.description || "",
        huongDan: data.steps?.join('\n') || data.instructions || "",
        moTa: data.description || "",
        thoiGian: parseInt(data.cookingTime || "30"),
        khauPhan: parseInt(data.servings || "4"),
        doKho: data.difficulty || "Dễ",
        danhMuc: data.cuisine || data.category || "Khác",
      });
      success("✅ Thêm công thức thành công!", `"${data.name}" đã được lưu vào bộ sưu tập.`);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleDeleteRecipe = async (id: number, name: string) => {
    try {
      await deleteRecipe(id);
      success(`🗑️ Đã xóa "${name}"`, "Công thức đã được xóa.");
    } catch (e: any) { error("Lỗi", e.message); }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Món ăn</h1>
          <p className="text-[var(--text-muted)]">
            Khám phá và lưu công thức nấu ăn yêu thích 👨‍🍳 — {recipes.length} công thức
          </p>
        </div>
        <Button
          className="bg-gradient-gold text-white font-semibold shadow-[var(--shadow-btn)] hover-lift rounded-[var(--radius-btn)] px-6 py-6 self-start md:self-auto"
          onClick={() => setShowAddRecipe(true)}
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Thêm công thức
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
        <CardContent className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Tìm kiếm món ăn, danh mục..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth" onClick={() => setShowFilter(true)}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-smooth ${selectedCategory === cat ? 'bg-gradient-gold text-white shadow-[var(--shadow-btn)]' : 'bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-dark)] hover:shadow-sm'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
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
              <div className="aspect-video relative overflow-hidden bg-[var(--card-bg)] flex items-center justify-center">
                <span className="text-6xl">🍽️</span>
                <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 left-3">
                  <Badge className="font-semibold border-none shadow-lg text-white" style={{ backgroundColor: difficultyColors[recipe.difficulty] || 'var(--success)' }}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-[var(--text-dark)] border-none shadow-sm font-semibold">{recipe.category}</Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform" onClick={e => { e.stopPropagation(); setViewRecipe(recipe); }}>
                    <Eye className="w-4 h-4 text-[var(--purple-deep)]" />
                  </button>
                  <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform" onClick={e => { e.stopPropagation(); handleDeleteRecipe(recipe.id, recipe.name); }}>
                    <Trash2 className="w-4 h-4 text-[var(--danger)]" />
                  </button>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-[var(--text-dark)] mb-2 truncate">{recipe.name}</h3>
                <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                  <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><span>{recipe.time}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /><span>{recipe.servings} người</span></div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-3.5 h-3.5 text-[var(--gold)] fill-[var(--gold)]" />
                    <span className="font-semibold text-[var(--gold)]">{recipe.rating}</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-purple text-white rounded-[var(--radius-sm)] hover-lift font-semibold" onClick={e => { e.stopPropagation(); setViewRecipe(recipe); }}>
                  <Eye className="w-4 h-4 mr-2" />Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddRecipeModal isOpen={showAddRecipe} onClose={() => setShowAddRecipe(false)} onSubmit={handleAddRecipe} />
      <FilterModal isOpen={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} type="recipe" />
      {viewRecipe && <ViewRecipeModal isOpen={!!viewRecipe} onClose={() => setViewRecipe(null)} recipe={viewRecipe} />}
    </div>
  );
}
