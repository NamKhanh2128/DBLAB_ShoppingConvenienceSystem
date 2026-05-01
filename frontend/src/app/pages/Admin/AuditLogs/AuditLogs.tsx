import { useState, useMemo } from "react";
import { FileText, Search, Clock, User, Activity, AlertCircle, CheckCircle, XCircle, Download, ChevronLeft, ChevronRight, Eye, Globe } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import Modal from "../../../components/common/Modal";
import { PageHeader } from "../../../components/common/PageHeader";
import { useAdmin } from "../../../context/AdminContext";
import { toast } from "../../../components/common/Toast";

const PAGE_SIZE = 8;

const typeConfig: Record<string, { label: string; cls: string }> = {
  auth: { label: "Xác thực", cls: "bg-purple-100 text-purple-700" },
  user: { label: "Người dùng", cls: "bg-blue-100 text-blue-700" },
  data: { label: "Dữ liệu", cls: "bg-orange-100 text-orange-700" },
  recipe: { label: "Công thức", cls: "bg-green-100 text-green-700" },
  settings: { label: "Cài đặt", cls: "bg-pink-100 text-pink-700" },
  report: { label: "Báo cáo", cls: "bg-yellow-100 text-yellow-700" },
  shopping: { label: "Mua sắm", cls: "bg-teal-100 text-teal-700" },
};

