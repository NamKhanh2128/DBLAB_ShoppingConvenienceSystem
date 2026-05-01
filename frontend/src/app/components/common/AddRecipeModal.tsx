import { X, ChefHat, Clock, Users, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const difficultyLevels = ["Dễ", "Trung bình", "Khó"];
const cuisineTypes = ["Việt Nam", "Trung Quốc", "Nhật Bản", "Hàn Quốc", "Châu Âu", "Khác"];

export function AddRecipeModal({
  isOpen,
  onClose,
  onSubmit
}: AddRecipeModalProps) {
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "" }]);
  const [steps, setSteps] = useState([""]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: "Việt Nam",
    difficulty: "Trung bình",
    cookingTime: "",
    servings: "4",
  });

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, ""]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, ingredients, steps });
    setFormData({
      name: "",
      description: "",
      cuisine: "Việt Nam",
      difficulty: "Trung bình",
      cookingTime: "",
      servings: "4",
    });
    setIngredients([{ name: "", quantity: "" }]);
    setSteps([""]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm công thức nấu ăn" size="xl">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Thêm công thức mới</h2>
              <p className="text-white/90 text-sm mt-1">
                Tạo công thức nấu ăn của riêng bạn
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-[var(--text-dark)]">Thông tin cơ bản</h3>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Tên món ăn
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Phở bò Hà Nội"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
              required
            />
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Mô tả
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn về món ăn..."
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
                Loại món
              </Label>
              <Select value={formData.cuisine} onValueChange={(value) => setFormData({ ...formData, cuisine: value })}>
                <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
                Độ khó
              </Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                required
              />
            </div>

            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
                <Users className="w-4 h-4 inline mr-1" />
                Số người ăn
              </Label>
              <Input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                placeholder="4"
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                required
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="space-y-3 border-t border-[var(--border-light)] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[var(--text-dark)]">Nguyên liệu</h3>
            <Button
              type="button"
              onClick={addIngredient}
              variant="outline"
              size="sm"
              className="text-[var(--gold)] border-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm
            </Button>
          </div>

          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={ingredient.name}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index].name = e.target.value;
                  setIngredients(newIngredients);
                }}
                placeholder="Tên nguyên liệu"
                className="flex-1 rounded-[var(--radius-sm)] border-[var(--border-light)]"
                required
              />
              <Input
                value={ingredient.quantity}
                onChange={(e) => {
                  const newIngredients = [...ingredients];
                  newIngredients[index].quantity = e.target.value;
                  setIngredients(newIngredients);
                }}
                placeholder="Số lượng"
                className="w-32 rounded-[var(--radius-sm)] border-[var(--border-light)]"
                required
              />
              {ingredients.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  variant="ghost"
                  size="icon"
                  className="text-[var(--danger)] hover:bg-[var(--danger-light)]"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3 border-t border-[var(--border-light)] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-[var(--text-dark)]">Các bước thực hiện</h3>
            <Button
              type="button"
              onClick={addStep}
              variant="outline"
              size="sm"
              className="text-[var(--gold)] border-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm bước
            </Button>
          </div>

          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-gold text-[var(--text-dark)] flex items-center justify-center font-bold text-sm shrink-0 mt-2">
                  {index + 1}
                </div>
                <Textarea
                  value={step}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index] = e.target.value;
                    setSteps(newSteps);
                  }}
                  placeholder={`Bước ${index + 1}...`}
                  className="flex-1 rounded-[var(--radius-sm)] border-[var(--border-light)] resize-none"
                  rows={2}
                  required
                />
              </div>
              {steps.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeStep(index)}
                  variant="ghost"
                  size="icon"
                  className="text-[var(--danger)] hover:bg-[var(--danger-light)] mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
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
            className="flex-1 bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Lưu công thức
          </Button>
        </div>
      </form>
    </Modal>
  );
}
