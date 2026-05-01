import { X, Package, MinusCircle, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";

interface UseInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  item?: any;
}

export function UseInventoryModal({
  isOpen,
  onClose,
  onSubmit,
  item
}: UseInventoryModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const maxQuantity = item?.quantity || 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ quantity, notes });
    setQuantity(1);
    setNotes("");
    onClose();
  };

  const increment = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ghi nhận sử dụng" size="md">
      

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Stock */}
          <div className="p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] text-center">
            <p className="text-sm text-[var(--text-muted)] mb-1">Số lượng hiện có</p>
            <p className="text-3xl font-black text-[var(--text-dark)]">
              {maxQuantity} <span className="text-lg font-semibold text-[var(--text-muted)]">{item?.unit || "hộp"}</span>
            </p>
          </div>

          {/* Quantity Selector */}
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-3 block text-center">
              Số lượng sử dụng
            </Label>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                onClick={decrement}
                disabled={quantity <= 1}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-2 border-[var(--border-light)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 disabled:opacity-50"
              >
                <MinusCircle className="w-6 h-6 text-[var(--gold)]" />
              </Button>

              <div className="relative">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    if (val >= 1 && val <= maxQuantity) {
                      setQuantity(val);
                    }
                  }}
                  min={1}
                  max={maxQuantity}
                  className="w-24 h-16 text-center text-3xl font-black rounded-[var(--radius-sm)] border-2 border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                />
              </div>

              <Button
                type="button"
                onClick={increment}
                disabled={quantity >= maxQuantity}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-2 border-[var(--border-light)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 disabled:opacity-50"
              >
                <PlusCircle className="w-6 h-6 text-[var(--gold)]" />
              </Button>
            </div>
            <p className="text-center text-xs text-[var(--text-muted)] mt-2">
              Còn lại sau khi sử dụng: {maxQuantity - quantity} {item?.unit || "hộp"}
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Ghi chú (tùy chọn)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Dùng cho món canh chua..."
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
              className="flex-1 bg-gradient-gold text-[var(--text-dark)] font-semibold rounded-[var(--radius-btn)] shadow-lg hover:shadow-xl transition-smooth"
            >
              Xác nhận sử dụng
            </Button>
          </div>
        </form>
    </Modal>
  );
}
