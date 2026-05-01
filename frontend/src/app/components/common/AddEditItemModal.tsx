import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Package, Tag, DollarSign, Layers } from "lucide-react";

interface ItemData {
  id?: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  description: string;
}

interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ItemData) => void;
  item?: ItemData | null;
  mode: "add" | "edit";
  title?: string;
  type?: "ingredient" | "recipe" | "product";
}

export function AddEditItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
  title,
  type = "ingredient",
}: AddEditItemModalProps) {
  const [formData, setFormData] = useState<ItemData>({
    name: "",
    category: "",
    price: "",
    unit: "kg",
    description: "",
  });

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData(item);
    } else {
      setFormData({
        name: "",
        category: "",
        price: "",
        unit: "kg",
        description: "",
      });
    }
  }, [item, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = {
    ingredient: ["Rau củ", "Thịt", "Cá", "Trứng & Sữa", "Gia vị", "Ngũ cốc"],
    recipe: ["Món chính", "Món phụ", "Canh", "Tráng miệng", "Đồ uống"],
    product: ["Thực phẩm tươi sống", "Thực phẩm đóng hộp", "Đồ gia dụng", "Vệ sinh"],
  };

  const units = ["kg", "gram", "lít", "ml", "gói", "hộp", "chai", "túi", "miếng"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || (mode === "add" ? "Thêm mới" : "Chỉnh sửa")}
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold"
          >
            {mode === "add" ? "Thêm mới" : "Lưu thay đổi"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
              Tên *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên"
              required
              className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
              Danh mục *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus:border-[var(--purple-deep)] focus:ring-[var(--purple-deep)]">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-sm)]">
                {categories[type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
              Giá (VNĐ)
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0"
              className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
              Đơn vị *
            </Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => setFormData({ ...formData, unit: value })}
            >
              <SelectTrigger className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus:border-[var(--purple-deep)] focus:ring-[var(--purple-deep)]">
                <SelectValue placeholder="Chọn đơn vị" />
              </SelectTrigger>
              <SelectContent className="rounded-[var(--radius-sm)]">
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-[var(--text-dark)] font-semibold">
            Mô tả
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Nhập mô tả chi tiết..."
            rows={4}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)] resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
