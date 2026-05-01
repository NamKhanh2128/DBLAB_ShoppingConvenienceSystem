import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Package, Tag, Hash, ShoppingCart } from "lucide-react";

interface ShoppingItemData {
  id?: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  note: string;
  assignedTo?: string;
}

interface AddShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ShoppingItemData) => void;
  item?: ShoppingItemData | null;
  mode: "add" | "edit";
}

export function AddShoppingItemModal({
  isOpen,
  onClose,
  onSave,
  item,
  mode,
}: AddShoppingItemModalProps) {
  const [formData, setFormData] = useState<ShoppingItemData>({
    name: "",
    quantity: "",
    unit: "kg",
    category: "Rau củ",
    note: "",
  });

  useEffect(() => {
    if (item && mode === "edit") {
      setFormData(item);
    } else {
      setFormData({
        name: "",
        quantity: "",
        unit: "kg",
        category: "Rau củ",
        note: "",
      });
    }
  }, [item, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const categories = ["Rau củ", "Thịt", "Cá", "Trứng & Sữa", "Gia vị", "Ngũ cốc", "Đồ uống", "Khác"];
  const units = ["kg", "gram", "lít", "ml", "gói", "hộp", "chai", "túi", "miếng", "cái"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Thêm mặt hàng mới" : "Chỉnh sửa mặt hàng"}
      size="md"
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
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
            Tên mặt hàng *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Cà chua"
            required
            className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
              <Hash className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
              Số lượng *
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              required
              className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-[var(--text-dark)] font-semibold">
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
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-[var(--text-dark)] font-semibold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[var(--purple-deep)]" strokeWidth={2.5} />
            Ghi chú
          </Label>
          <Input
            id="note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Ghi chú thêm về mặt hàng..."
            className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:border-[var(--purple-deep)] focus-visible:ring-[var(--purple-deep)]"
          />
        </div>
      </form>
    </Modal>
  );
}

export default AddShoppingItemModal;