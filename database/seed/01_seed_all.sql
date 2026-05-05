USE shoppingdb;
GO

-- ========================================================
-- 1. XÓA SẠCH DỮ LIỆU
-- ========================================================
DELETE FROM BaoCaoChiTieu;
DELETE FROM KeHoachBuaAn;
DELETE FROM NguyenLieuMon;
DELETE FROM MonAn;
DELETE FROM KhoThucPham;
DELETE FROM ChiTietMuaSam;
DELETE FROM DanhSachMuaSam;
DELETE FROM ThanhVienNhom;
DELETE FROM NhomGiaDinh;
GO

-- ========================================================
-- 2. CHÈN / CẬP NHẬT DỮ LIỆU: NGƯỜI DÙNG
-- - Không xóa NguoiDung để tránh mất tài khoản đã đăng ký thật
-- - Luôn đảm bảo tồn tại 2 tài khoản ADMIN cố định
-- - Mật khẩu cho 2 admin: 123456
-- ========================================================
MERGE INTO NguoiDung AS target
USING (
  VALUES
    (1, N'Admin 1', 'admin1@test.com', '$2a$10$wO3mY8lC9JcKkI5kS.bQ8.tW5sFwP.W1p3jJ6xMvO5VnU9rA9k3S2', 'ADMIN', 'ACTIVE'),
    (2, N'Admin 2', 'admin2@test.com', '$2a$10$wO3mY8lC9JcKkI5kS.bQ8.tW5sFwP.W1p3jJ6xMvO5VnU9rA9k3S2', 'ADMIN', 'ACTIVE'),
    (3, N'Nguyễn Khánh', 'khanh@example.com', '$2a$10$wO3mY8lC9JcKkI5kS.bQ8.tW5sFwP.W1p3jJ6xMvO5VnU9rA9k3S2', 'MEMBER', 'ACTIVE'),
    (4, N'Lê Thảo', 'thao@example.com', '$2a$10$wO3mY8lC9JcKkI5kS.bQ8.tW5sFwP.W1p3jJ6xMvO5VnU9rA9k3S2', 'MEMBER', 'ACTIVE')
) AS source (MaNguoiDung, HoTen, Email, MatKhauHash, VaiTro, TrangThai)
ON target.MaNguoiDung = source.MaNguoiDung
WHEN MATCHED THEN
  UPDATE SET
    HoTen = source.HoTen,
    Email = source.Email,
    MatKhauHash = source.MatKhauHash,
    VaiTro = source.VaiTro,
    TrangThai = source.TrangThai
WHEN NOT MATCHED BY TARGET THEN
  INSERT (MaNguoiDung, HoTen, Email, MatKhauHash, VaiTro, TrangThai)
  VALUES (source.MaNguoiDung, source.HoTen, source.Email, source.MatKhauHash, source.VaiTro, source.TrangThai);
GO

-- ========================================================
-- 3. CHÈN DỮ LIỆU: NHÓM GIA ĐÌNH (FORCE ID 1-2)
-- ========================================================
SET IDENTITY_INSERT NhomGiaDinh ON;
INSERT INTO NhomGiaDinh (MaNhom, TenNhom, TruongNhom)
VALUES
(1, N'Gia đình Khánh', 2),
(2, N'Nhà của Minh', 3);
SET IDENTITY_INSERT NhomGiaDinh OFF;
GO

-- THÀNH VIÊN NHÓM (Không có Identity nên không cần SET)
INSERT INTO ThanhVienNhom (MaNhom, MaNguoiDung, VaiTro)
VALUES
(1, 2, 'LEADER'),
(1, 4, 'MEMBER'),
(2, 3, 'LEADER');
GO

-- ========================================================
-- 4. CHÈN DỮ LIỆU: KHO THỰC PHẨM (FORCE ID 1-3)
-- ========================================================
SET IDENTITY_INSERT KhoThucPham ON;
INSERT INTO KhoThucPham (MaTP, MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, TrangThai)
VALUES
(1, 1, N'Thịt ba rọi', 1.5, N'kg', DATEADD(day, 2, GETDATE()), N'Ngăn đá', 'CON_HAN'),
(2, 1, N'Rau muống', 2.0, N'bó', DATEADD(day, -1, GETDATE()), N'Ngăn mát', 'CON_HAN'),
(3, 1, N'Trứng gà', 10, N'quả', DATEADD(day, 10, GETDATE()), N'Cánh tủ lạnh', 'CON_HAN');
SET IDENTITY_INSERT KhoThucPham OFF;
GO

-- ========================================================
-- 5. CHÈN DỮ LIỆU: DANH SÁCH MUA SẮM (FORCE ID 1-2)
-- ========================================================
SET IDENTITY_INSERT DanhSachMuaSam ON;
INSERT INTO DanhSachMuaSam (MaDanhSach, MaNhom, TrangThai, GhiChu)
VALUES
(1, 1, 'ACTIVE', N'Mua sắm cho tuần này'),
(2, 1, 'PENDING', N'Chuẩn bị party cuối tuần');
SET IDENTITY_INSERT DanhSachMuaSam OFF;
GO

INSERT INTO ChiTietMuaSam (MaDanhSach, TenThucPham, SoLuong, DonVi, NguoiPhuTrach, GiaDuKien, DaMua)
VALUES
(1, N'Thịt bò', 1.0, N'kg', 2, 250000, 0),
(1, N'Hành lá', 0.5, N'kg', 4, 15000, 1);
GO

-- ========================================================
-- 6. CHÈN DỮ LIỆU: MÓN ĂN (FORCE ID 1-2)
-- ========================================================
SET IDENTITY_INSERT MonAn ON;
INSERT INTO MonAn (MaMon, TenMon, CongThuc, HuongDan)
VALUES
(1, N'Thịt kho tàu', N'Thịt heo, Trứng, Nước mắm', N'Ướp thịt > Thắng đường > Kho'),
(2, N'Rau muống xào tỏi', N'Rau muống, Tỏi, dầu ăn', N'Luộc sơ rau > Phi tỏi > Xào nhanh');
SET IDENTITY_INSERT MonAn OFF;
GO

-- Ánh xạ Nguyên Liệu Món
INSERT INTO NguyenLieuMon (MaMon, MaTP, SoLuongCan)
VALUES
(1, 1, 0.5), -- Cần 0.5kg thịt ba rọi
(2, 2, 1);   -- Cần 1 bó rau muống
GO

-- ========================================================
-- 7. CHÈN DỮ LIỆU: KẾ HOẠCH BỮA ĂN
-- ========================================================
INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu)
VALUES
(1, CAST(GETDATE() AS DATE), 'TOI', 1, N'Cơm nhà'),
(1, CAST(GETDATE() AS DATE), 'TRUA', 2, N'Ăn nhẹ');
GO

-- ========================================================
-- 8. CHÈN DỮ LIỆU: BÁO CÁO CHI TIÊU
-- ========================================================
INSERT INTO BaoCaoChiTieu (MaNhom, TuanThang, TongChiPhi, TongLangPhi)
VALUES
(1, N'Tháng ' + CAST(MONTH(GETDATE()) AS NVARCHAR) + '-' + CAST(YEAR(GETDATE()) AS NVARCHAR), 1500000, 50000);
GO

PRINT N'Hoàn tất quá trình SEED dữ liệu toàn bộ Database!';
