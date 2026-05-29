USE shoppingdb;
GO

-- ======================================================
-- 1. Thêm cột SoKhauPhan và TenMonAn vào KeHoachBuaAn
-- ======================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('KeHoachBuaAn') AND name = 'SoKhauPhan'
)
BEGIN
    ALTER TABLE KeHoachBuaAn ADD SoKhauPhan INT NOT NULL DEFAULT 4;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('KeHoachBuaAn') AND name = 'TenMonAn'
)
BEGIN
    ALTER TABLE KeHoachBuaAn ADD TenMonAn NVARCHAR(200) NULL;
END
GO

-- Cập nhật dữ liệu cũ để đồng bộ hóa tên món ăn từ bảng MonAn sang KeHoachBuaAn
UPDATE kh
SET kh.TenMonAn = m.TenMon
FROM KeHoachBuaAn kh
INNER JOIN MonAn m ON kh.MaMon = m.MaMon
WHERE kh.TenMonAn IS NULL;
GO

-- ======================================================
-- 2. Thay đổi quan hệ FK_KHBA_Mon thành ON DELETE SET NULL
-- ======================================================
-- Bỏ thuộc tính NOT NULL cho cột MaMon
ALTER TABLE KeHoachBuaAn ALTER COLUMN MaMon INT NULL;
GO

-- Xóa ràng buộc khóa ngoại cũ nếu tồn tại
IF EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_KHBA_Mon'
)
BEGIN
    ALTER TABLE KeHoachBuaAn DROP CONSTRAINT FK_KHBA_Mon;
END
GO

-- Thêm ràng buộc khóa ngoại mới với ON DELETE SET NULL
ALTER TABLE KeHoachBuaAn
ADD CONSTRAINT FK_KHBA_Mon
FOREIGN KEY (MaMon)
REFERENCES MonAn(MaMon)
ON DELETE SET NULL;
GO
