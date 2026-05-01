import { X, FileText, Download, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import Modal from "./Modal";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (data: any) => void;
}

const exportFormats = ["PDF", "Excel", "CSV"];
const reportTypes = [
  "Chi tiêu theo tháng",
  "Thống kê mua sắm",
  "Tình trạng kho",
  "Kế hoạch ăn uống",
  "Báo cáo tổng hợp"
];

export function ExportReportModal({
  isOpen,
  onClose,
  onExport
}: ExportReportModalProps) {
  const [formData, setFormData] = useState({
    reportType: "Chi tiêu theo tháng",
    format: "PDF",
    startDate: "",
    endDate: "",
    includeCharts: true,
    includeSummary: true,
    includeDetails: true,
  });

  const handleExport = () => {
    onExport(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xuất báo cáo" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Xuất báo cáo</h2>
              <p className="text-white/90 text-sm mt-1">
                Chọn định dạng và nội dung báo cáo
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

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Loại báo cáo
          </Label>
          <Select value={formData.reportType} onValueChange={(value) => setFormData({ ...formData, reportType: value })}>
            <SelectTrigger className="rounded-[var(--radius-sm)] border-[var(--border-light)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Định dạng
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {exportFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setFormData({ ...formData, format })}
                className={`
                    p-3 rounded-[var(--radius-sm)] font-semibold text-sm transition-smooth
                    ${formData.format === format
                    ? "bg-gradient-purple text-white shadow-md"
                    : "bg-[var(--card-bg)] text-[var(--text-dark)] hover:bg-white hover:shadow-sm"
                  }
                  `}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                {format}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            <Calendar className="w-4 h-4 inline mr-1" />
            Khoảng thời gian
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-[var(--text-muted)] mb-1 block">Từ ngày</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              />
            </div>
            <div>
              <Label className="text-xs text-[var(--text-muted)] mb-1 block">Đến ngày</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple)] focus-visible:border-[var(--purple)]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-[var(--border-light)]">
          <Label className="text-[var(--text-dark)] font-semibold block">
            Nội dung bao gồm
          </Label>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="charts"
                checked={formData.includeCharts}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeCharts: checked as boolean })
                }
                className="border-[var(--border-purple)] data-[state=checked]:bg-[var(--purple)]"
              />
              <label
                htmlFor="charts"
                className="text-sm text-[var(--text-dark)] cursor-pointer"
              >
                Biểu đồ và đồ thị
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="summary"
                checked={formData.includeSummary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeSummary: checked as boolean })
                }
                className="border-[var(--border-purple)] data-[state=checked]:bg-[var(--purple)]"
              />
              <label
                htmlFor="summary"
                className="text-sm text-[var(--text-dark)] cursor-pointer"
              >
                Tổng quan thống kê
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="details"
                checked={formData.includeDetails}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeDetails: checked as boolean })
                }
                className="border-[var(--border-purple)] data-[state=checked]:bg-[var(--purple)]"
              />
              <label
                htmlFor="details"
                className="text-sm text-[var(--text-dark)] cursor-pointer"
              >
                Chi tiết giao dịch
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1 bg-gradient-purple text-white font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
