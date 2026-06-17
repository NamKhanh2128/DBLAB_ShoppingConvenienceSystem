USE shoppingdb;
GO

-- ======================================================
-- 1. Thêm cột Version và NgayCapNhat vào KhoThucPham để phục vụ OCC
-- ======================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('KhoThucPham') AND name = 'Version'
)
BEGIN
    ALTER TABLE KhoThucPham ADD Version INT NOT NULL DEFAULT 1;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('KhoThucPham') AND name = 'NgayCapNhat'
)
BEGIN
    ALTER TABLE KhoThucPham ADD NgayCapNhat DATETIME NULL;
END
GO

-- Cập nhật NgayCapNhat mặc định cho dữ liệu cũ
UPDATE KhoThucPham SET NgayCapNhat = GETDATE() WHERE NgayCapNhat IS NULL;
GO

-- Đặt mặc định cho NgayCapNhat
IF NOT EXISTS (
    SELECT 1 FROM sys.default_constraints 
    WHERE parent_object_id = OBJECT_ID('KhoThucPham') 
      AND name = 'DF_KhoThucPham_NgayCapNhat'
)
BEGIN
    ALTER TABLE KhoThucPham ADD CONSTRAINT DF_KhoThucPham_NgayCapNhat DEFAULT GETDATE() FOR NgayCapNhat;
END
GO


-- ======================================================
-- 2. Tạo bảng NhatKyKho để lưu vết thay đổi vật phẩm
-- ======================================================
IF OBJECT_ID('NhatKyKho', 'U') IS NULL
BEGIN
    CREATE TABLE NhatKyKho (
        MaNhatKy INT IDENTITY(1,1) PRIMARY KEY,
        MaTP INT NULL, -- Lưu mã thực phẩm (có thể null nếu vật phẩm bị xóa hẳn)
        TenTP NVARCHAR(100) NOT NULL,
        MaNhom INT NOT NULL,
        NguoiThucHien INT NULL,
        HanhDong NVARCHAR(50) NOT NULL, -- 'THEM_MOI', 'CAP_NHAT', 'TIEU_THU', 'XOA'
        SoLuongTruoc DECIMAL(10,2) NULL,
        SoLuongSau DECIMAL(10,2) NULL,
        DonVi NVARCHAR(50) NULL,
        NgayThucHien DATETIME DEFAULT GETDATE(),
        GhiChu NVARCHAR(255) NULL,
        
        CONSTRAINT FK_NKK_Nhom FOREIGN KEY (MaNhom) REFERENCES NhomGiaDinh(MaNhom) ON DELETE CASCADE,
        CONSTRAINT FK_NKK_User FOREIGN KEY (NguoiThucHien) REFERENCES NguoiDung(MaNguoiDung) ON DELETE SET NULL
    );
END
GO
