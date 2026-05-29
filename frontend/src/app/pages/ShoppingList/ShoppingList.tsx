import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Plus, Search, Filter, Check, X, Calendar, ShoppingCart,
  CheckCircle2, Trash2, MoreVertical, Share2, Download, Eye,
  Pencil, Loader2, PackagePlus, Layers, AlertCircle, Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Progress } from "../../components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useToastContext } from "../../context/ToastContext";
import {
  AddShoppingListModal, AddShoppingItemModal, EditShoppingItemModal,
  ViewShoppingItemModal, ShareShoppingListModal, FilterModal, ConfirmDialog,
} from "../../components/common";
import { useShopping } from "../../hooks/useData";

// ─────────────────────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────────────────────
function mapList(raw: any) {
  return {
    id: raw.MaDanhSach,
    name: raw.GhiChu || `Danh sách #${raw.MaDanhSach}`,
    date: raw.NgayTao ? new Date(raw.NgayTao).toLocaleDateString("vi-VN") : "",
    status: (raw.TrangThai || "DANG_TAO").toLowerCase(),
    emoji: raw.TrangThai === "HOAN_THANH" ? "✅" : raw.TrangThai === "DANG_MUA" ? "🛒" : "📋",
    totalItems: raw.TongMon || 0,
    doneItems: raw.DaMuaCount || 0,
    totalCost: raw.TongGiaDuKien || 0,
    actualCost: raw.TongGiaThucTe || 0,
  };
}

