/**
 * inventory.ts (Frontend Utility)
 * Quản lý chuẩn hóa danh sách đơn vị và định dạng màu sắc cho hạn sử dụng thực phẩm.
 */

export const INVENTORY_UNITS = [
  'g', 'kg', 'ml', 'l',
  'quả', 'hộp', 'chai', 'gói', 'bó', 'lon', 'cái', 'chiếc'
];

export interface ExpiryStatusInfo {
  status: 'critical' | 'warning' | 'good' | 'none';
  text: string;
  badgeClass: string;
  textClass: string;
  icon: string;
}

/**
 * Tính toán trạng thái hạn sử dụng của thực phẩm
 */
export function getExpiryStatus(expiryDateStr: string | null | Date): ExpiryStatusInfo {
  if (!expiryDateStr) {
    return {
      status: 'none',
      text: 'Không có HSD',
      badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      textClass: 'text-gray-500',
      icon: '♾️'
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'critical',
      text: `Đã hết hạn (${Math.abs(diffDays)} ngày trước)`,
      badgeClass: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
      textClass: 'text-red-600 dark:text-red-400 font-bold',
      icon: '🚨'
    };
  }

  if (diffDays === 0) {
    return {
      status: 'critical',
      text: 'Hết hạn hôm nay!',
      badgeClass: 'bg-red-100 text-red-700 animate-pulse border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
      textClass: 'text-red-600 dark:text-red-400 font-bold',
      icon: '⚠️'
    };
  }

  if (diffDays === 1) {
    return {
      status: 'critical',
      text: 'Hết hạn ngày mai!',
      badgeClass: 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900',
      textClass: 'text-orange-600 dark:text-orange-400 font-bold',
      icon: '⏰'
    };
  }

  if (diffDays <= 3) {
    return {
      status: 'warning',
      text: `Còn ${diffDays} ngày (Sắp hết hạn)`,
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
      textClass: 'text-amber-600 dark:text-amber-400 font-semibold',
      icon: '⏳'
    };
  }

  return {
    status: 'good',
    text: `Còn ${diffDays} ngày`,
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    icon: '✅'
  };
}
