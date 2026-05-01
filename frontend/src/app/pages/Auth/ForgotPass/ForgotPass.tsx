import { Link } from "react-router";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export function ForgotPassword() {
  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-7 h-7 text-white" />
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Quên mật khẩu?
        </h1>
        <p className="text-gray-600">
          Nhập email của bạn để nhận liên kết đặt lại mật khẩu
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="h-12 rounded-xl focus-visible:ring-[#22C55E]"
            />
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:shadow-lg text-white rounded-xl text-base font-semibold"
          >
            Gửi liên kết đặt lại
          </Button>
        </form>

        <Link to="/auth/login">
          <Button
            variant="ghost"
            className="w-full mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </Button>
        </Link>
      </div>
    </div>
  );
}
