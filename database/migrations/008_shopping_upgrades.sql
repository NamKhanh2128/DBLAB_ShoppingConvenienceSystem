-- =============================================================
-- MIGRATION 008: Shopping List Upgrades
-- Mục tiêu:
--   1. Thêm DanhMucHang vào ChiTietMuaSam để phân loại quầy hàng
--      (Hỗ trợ gom nhóm theo khu vực siêu thị)
--   2. Thêm NgayMua để tracking timestamp khi đánh dấu đã mua
--      (Hỗ trợ báo cáo lịch sử chi tiêu theo ngày)
--   3. Thêm MaNguoiMua để biết ai đã đánh dấu mua món đó
--      (Accountability - minh bạch trong gia đình)
-- =============================================================

USE shoppingdb;
GO

-- -------------------------------------------------------
-- 1. Thêm cột DanhMucHang (phân loại quầy hàng)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietMuaSam') AND name = 'DanhMucHang')
BEGIN
    ALTER TABLE ChiTietMuaSam ADD DanhMucHang NVARCHAR(50) NULL;
    PRINT 'Added column DanhMucHang to ChiTietMuaSam';
END
GO

-- -------------------------------------------------------
-- 2. Thêm cột NgayMua (timestamp khi đánh dấu đã mua)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietMuaSam') AND name = 'NgayMua')
BEGIN
    ALTER TABLE ChiTietMuaSam ADD NgayMua DATETIME NULL;
    PRINT 'Added column NgayMua to ChiTietMuaSam';
END
GO

-- -------------------------------------------------------
-- 3. Thêm cột MaNguoiMua (ai đã đánh dấu mua)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ChiTietMuaSam') AND name = 'MaNguoiMua')
BEGIN
    ALTER TABLE ChiTietMuaSam ADD MaNguoiMua INT NULL;
    PRINT 'Added column MaNguoiMua to ChiTietMuaSam';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_CTMS_NguoiMua')
BEGIN
    ALTER TABLE ChiTietMuaSam
    ADD CONSTRAINT FK_CTMS_NguoiMua
    FOREIGN KEY (MaNguoiMua)
    REFERENCES NguoiDung(MaNguoiDung)
    ON DELETE NO ACTION  -- Dùng NO ACTION thay vì SET NULL để tránh multiple cascade paths
    ON UPDATE NO ACTION;
    PRINT 'Added FK_CTMS_NguoiMua constraint';
END
GO

-- -------------------------------------------------------
-- 4. Index hỗ trợ tìm kiếm trùng lặp theo tên + đơn vị
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CTMS_MaDanhSach_TenThucPham' AND object_id = OBJECT_ID('ChiTietMuaSam'))
BEGIN
    CREATE INDEX IX_CTMS_MaDanhSach_TenThucPham
    ON ChiTietMuaSam(MaDanhSach, TenThucPham, DonVi);
    PRINT 'Created index IX_CTMS_MaDanhSach_TenThucPham';
END
GO

-- -------------------------------------------------------
-- 5. Index hỗ trợ tìm kiếm kho theo tên (cho auto-restock)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_KhoThucPham_MaNhom_TenTP' AND object_id = OBJECT_ID('KhoThucPham'))
BEGIN
    CREATE INDEX IX_KhoThucPham_MaNhom_TenTP
    ON KhoThucPham(MaNhom, TenTP);
    PRINT 'Created index IX_KhoThucPham_MaNhom_TenTP';
END
GO

PRINT 'Migration 008_shopping_upgrades completed successfully.';
GO
