import { ShoppingCart, Package, Utensils, ChefHat, FileText, Users } from "lucide-react";
import { Button } from "../ui/button"; // Đảm bảo đường dẫn này đúng với dự án của bạn
import Modal from "./Modal";

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

// 🔥 Chuẩn hóa lại toàn bộ mã màu dùng hệ thống của Tailwind để tránh lỗi hiển thị
const quickActions = [
  {
    id: "add-shopping",
    icon: ShoppingCart,
    label: "Thêm danh sách mua sắm",
    description: "Tạo danh sách mua sắm mới",
    color: "from-amber-400 to-amber-600",
  },
  {
    id: "add-inventory",
    icon: Package,
    label: "Thêm thực phẩm vào kho",
    description: "Cập nhật kho thực phẩm",
    color: "from-yellow-400 to-yellow-600",
  },
  {
    id: "add-meal",
    icon: Utensils,
    label: "Lên kế hoạch ăn uống",
    description: "Thêm kế hoạch bữa ăn",
    color: "from-purple-500 to-purple-700",
  },
  {
    id: "add-recipe",
    icon: ChefHat,
    label: "Tạo công thức nấu ăn",
    description: "Lưu công thức mới",
    color: "from-orange-500 to-orange-700",
  },
  {
    id: "view-reports",
    icon: FileText,
    label: "Xem báo cáo",
    description: "Thống kê chi tiêu",
    color: "from-blue-500 to-blue-700",
  },
  {
    id: "invite-member",
    icon: Users,
    label: "Mời thành viên",
    description: "Thêm người vào gia đình",
    color: "from-pink-500 to-pink-700",
  },
];

export function QuickActionModal({
  isOpen,
  onClose,
  onAction
}: QuickActionModalProps) {
  const handleAction = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thao tác nhanh" size="sm">

      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                aria-label={`${action.label}: ${action.description}`}
                onClick={() => handleAction(action.id)}
                className="group relative p-5 text-left rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 bg-white overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-all duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md group-hover:bg-white/20 transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* Text Container */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 group-hover:text-white transition-colors duration-300 mb-1 leading-tight">
                        {action.label}
                      </h3>
                      <p className="text-xs text-gray-500 group-hover:text-white/90 transition-colors duration-300">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full py-6 rounded-xl border-gray-200 hover:bg-gray-50 font-semibold text-gray-600 transition-colors"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}