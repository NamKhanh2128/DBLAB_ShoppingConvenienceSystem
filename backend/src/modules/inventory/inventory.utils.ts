/**
 * inventory.utils.ts
 * Bộ chuyển đổi và chuẩn hóa đơn vị đo lường thực phẩm.
 * Hỗ trợ so sánh tương đương lượng thực phẩm giữa kho (g/ml) và công thức (kg/l).
 */

export const STANDARD_UNITS = [
  'g', 'kg', 'ml', 'l',
  'quả', 'hộp', 'chai', 'gói', 'bó', 'lon', 'cái', 'chiếc'
];

/**
 * Chuẩn hóa chuỗi đơn vị đo lường nhập vào về đơn vị chuẩn hệ thống.
 */
export function standardizeUnit(unit: string): string {
  if (!unit) return '';
  const u = unit.trim().toLowerCase();
  
  if (['g', 'gam', 'gram'].includes(u)) return 'g';
  if (['kg', 'kilogam', 'kí', 'ki', 'kilo'].includes(u)) return 'kg';
  if (['ml', 'mililit', 'mili'].includes(u)) return 'ml';
  if (['l', 'lít', 'lit'].includes(u)) return 'l';
  
  // Nếu là đơn vị đếm thông thường khác, giữ nguyên
  const matched = STANDARD_UNITS.find(std => std === u);
  return matched || u;
}

/**
 * Quy đổi số lượng từ đơn vị nguồn sang đơn vị đích.
 * Trả về số lượng đã quy đổi hoặc null nếu hai đơn vị không thuộc cùng hệ quy chiếu (ví dụ: g <-> ml hoặc g <-> quả).
 */
export function getEquivalentQuantity(qty: number, fromUnit: string, toUnit: string): number | null {
  const src = standardizeUnit(fromUnit);
  const dest = standardizeUnit(toUnit);

  if (src === dest) return qty;

  // Hệ Đo Khối Lượng (Weight)
  if (src === 'kg' && dest === 'g') {
    return qty * 1000;
  }
  if (src === 'g' && dest === 'kg') {
    return qty / 1000;
  }

  // Hệ Đo Thể Tích (Volume)
  if (src === 'l' && dest === 'ml') {
    return qty * 1000;
  }
  if (src === 'ml' && dest === 'l') {
    return qty / 1000;
  }

  // Không quy đổi chéo được
  return null;
}

/**
 * Kiểm tra xem lượng thực phẩm hiện có trong kho có đủ đáp ứng công thức nấu ăn hay không.
 */
export function isQuantitySufficient(
  availableQty: number,
  availableUnit: string,
  requiredQty: number,
  requiredUnit: string
): boolean {
  const converted = getEquivalentQuantity(availableQty, availableUnit, requiredUnit);
  if (converted !== null) {
    return converted >= requiredQty;
  }
  
  // Nếu không thể quy đổi (khác đơn vị đo), so sánh trực tiếp tên đơn vị và số lượng
  return standardizeUnit(availableUnit) === standardizeUnit(requiredUnit) && availableQty >= requiredQty;
}