function ViewLogModal({ log, onClose }: { log: any; onClose: () => void }) {
  if (!log) return null;
  const statusCls = log.status === "success" ? "bg-green-100 text-green-700" : log.status === "error" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
  const statusLabel = log.status === "success" ? "Thành công" : log.status === "error" ? "Lỗi" : "Cảnh báo";
  return (
    <Modal isOpen={!!log} onClose={onClose} title="Chi tiết nhật ký" size="md"
      footer={<Button variant="outline" onClick={onClose} className="w-full rounded-[var(--radius-sm)] font-semibold">Đóng</Button>}
    >
      <div className="space-y-3 p-1">
        <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <div className="w-12 h-12 bg-white rounded-[10px] flex items-center justify-center shadow-sm flex-shrink-0">
            {log.status === "success" ? <CheckCircle className="w-6 h-6 text-green-600" /> : log.status === "error" ? <XCircle className="w-6 h-6 text-red-600" /> : <AlertCircle className="w-6 h-6 text-yellow-600" />}
          </div>
          <div>
            <h3 className="font-black text-[var(--text-dark)]">{log.action}</h3>
            <Badge className={`${statusCls} rounded-full px-2.5 py-0.5 text-xs font-semibold mt-1`}>{statusLabel}</Badge>
          </div>
        </div>
        {[
          { icon: User, label: "Người thực hiện", value: log.user },
          { icon: Globe, label: "Địa chỉ IP", value: log.ip },
          { icon: Clock, label: "Thời gian", value: log.timestamp },
          { icon: Activity, label: "Loại", value: typeConfig[log.type]?.label || log.type },
          { icon: FileText, label: "Mô tả chi tiết", value: log.description },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <div className="w-8 h-8 bg-gradient-purple rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-muted)]">{label}</p>
              <p className="text-sm font-semibold text-[var(--text-dark)]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export function AuditLogs() {
  const { auditLogs, users } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewLog, setViewLog] = useState<any>(null);
  const [filterUser, setFilterUser] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const userNames = useMemo(() => ["all", ...Array.from(new Set(auditLogs.map(l => l.user)))], [auditLogs]);

  const filtered = useMemo(() => {
    return auditLogs.filter(log => {
      const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "all" || log.type === filterType;
      const matchStatus = filterStatus === "all" || log.status === filterStatus;
      const matchUser = filterUser === "all" || log.user === filterUser;
      const logDate = log.timestamp.slice(0, 10);
      const matchFrom = !dateFrom || logDate >= dateFrom;
      const matchTo = !dateTo || logDate <= dateTo;
      return matchSearch && matchType && matchStatus && matchUser && matchFrom && matchTo;
    });
  }, [auditLogs, search, filterType, filterStatus, filterUser, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const rows = [["ID","User","Action","Type","Status","Description","IP","Timestamp"],
      ...filtered.map(l => [l.id,l.user,l.action,l.type,l.status,`"${l.description}"`,l.ip,l.timestamp])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "audit_logs.csv";
    a.click();
    toast.success("Đã xuất nhật ký hệ thống!");
  };

  const getStatusIcon = (s: string) => {
    if (s === "success") return <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={2.5} />;
    if (s === "error") return <XCircle className="w-5 h-5 text-red-600" strokeWidth={2.5} />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" strokeWidth={2.5} />;
  };

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter(l => l.status === "success").length,
    error: auditLogs.filter(l => l.status === "error").length,
    warning: auditLogs.filter(l => l.status === "warning").length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader
        title="Nhật ký hệ thống"
        description={`${auditLogs.length} hoạt động được ghi lại`}
        icon={FileText}
        action={
          <Button onClick={exportCSV} variant="outline" className="rounded-[var(--radius-sm)] border-[var(--border-light)] font-semibold">
            <Download className="w-4 h-4 mr-2" />Xuất CSV
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng hoạt động", value: stats.total, color: "from-[var(--purple-deep)] to-[var(--purple-light)]" },
          { label: "Thành công", value: stats.success, color: "from-green-500 to-green-400" },
          { label: "Lỗi", value: stats.error, color: "from-red-500 to-red-400" },
          { label: "Cảnh báo", value: stats.warning, color: "from-yellow-500 to-yellow-400" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xl font-black text-[var(--text-dark)]">{s.value}</p>
                <p className="text-xs font-semibold text-[var(--text-muted)]">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <Input placeholder="Tìm kiếm nhật ký..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)] focus-visible:border-[var(--purple-deep)]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={filterUser} onValueChange={v => { setFilterUser(v); setPage(1); }}>
              <SelectTrigger className="h-10 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue placeholder="Người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người dùng</SelectItem>
                {userNames.filter(n => n !== "all").map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1); }}>
              <SelectTrigger className="h-10 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue placeholder="Loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(typeConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="h-10 rounded-[var(--radius-sm)] border-[var(--border-light)]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="success">Thành công</SelectItem>
                <SelectItem value="error">Lỗi</SelectItem>
                <SelectItem value="warning">Cảnh báo</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                className="h-10 rounded-[var(--radius-sm)] border-[var(--border-light)] text-sm" />
              <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
                className="h-10 rounded-[var(--radius-sm)] border-[var(--border-light)] text-sm" />
            </div>
          </div>
          {(search || filterType !== "all" || filterStatus !== "all" || filterUser !== "all" || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterType("all"); setFilterStatus("all"); setFilterUser("all"); setDateFrom(""); setDateTo(""); setPage(1); }}
              className="text-[var(--text-muted)] hover:text-red-600 text-xs font-semibold">
              ✕ Xóa bộ lọc ({filtered.length} kết quả)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-30" strokeWidth={1.5} />
              <p className="font-bold text-[var(--text-dark)]">Không tìm thấy nhật ký</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Thử thay đổi bộ lọc</p>
            </CardContent>
          </Card>
        ) : paginated.map(log => (
          <Card key={log.id} className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white hover-lift transition-smooth">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[var(--card-bg)] rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm">
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-black text-[var(--text-dark)]">{log.action}</h3>
                    <Badge className={`${typeConfig[log.type]?.cls || "bg-gray-100 text-gray-600"} rounded-full px-2.5 py-0.5 font-semibold text-xs`}>
                      {typeConfig[log.type]?.label || log.type}
                    </Badge>
                    <Badge className={`rounded-full px-2.5 py-0.5 font-semibold text-xs ${
                      log.status === "success" ? "bg-green-100 text-green-700" :
                      log.status === "error" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {log.status === "success" ? "Thành công" : log.status === "error" ? "Lỗi" : "Cảnh báo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">{log.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)] font-semibold">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[var(--purple-deep)]" />{log.user}</span>
                    <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-[var(--purple-deep)]" />IP: {log.ip}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[var(--purple-deep)]" />{log.timestamp}</span>
                    <button onClick={e => { e.stopPropagation(); setViewLog(log); }}
                      className="flex items-center gap-1 text-[var(--purple-deep)] hover:underline font-semibold">
                      <Eye className="w-3.5 h-3.5" />Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ViewLogModal log={viewLog} onClose={() => setViewLog(null)} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)} / {filtered.length} nhật ký
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p-1)} className="rounded-[8px]">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-[8px] text-sm font-bold transition-smooth ${p === page ? "bg-gradient-purple text-white shadow-[var(--shadow-btn)]" : "text-[var(--text-muted)] hover:bg-[var(--card-bg)]"}`}>{p}</button>
            ))}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p+1)} className="rounded-[8px]">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
