import { X, Share2, Copy, Mail, MessageCircle, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Modal from "./Modal";

interface ShareShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  listName?: string;
}

export function ShareShoppingListModal({
  isOpen,
  onClose,
  listName
}: ShareShoppingListModalProps) {
  const [copied, setCopied] = useState(false);
  const shareLink = "https://market.app/list/abc123";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      id: "email",
      icon: Mail,
      label: "Email",
      color: "from-[#3B82F6] to-[#2563EB]",
    },
    {
      id: "sms",
      icon: MessageCircle,
      label: "SMS",
      color: "bg-gradient-gold",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chia sẻ danh sách" size="md">

      {/* Header */}
      <div style={{ display: "none" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6" />
            <div>
              <h2 className="text-2xl font-black">Chia sẻ danh sách</h2>
              <p className="text-white/90 text-sm mt-1">
                {listName || "Danh sách mua sắm"}
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
      <div className="p-6 space-y-6">
        {/* Share Link */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-2 block">
            Liên kết chia sẻ
          </Label>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              className="flex-1 rounded-[var(--radius-sm)] border-[var(--border-light)] bg-[var(--card-bg)]"
            />
            <Button
              onClick={handleCopy}
              className={`
                  rounded-[var(--radius-btn)] font-semibold transition-smooth
                  ${copied
                  ? 'bg-[var(--success)] text-white'
                  : 'bg-gradient-gold text-[var(--text-dark)] hover-lift'
                }
                `}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Đã sao
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Sao chép
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share Options */}
        <div>
          <Label className="text-[var(--text-dark)] font-semibold mb-3 block">
            Chia sẻ qua
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  className={`
                      group p-4 rounded-[var(--radius-sm)] border border-[var(--border-light)] 
                      hover:border-transparent hover:shadow-lg transition-smooth bg-white
                      relative overflow-hidden
                    `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-100 transition-smooth`} />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center shadow-md group-hover:bg-white/20 transition-smooth`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm text-[var(--text-dark)] group-hover:text-white transition-smooth">
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="p-6 bg-[var(--card-bg)] rounded-[var(--radius-sm)] text-center">
          <div className="w-32 h-32 mx-auto bg-white rounded-[var(--radius-sm)] shadow-md flex items-center justify-center mb-3">
            <div className="text-[var(--text-muted)] text-xs">QR Code</div>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            Quét mã QR để xem danh sách
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-btn)] border-[var(--border-light)] hover:bg-[var(--card-bg)] font-semibold"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