function mapItem(raw: any) {
  return {
    id: raw.MaCT,
    name: raw.TenThucPham,
    quantity: raw.SoLuong,
    unit: raw.DonVi || "",
    quantityLabel: `${raw.SoLuong} ${raw.DonVi || ""}`.trim(),
    price: Number(raw.GiaDuKien || 0),
    priceLabel: `${Number(raw.GiaDuKien || 0).toLocaleString()}₫`,
    actualPrice: Number(raw.GiaThucTe || 0),
    assignee: raw.TenNguoiPhuTrach || "Tôi",
    buyer: raw.TenNguoiMua || null,
    category: raw.DanhMucHang || "Khác",
    done: !!raw.DaMua,
    ngayMua: raw.NgayMua,
    _raw: raw,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RestockConfirmModal — Xác nhận nhập kho
// ─────────────────────────────────────────────────────────────────────────────
function RestockConfirmModal({
  listName,
  doneCount,
  onConfirm,
  onClose,
  loading,
}: {
  listName: string;
  doneCount: number;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 animate-slide-up">
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, var(--success), #38a169)" }}>
          <PackagePlus className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-black text-[var(--text-dark)] text-center mb-2">Hoàn thành và Nhập kho</h3>
        <p className="text-[var(--text-muted)] text-center text-sm mb-1">
          Tự động nhập <strong className="text-[var(--text-dark)]">{doneCount} món</strong> đã mua vào kho tủ lạnh?
        </p>
        <p className="text-xs text-center text-[var(--text-muted)] mb-6 bg-[var(--card-bg)] rounded-xl p-3">
          💡 Nếu món đã có sẵn trong kho, hệ thống sẽ <strong>cộng thêm số lượng</strong> thay vì tạo bản ghi mới.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)]" disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-white font-bold rounded-[var(--radius-btn)]"
            style={{ background: "linear-gradient(135deg, var(--success), #38a169)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PackagePlus className="w-4 h-4 mr-2" />}
            {loading ? "Đang nhập kho..." : "Nhập kho"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export function ShoppingList() {
  const { success, error, info, warning } = useToastContext();
  const {
    lists: rawLists, loading,
    loadLists, loadItems, createList, deleteList: apiDeleteList,
    addItem: apiAddItem, toggleItem: apiToggleItem,
    updateItem: apiUpdateItem, deleteItem: apiDeleteItem,
    completeAndRestock: apiCompleteAndRestock,
    mergeDuplicates: apiMergeDuplicates,
  } = useShopping();

  const lists = useMemo(() => rawLists.map(mapList), [rawLists]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showAddList, setShowAddList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showRestock, setShowRestock] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItemState, setDeleteItemState] = useState<any>(null);
  const [deleteListModal, setDeleteListModal] = useState(false);
  const [restockLoading, setRestockLoading] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);

  // Auto-select first list
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  // Load items when list changes
  useEffect(() => {
    if (!selectedListId) return;
    loadItems(selectedListId).then(data => setRawItems(data));
  }, [selectedListId]);

  const items = useMemo(() => rawItems.map(mapItem), [rawItems]);
  const selectedList = lists.find(l => l.id === selectedListId);

  const filteredItems = useMemo(() =>
    items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [items, searchQuery]
  );

  // Stats
  const completedItems = filteredItems.filter(i => i.done).length;
  const totalItems = filteredItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const totalEstimate = items.reduce((s, i) => s + i.price, 0);
  const purchasedCost = items.filter(i => i.done).reduce((s, i) => s + i.actualPrice || i.price, 0);
  const remainingCost = totalEstimate - purchasedCost;
  const doneItemsCount = items.filter(i => i.done).length;

  const refreshItems = useCallback(async () => {
    if (!selectedListId) return;
    const data = await loadItems(selectedListId);
    setRawItems(data);
  }, [selectedListId, loadItems]);

  // ── Handlers ──────────────────────────────────────────────────────

  const toggleItemHandler = async (itemId: number) => {
    if (!selectedListId) return;
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    try {
      await apiToggleItem(selectedListId, itemId, !item.done);
      await refreshItems();
      if (!item.done) success(`✅ Đã mua "${item.name}"`, "Món đã được đánh dấu hoàn thành");
      else info(`↩️ Bỏ đánh dấu "${item.name}"`, "Đã chuyển về chưa mua");
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemState || !selectedListId) return;
    try {
      await apiDeleteItem(selectedListId, deleteItemState.id);
      await refreshItems();
      await loadLists();
      success(`🗑️ Đã xóa "${deleteItemState.name}"`, "Món đã được xóa khỏi danh sách");
      setDeleteItemState(null);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleAddList = async (data: any) => {
    try {
      await createList(data.name || data.ghiChu);
      success("✅ Tạo danh sách thành công!", "Đã tạo danh sách mới.");
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleAddItem = async (data: any) => {
    if (!selectedListId) return;
    try {
      const result: any = await apiAddItem(selectedListId, {
        tenThucPham: data.name,
        soLuong: parseFloat(data.quantity) || 1,
        donVi: data.unit || "",
        giaDuKien: parseInt(data.price || "0"),
        danhMucHang: data.category || null,
        nguoiPhuTrach: null,
      });
      await refreshItems();
      await loadLists();
      // Thông báo phân biệt: tạo mới vs gom nhóm
      if (result?.merged) {
        warning("🔄 Đã gom nhóm!", result.message || `"${data.name}" đã được cộng số lượng vào item hiện có.`);
      } else {
        success("✅ Thêm món thành công!", `"${data.name}" đã được thêm vào danh sách.`);
      }
      setShowAddItem(false);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleEditItem = async (data: any) => {
    if (!editItem || !selectedListId) return;
    try {
      await apiUpdateItem(selectedListId, editItem.id, {
        tenThucPham: data.name,
        soLuong: parseFloat(data.quantity) || 1,
        donVi: data.unit || "",
        giaDuKien: parseInt(data.price || "0"),
      });
      await refreshItems();
      success("✅ Cập nhật thành công!", "Thông tin món đã được cập nhật.");
      setEditItem(null);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleDeleteList = async () => {
    if (!selectedListId) return;
    try {
      await apiDeleteList(selectedListId);
      setDeleteListModal(false);
      setSelectedListId(null);
      setRawItems([]);
      success("🗑️ Đã xóa danh sách!", "Danh sách đã được xóa.");
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleShare = () => {
    success("📤 Chia sẻ thành công!", "Đã chia sẻ danh sách tới thành viên gia đình.");
  };

  const handleExportPDF = () => {
    info("📄 Xuất PDF", "Đang tạo file PDF...");
    setTimeout(() => success("✅ Xuất PDF thành công!", "File đã được tải xuống."), 1500);
  };

  /** Hoàn thành mua sắm + nhập kho */
  const handleCompleteAndRestock = async () => {
    if (!selectedListId) return;
    setRestockLoading(true);
    try {
      const result = await apiCompleteAndRestock(selectedListId);
      setShowRestock(false);
      success(
        "🎉 Đã nhập kho thành công!",
        `Thêm mới ${result.addedToInventory} món · Cộng thêm ${result.mergedWithExisting} món hiện có`
      );
    } catch (e: any) {
      error("Lỗi nhập kho", e.message);
    } finally {
      setRestockLoading(false);
    }
  };

  /** Gom nhóm nguyên liệu trùng */
  const handleMergeDuplicates = async () => {
    if (!selectedListId) return;
    setMergeLoading(true);
    try {
      const result = await apiMergeDuplicates(selectedListId);
      if (result.mergedCount > 0) {
        success("🔄 Gom nhóm thành công!", result.message);
      } else {
        info("ℹ️ Không có gì để gom", result.message);
      }
    } catch (e: any) {
      error("Lỗi", e.message);
    } finally {
      setMergeLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Danh sách mua sắm</h1>
          <p className="text-[var(--text-muted)]">Quản lý và phân công nhiệm vụ mua sắm cho cả gia đình 🛒</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button
            variant="outline"
            className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />Chia sẻ
          </Button>
          <Button
            className="bg-gradient-gold text-white font-semibold px-6 py-6 rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift"
            onClick={() => setShowAddList(true)}
          >
            <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Tạo danh sách
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--gold)] mr-3" />
          <span className="text-[var(--text-muted)]">Đang tải danh sách mua sắm...</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Sidebar: Lists ─────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-black text-[var(--text-dark)] flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[var(--gold)]" />Danh sách của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lists.length === 0 && !loading && (
                <p className="text-center text-[var(--text-muted)] py-4 text-sm">Chưa có danh sách nào</p>
              )}
              {lists.map((list) => {
                const lp = list.totalItems > 0 ? (list.doneItems / list.totalItems) * 100 : 0;
                const isActive = selectedListId === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={() => { setSelectedListId(list.id); setSearchQuery(""); }}
                    className={`w-full text-left p-4 rounded-[var(--radius-sm)] transition-smooth ${isActive ? "bg-gradient-gold text-white shadow-[var(--shadow-btn)]" : "bg-[var(--card-bg)] hover:bg-white hover:shadow-md"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xl">{list.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm mb-0.5 ${isActive ? "text-white" : "text-[var(--text-dark)]"}`}>{list.name}</p>
                          <p className={`text-xs flex items-center gap-1 ${isActive ? "text-white/90" : "text-[var(--text-muted)]"}`}>
                            <Calendar size={12} />{list.date}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border-none font-semibold shrink-0 text-xs ${isActive ? "bg-white/20 text-white" : "bg-[var(--card-bg)] text-[var(--text-muted)]"}`}>
                        {list.status === "hoan_thanh" ? "✅ Xong" : list.status === "dang_mua" ? "🛒 Đang mua" : "📋 Mới"}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={isActive ? "text-white/90" : "text-[var(--text-muted)]"}>{list.doneItems}/{list.totalItems} món</span>
                        <span className={`font-semibold ${isActive ? "text-white" : "text-[var(--text-dark)]"}`}>{Math.round(lp)}%</span>
                      </div>
                      <Progress value={lp} className={`h-1.5 ${isActive ? "bg-white/20" : ""}`} />
                    </div>
                  </button>
                );
              })}
              <Button
                variant="outline"
                className="w-full border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-semibold transition-smooth mt-2"
                onClick={() => setShowAddList(true)}
              >
                <Plus className="w-4 h-4 mr-2" />Tạo danh sách mới
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-gradient-purple text-white overflow-hidden">
            <CardContent className="p-6">
              <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wide">Chi tiêu dự kiến</p>
              <p className="text-3xl font-black mb-4">{totalEstimate.toLocaleString()}₫</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">✅ Đã mua:</span>
                  <span className="font-semibold">{purchasedCost.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">🛒 Còn lại:</span>
                  <span className="font-semibold text-yellow-300">{remainingCost.toLocaleString()}₫</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Content ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Actions */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    placeholder="Tìm kiếm món..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)]"
                  />
                </div>
                <Button variant="outline" size="icon" className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)]" onClick={() => setShowFilter(true)}>
                  <Filter className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)]">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleMergeDuplicates} disabled={mergeLoading}>
                      {mergeLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
                      Gom nhóm trùng lặp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <Download className="w-4 h-4 mr-2" />Xuất PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowShare(true)}>
                      <Share2 className="w-4 h-4 mr-2" />Chia sẻ
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[var(--danger)]" onClick={() => setDeleteListModal(true)}>
                      <Trash2 className="w-4 h-4 mr-2" />Xóa danh sách
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Progress + Complete Button */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] overflow-hidden bg-gradient-gold">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-black mb-1">{selectedList?.name || "Chọn danh sách"}</h3>
                  <p className="text-white/90 text-sm">{completedItems} / {totalItems} món đã hoàn thành</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black">{Math.round(progress)}%</div>
                  <p className="text-xs text-white/90">Tiến độ</p>
                </div>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-white rounded-full transition-all shadow-lg" style={{ width: `${progress}%` }} />
              </div>

              {/* Nút Hoàn thành & Nhập kho — chỉ hiện khi có item đã mua */}
              {doneItemsCount > 0 && selectedList?.status !== "hoan_thanh" && (
                <Button
                  onClick={() => setShowRestock(true)}
                  className="w-full font-bold text-[var(--gold)] rounded-[var(--radius-btn)] border-2 border-white/60 hover:bg-white transition-smooth"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <PackagePlus className="w-5 h-5 mr-2" />
                  Hoàn thành &amp; Nhập kho ({doneItemsCount} món đã mua)
                </Button>
              )}
              {selectedList?.status === "hoan_thanh" && (
                <div className="flex items-center gap-2 justify-center bg-white/20 rounded-xl py-2 px-4">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold text-sm">Danh sách đã hoàn thành và nhập kho</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Merge tip khi có trùng lặp */}
          {items.length > 1 && (() => {
            const nameSet = new Set<string>();
            const hasDup = items.some(i => {
              const key = `${i.name.toLowerCase().trim()}|${i.unit.toLowerCase().trim()}`;
              if (nameSet.has(key)) return true;
              nameSet.add(key);
              return false;
            });
            return hasDup ? (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-700 flex-1">Phát hiện nguyên liệu trùng lặp. Gom nhóm để mua hiệu quả hơn!</p>
                <Button
                  size="sm"
                  onClick={handleMergeDuplicates}
                  disabled={mergeLoading}
                  className="text-white rounded-lg text-xs font-semibold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #d69e2e, #b7791f)" }}
                >
                  {mergeLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                  Gom nhóm
                </Button>
              </div>
            ) : null;
          })()}

          {/* Shopping Items */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-[var(--text-dark)]">Danh sách mua ({totalItems})</CardTitle>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                  {completedItems} hoàn thành
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {!selectedListId ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Chọn một danh sách để xem</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Danh sách trống</p>
                  <p className="text-sm">Thêm món mới để bắt đầu</p>
                </div>
              ) : (
                filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 rounded-[var(--radius-sm)] transition-smooth ${item.done ? "bg-[var(--card-bg)] opacity-70" : "bg-white border border-[var(--border-light)] hover:border-[var(--gold)] hover:shadow-md"}`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    {/* Checkbox lớn hơn để dễ bấm khi đi chợ */}
                    <button
                      onClick={() => toggleItemHandler(item.id)}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-smooth active:scale-95 ${item.done ? "bg-[var(--success)] border-[var(--success)] shadow-md" : "border-[var(--border-purple)] hover:border-[var(--success)] hover:bg-[var(--success)]/5"}`}
                      title={item.done ? "Bỏ đánh dấu" : "Đánh dấu đã mua"}
                    >
                      {item.done && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm mb-0.5 ${item.done ? "line-through text-[var(--text-muted)]" : "text-[var(--text-dark)]"}`}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap">
                        <span className="font-medium">{item.quantityLabel}</span>
                        <span>•</span>
                        <span className="font-semibold text-[var(--gold)]">{item.priceLabel}</span>
                        {item.category !== "Khác" && (
                          <>
                            <span>•</span>
                            <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] border-none text-[10px] px-1.5 py-0 font-medium">
                              {item.category}
                            </Badge>
                          </>
                        )}
                        {item.done && item.buyer && (
                          <span className="text-[var(--success)] font-medium">✅ {item.buyer}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-purple text-white text-xs font-bold">
                          {item.assignee.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-[var(--text-muted)] hidden sm:inline font-medium">{item.assignee}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="text-[var(--text-muted)] hover:text-[var(--info)] hover:bg-[var(--info-light)] transition-smooth rounded-[10px] w-8 h-8" onClick={() => setViewItem(item)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 transition-smooth rounded-[10px] w-8 h-8" onClick={() => setEditItem(item)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-smooth rounded-[10px] w-8 h-8" onClick={() => setDeleteItemState(item)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full rounded-[var(--radius-sm)] border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white font-semibold transition-smooth mt-2"
                onClick={() => setShowAddItem(true)}
              >
                <Plus className="w-4 h-4 mr-2" />Thêm món mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <AddShoppingListModal isOpen={showAddList} onClose={() => setShowAddList(false)} onSubmit={handleAddList} />
      <AddShoppingItemModal isOpen={showAddItem} onClose={() => setShowAddItem(false)} onSave={handleAddItem} mode="add" />
      {editItem && <EditShoppingItemModal isOpen={!!editItem} onClose={() => setEditItem(null)} onSubmit={handleEditItem} item={editItem} />}
      {viewItem && <ViewShoppingItemModal isOpen={!!viewItem} onClose={() => setViewItem(null)} item={viewItem} />}
      <ShareShoppingListModal isOpen={showShare} onClose={() => setShowShare(false)} listName={selectedList?.name} onSubmit={handleShare} />
      <FilterModal isOpen={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} />

      {/* Confirm: Xóa item */}
      <ConfirmDialog
        isOpen={!!deleteItemState}
        onClose={() => setDeleteItemState(null)}
        onConfirm={handleDeleteItem}
        title="Xóa món này?"
        message={`Bạn có chắc muốn xóa "${deleteItemState?.name}" khỏi danh sách không?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Confirm: Xóa list */}
      <ConfirmDialog
        isOpen={deleteListModal}
        onClose={() => setDeleteListModal(false)}
        onConfirm={handleDeleteList}
        title="Xóa danh sách?"
        message={`Bạn có chắc muốn xóa danh sách "${selectedList?.name}" không?`}
        confirmText="Xóa danh sách"
        cancelText="Hủy"
        type="danger"
      />

      {/* Confirm: Hoàn thành & Nhập kho */}
      {showRestock && (
        <RestockConfirmModal
          listName={selectedList?.name || ""}
          doneCount={doneItemsCount}
          onConfirm={handleCompleteAndRestock}
          onClose={() => setShowRestock(false)}
          loading={restockLoading}
        />
      )}
    </div>
  );
}