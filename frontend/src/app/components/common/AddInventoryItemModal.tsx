import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import Modal from "./Modal";

interface AddInventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const locationOptions = ["Tủ lạnh", "Ngăn đông", "Tủ bếp", "Kệ đồ"];
const categoryOptions = ["Thịt", "Rau củ", "Hải sản", "Trái cây", "Gia vị", "Đồ khô", "Sữa"];

export function AddInventoryItemModal({
  isOpen,
  onClose,
  onSubmit
}: AddInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "cái",
    location: "Tủ lạnh",
    category: "Thịt",
    expiryDate: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      quantity: "",
      unit: "cái",
      location: "Tủ lạnh",
      category: "Thịt",
      expiryDate: "",
      notes: "",
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm thực phẩm" size="md">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[var(--text-muted)] text-sm mb-4">
            Thêm thực phẩm mới vào kho
          </p>
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Tên thực phẩm
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Sữa tươi Vinamilk"
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
                Số lượng
              </Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="VD: 2"
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
                required
              />
            </div>

            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
                Đơn vị
              </Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cái">Cái</SelectItem>
                  <SelectItem value="hộp">Hộp</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="quả">Quả</SelectItem>
                  <SelectItem value="củ">Củ</SelectItem>
                  <SelectItem value="bó">Bó</SelectItem>
                  <SelectItem value="gói">Gói</SelectItem>
                  <SelectItem value="lít">Lít</SelectItem>
                  <SelectItem value="ml">Ml</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Vị trí lưu trữ
            </Label>
            <Select value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}>
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Danh mục
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
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
              Ngày hết hạn
            </Label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">Tùy chọn — để trống nếu không có hạn sử dụng</p>
          </div>

          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Ghi chú (tùy chọn)
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Thêm ghi chú về thực phẩm..."
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
              Thêm thực phẩm
            </Button>
          </div>
        </form>
    </Modal>
  );
}
