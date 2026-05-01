import { X, Link, Upload, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Modal from "./Modal";

interface ImportRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export function ImportRecipeModal({
  isOpen,
  onClose,
  onImport
}: ImportRecipeModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImportUrl = () => {
    setLoading(true);
    // Simulate import
    setTimeout(() => {
      onImport({ type: "url", url });
      setLoading(false);
      setUrl("");
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nhập công thức" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Import công thức</h2>
              <p className="text-white/90 text-sm mt-1">
                Thêm công thức từ web hoặc file
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
      <div className="p-6">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[var(--card-bg)] p-1 rounded-[var(--radius-sm)]">
            <TabsTrigger
              value="url"
              className="rounded-[var(--radius-sm)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Từ URL
            </TabsTrigger>
            <TabsTrigger
              value="file"
              className="rounded-[var(--radius-sm)] data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Từ File
            </TabsTrigger>
          </TabsList>

          {/* From URL */}
          <TabsContent value="url" className="space-y-4 mt-4">
            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
                <Link className="w-4 h-4 text-[var(--gold)]" />
                URL công thức
              </Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="rounded-[var(--radius-sm)] border-[var(--border-light)] focus-visible:ring-[var(--gold)] focus-visible:border-[var(--gold)]"
              />
            </div>

            <div className="p-4 bg-[var(--card-bg)] rounded-[var(--radius-sm)]">
              <p className="text-sm text-[var(--text-muted)] mb-2">
                <strong>Các trang được hỗ trợ:</strong>
              </p>
              <ul className="text-xs text-[var(--text-muted)] space-y-1">
                <li>• AllRecipes.com</li>
                <li>• Food Network</li>
                <li>• Cooky.vn</li>
                <li>• Và nhiều trang khác...</li>
              </ul>
            </div>

            <Button
              onClick={handleImportUrl}
              disabled={!url || loading}
              className="w-full bg-gradient-gold text-[var(--text-dark)] font-bold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] hover-lift transition-smooth disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang import...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import từ URL
                </>
              )}
            </Button>
          </TabsContent>

          {/* From File */}
          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <Label className="text-[var(--text-dark)] font-semibold mb-2 block flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--gold)]" />
                Chọn file
              </Label>
              <div className="border-2 border-dashed border-[var(--border-light)] rounded-[var(--radius-sm)] p-8 text-center hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-smooth cursor-pointer">
                <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[var(--text-dark)] mb-1">
                  Kéo thả file vào đây
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  hoặc nhấn để chọn file
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Hỗ trợ: PDF, JSON, TXT
                </p>
              </div>
            </div>

            <Button
              disabled
              className="w-full bg-gradient-gold text-[var(--text-dark)] font-semibold rounded-[var(--radius-btn)] shadow-[var(--shadow-btn)] opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import từ file
            </Button>
          </TabsContent>
        </Tabs>

        {/* Cancel Button */}
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full mt-4 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
        >
          Hủy
        </Button>
      </div>
    </Modal>
  );
}
