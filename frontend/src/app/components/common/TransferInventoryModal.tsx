import { X, ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Modal from "./Modal";

interface TransferInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  item?: any;
}

const locations = [
  { value: "fridge", label: "Tủ lạnh", icon: "❄️" },
  { value: "freezer", label: "Ngăn đông", icon: "🧊" },
  { value: "pantry", label: "Tủ bếp", icon: "🗄️" },
  { value: "shelf", label: "Kệ đồ", icon: "📦" },
];

export function TransferInventoryModal({
  isOpen,
  onClose,
  onSubmit,
  item
}: TransferInventoryModalProps) {
  const currentLocation = item?.location || "Tủ lạnh";
  const [newLocation, setNewLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ newLocation });
    onClose();
  };

  const getCurrentLocationValue = () => {
    const loc = locations.find(l => l.label === currentLocation);
    return loc?.value || "fridge";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chuyển thực phẩm" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Chuyển vị trí</h2>
              <p className="text-white/90 text-sm mt-1">
                {item?.name || "Thực phẩm"}
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
        {/* Current Location */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-3 block">
            Vị trí hiện tại
          </Label>
          <div className="p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)] border-2 border-[var(--border-light)]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl">
                {locations.find(l => l.value === getCurrentLocationValue())?.icon}
              </div>
              <div>
                <p className="font-semibold text-[var(--text-dark)]">{currentLocation}</p>
                <p className="text-xs text-[var(--text-muted)]">Vị trí lưu trữ hiện tại</p>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center shadow-md">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* New Location */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-3 block">
            Vị trí mới
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {locations
              .filter(loc => loc.value !== getCurrentLocationValue())
              .map((location) => (
                <button
                  key={location.value}
                  type="button"
                  onClick={() => setNewLocation(location.value)}
                  className={`
                      p-4 rounded-[var(--radius-sm)] border-2 transition-smooth
                      ${newLocation === location.value
                      ? "border-[var(--purple)] bg-gradient-purple/5 shadow-md"
                      : "border-[var(--border-light)] hover:border-[var(--purple)] hover:shadow-sm"
                    }
                    `}
                >
                  <div className="text-3xl mb-2">{location.icon}</div>
                  <p className={`text-sm font-semibold ${newLocation === location.value
                    ? "text-[var(--purple)]"
                    : "text-[var(--text-dark)]"
                    }`}>
                    {location.label}
                  </p>
                </button>
              ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-gradient-to-r from-[var(--purple-light)] to-[var(--gold-light)] rounded-[var(--radius-sm)] border-l-4 border-[var(--purple)]">
          <p className="text-sm text-[var(--text-dark)]">
            <strong>Lưu ý:</strong> Việc chuyển vị trí sẽ được ghi lại trong lịch sử lưu trữ của thực phẩm.
          </p>
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
            disabled={!newLocation}
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth disabled:opacity-50"
          >
            Xác nhận chuyển
          </Button>
        </div>
      </form>
    </Modal>
  );
}
