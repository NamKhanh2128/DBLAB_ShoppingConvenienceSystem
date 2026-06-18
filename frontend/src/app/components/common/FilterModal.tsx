import { X, Filter, Calendar, DollarSign, Tag, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import Modal from "./Modal";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  type?: "shopping" | "inventory" | "meal" | "recipe";
}

export function FilterModal({
  isOpen,
  onClose,
  onApply,
  type = "shopping"
}: FilterModalProps) {
  const [filters, setFilters] = useState({
    dateRange: "all",
    category: "all",
    status: "all",
    priceMin: "",
    priceMax: "",
    assignee: "all",
    location: "all",
    expiryStatus: [] as string[],
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      dateRange: "all",
      category: "all",
      status: "all",
      priceMin: "",
      priceMax: "",
      assignee: "all",
      location: "all",
      expiryStatus: [],
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bộ lọc" size="md">
      <div className="space-y-4">
        {/* Date Range */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--purple-primary)]" />
            Khoảng thời gian
          </Label>
          <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="custom">Tùy chọn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
            <Tag className="w-4 h-4 text-[var(--purple-primary)]" />
            Danh mục
          </Label>
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="meat">Thịt</SelectItem>
              <SelectItem value="vegetable">Rau củ</SelectItem>
              <SelectItem value="dairy">Sữa</SelectItem>
              <SelectItem value="seafood">Hải sản</SelectItem>
              <SelectItem value="beverage">Đồ uống</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status (Shopping List) */}
        {type === "shopping" && (
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Trạng thái
            </Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang mua</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="pending">Sắp tới</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Location (Inventory) */}
        {type === "inventory" && (
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Vị trí lưu trữ
            </Label>
            <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="fridge">Tủ lạnh</SelectItem>
                <SelectItem value="freezer">Ngăn đông</SelectItem>
                <SelectItem value="pantry">Tủ bếp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price Range (Shopping List) */}
        {type === "shopping" && (
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[var(--purple-primary)]" />
              Khoảng giá
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Từ"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)]"
              />
              <Input
                type="number"
                placeholder="Đến"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)]"
              />
            </div>
          </div>
        )}

        {/* Assignee (Shopping List) */}
        {type === "shopping" && (
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--purple-primary)]" />
              Người phụ trách
            </Label>
            <Select value={filters.assignee} onValueChange={(value) => setFilters({ ...filters, assignee: value })}>
              <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="me">Mẹ</SelectItem>
                <SelectItem value="dad">Bố</SelectItem>
                <SelectItem value="child">Con</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Expiry Status (Inventory) */}
        {type === "inventory" && (
          <div>
            <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
              Tình trạng hạn sử dụng
            </Label>
            <div className="space-y-2">
              {[
                { id: "critical", label: "Gấp (dưới 3 ngày)", color: "text-[var(--danger)]" },
                { id: "warning", label: "Sắp hết hạn (3-7 ngày)", color: "text-[var(--warning)]" },
                { id: "good", label: "Tốt (trên 7 ngày)", color: "text-[var(--success)]" },
              ].map((status) => (
                <div key={status.id} className="flex items-center gap-3">
                  <Checkbox
                    id={status.id}
                    checked={filters.expiryStatus.includes(status.id)}
                    onCheckedChange={(checked) => {
                      const updated = checked
                        ? [...filters.expiryStatus, status.id]
                        : filters.expiryStatus.filter(id => id !== status.id);
                      setFilters({ ...filters, expiryStatus: updated });
                    }}
                    className="border-[var(--border-light)] data-[state=checked]:bg-[var(--purple-primary)]"
                  />
                  <label
                    htmlFor={status.id}
                    className={`text-sm cursor-pointer ${status.color}`}
                  >
                    {status.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Đặt lại
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
