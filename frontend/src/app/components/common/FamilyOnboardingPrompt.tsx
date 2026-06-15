import { Users, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function FamilyOnboardingPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto text-center animate-slide-up">
      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden p-8">
        <CardContent className="space-y-6 p-0">
          <div className="w-16 h-16 rounded-3xl bg-[var(--gold)]/10 flex items-center justify-center mx-auto shadow-sm">
            <Users className="w-8 h-8 text-[var(--gold)]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[var(--text-dark)]" style={{ fontFamily: "var(--font-heading)" }}>
              Bạn chưa tham gia nhóm gia đình nào
            </h2>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Để sử dụng các tính năng lập kế hoạch bữa ăn, quản lý kho thực phẩm và danh sách mua sắm, bạn cần thuộc về một nhóm gia đình (để chia sẻ dữ liệu giữa các thành viên).
            </p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-2xl p-4 text-left text-xs space-y-2 text-[var(--text-muted)]">
            <p className="font-semibold text-[var(--text-dark)] flex items-center gap-1.5">
              💡 Bạn có thể chọn:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Tạo nhóm mới:</strong> Bắt đầu nhóm gia đình của riêng bạn và mời người khác tham gia.</li>
              <li><strong>Gia nhập bằng mã mời:</strong> Nhập mã mời gồm 8 ký tự được chia sẻ bởi thành viên gia đình khác.</li>
            </ul>
          </div>

          <Link to="/app/family" className="block w-full">
            <Button className="w-full h-12 bg-gradient-gold text-white font-bold rounded-xl shadow-[var(--shadow-btn)] hover-lift transition-smooth flex items-center justify-center gap-2">
              Thiết lập gia đình ngay
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
