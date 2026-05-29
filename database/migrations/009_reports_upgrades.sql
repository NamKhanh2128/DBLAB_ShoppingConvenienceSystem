-- =============================================================
-- MIGRATION 009: Reports & Statistical Upgrades
-- Mục tiêu:
--   1. Thêm SoThanhVien vào BaoCaoChiTieu để chốt quy mô gia đình tại thời điểm thống kê
--      (Tránh sai lệch dữ liệu lịch sử khi thêm/bớt người)
--   2. Thêm TongCalo để hỗ trợ lưu calo tiêu thụ trong kỳ
--   3. Tạo index tối ưu hóa tìm kiếm báo cáo theo nhóm gia đình
-- =============================================================

USE shoppingdb;
GO

-- -------------------------------------------------------
-- 1. Thêm cột SoThanhVien (quy mô gia đình lịch sử)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('BaoCaoChiTieu') AND name = 'SoThanhVien')
BEGIN
    ALTER TABLE BaoCaoChiTieu ADD SoThanhVien INT NOT NULL DEFAULT 1;
    PRINT 'Added column SoThanhVien to BaoCaoChiTieu';
END
GO

-- -------------------------------------------------------
-- 2. Thêm cột TongCalo (lượng năng lượng tiêu thụ)
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('BaoCaoChiTieu') AND name = 'TongCalo')
BEGIN
    ALTER TABLE BaoCaoChiTieu ADD TongCalo INT NOT NULL DEFAULT 0;
    PRINT 'Added column TongCalo to BaoCaoChiTieu';
END
GO

-- -------------------------------------------------------
-- 3. Tạo index IX_BaoCaoChiTieu_MaNhom_NgayTao
-- -------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_BaoCaoChiTieu_MaNhom_NgayTao' AND object_id = OBJECT_ID('BaoCaoChiTieu'))
BEGIN
    CREATE INDEX IX_BaoCaoChiTieu_MaNhom_NgayTao
    ON BaoCaoChiTieu(MaNhom, NgayTao);
    PRINT 'Created index IX_BaoCaoChiTieu_MaNhom_NgayTao';
END
GO

PRINT 'Migration 009_reports_upgrades completed successfully.';
GO
