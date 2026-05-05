import { X, Utensils, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";

interface AddMealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
  initialRecipeName?: string;
  initialRecipeId?: number | string;
}

const mealTypes = ["Sáng", "Trưa", "Tối", "Phụ"];
const recipesList = [
  "Phở bò",
  "Cơm gà",
  "Bún chả",
  "Mì xào hải sản",
  "Canh chua",
  "Gỏi cuốn",
  "Bánh mì",
  "Cháo lòng"
];

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
    servings: "4",
    cookingTime: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        recipeName: initialRecipeName || prev.recipeName,
      }));
    }
  }, [isOpen, initialRecipeName, initialRecipeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...formData, recipeId: initialRecipeId });
    await onSuccess?.();
    setFormData({
      date: "",
      mealType: "Trưa",
      recipeName: "",
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
          <Select value={formData.recipeName} onValueChange={(value) => setFormData({ ...formData, recipeName: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue placeholder="Chọn món ăn" />
            </SelectTrigger>
            <SelectContent>
              {recipesList.map((recipe) => (
                <SelectItem key={recipe} value={recipe}>{recipe}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
