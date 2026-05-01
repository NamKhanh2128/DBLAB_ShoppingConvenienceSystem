import { X, TrendingUp, Calendar, DollarSign, Package } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import Modal from "./Modal";

interface ViewStatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stat?: any;
}

export function ViewStatDetailsModal({
  isOpen,
  onClose,
  stat
}: ViewStatDetailsModalProps) {
  if (!stat) return null;

  const mockData = {
    title: stat.title || "Chi tiêu tháng này",
    value: stat.value || "12,450,000₫",
    change: stat.change || "+15%",
    trend: stat.trend || "up",
    details: [
      { label: "Tuần 1", value: "2,850,000₫", percentage: 23 },
      { label: "Tuần 2", value: "3,200,000₫", percentage: 26 },
      { label: "Tuần 3", value: "2,950,000₫", percentage: 24 },
      { label: "Tuần 4", value: "3,450,000₫", percentage: 27 },
    ],
    categories: [
      { name: "Thịt & Hải sản", amount: "4,200,000₫", color: "from-[#EF4444] to-[#DC2626]" },
      { name: "Rau củ quả", amount: "2,800,000₫", color: "bg-gradient-gold" },
      { name: "Sữa & Trứng", amount: "1,950,000₫", color: "from-[#3B82F6] to-[#2563EB]" },
      { name: "Khác", amount: "3,500,000₫", color: "from-[#F97316] to-[#EA580C]" },
    ]
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thống kê" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">{mockData.title}</h2>
              <p className="text-white/90 text-sm mt-1">Chi tiết thống kê</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-smooth"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Value */}
        <div className="flex items-end gap-3">
          <div className="text-4xl font-black">{mockData.value}</div>
          <Badge
            className={`
              mb-2 border-none font-semibold
              ${mockData.trend === 'up'
                ? 'bg-[var(--success)] text-white'
                : 'bg-[var(--danger)] text-white'
              }
            `}
          >
            {mockData.change}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Weekly Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[var(--purple)]" />
            <h3 className="font-bold text-lg text-[var(--text-dark)]">Phân bổ theo tuần</h3>
          </div>

          <div className="space-y-3">
            {mockData.details.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-dark)]">{item.label}</span>
                  <span className="text-sm font-bold text-[var(--purple)]">{item.value}</span>
                </div>
                <div className="w-full h-2 bg-[var(--card-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-purple rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Category Breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-[var(--purple)]" />
            <h3 className="font-bold text-lg text-[var(--text-dark)]">Phân loại chi tiêu</h3>
          </div>

          <div className="space-y-3">
            {mockData.categories.map((category, index) => (
              <div
                key={index}
                className="relative p-4 rounded-[var(--radius-sm)] overflow-hidden group cursor-pointer transition-smooth hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-10 group-hover:opacity-20 transition-smooth`} />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${category.color}`} />
                    <span className="font-semibold text-[var(--text-dark)]">{category.name}</span>
                  </div>
                  <span className="font-bold text-[var(--text-dark)]">{category.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gradient-to-r from-[var(--purple-light)] to-[var(--gold-light)] rounded-[var(--radius-sm)] border-l-4 border-[var(--purple)]">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-[var(--purple)] mt-0.5" />
            <div>
              <p className="font-semibold text-[var(--text-dark)] mb-1">
                Tổng quan
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Chi tiêu tháng này tăng {mockData.change} so với tháng trước. Danh mục chi nhiều nhất là Thịt & Hải sản.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Đóng
          </Button>
          <Button
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            Xuất báo cáo
          </Button>
        </div>
      </div>
    </Modal>
  );
}