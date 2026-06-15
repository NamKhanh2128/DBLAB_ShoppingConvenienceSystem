import { TrendingUp, DollarSign, TrendingDown, Calendar, Loader2, Download, AlertTriangle, Lightbulb, Sparkles, Filter, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReports } from "../../hooks/useData";
import { ExportReportModal } from "../../components/common/ExportReportModal";
import { FamilyOnboardingPrompt } from "../../components/common";
import { useToastContext } from "../../context/ToastContext";
import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

const categoryColors = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6'];

export function Reports() {
  const { reports, summary, loading, applyFilters, filters } = useReports();
  const { success, error, info, warning } = useToastContext();
  const { groupId } = useAuth();

  const [activeFilterTab, setActiveFilterTab] = useState<"7days" | "30days" | "12months" | "custom">("30days");
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Theo dõi kích thước màn hình phục vụ biểu đồ co giãn mượt mà
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Xử lý nút chọn nhanh khoảng thời gian
  const handleQuickFilter = (type: "7days" | "30days" | "12months") => {
    setActiveFilterTab(type);
    const today = new Date();
    let start = new Date();

    if (type === "7days") {
      start.setDate(today.getDate() - 6);
    } else if (type === "30days") {
      start.setDate(today.getDate() - 29);
    } else if (type === "12months") {
      start.setFullYear(today.getFullYear() - 1);
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    applyFilters({
      startDate: formatDate(start),
      endDate: formatDate(today)
    });
    success(`Đã lọc báo cáo theo ${type === "7days" ? "7 ngày qua" : type === "30days" ? "30 ngày qua" : "12 tháng qua"}`);
  };

  // Áp dụng lọc ngày tùy chọn
  const handleCustomRangeApply = () => {
    if (!customRange.startDate || !customRange.endDate) {
      warning("Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc");
      return;
    }
    const start = new Date(customRange.startDate);
    const end = new Date(customRange.endDate);

    if (start > end) {
      error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      error("Khoảng thời gian không được vượt quá 1 năm (366 ngày)");
      return;
    }

    applyFilters(customRange);
    success("Đã áp dụng bộ lọc ngày tùy chỉnh");
  };

  const totalSpend = summary?.TongChiPhi || 0;
  const totalWaste = summary?.TongLangPhi || 0;
  const savings = summary?.TongTietKiem || 0;

  // Chuẩn bị dữ liệu biểu đồ chi tiêu
  const monthlyData = useMemo(() => {
    if (reports.length > 0) {
      return [...reports].reverse().map((r: any) => ({
        month: r.TuanThang || '',
        expense: Math.round((r.TongChiPhi || 0) / 1000),
        waste: Math.round((r.TongLangPhi || 0) / 1000),
      }));
    }
    // Fallback nếu không có dữ liệu báo cáo tuần/tháng nhưng có xu hướng động từ summary
    const trend = summary?.expenseTrend || [];
    return trend.map((t: any) => ({
      month: t.label || '',
      expense: Math.round((t.value || 0) / 1000),
      waste: 0,
    }));
  }, [reports, summary]);

  // Chuẩn bị dữ liệu biểu đồ tròn phân bổ danh mục (chống lỗi chia cho 0)
  const categoryData = useMemo(() => {
    const catRaw: any[] = summary?.categorySpend || summary?.ChiTietDanhMuc || [];
    if (catRaw.length > 0) {
      return catRaw.map((item: any, index: number) => ({
        name: item.name || item.DanhMuc || item.category || 'Khác',
        value: Number(item.value ?? item.TongChiPhi ?? item.SoLuong ?? 0),
        color: categoryColors[index % categoryColors.length],
      })).filter((c: any) => c.value > 0);
    }
    return [];
  }, [summary]);

  // Tính toán phần trăm tỷ lệ danh mục
  const categoryWithPercentages = useMemo(() => {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    return categoryData.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));
  }, [categoryData]);

  // Trợ lý Báo cáo Thông minh - Tính toán tư vấn tài chính chi tiết
  const insights = useMemo(() => {
    const items = [];
    if (totalSpend === 0) return [];

    const wastePercent = totalSpend > 0 ? Math.round((totalWaste / totalSpend) * 100) : 0;

    // So sánh chu kỳ chi tiêu (Kỳ này vs Kỳ trước)
    if (reports.length >= 2) {
      const current = reports[0]?.TongChiPhi || 0;
      const previous = reports[1]?.TongChiPhi || 0;
      if (previous > 0) {
        const diff = current - previous;
        const percent = Math.round((Math.abs(diff) / previous) * 100);
        if (diff > 0) {
          items.push({
            type: "warning",
            icon: AlertTriangle,
            bgClass: "bg-amber-50 border-amber-200 text-amber-900",
            iconClass: "text-amber-600",
            text: `Chi tiêu kỳ này gia tăng ${percent}% (+${diff.toLocaleString()}₫) so với kỳ trước. Rất đáng lưu tâm để rà soát danh sách mua sắm tiếp theo.`
          });
        } else if (diff < 0) {
          items.push({
            type: "success",
            icon: CheckCircle2,
            bgClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
            iconClass: "text-emerald-600",
            text: `Thật xuất sắc! Chi tiêu giảm được ${percent}% (-${Math.abs(diff).toLocaleString()}₫) so với trước. Gia đình đang tối ưu hóa ngân sách rất tốt.`
          });
        }
      }
    }

    // Tỷ lệ lãng phí tủ lạnh
    if (wastePercent > 20) {
      items.push({
        type: "danger",
        icon: AlertTriangle,
        bgClass: "bg-red-50 border-red-200 text-red-900",
        iconClass: "text-red-600",
        text: `Cảnh báo lãng phí: Khoảng ${wastePercent}% ngân sách chi tiêu đang bị lãng phí do thực phẩm hết hạn trong kho. Hãy lên kế hoạch thực đơn dựa trên nguyên liệu sẵn có.`
      });
    } else if (wastePercent > 5) {
      items.push({
        type: "info",
        icon: Lightbulb,
        bgClass: "bg-blue-50 border-blue-200 text-blue-900",
        iconClass: "text-blue-600",
        text: `Tỷ lệ hao hụt thực phẩm ở mức ${wastePercent}% chi tiêu. Thử tích chọn "Đã mua" & tự động cập nhật số lượng tủ lạnh để phân phối khoa học hơn.`
      });
    } else {
      items.push({
        type: "success",
        icon: Sparkles,
        bgClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
        iconClass: "text-emerald-600",
        text: `Quản lý thực phẩm hoàn hảo! Tỷ lệ lãng phí chỉ ở mức ${wastePercent}%. Một thói quen tiêu dùng vô cùng tiết kiệm và thân thiện với môi trường.`
      });
    }

    // Nhóm chi tiêu dẫn đầu
    if (categoryData.length > 0) {
      const topCat = [...categoryData].sort((a, b) => b.value - a.value)[0];
      const catPercent = totalSpend > 0 ? Math.round((topCat.value / totalSpend) * 100) : 0;
      items.push({
        type: "insight",
        icon: Lightbulb,
        bgClass: "bg-indigo-50 border-indigo-200 text-indigo-900",
        iconClass: "text-indigo-600",
        text: `Nhóm "${topCat.name}" tiêu tốn tài chính nhiều nhất, chiếm ${catPercent}% ngân sách. Bạn có thể kiểm tra danh sách mua sắm xem có các nhãn hàng sỉ giá tốt hơn cho nhóm này.`
      });
    }

    return items;
  }, [reports, totalSpend, totalWaste, categoryData]);

  // Xử lý xuất file dữ liệu báo cáo
  const handleExport = (options: any) => {
    if (options.format === "CSV" || options.format === "Excel") {
      let csvContent = "\uFEFF"; // Ký tự BOM giúp Excel đọc đúng font Tiếng Việt UTF-8
      
      csvContent += "=== BÁO CÁO TIÊU DÙNG THÔNG MINH - SHOPPING CONVENIENCE SYSTEM ===\n";
      csvContent += `Loại báo cáo,${options.reportType}\n`;
      csvContent += `Phạm vi xuất,${options.startDate || 'Tất cả'} đến ${options.endDate || 'Hiện tại'}\n`;
      csvContent += `Thời gian tạo báo cáo,${new Date().toLocaleString("vi-VN")}\n\n`;
      
      if (options.includeSummary) {
        csvContent += "--- PHẦN 1: TỔNG QUAN TÀI CHÍNH ---\n";
        csvContent += `Tổng chi tiêu thực tế,${totalSpend} ₫\n`;
        csvContent += `Tổng hao hụt / lãng phí,${totalWaste} ₫\n`;
        csvContent += `Tiết kiệm tối ưu ước tính,${savings} ₫\n`;
        csvContent += `Số lượng giỏ đi chợ hoàn thành,${summary?.SoBaoCao || 0}\n\n`;
      }
      
      if (options.includeDetails) {
        csvContent += "--- PHẦN 2: LỊCH SỬ CHI TIÊU ---\n";
        csvContent += "Thời kỳ / Tuần,Tổng Chi Tiêu (đ),Tổng Lãng Phí (đ),Số thành viên\n";
        reports.forEach((r: any) => {
          csvContent += `"${r.TuanThang || ''}",${r.TongChiPhi || 0},${r.TongLangPhi || 0},${r.SoThanhVien || 1}\n`;
        });
        csvContent += "\n";
        
        csvContent += "--- PHẦN 3: PHÂN BỔ THEO QUẦY HÀNG ---\n";
        csvContent += "Tên quầy / Danh mục,Tổng số tiền chi (đ)\n";
        categoryData.forEach((c: any) => {
          csvContent += `"${c.name}",${c.value}\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BaoCao_GiaDinh_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      success("Xuất báo cáo dạng bảng CSV hoàn tất. Bạn có thể mở trực tiếp trong Excel.");
    } else if (options.format === "PDF") {
      // In ấn layout hoặc xuất PDF trình duyệt
      window.print();
      success("Đang mở hộp thoại in báo cáo (PDF).");
    }
  };

  if (!groupId) {
    return (
      <div className="space-y-6 print:p-8 print:bg-white">
        {/* Header báo cáo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4 print:border-b-2 print:pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-dark)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Báo cáo & Thống kê
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              Phân tích số liệu tài chính, dinh dưỡng và tối ưu hóa ngân sách gia đình thông minh.
            </p>
          </div>
        </div>
        <FamilyOnboardingPrompt />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--purple)] mb-4" />
        <span className="text-[var(--text-muted)] text-lg font-medium">Trí tuệ phân tích đang xử lý dữ liệu...</span>
      </div>
    );
  }

  // Giao diện Empty State khi gia đình hoàn toàn chưa có bất kỳ dữ liệu chi tiêu nào
  const hasNoData = totalSpend === 0 && reports.length === 0;

  return (
    <div className="space-y-6 print:p-8 print:bg-white">
      {/* Header báo cáo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-light)] pb-4 print:border-b-2 print:pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-dark)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Báo cáo & Thống kê
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Phân tích số liệu tài chính, dinh dưỡng và tối ưu hóa ngân sách gia đình thông minh.
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button
            onClick={() => setIsExportOpen(true)}
            disabled={hasNoData}
            className="bg-gradient-purple hover:opacity-95 text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-purple)] hover-lift flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Bộ lọc khoảng thời gian trực quan */}
      <div className="bg-[var(--card-bg)] p-4 rounded-2xl shadow-sm border border-[var(--border-light)] flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--purple)]" />
          <span className="text-sm font-bold text-[var(--text-dark)]">Khoảng thời gian:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickFilter("7days")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeFilterTab === "7days"
                ? "bg-[var(--purple)] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            7 ngày qua
          </button>
          <button
            onClick={() => handleQuickFilter("30days")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeFilterTab === "30days"
                ? "bg-[var(--purple)] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            30 ngày qua
          </button>
          <button
            onClick={() => handleQuickFilter("12months")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeFilterTab === "12months"
                ? "bg-[var(--purple)] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            12 tháng qua
          </button>
          <button
            onClick={() => setActiveFilterTab("custom")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activeFilterTab === "custom"
                ? "bg-[var(--purple)] text-white shadow-md"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Tùy chọn ngày
          </button>
        </div>

        {activeFilterTab === "custom" && (
          <div className="flex items-center gap-2 mt-2 md:mt-0 animate-fadeIn">
            <Input
              type="date"
              value={customRange.startDate}
              onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
              className="h-9 text-xs rounded-lg border-gray-300 focus-visible:ring-[var(--purple)]"
            />
            <span className="text-xs text-gray-500">đến</span>
            <Input
              type="date"
              value={customRange.endDate}
              onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
              className="h-9 text-xs rounded-lg border-gray-300 focus-visible:ring-[var(--purple)]"
            />
            <Button
              size="sm"
              onClick={handleCustomRangeApply}
              className="h-9 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
            >
              Áp dụng
            </Button>
          </div>
        )}
      </div>

      {hasNoData ? (
        /* Giao diện Empty State khi hoàn toàn không có dữ liệu chi tiêu */
        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-300 text-center space-y-6 shadow-sm">
          <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-[var(--purple)] animate-bounce">
            <HelpCircle className="w-12 h-12" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-gray-800">Chưa tìm thấy dữ liệu thống kê</h3>
            <p className="text-gray-500 text-sm">
              Gia đình của bạn chưa hoàn tất bất kỳ danh sách mua sắm nào hoặc chưa tạo giao dịch. Báo cáo tài chính sẽ tự động xuất hiện sau khi bạn hoàn thành chuyến đi chợ đầu tiên.
            </p>
          </div>
          <div>
            <Link to="/app/shopping-list">
              <Button className="bg-gradient-purple text-white font-bold rounded-xl px-6 py-3 hover-lift shadow-md">
                Lên danh sách đi chợ ngay
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Dashboard thẻ tài chính tổng hợp */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-[#10B981] to-[#059669] text-white overflow-hidden relative">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                <DollarSign className="w-36 h-36" />
              </div>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold opacity-90">Tổng chi chi trả thực tế</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight pt-2">{totalSpend.toLocaleString()}₫</p>
                <div className="pt-2">
                  <Badge className="bg-white/20 text-white border-none hover:bg-white/20">Thời gian: {filters.startDate || 'Ban đầu'} đến {filters.endDate || 'Hiện tại'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white overflow-hidden relative">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                <TrendingDown className="w-36 h-36" />
              </div>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold opacity-90">Ước tính hao hụt & lãng phí</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight pt-2">{totalWaste.toLocaleString()}₫</p>
                <div className="pt-2">
                  <Badge className="bg-white/20 text-white border-none hover:bg-white/20">Thực phẩm hết hạn bỏ đi</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white overflow-hidden relative">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                <TrendingUp className="w-36 h-36" />
              </div>
              <CardContent className="p-6 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold opacity-90">Tiết kiệm nhờ tối ưu kho</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight pt-2">{savings.toLocaleString()}₫</p>
                <div className="pt-2">
                  <Badge className="bg-white/20 text-white border-none hover:bg-white/20">Ước lượng tối ưu</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trợ lý Báo cáo Thông minh (AI Insights) */}
          {insights.length > 0 && (
            <Card className="border-none shadow-md rounded-2xl bg-slate-50 border border-slate-200">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--purple)]" />
                <CardTitle className="text-base font-bold text-slate-800">Trợ lý Báo cáo Thông minh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((ins, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${ins.bgClass} transition-all duration-300 hover:shadow-sm`}
                  >
                    <ins.icon className={`w-5 h-5 mt-0.5 shrink-0 ${ins.iconClass}`} />
                    <p className="text-sm font-medium leading-relaxed">{ins.text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Biểu đồ chi tiết */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-md rounded-3xl p-2 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800">Biến động chi tiêu & lãng phí</CardTitle>
                <CardDescription>So sánh sự tương quan tài chính (đơn vị: nghìn đồng)</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: isMobile ? 9 : 11, fill: '#6B7280' }}
                        interval={isMobile ? (monthlyData.length > 8 ? 2 : 0) : 0}
                        angle={isMobile ? -35 : 0}
                        textAnchor={isMobile ? "end" : "middle"}
                        height={isMobile ? 50 : 30}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <Tooltip
                        formatter={(val: any) => [`${val.toLocaleString()}k ₫`, ""]}
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px'
                        }}
                      />
                      <Line type="monotone" dataKey="expense" name="Chi tiêu" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="waste" name="Lãng phí" stroke="#EF4444" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex items-center justify-center text-[var(--text-muted)]">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-sm">Chưa có xu hướng thời gian</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-3xl p-2 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800">Phân bổ chi tiêu theo quầy hàng</CardTitle>
                <CardDescription>Chi tiêu chi tiết dựa trên phân loại quầy siêu thị</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
                    <div className="w-full md:w-1/2">
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(val: any) => [`${val.toLocaleString()} ₫`, "Số tiền"]}
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-2">
                      {categoryWithPercentages.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="font-bold text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-gray-900">{item.value.toLocaleString()}₫</span>
                            <span className="text-xs text-gray-400 ml-1.5 font-bold">({item.percentage}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-[var(--text-muted)]">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-semibold text-sm">Chưa có phân loại quầy hàng</p>
                      <p className="text-xs text-gray-400 mt-1">Đánh dấu Danh mục khi tạo món hàng để hiển thị</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lịch sử báo cáo chi tiết */}
          {reports.length > 0 && (
            <Card className="border-none shadow-md rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-gray-100 py-5">
                <CardTitle className="text-lg font-bold text-gray-800">Lịch sử thống kê tiêu dùng</CardTitle>
                <CardDescription>Bảng thống kê đóng băng lịch sử để bảo vệ toàn vẹn dữ liệu.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-slate-50 font-bold">
                      <tr>
                        <th className="px-6 py-4">Mốc chu kỳ</th>
                        <th className="px-6 py-4">Quy mô thành viên</th>
                        <th className="px-6 py-4 text-red-600">Lượng hao hụt / Lãng phí</th>
                        <th className="px-6 py-4 text-emerald-600 text-right">Tổng chi đi chợ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reports.map((r: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/55 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">{r.TuanThang}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="border-slate-300 text-slate-700 bg-slate-100">
                              {r.SoThanhVien || 1} người
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-red-600 font-semibold">{Number(r.TongLangPhi || 0).toLocaleString()}₫</td>
                          <td className="px-6 py-4 text-emerald-600 font-extrabold text-right text-base">{Number(r.TongChiPhi || 0).toLocaleString()}₫</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modal xuất báo cáo */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
    </div>
  );
}
