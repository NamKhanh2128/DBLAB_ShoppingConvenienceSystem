USE shoppingdb;
GO

-- ==========================================
-- VIEWS BÁO CÁO & THỐNG KÊ
-- ==========================================

-- 1. View: Danh sách thực phẩm sắp hết hạn (trong vòng 3 ngày tới)
CREATE OR ALTER VIEW vw_ThucPhamSapHetHan AS
SELECT 
    K.MaTP, K.TenTP, K.SoLuong, K.DonVi, K.HanSuDung, K.ViTri,
    N.TenNhom, N.MaNhom
FROM KhoThucPham K
JOIN NhomGiaDinh N ON K.MaNhom = N.MaNhom
WHERE K.HanSuDung IS NOT NULL 
  AND K.HanSuDung BETWEEN CAST(GETDATE() AS DATE) AND DATEADD(day, 3, CAST(GETDATE() AS DATE))
  AND K.TrangThai = 'CON_HAN' AND K.SoLuong > 0;
GO

-- 2. View: Thống kê chi tiêu mua sắm theo từng danh sách
CREATE OR ALTER VIEW vw_ThongKeMuaSam AS
SELECT 
    DS.MaDanhSach, DS.NgayTao, DS.TrangThai, DS.MaNhom,
    SUM(CT.GiaDuKien) AS TongGiaDuKien,
    SUM(CASE WHEN CT.DaMua = 1 THEN CT.GiaThucTe ELSE 0 END) AS TongGiaThucTe_DaMua,
    COUNT(CT.MaCT) AS TongSoMon,
    SUM(CASE WHEN CT.DaMua = 1 THEN 1 ELSE 0 END) AS SoMonDaMua
FROM DanhSachMuaSam DS
LEFT JOIN ChiTietMuaSam CT ON DS.MaDanhSach = CT.MaDanhSach
GROUP BY DS.MaDanhSach, DS.NgayTao, DS.TrangThai, DS.MaNhom;
GO
