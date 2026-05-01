-- =========================
-- CREATE DATABASE
-- =========================
IF DB_ID('shoppingdb') IS NULL
BEGIN
    CREATE DATABASE shoppingdb;
END
GO

USE shoppingdb;
GO

-- ==========================================
-- DỌN DẸP DATABASE (Xóa tất cả ràng buộc và bảng cũ)
-- ==========================================
-- 1. Xóa tất cả Foreign Key Constraints
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;
EXEC sp_executesql @sql;

-- 2. Xóa các bảng theo đúng thứ tự hoặc xóa tất cả (vì đã bỏ constraint)
DROP TABLE IF EXISTS BaoCaoChiTieu;
DROP TABLE IF EXISTS KeHoachBuaAn;
DROP TABLE IF EXISTS NguyenLieuMon;
DROP TABLE IF EXISTS MonAn;
DROP TABLE IF EXISTS KhoThucPham;
DROP TABLE IF EXISTS ChiTietMuaSam;
DROP TABLE IF EXISTS DanhSachMuaSam;
DROP TABLE IF EXISTS ThanhVienNhom;
DROP TABLE IF EXISTS NhomGiaDinh;
DROP TABLE IF EXISTS NguoiDung;

-- 3. Xóa thêm các bảng cũ từ phiên bản trước (nếu có)
DROP TABLE IF EXISTS BuocNauAn;
DROP TABLE IF EXISTS NhatKyHeThong;
DROP TABLE IF EXISTS NguyenLieu;
DROP TABLE IF EXISTS DanhMuc;
GO

-- =========================
-- 1. NguoiDung
-- =========================
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    MatKhauHash NVARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    TrangThai NVARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- =========================
-- 2. NhomGiaDinh
-- =========================
CREATE TABLE NhomGiaDinh (
    MaNhom INT IDENTITY(1,1) PRIMARY KEY,
    TenNhom NVARCHAR(100) NOT NULL,
    TruongNhom INT NULL,
    NgayTao DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Nhom_TruongNhom
    FOREIGN KEY (TruongNhom)
    REFERENCES NguoiDung(MaNguoiDung)
    ON DELETE SET NULL
);
GO

-- =========================
-- 3. ThanhVienNhom
-- =========================
CREATE TABLE ThanhVienNhom (
    MaNhom INT,
    MaNguoiDung INT,
    VaiTro NVARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    NgayThamGia DATETIME DEFAULT GETDATE(),

    CONSTRAINT PK_ThanhVien PRIMARY KEY (MaNhom, MaNguoiDung),

    CONSTRAINT FK_TVN_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE CASCADE,

    CONSTRAINT FK_TVN_User
    FOREIGN KEY (MaNguoiDung)
    REFERENCES NguoiDung(MaNguoiDung)
    ON DELETE CASCADE
);
GO

-- =========================
-- 4. DanhSachMuaSam
-- =========================
CREATE TABLE DanhSachMuaSam (
    MaDanhSach INT IDENTITY(1,1) PRIMARY KEY,
    MaNhom INT NOT NULL,
    NgayTao DATE DEFAULT CAST(GETDATE() AS DATE),
    TrangThai NVARCHAR(50) NOT NULL DEFAULT 'DANG_TAO',
    GhiChu NVARCHAR(255),

    CONSTRAINT FK_DSMS_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE CASCADE
);
GO

-- =========================
-- 5. ChiTietMuaSam
-- =========================
CREATE TABLE ChiTietMuaSam (
    MaCT INT IDENTITY(1,1) PRIMARY KEY,
    MaDanhSach INT NOT NULL,
    TenThucPham NVARCHAR(100) NOT NULL,
    SoLuong DECIMAL(10,2) NOT NULL,
    DonVi NVARCHAR(50),
    NguoiPhuTrach INT NULL,
    GiaDuKien DECIMAL(12,2) NOT NULL DEFAULT 0,
    GiaThucTe DECIMAL(12,2) NOT NULL DEFAULT 0,
    DaMua BIT NOT NULL DEFAULT 0,
    GhiChu NVARCHAR(255),

    CONSTRAINT FK_CTMS_DanhSach
    FOREIGN KEY (MaDanhSach)
    REFERENCES DanhSachMuaSam(MaDanhSach)
    ON DELETE CASCADE,

    CONSTRAINT FK_CTMS_User
    FOREIGN KEY (NguoiPhuTrach)
    REFERENCES NguoiDung(MaNguoiDung)
    ON DELETE SET NULL,

    CONSTRAINT CK_SoLuong CHECK (SoLuong > 0),
    CONSTRAINT CK_GiaDuKien CHECK (GiaDuKien >= 0),
    CONSTRAINT CK_GiaThucTe CHECK (GiaThucTe >= 0)
);
GO

