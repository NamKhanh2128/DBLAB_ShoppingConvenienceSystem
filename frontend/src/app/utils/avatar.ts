/**
 * avatar.ts
 * Helpers phục vụ vẽ avatar đại diện động và màu sắc phân biệt giữa các thành viên.
 */

// Lấy 1 hoặc 2 chữ cái đầu tiên của họ và tên (ví dụ: "Nguyễn Văn Anh" -> "NA")
export const getInitials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 1).toUpperCase();
  }
  const first = parts[0].substring(0, 1);
  const last = parts[parts.length - 1].substring(0, 1);
  return (first + last).toUpperCase();
};

// Hàm hash họ tên thành mã màu HSL hài hòa, dễ nhìn và không bị quá chói hay quá tối
export const getMemberColor = (name: string): string => {
  if (!name) return '#FFD700'; // Mặc định màu vàng
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Hue chạy từ 0 - 360 độ màu sắc
  const h = Math.abs(hash % 360);
  // Saturation 65% và Lightness 40% để tạo tông màu pastel sang trọng, dễ đọc chữ trắng
  return `hsl(${h}, 65%, 40%)`;
};
