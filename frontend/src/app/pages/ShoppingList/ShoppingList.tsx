import { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, Filter, Check, X, Calendar, ShoppingCart,
  CheckCircle2, Trash2, MoreVertical, Share2, Download, Eye, Pencil, Loader2
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

function mapList(raw: any) {
  return {
    id: raw.MaDanhSach,
    name: raw.GhiChu || `Danh sách #${raw.MaDanhSach}`,
    date: raw.NgayTao ? new Date(raw.NgayTao).toLocaleDateString('vi-VN') : '',
    status: (raw.TrangThai || 'ACTIVE').toLowerCase(),
    emoji: raw.TrangThai === 'COMPLETED' ? '✅' : raw.TrangThai === 'PENDING' ? '🎉' : '🛒',
    totalItems: raw.TongMon || 0,
    doneItems: raw.DaMuaCount || 0,
    totalCost: raw.TongGiaDuKien || 0,
  };
}

function mapItem(raw: any) {
  return {
    id: raw.MaCT,
    name: raw.TenThucPham,
    quantity: `${raw.SoLuong} ${raw.DonVi || ''}`.trim(),
    price: `${Number(raw.GiaDuKien || 0).toLocaleString()}₫`,
    assignee: raw.TenNguoiPhuTrach || 'Tôi',
    emoji: '🛍️',
    done: !!raw.DaMua,
    category: 'Khác',
    _raw: raw,
  };
}

export function ShoppingList() {
  const { success, error, info } = useToastContext();
  const {
    lists: rawLists, loading,
    loadLists, loadItems, createList, deleteList: apiDeleteList,
    addItem: apiAddItem, toggleItem: apiToggleItem,
    updateItem: apiUpdateItem, deleteItem: apiDeleteItem,
  } = useShopping();

  const lists = useMemo(() => rawLists.map(mapList), [rawLists]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [rawItems, setRawItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddList, setShowAddList] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteListModal, setDeleteListModal] = useState(false);

  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists]);

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

  const completedItems = filteredItems.filter(i => i.done).length;
  const totalItems = filteredItems.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const totalCost = items.reduce((s, i) => s + parseInt(i.price.replace(/[^\d]/g, '') || '0'), 0);
  const completedCost = items.filter(i => i.done).reduce((s, i) => s + parseInt(i.price.replace(/[^\d]/g, '') || '0'), 0);

  const refreshItems = async () => {
    if (!selectedListId) return;
    const data = await loadItems(selectedListId);
    setRawItems(data);
  };

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
    if (!deleteItem || !selectedListId) return;
    try {
      await apiDeleteItem(selectedListId, deleteItem.id);
      await refreshItems();
      await loadLists();
      success(`🗑️ Đã xóa "${deleteItem.name}"`, "Món đã được xóa khỏi danh sách");
      setDeleteItem(null);
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
      await apiAddItem(selectedListId, {
        tenThucPham: data.name,
        soLuong: parseFloat(data.quantity) || 1,
        donVi: data.unit || '',
        giaDuKien: parseInt(data.price || '0'),
        nguoiPhuTrach: null,
      });
      await refreshItems();
      await loadLists();
      success("✅ Thêm món thành công!", `"${data.name}" đã được thêm vào danh sách.`);
      setShowAddItem(false);
    } catch (e: any) { error("Lỗi", e.message); }
  };

  const handleEditItem = async (data: any) => {
    if (!editItem || !selectedListId) return;
    try {
      await apiUpdateItem(selectedListId, editItem.id, {
        tenThucPham: data.name,
        soLuong: parseFloat(data.quantity) || 1,
        donVi: data.unit || '',
        giaDuKien: parseInt(data.price || '0'),
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

  const handleShare = (data: any) => {
    success("📤 Chia sẻ thành công!", `Đã chia sẻ danh sách tới ${data.email || "thành viên"}.`);
  };

  const handleExportPDF = () => {
    info("📄 Xuất PDF", "Đang tạo file PDF...");
    setTimeout(() => success("✅ Xuất PDF thành công!", "File đã được tải xuống."), 1500);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">Danh sách mua sắm</h1>
          <p className="text-[var(--text-muted)]">Quản lý và phân công nhiệm vụ mua sắm cho cả gia đình 🛒</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Button variant="outline" className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-btn)] font-semibold transition-smooth" onClick={() => setShowShare(true)}>
            <Share2 className="w-4 h-4 mr-2" />Chia sẻ
          </Button>
          <Button className="bg-gradient-gold text-white font-semibold px-6 py-6 rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth" onClick={() => setShowAddList(true)}>
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
        {/* Lists Sidebar */}
        <div className="space-y-4">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] hover-lift transition-smooth">
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
                const listProgress = list.totalItems > 0 ? (list.doneItems / list.totalItems) * 100 : 0;
                return (
                  <button
                    key={list.id}
                    onClick={() => { setSelectedListId(list.id); setSearchQuery(""); }}
                    className={`w-full text-left p-4 rounded-[var(--radius-sm)] transition-smooth ${selectedListId === list.id ? 'bg-gradient-gold text-white shadow-[var(--shadow-btn)]' : 'bg-[var(--card-bg)] hover:bg-white hover:shadow-md'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xl">{list.emoji}</span>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm mb-0.5 ${selectedListId === list.id ? 'text-white' : 'text-[var(--text-dark)]'}`}>{list.name}</p>
                          <p className={`text-xs flex items-center gap-1 ${selectedListId === list.id ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                            <Calendar size={12} />{list.date}
                          </p>
                        </div>
                      </div>
                      <Badge className={`border-none font-semibold shrink-0 ${list.status === 'active' ? selectedListId === list.id ? 'bg-white/20 text-white' : 'bg-[var(--success-light)] text-[var(--success)]' : selectedListId === list.id ? 'bg-white/20 text-white' : 'bg-[var(--warning-light)] text-[var(--warning)]'}`}>
                        {list.status === 'active' ? 'Đang mua' : list.status === 'completed' ? 'Hoàn thành' : 'Sắp tới'}
                      </Badge>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={selectedListId === list.id ? 'text-white/90' : 'text-[var(--text-muted)]'}>{list.doneItems}/{list.totalItems} món</span>
                        <span className={`font-semibold ${selectedListId === list.id ? 'text-white' : 'text-[var(--text-dark)]'}`}>{Math.round(listProgress)}%</span>
                      </div>
                      <Progress value={listProgress} className={`h-1.5 ${selectedListId === list.id ? 'bg-white/20' : ''}`} />
                    </div>
                  </button>
                );
              })}
              <Button variant="outline" className="w-full border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-[var(--radius-sm)] font-semibold transition-smooth mt-2" onClick={() => setShowAddList(true)}>
                <Plus className="w-4 h-4 mr-2" />Tạo danh sách mới
              </Button>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-gradient-purple text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wide">Tổng chi tiêu</p>
                <p className="text-3xl font-black">{totalCost.toLocaleString()}₫</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Đã mua:</span>
                  <span className="font-semibold">{completedCost.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Còn lại:</span>
                  <span className="font-semibold">{(totalCost - completedCost).toLocaleString()}₫</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search & Actions */}
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)]">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input placeholder="Tìm kiếm món..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]" />
                </div>
                <Button variant="outline" size="icon" className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth" onClick={() => setShowFilter(true)}>
                  <Filter className="w-4 h-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-[var(--radius-sm)] border-[var(--border-light)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-smooth">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPDF}><Download className="w-4 h-4 mr-2" />Xuất PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowShare(true)}><Share2 className="w-4 h-4 mr-2" />Chia sẻ</DropdownMenuItem>
                    <DropdownMenuItem className="text-[var(--danger)]" onClick={() => setDeleteListModal(true)}><Trash2 className="w-4 h-4 mr-2" />Xóa danh sách</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
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
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all shadow-lg" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>

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
                    className={`flex items-center gap-4 p-4 rounded-[var(--radius-sm)] transition-smooth ${item.done ? 'bg-[var(--card-bg)] opacity-70' : 'bg-white border border-[var(--border-light)] hover:border-[var(--gold)] hover:shadow-md'}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <button
                      onClick={() => toggleItemHandler(item.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-smooth ${item.done ? 'bg-[var(--success)] border-[var(--success)] shadow-md' : 'border-[var(--border-purple)] hover:border-[var(--gold)] hover:bg-[var(--gold)]/5'}`}
                    >
                      {item.done && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                    </button>
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm mb-0.5 ${item.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-dark)]'}`}>{item.name}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>{item.quantity}</span>
                        <span>•</span>
                        <span className="font-semibold text-[var(--gold)]">{item.price}</span>
                        <span>•</span>
                        <Badge className="bg-[var(--card-bg)] text-[var(--text-muted)] border-none text-[10px] px-1.5 py-0 font-medium">{item.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-purple text-white text-xs font-bold">{item.assignee.charAt(0)}</AvatarFallback>
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
                      <Button variant="ghost" size="icon" className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-smooth rounded-[10px] w-8 h-8" onClick={() => setDeleteItem(item)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full rounded-[var(--radius-sm)] border-dashed border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white font-semibold transition-smooth mt-2" onClick={() => setShowAddItem(true)}>
                <Plus className="w-4 h-4 mr-2" />Thêm món mới
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddShoppingListModal isOpen={showAddList} onClose={() => setShowAddList(false)} onSubmit={handleAddList} />
      <AddShoppingItemModal isOpen={showAddItem} onClose={() => setShowAddItem(false)} onSave={handleAddItem} mode="add" />
      {editItem && <EditShoppingItemModal isOpen={!!editItem} onClose={() => setEditItem(null)} onSubmit={handleEditItem} item={editItem} />}
      {viewItem && <ViewShoppingItemModal isOpen={!!viewItem} onClose={() => setViewItem(null)} item={viewItem} />}
      <ShareShoppingListModal isOpen={showShare} onClose={() => setShowShare(false)} listName={selectedList?.name} />
      <FilterModal isOpen={showFilter} onClose={() => setShowFilter(false)} onApply={() => setShowFilter(false)} />
      <ConfirmDialog isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleteItem} title="Xóa món này?" message={`Bạn có chắc muốn xóa "${deleteItem?.name}" khỏi danh sách không?`} confirmText="Xóa" cancelText="Hủy" type="danger" />
      <ConfirmDialog isOpen={deleteListModal} onClose={() => setDeleteListModal(false)} onConfirm={handleDeleteList} title="Xóa danh sách?" message={`Bạn có chắc muốn xóa danh sách "${selectedList?.name}" không?`} confirmText="Xóa danh sách" cancelText="Hủy" type="danger" />
    </div>
  );
}