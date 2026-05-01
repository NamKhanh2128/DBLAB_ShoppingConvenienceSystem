import { X, Sparkles, Calendar, Users, ChefHat } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import Modal from "./Modal";

interface GenerateMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
}

const dietaryPreferences = [
  { id: "vegetarian", label: "Chay", emoji: "🥗" },
  { id: "lowCarb", label: "Ít tinh bột", emoji: "🥑" },
  { id: "highProtein", label: "Nhiều protein", emoji: "🍗" },
  { id: "balanced", label: "Cân bằng", emoji: "⚖️" },
];

const mealTimes = [
  { id: "breakfast", label: "Bữa sáng", emoji: "🌅" },
  { id: "lunch", label: "Bữa trưa", emoji: "☀️" },
  { id: "dinner", label: "Bữa tối", emoji: "🌙" },
  { id: "snack", label: "Bữa phụ", emoji: "🍪" },
];

export function GenerateMealPlanModal({
  isOpen,
  onClose,
  onGenerate
}: GenerateMealPlanModalProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    servings: "4",
    selectedMeals: ["breakfast", "lunch", "dinner"],
    preferences: ["balanced"],
  });

  const toggleMeal = (mealId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedMeals: prev.selectedMeals.includes(mealId)
        ? prev.selectedMeals.filter(id => id !== mealId)
        : [...prev.selectedMeals, mealId]
    }));
  };

  const togglePreference = (prefId: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(prefId)
        ? prev.preferences.filter(id => id !== prefId)
        : [...prev.preferences, prefId]
    }));
  };

  const handleGenerate = () => {
    onGenerate(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo kế hoạch bữa ăn" size="lg">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Tự động tạo kế hoạch</h2>
              <p className="text-white/90 text-sm mt-1">
                AI sẽ gợi ý thực đơn phù hợp cho gia đình
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Date Range */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--gold)]" />
            Khoảng thời gian
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[var(--text-muted)] mb-1 block">Từ ngày</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                required
              />
            </div>
            <div>
              <Label className="text-xs text-[var(--text-muted)] mb-1 block">Đến ngày</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Servings */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--gold)]" />
            Số người ăn
          </Label>
          <Input
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
            placeholder="4"
            min="1"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
            required
          />
        </div>

        {/* Meal Times */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-3 block flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-[var(--gold)]" />
            Bữa ăn trong ngày
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {mealTimes.map((meal) => (
              <button
                key={meal.id}
                type="button"
                onClick={() => toggleMeal(meal.id)}
                className={`
                    p-4 rounded-[var(--radius-sm)] border-2 transition-smooth text-left
                    ${formData.selectedMeals.includes(meal.id)
                    ? "border-[var(--gold)] bg-gradient-gold/5 shadow-md"
                    : "border-[var(--border-light)] hover:border-[var(--gold)] hover:shadow-sm"
                  }
                  `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meal.emoji}</span>
                  <span className={`text-sm font-semibold ${formData.selectedMeals.includes(meal.id)
                    ? "text-[var(--gold)]"
                    : "text-[var(--text-dark)]"
                    }`}>
                    {meal.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-3 block">
            Sở thích ăn uống
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {dietaryPreferences.map((pref) => (
              <button
                key={pref.id}
                type="button"
                onClick={() => togglePreference(pref.id)}
                className={`
                    p-4 rounded-[var(--radius-sm)] border-2 transition-smooth text-left
                    ${formData.preferences.includes(pref.id)
                    ? "border-[var(--gold)] bg-gradient-gold/5 shadow-md"
                    : "border-[var(--border-light)] hover:border-[var(--gold)] hover:shadow-sm"
                  }
                  `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{pref.emoji}</span>
                  <span className={`text-sm font-semibold ${formData.preferences.includes(pref.id)
                    ? "text-[var(--gold)]"
                    : "text-[var(--text-dark)]"
                    }`}>
                    {pref.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-gradient-to-r from-[var(--gold-light)] to-[var(--purple-light)] rounded-[var(--radius-sm)] border-l-4 border-[var(--gold)]">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[var(--gold)] mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text-dark)] mb-1">
                AI sẽ tự động gợi ý
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Thực đơn được tạo dựa trên sở thích, nguyên liệu có sẵn trong kho và cân bằng dinh dưỡng
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!formData.startDate || !formData.endDate || formData.selectedMeals.length === 0}
            className="flex-1 bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Tạo kế hoạch
          </Button>
        </div>
      </div>
    </Modal>
  );
}
