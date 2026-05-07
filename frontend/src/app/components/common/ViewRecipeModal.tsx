import { X, Clock, Users, ChefHat, Star, Heart, Share2, Printer } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import Modal from "./Modal";

interface ViewRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe?: any;
  onAddToMealPlan?: (recipeId: number, recipeName: string) => void;
}

export function ViewRecipeModal({
  isOpen,
  onClose,
  recipe,
  onAddToMealPlan,
}: ViewRecipeModalProps) {
  if (!recipe) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết công thức" size="lg">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6" />
            <h2 className="text-2xl font-black">{recipe.name || "Phở bò Hà Nội"}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-white/20 text-white border-none">
            {recipe.cuisine || "Việt Nam"}
          </Badge>
          <Badge className="bg-white/20 text-white border-none">
            {recipe.difficulty || "Trung bình"}
          </Badge>
          <div className="flex items-center gap-1 text-white/90">
            <Star className="w-4 h-4 fill-white" />
            <span className="text-sm font-semibold">4.8</span>
            <span className="text-sm">(125 đánh giá)</span>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4 p-6 bg-[var(--card-bg)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <Clock className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Thời gian</p>
            <p className="font-bold text-[var(--text-dark)]">{recipe.cookingTime ?? (recipe.time ? recipe.time.replace(" phút", "") : "45")} phút</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
            <Users className="w-6 h-6 text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Khẩu phần</p>
            <p className="font-bold text-[var(--text-dark)]">{recipe.servings || "4"} người</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        {recipe.description && (
          <div>
            <h3 className="font-bold text-lg text-[var(--text-dark)] mb-2">Mô tả</h3>
            <p className="text-[var(--text-muted)]">
              {recipe.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Ingredients */}
        <div>
          <h3 className="font-bold text-lg text-[var(--text-dark)] mb-3">Nguyên liệu</h3>
          <div className="space-y-2">
            {(recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [
              { name: "Thịt bò", quantity: "500g" },
              { name: "Bánh phở", quantity: "400g" },
              { name: "Hành tây", quantity: "1 củ" },
              { name: "Gừng", quantity: "50g" },
              { name: "Hành lá", quantity: "1 bó" },
            ]).map((ingredient: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
                <div className="w-2 h-2 rounded-full bg-[var(--gold)]" />
                {typeof ingredient === "string" ? (
                  <span className="flex-1 text-[var(--text-dark)]">{ingredient}</span>
                ) : (
                  <>
                    <span className="flex-1 text-[var(--text-dark)]">{ingredient.name}</span>
                    <span className="font-semibold text-[var(--purple)]">{ingredient.quantity}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Steps */}
        <div>
          <h3 className="font-bold text-lg text-[var(--text-dark)] mb-3">Cách làm</h3>
          <div className="space-y-4">
            {(recipe.steps || [
              "Sơ chế thịt bò, rửa sạch và chần qua nước sôi",
              "Ninh nước dùng với xương bò, hành, gừng trong 3-4 tiếng",
              "Trụng bánh phở, cho vào tô",
              "Múc nước dùng, cho thịt bò, rắc hành lá và ngò gai",
              "Thưởng thức khi còn nóng"
            ]).map((step: any, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-gold text-[var(--text-dark)] flex items-center justify-center font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-[var(--text-dark)] leading-relaxed">
                    {typeof step === "string" ? step : (step.description || step.MoTa || JSON.stringify(step))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--border-light)]">
          <Button
            variant="outline"
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            <Heart className="w-4 h-4 mr-2" />
            Yêu thích
          </Button>
          <Button
            variant="outline"
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
          <Button
            variant="outline"
            className="rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            <Printer className="w-4 h-4 mr-2" />
            In
          </Button>
        </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
            >
              Đóng
            </Button>
            <Button
              className="flex-1 bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
              onClick={() => {
                if (onAddToMealPlan && recipe) {
                  onAddToMealPlan(recipe.id, recipe.name);
                  onClose();
                }
              }}
              disabled={!onAddToMealPlan}
            >
              Thêm vào kế hoạch
            </Button>
          </div>
      </div>
    </Modal>
  );
}
