import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Modal from "./Modal";

interface EditShoppingItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  item?: any;
}

const emojiOptions = ["🥩", "🍅", "🥛", "🥚", "🥬", "🥓", "🌾", "🦐", "🍷", "🥕", "🍞", "🧀"];
const categoryOptions = ["Thịt", "Rau củ", "Sữa", "Trứng", "Gạo", "Hải sản", "Đồ uống", "Bánh mì"];

export function EditShoppingItemModal({
  isOpen,
  onClose,
  onSubmit,
  item
}: EditShoppingItemModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    quantity: item?.quantity || "",
    price: item?.price || "",
    emoji: item?.emoji || "🥩",
    category: item?.category || "Thịt",
    assignee: item?.assignee || "Mẹ",
  });

  useEffect(() => {
    setFormData({
      name: item?.name || "",
      quantity: item?.quantity || "",
      price: item?.price || "",
      emoji: item?.emoji || "🥩",
      category: item?.category || "Thịt",
      assignee: item?.assignee || "Mẹ",
    });
  }, [item, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa mặt hàng" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Chỉnh sửa món</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-white/90 text-sm mt-1">
          Cập nhật thông tin món mua
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Tên món
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Thịt bò Úc cao cấp"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Số lượng
            </Label>
            <Input
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="VD: 500g"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              required
            />
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Giá
            </Label>
            <Input
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="VD: 225,000₫"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Biểu tượng
          </Label>
          <div className="grid grid-cols-6 gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, emoji })}
                className={`
                    text-2xl p-3 rounded-[var(--radius-sm)] transition-smooth
                    ${formData.emoji === emoji
                    ? "bg-gradient-purple shadow-md scale-110"
                    : "bg-[var(--card-bg)] hover:bg-white hover:shadow-sm"
                  }
                  `}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Danh mục
          </Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus:ring-[var(--purple)] focus:border-[var(--purple)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Người phụ trách
          </Label>
          <Select value={formData.assignee} onValueChange={(value) => setFormData({ ...formData, assignee: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus:ring-[var(--purple)] focus:border-[var(--purple)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mẹ">Mẹ</SelectItem>
              <SelectItem value="Bố">Bố</SelectItem>
              <SelectItem value="Con">Con</SelectItem>
              <SelectItem value="Tôi">Tôi</SelectItem>
            </SelectContent>
          </Select>
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
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
