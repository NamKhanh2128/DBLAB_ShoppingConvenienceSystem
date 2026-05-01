import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";

interface AddShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const emojiOptions = ["🛒", "✅", "🎉", "🍽️", "🥗", "🍕", "🛍️", "📝"];

export function AddShoppingListModal({
  isOpen,
  onClose,
  onSubmit
}: AddShoppingListModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    emoji: "🛒",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", date: "", emoji: "🛒", description: "" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo danh sách mua sắm" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Tạo danh sách mới</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-white/90 text-sm mt-1">
          Tạo danh sách mua sắm cho gia đình
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Tên danh sách
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Danh sách tuần này"
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
            required
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Ngày mua sắm
          </Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
            required
          />
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Biểu tượng
          </Label>
          <div className="grid grid-cols-8 gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setFormData({ ...formData, emoji })}
                className={`
                    text-2xl p-3 rounded-[var(--radius-sm)] transition-smooth
                    ${formData.emoji === emoji
                    ? "bg-gradient-gold shadow-md scale-110"
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
            Ghi chú (tùy chọn)
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Thêm ghi chú cho danh sách..."
            className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)] resize-none"
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
            className="flex-1 bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Tạo danh sách
          </Button>
        </div>
      </form>
    </Modal>
  );
}