-- =========================
-- 6. KhoThucPham
-- =========================
CREATE TABLE KhoThucPham (
    MaTP INT IDENTITY(1,1) PRIMARY KEY,
    MaNhom INT NOT NULL,
    TenTP NVARCHAR(100) NOT NULL,
    SoLuong DECIMAL(10,2) NOT NULL,
    DonVi NVARCHAR(50),
    HanSuDung DATE,
    ViTri NVARCHAR(100),
    NgayNhap DATE DEFAULT CAST(GETDATE() AS DATE),
    TrangThai NVARCHAR(30) NOT NULL DEFAULT 'CON_HAN',

    CONSTRAINT FK_Kho_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE CASCADE,

    CONSTRAINT CK_Kho_SoLuong CHECK (SoLuong >= 0)
);
GO

-- =========================
-- 7. MonAn
-- =========================
CREATE TABLE MonAn (
    MaMon INT IDENTITY(1,1) PRIMARY KEY,
    TenMon NVARCHAR(200) NOT NULL,
    CongThuc NVARCHAR(MAX),
    HuongDan NVARCHAR(MAX),
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- =========================
-- 8. NguyenLieuMon
-- =========================
CREATE TABLE NguyenLieuMon (
    MaMon INT,
    MaTP INT,
    SoLuongCan DECIMAL(10,2) NOT NULL,

    CONSTRAINT PK_NguyenLieu PRIMARY KEY (MaMon, MaTP),

    CONSTRAINT FK_NLM_Mon
    FOREIGN KEY (MaMon)
    REFERENCES MonAn(MaMon)
    ON DELETE CASCADE,

    CONSTRAINT FK_NLM_Kho
    FOREIGN KEY (MaTP)
    REFERENCES KhoThucPham(MaTP)
    ON DELETE CASCADE,

    CONSTRAINT CK_SoLuongCan CHECK (SoLuongCan > 0)
);
GO

-- =========================
-- 9. KeHoachBuaAn
-- =========================
CREATE TABLE KeHoachBuaAn (
    MaKeHoach INT IDENTITY(1,1) PRIMARY KEY,
    MaNhom INT NOT NULL,
    Ngay DATE NOT NULL,
    Buoi NVARCHAR(10) NOT NULL CHECK (Buoi IN ('SANG','TRUA','TOI')),
    MaMon INT NOT NULL,
    GhiChu NVARCHAR(255),

    CONSTRAINT FK_KHBA_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE CASCADE,

    CONSTRAINT FK_KHBA_Mon
    FOREIGN KEY (MaMon)
    REFERENCES MonAn(MaMon)
    ON DELETE CASCADE
);
GO

-- =========================
-- 10. BaoCaoChiTieu
-- =========================
CREATE TABLE BaoCaoChiTieu (
    MaBaoCao INT IDENTITY(1,1) PRIMARY KEY,
    MaNhom INT NOT NULL,
    TuanThang NVARCHAR(50),
    TongChiPhi DECIMAL(12,2) NOT NULL DEFAULT 0,
    TongLangPhi DECIMAL(12,2) NOT NULL DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_BC_Nhom
    FOREIGN KEY (MaNhom)
    REFERENCES NhomGiaDinh(MaNhom)
    ON DELETE CASCADE,

    CONSTRAINT CK_TongChiPhi CHECK (TongChiPhi >= 0),
    CONSTRAINT CK_TongLangPhi CHECK (TongLangPhi >= 0)
);
GO