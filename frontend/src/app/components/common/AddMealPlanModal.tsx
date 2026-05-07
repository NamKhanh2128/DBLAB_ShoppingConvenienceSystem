import { X, Utensils, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";
import { recipesApi } from "../../services/api";

interface AddMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
  initialRecipeName?: string;
  initialRecipeId?: number | string;
}

const mealTypes = ["Sáng", "Trưa", "Tối", "Phụ"];

export function AddMealPlanModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialRecipeName = "",
  initialRecipeId,
}: AddMealPlanModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    mealType: "Trưa",
    recipeName: "",
    recipeId: initialRecipeId ?? "",
    servings: "4",
    cookingTime: "",
    notes: "",
  });
  const [apiRecipes, setApiRecipes] = useState<{ id: number; name: string }[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        recipeName: initialRecipeName || prev.recipeName,
        recipeId: initialRecipeId ?? prev.recipeId,
      }));
      // Fetch real recipes from API
      setLoadingRecipes(true);
      recipesApi.getAll()
        .then(res => setApiRecipes((res.data || []).map((r: any) => ({ id: r.MaMon, name: r.TenMon }))))
        .catch(() => {})
        .finally(() => setLoadingRecipes(false));
    }
  }, [isOpen, initialRecipeName, initialRecipeId]);

  const handleRecipeSelect = (value: string) => {
    const found = apiRecipes.find(r => String(r.id) === value);
    setFormData(prev => ({
      ...prev,
      recipeName: found ? found.name : value,
      recipeId: found ? found.id : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, recipeId: formData.recipeId || initialRecipeId });
    await onSuccess?.();
    setFormData({
      date: "",
      mealType: "Trưa",
      recipeName: "",
      recipeId: "",
      servings: "4",
      cookingTime: "",
      notes: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm bữa ăn" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Thêm kế hoạch ăn</h2>
              <p className="text-white/90 text-sm mt-1">
                Lên kế hoạch bữa ăn cho gia đình
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Ngày ăn
          </Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
            required
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Bữa ăn
          </Label>
          <Select value={formData.mealType} onValueChange={(value) => setFormData({ ...formData, mealType: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map((meal) => (
                <SelectItem key={meal} value={meal}>{meal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Món ăn
          </Label>
          {loadingRecipes ? (
            <div className="flex items-center gap-2 h-10 px-3 border rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)] text-sm">Đang tải...</span>
            </div>
          ) : apiRecipes.length > 0 ? (
            <Select
              value={formData.recipeId ? String(formData.recipeId) : ""}
              onValueChange={handleRecipeSelect}
            >
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue placeholder={formData.recipeName || "Chọn món ăn"} />
              </SelectTrigger>
              <SelectContent>
                {apiRecipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={String(recipe.id)}>{recipe.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={formData.recipeName}
              onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
              placeholder="Nhập tên món ăn"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              required
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Số người ăn
            </Label>
            <Input
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              placeholder="4"
              min="1"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              required
            />
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              <Clock className="w-4 h-4 inline mr-1" />
              Thời gian (phút)
            </Label>
            <Input
              type="number"
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
              placeholder="30"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
            />
          </div>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Ghi chú (tùy chọn)
          </Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Thêm ghi chú về bữa ăn..."
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)] resize-none"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Thêm kế hoạch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
