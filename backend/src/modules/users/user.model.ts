/**
 * user.model.ts
 * Contract dữ liệu cho bảng NguoiDung — phải khớp 100% với tên cột trong SQL Server.
 * Đây là "nguồn sự thật duy nhất" (Single Source of Truth) cho toàn bộ backend.
 */

// ─── DB Row: Ánh xạ trực tiếp từ tên cột SQL (PascalCase như trong DB) ─────
export interface NguoiDungRow {
  MaNguoiDung : number;
  HoTen       : string;
  Email       : string;
  MatKhauHash : string;        // KHÔNG bao giờ trả ra ngoài API
  SoDienThoai : string | null;
  Bio         : string | null;
  VaiTro      : 'ADMIN' | 'MEMBER';
  TrangThai   : 'ACTIVE' | 'BANNED' | 'INACTIVE';
  NgayTao     : Date;
  NgayCapNhat : Date;
}

// ─── Safe User: Loại bỏ password trước khi trả về client ──────────────────
export type SafeUser = Omit<NguoiDungRow, 'MatKhauHash'>;

// ─── DTO: Body mà Frontend gửi lên khi cập nhật hồ sơ ──────────────────────
// Tên field camelCase (theo convention JSON/REST) — backend sẽ map sang PascalCase khi query.
export interface UpdateProfileDto {
  hoTen       ?: string;   // → HoTen
  email       ?: string;   // → Email
  soDienThoai ?: string;   // → SoDienThoai
  bio         ?: string;   // → Bio
}

// ─── DTO: Body đổi mật khẩu ─────────────────────────────────────────────────
export interface ChangePasswordDto {
  currentPassword : string;
  newPassword     : string;
}
