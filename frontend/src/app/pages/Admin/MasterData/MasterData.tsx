import { useState } from "react";
import { Database, Plus, MoreVertical, Edit, Trash2, Eye, Package, Utensils, Tag, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { PageHeader } from "../../../components/common/PageHeader";
import { AddEditItemModal } from "../../../components/common/AddEditItemModal";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { toast } from "../../../components/common/Toast";
import Modal from "../../../components/common/Modal";
import { Label } from "../../../components/ui/label";

const initialIngredients = [
  { id: "1", name: "Cà chua", category: "Rau củ", price: "15000", unit: "kg", description: "Cà chua tươi nhập từ Đà Lạt" },
  { id: "2", name: "Thịt heo ba chỉ", category: "Thịt", price: "120000", unit: "kg", description: "Thịt heo ba chỉ tươi" },
  { id: "3", name: "Cá hồi", category: "Cá", price: "250000", unit: "kg", description: "Cá hồi Na Uy nhập khẩu" },
  { id: "4", name: "Hành tây", category: "Rau củ", price: "20000", unit: "kg", description: "Hành tây tươi" },
  { id: "5", name: "Tôm sú", category: "Hải sản", price: "180000", unit: "kg", description: "Tôm sú tươi sống" },
];

const initialRecipes = [
  { id: "1", name: "Canh chua cá lóc", category: "Món nước", price: "80000", unit: "phần", description: "Canh chua cá lóc miền Nam đậm vị" },
  { id: "2", name: "Gà xào sả ớt", category: "Món xào", price: "120000", unit: "phần", description: "Gà xào sả ớt đậm đà" },
  { id: "3", name: "Phở bò", category: "Món nước", price: "65000", unit: "tô", description: "Phở bò Hà Nội truyền thống" },
];

const initialCategories = [
  { id: "1", name: "Rau củ", type: "Nguyên liệu", count: 45, color: "bg-green-100 text-green-700" },
  { id: "2", name: "Thịt", type: "Nguyên liệu", count: 23, color: "bg-red-100 text-red-700" },
  { id: "3", name: "Hải sản", type: "Nguyên liệu", count: 18, color: "bg-blue-100 text-blue-700" },
  { id: "4", name: "Món nước", type: "Công thức", count: 67, color: "bg-purple-100 text-purple-700" },
  { id: "5", name: "Món xào", type: "Công thức", count: 34, color: "bg-yellow-100 text-yellow-700" },
  { id: "6", name: "Tráng miệng", type: "Công thức", count: 21, color: "bg-pink-100 text-pink-700" },
];

function ItemActionModal({ item, onClose, onView, onEdit, onDelete }: {
  item: any; onClose: () => void;
  onView: () => void; onEdit: () => void; onDelete: () => void;
}) {
  if (!item) return null;
  return (
    <Modal isOpen={!!item} onClose={onClose} title={`Thao tác: ${item.name}`} size="sm">
      <div className="p-2 space-y-1">
        {[
          { icon: Eye, label: "Xem chi tiết", color: "text-[var(--purple-deep)]", bg: "hover:bg-purple-50", onClick: onView },
          { icon: Edit, label: "Chỉnh sửa", color: "text-blue-600", bg: "hover:bg-blue-50", onClick: onEdit },
          { icon: Trash2, label: "Xóa", color: "text-red-600", bg: "hover:bg-red-50", onClick: onDelete },
        ].map(({ icon: Icon, label, color, bg, onClick }) => (
          <button key={label} onClick={() => { onClick(); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-smooth ${bg} text-left`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} strokeWidth={2.5} />
            <span className={`font-semibold text-sm ${color}`}>{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function CategoryActionModal({ category, onClose, onEdit, onDelete }: {
  category: any; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  if (!category) return null;
  return (
    <Modal isOpen={!!category} onClose={onClose} title={`Thao tác: ${category.name}`} size="sm">
      <div className="p-2 space-y-1">
        {[
          { icon: Edit, label: "Chỉnh sửa danh mục", color: "text-blue-600", bg: "hover:bg-blue-50", onClick: onEdit },
          { icon: Trash2, label: "Xóa danh mục", color: "text-red-600", bg: "hover:bg-red-50", onClick: onDelete },
        ].map(({ icon: Icon, label, color, bg, onClick }) => (
          <button key={label} onClick={() => { onClick(); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] transition-smooth ${bg} text-left`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} strokeWidth={2.5} />
            <span className={`font-semibold text-sm ${color}`}>{label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function ViewItemModal({ item, onClose, onEdit }: { item: any; onClose: () => void; onEdit: () => void }) {
  if (!item) return null;
  return (
    <Modal isOpen={!!item} onClose={onClose} title="Chi tiết" size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button onClick={onEdit} className="flex-1 bg-gradient-purple text-white rounded-[var(--radius-sm)] font-semibold">
            <Edit className="w-4 h-4 mr-2" />Chỉnh sửa
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-[var(--radius-sm)] font-semibold">Đóng</Button>
        </div>
      }
    >
      <div className="space-y-3 p-1">
        {[
          { label: "Tên", value: item.name },
          { label: "Danh mục", value: item.category },
          { label: "Đơn giá", value: `${parseInt(item.price || 0).toLocaleString()} đ` },
          { label: "Đơn vị", value: item.unit },
          { label: "Mô tả", value: item.description },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-3 p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
            <span className="text-sm font-bold text-[var(--text-muted)] w-24 flex-shrink-0">{label}</span>
            <span className="text-sm font-semibold text-[var(--text-dark)]">{value}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function EditCategoryModal({ category, onClose, onSave }: { category: any; onClose: () => void; onSave: (data: any) => void }) {
  const [name, setName] = useState(category?.name || "");
  const [type, setType] = useState(category?.type || "Nguyên liệu");
  if (!category) return null;
  return (
    <Modal isOpen={!!category} onClose={onClose} title={`Chỉnh sửa danh mục: ${category.name}`} size="md"
      footer={
        <div className="flex gap-2 w-full">
          <Button onClick={() => { onSave({ name, type }); }} className="flex-1 bg-gradient-purple text-white rounded-[var(--radius-sm)] font-semibold">Lưu</Button>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-[var(--radius-sm)] font-semibold">Hủy</Button>
        </div>
      }
    >
      <div className="space-y-4 p-1">
        <div className="space-y-2">
          <Label className="font-semibold">Tên danh mục</Label>
          <Input value={name} onChange={e => setName(e.target.value)}
            className="h-11 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)]" />
        </div>
        <div className="space-y-2">
          <Label className="font-semibold">Loại</Label>
          <div className="flex gap-2">
            {["Nguyên liệu", "Công thức"].map(t => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-bold border transition-smooth ${type === t ? "bg-gradient-purple text-white border-transparent shadow-[var(--shadow-btn)]" : "border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--card-bg)]"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
          <p className="text-xs text-[var(--text-muted)]">Số mục hiện tại</p>
          <p className="text-2xl font-black text-[var(--purple-deep)]">{category.count}</p>
        </div>
      </div>
    </Modal>
  );
}

export function MasterData() {
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [actionItem, setActionItem] = useState<any>(null);
  const [actionCategory, setActionCategory] = useState<any>(null);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [deleteCategory, setDeleteCategory] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeTab, setActiveTab] = useState("ingredients");
  const [search, setSearch] = useState("");

  const handleAdd = () => { setSelectedItem(null); setModalMode("add"); setIsModalOpen(true); };
  const handleEdit = (item: any) => { setSelectedItem(item); setModalMode("edit"); setViewItem(null); setIsModalOpen(true); };
  const handleView = (item: any) => { setSelectedItem(item); setViewItem(item); };
  const handleDelete = (item: any) => { setSelectedItem(item); setIsDeleteDialogOpen(true); };

  const handleSave = (data: any) => {
    const newItem = { ...data, id: Date.now().toString() };
    if (modalMode === "add") {
      activeTab === "ingredients" ? setIngredients(p => [...p, newItem]) : setRecipes(p => [...p, newItem]);
      toast.success("Đã thêm mới thành công!");
    } else {
      activeTab === "ingredients"
        ? setIngredients(p => p.map(i => i.id === selectedItem.id ? { ...i, ...data } : i))
        : setRecipes(p => p.map(r => r.id === selectedItem.id ? { ...r, ...data } : r));
      toast.success("Đã cập nhật thành công!");
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    activeTab === "ingredients"
      ? setIngredients(p => p.filter(i => i.id !== selectedItem.id))
      : setRecipes(p => p.filter(r => r.id !== selectedItem.id));
    toast.success(`Đã xóa "${selectedItem?.name}"`);
    setIsDeleteDialogOpen(false);
  };

  const handleSaveCategory = (data: any) => {
    setCategories(p => p.map(c => c.id === editCategory.id ? { ...c, ...data } : c));
    toast.success(`Đã cập nhật danh mục "${data.name}"`);
    setEditCategory(null);
  };

  const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()));

  const renderTable = (data: any[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--border-light)] hover:bg-transparent bg-[var(--card-bg)]">
            <TableHead className="font-bold text-[var(--text-dark)] pl-6">Tên</TableHead>
            <TableHead className="font-bold text-[var(--text-dark)]">Danh mục</TableHead>
            <TableHead className="font-bold text-[var(--text-dark)]">Giá</TableHead>
            <TableHead className="font-bold text-[var(--text-dark)]">Đơn vị</TableHead>
            <TableHead className="font-bold text-[var(--text-dark)]">Mô tả</TableHead>
            <TableHead className="font-bold text-[var(--text-dark)] text-right pr-6">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center py-10 text-[var(--text-muted)]">Không có dữ liệu</TableCell></TableRow>
          )}
          {data.map(item => (
            <TableRow key={item.id} className="border-[var(--border-light)] hover:bg-[var(--card-bg)] transition-smooth">
              <TableCell className="font-bold text-[var(--text-dark)] pl-6">{item.name}</TableCell>
              <TableCell>
                <Badge className="bg-purple-100 text-[var(--purple-deep)] border-purple-200 rounded-full px-3 py-1 font-semibold">{item.category}</Badge>
              </TableCell>
              <TableCell className="font-semibold text-[var(--gold)]">{parseInt(item.price).toLocaleString()} đ</TableCell>
              <TableCell className="text-[var(--text-muted)] font-medium">{item.unit}</TableCell>
              <TableCell className="text-[var(--text-muted)] max-w-[200px] truncate">{item.description}</TableCell>
              <TableCell className="text-right pr-6">
                <Button variant="ghost" size="icon"
                  onClick={() => setActionItem(item)}
                  className="rounded-[8px] hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--purple-deep)]">
                  <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <PageHeader title="Dữ liệu gốc" description="Quản lý nguyên liệu, công thức và danh mục" icon={Database} />

      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearch(""); }} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="bg-white border border-[var(--border-light)] shadow-sm rounded-[var(--radius-sm)] p-1.5">
            <TabsTrigger value="ingredients" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold">
              <Package className="w-4 h-4 mr-2" strokeWidth={2.5} />Nguyên liệu ({ingredients.length})
            </TabsTrigger>
            <TabsTrigger value="recipes" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold">
              <Utensils className="w-4 h-4 mr-2" strokeWidth={2.5} />Công thức ({recipes.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-[8px] data-[state=active]:bg-gradient-purple data-[state=active]:text-white data-[state=active]:shadow-md font-semibold">
              <Tag className="w-4 h-4 mr-2" strokeWidth={2.5} />Danh mục ({categories.length})
            </TabsTrigger>
          </TabsList>
          {activeTab !== "categories" && (
            <Button onClick={handleAdd} className="bg-gradient-purple text-white rounded-[var(--radius-sm)] shadow-[var(--shadow-btn)] hover-lift font-semibold">
              <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />Thêm mới
            </Button>
          )}
        </div>

        <TabsContent value="ingredients" className="space-y-4">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input placeholder="Tìm nguyên liệu..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)]" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-0">{renderTable(filteredIngredients)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recipes" className="space-y-4">
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input placeholder="Tìm công thức..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-10 rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--purple-deep)]" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>}
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white">
            <CardContent className="p-0">{renderTable(filteredRecipes)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Card key={cat.id} className="border-none shadow-[var(--shadow-card)] rounded-[var(--radius)] bg-white hover-lift transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${cat.color} rounded-[12px] flex items-center justify-center shadow-sm`}>
                      <Tag className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <Button variant="ghost" size="icon"
                        onClick={() => setActionCategory(cat)}
                        className="rounded-[8px] hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--purple-deep)]">
                        <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                      </Button>
                  </div>
                  <h3 className="text-lg font-black text-[var(--text-dark)]">{cat.name}</h3>
                  <Badge className="mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[var(--card-bg)] text-[var(--text-muted)]">{cat.type}</Badge>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-light)]">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Tổng số mục</span>
                    <span className="text-2xl font-black text-[var(--purple-deep)]">{cat.count}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="border-none border-2 border-dashed border-[var(--border-light)] rounded-[var(--radius)] bg-transparent hover:border-[var(--purple-light)] hover:bg-[var(--card-bg)] transition-smooth cursor-pointer group"
              onClick={() => toast.info("Chức năng thêm danh mục đang phát triển")}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[160px] gap-2">
                <div className="w-12 h-12 bg-[var(--card-bg)] group-hover:bg-white rounded-full flex items-center justify-center transition-smooth">
                  <Plus className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--purple-deep)]" strokeWidth={2.5} />
                </div>
                <p className="text-sm font-semibold text-[var(--text-muted)] group-hover:text-[var(--purple-deep)]">Thêm danh mục</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Item Action Modal */}
      <ItemActionModal item={actionItem} onClose={() => setActionItem(null)}
        onView={() => handleView(actionItem)}
        onEdit={() => handleEdit(actionItem)}
        onDelete={() => handleDelete(actionItem)}
      />

      {/* Category Action Modal */}
      <CategoryActionModal category={actionCategory} onClose={() => setActionCategory(null)}
        onEdit={() => setEditCategory(actionCategory)}
        onDelete={() => setDeleteCategory(actionCategory)}
      />

      {/* View Detail Modal */}
      <ViewItemModal item={viewItem} onClose={() => setViewItem(null)} onEdit={() => handleEdit(viewItem)} />

      {/* Edit Category Modal */}
      <EditCategoryModal category={editCategory} onClose={() => setEditCategory(null)} onSave={handleSaveCategory} />

      {/* Add/Edit Item Modal */}
      <AddEditItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} item={selectedItem} mode={modalMode}
        title={modalMode === "add" ? (activeTab === "ingredients" ? "Thêm nguyên liệu" : "Thêm công thức") : (activeTab === "ingredients" ? "Chỉnh sửa nguyên liệu" : "Chỉnh sửa công thức")}
        type={activeTab === "ingredients" ? "ingredient" : "recipe"}
      />

      {/* Delete Item */}
      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDelete}
        title="Xác nhận xóa" message={`Bạn có chắc muốn xóa "${selectedItem?.name}"?`} confirmText="Xóa" type="danger" />

      {/* Delete Category */}
      <ConfirmDialog isOpen={!!deleteCategory} onClose={() => setDeleteCategory(null)}
        onConfirm={() => { setCategories(p => p.filter(c => c.id !== deleteCategory?.id)); toast.success(`Đã xóa danh mục "${deleteCategory?.name}"`); setDeleteCategory(null); }}
        title="Xóa danh mục" message={`Xóa danh mục "${deleteCategory?.name}" sẽ ảnh hưởng đến ${deleteCategory?.count} mục. Tiếp tục?`}
        confirmText="Xóa" type="danger" />
    </div>
  );
}
