USE shoppingdb;
GO
SET NOCOUNT ON;
GO

-- ================================================================
-- SEED BULK v2.0 | shoppingdb | 2026-06-18
-- Chạy file này SAU 01_seed_master.sql
-- Sinh dữ liệu: Kho, Nhật ký kho, Danh sách chợ, Kế hoạch bữa ăn,
--               Báo cáo chi tiêu, Audit logs
-- ================================================================

-- ================================================================
-- SECTION 1: KHO THỰC PHẨM NHÓM 1 — FORCE IDs 1–25
-- (Dùng cho NguyenLieuMon liên kết công thức)
-- ================================================================
SET IDENTITY_INSERT KhoThucPham ON;
INSERT INTO KhoThucPham (MaTP, MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai, Version)
VALUES
(1,  1, N'Thịt bò thăn',       0.8,  N'kg',   DATEADD(day,3,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(2,  1, N'Thịt ba rọi',        1.2,  N'kg',   DATEADD(day,4,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(3,  1, N'Gà ta',              1.5,  N'kg',   DATEADD(day,2,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(4,  1, N'Tôm sú',             0.5,  N'kg',   DATEADD(day,2,GETDATE()),  'Freezer',  CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(5,  1, N'Cá hồi phi lê',      0.4,  N'kg',   DATEADD(day,1,GETDATE()),  'Freezer',  CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(6,  1, N'Rau muống',          2.0,  N'bó',   DATEADD(day,2,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(7,  1, N'Cà chua',            0.5,  N'kg',   DATEADD(day,5,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(8,  1, N'Trứng gà',           12.0, N'quả',  DATEADD(day,15,GETDATE()), 'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(9,  1, N'Gạo Jasmine',        5.0,  N'kg',   DATEADD(day,180,GETDATE()),'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(10, 1, N'Nước mắm Phú Quốc',  0.7,  N'lít',  DATEADD(day,365,GETDATE()),'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(11, 1, N'Dầu ăn Neptune',     1.0,  N'lít',  DATEADD(day,300,GETDATE()),'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(12, 1, N'Tỏi',               0.2,  N'kg',   DATEADD(day,30,GETDATE()), 'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(13, 1, N'Hành tây',           0.5,  N'kg',   DATEADD(day,14,GETDATE()), 'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(14, 1, N'Khoai tây',          1.0,  N'kg',   DATEADD(day,21,GETDATE()), 'Pantry',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(15, 1, N'Cà rốt',             0.5,  N'kg',   DATEADD(day,10,GETDATE()), 'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(16, 1, N'Sữa tươi Vinamilk',  1.0,  N'lít',  DATEADD(day,7,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(17, 1, N'Bơ lạt Anchor',      0.2,  N'kg',   DATEADD(day,30,GETDATE()), 'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
-- Sắp hết hạn (edge case)
(18, 1, N'Mực ống',            0.3,  N'kg',   DATEADD(day,1,GETDATE()),  'Freezer',  DATEADD(day,-3,CAST(GETDATE() AS DATE)), 'CON_HAN', 1),
(19, 1, N'Rau ngót',           0.3,  N'bó',   DATEADD(day,1,GETDATE()),  'Fridge',   DATEADD(day,-2,CAST(GETDATE() AS DATE)), 'CON_HAN', 1),
-- Đã hết hạn (edge case)
(20, 1, N'Thịt heo bằm',       0.4,  N'kg',   DATEADD(day,-2,GETDATE()), 'Fridge',   DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'HET_HAN', 1),
-- Thêm các mục dùng riêng cho nhóm 1
(21, 1, N'Bí đao',             0.8,  N'kg',   DATEADD(day,5,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(22, 1, N'Mướp',               2.0,  N'quả',  DATEADD(day,4,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(23, 1, N'Đậu phụ',            0.4,  N'kg',   DATEADD(day,5,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(24, 1, N'Bún tươi',           0.5,  N'kg',   DATEADD(day,3,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1),
(25, 1, N'Cải thảo',           0.6,  N'kg',   DATEADD(day,7,GETDATE()),  'Fridge',   CAST(GETDATE() AS DATE), 'CON_HAN', 1);
SET IDENTITY_INSERT KhoThucPham OFF;
GO

-- ================================================================
-- SECTION 2: NGUYÊN LIỆU MÓN ĂN (liên kết recipe → KhoThucPham nhóm 1)
-- ================================================================
INSERT INTO NguyenLieuMon (MaMon, MaTP, SoLuongCan)
VALUES
(1,  1,  0.5),  -- Phở bò ← thịt bò thăn 500g
(1,  13, 0.1),  -- Phở bò ← hành tây
(5,  2,  0.7),  -- Thịt kho tàu ← thịt ba rọi
(5,  8,  6.0),  -- Thịt kho tàu ← trứng gà
(6,  3,  1.0),  -- Gà kho gừng ← gà ta
(7,  5,  0.4),  -- Cá hồi nướng ← cá hồi phi lê
(8,  1,  0.5),  -- Bò lúc lắc ← thịt bò
(9,  4,  0.5),  -- Tôm rang muối ← tôm sú
(10, 19, 0.2),  -- Canh rau ngót ← rau ngót
(11, 6,  0.5),  -- Rau muống xào ← rau muống
(12, 8,  4.0),  -- Trứng chiên cà chua ← trứng gà
(12, 7,  0.3),  -- Trứng chiên cà chua ← cà chua
(13, 21, 0.5),  -- Canh bí đao ← bí đao
(18, 23, 0.4),  -- Đậu phụ sốt ← đậu phụ
(27, 25, 0.4),  -- Cải thảo xào ← cải thảo
(30, 18, 0.5);  -- Mực xào sả ← mực ống
GO

-- ================================================================
-- SECTION 3: KHO THỰC PHẨM CÁC NHÓM 2–15 (không force ID)
-- ================================================================

-- Nhóm 2 (Khoa/Dung) — ~18 items
INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
VALUES
(2, N'Gạo ST25',         5.0,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Thịt bò',          0.6,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Ức gà',            0.5,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Trứng gà',         10.0, N'quả',  DATEADD(day,20,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Sữa chua',         4.0,  N'hộp',  DATEADD(day,10,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Xà lách xanh',     0.3,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Cà chua cherry',   0.2,  N'kg',   DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Dầu olive',        0.5,  N'lít',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Mì ý',             0.5,  N'kg',   DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Phô mai mozzarella',0.2, N'kg',   DATEADD(day,14,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Táo Fuji',         6.0,  N'quả',  DATEADD(day,10,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Chuối tiêu',       5.0,  N'quả',  DATEADD(day,5,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Nước mắm',         0.5,  N'lít',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Tỏi',              0.1,  N'kg',   DATEADD(day,30,GETDATE()),  'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(2, N'Tôm thẻ',          0.3,  N'kg',   DATEADD(day,1,GETDATE()),   'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Sắp hết hạn
(2, N'Rau cải ngọt',     0.4,  N'kg',   DATEADD(day,1,GETDATE()),   'Fridge', DATEADD(day,-2,CAST(GETDATE() AS DATE)), 'CON_HAN'),
(2, N'Sữa tươi',         0.5,  N'lít',  DATEADD(day,2,GETDATE()),   'Fridge', DATEADD(day,-3,CAST(GETDATE() AS DATE)), 'CON_HAN'),
-- Hết hạn
(2, N'Hũ sữa chua hỏng', 1.0,  N'hộp',  DATEADD(day,-3,GETDATE()),  'Fridge', DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'HET_HAN');
GO

-- Nhóm 3 (Sinh viên) — ~20 items
INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
VALUES
(3, N'Gạo',              3.0,  N'kg',   DATEADD(day,90,GETDATE()),  'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Mì gói Hảo Hảo',  20.0, N'gói',  DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Trứng gà',         12.0, N'quả',  DATEADD(day,14,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Xúc xích',         6.0,  N'cây',  DATEADD(day,10,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Thịt heo nạc',     0.4,  N'kg',   DATEADD(day,2,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Cải thảo',         0.5,  N'kg',   DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Dưa chuột',        4.0,  N'quả',  DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Cà chua',          0.4,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Nước mắm',         0.3,  N'lít',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Dầu ăn',           0.5,  N'lít',  DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Tương ớt Chinsu',  0.3,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Bánh mì sandwich', 4.0,  N'ổ',    DATEADD(day,3,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Pate',             1.0,  N'hộp',  DATEADD(day,30,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Hành lá',          1.0,  N'bó',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Chuối',            6.0,  N'quả',  DATEADD(day,4,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Sữa tươi',         1.0,  N'lít',  DATEADD(day,7,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Chả giò đông lạnh',8.0,  N'cái',  DATEADD(day,60,GETDATE()),  'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Đậu phụ',          0.4,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(3, N'Rau muống',        1.0,  N'bó',   DATEADD(day,2,GETDATE()),   'Fridge', DATEADD(day,-1,CAST(GETDATE() AS DATE)), 'CON_HAN'),
(3, N'Thức ăn hết hạn',  1.0,  N'hộp',  DATEADD(day,-5,GETDATE()),  'Fridge', DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'HET_HAN');
GO

-- Nhóm 4 (Lý Thành) — ~18 items
INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
VALUES
(4, N'Gạo Thơm Lài',     5.0,  N'kg',   DATEADD(day,120,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Sườn heo',         0.8,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Cá rô phi',        0.6,  N'kg',   DATEADD(day,2,GETDATE()),   'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Thịt gà',          0.8,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Rau ngót',         0.3,  N'bó',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Bí đao',           1.0,  N'kg',   DATEADD(day,7,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Đậu hà lan',       0.2,  N'kg',   DATEADD(day,30,GETDATE()),  'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Nấm rơm',          0.3,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Trứng vịt',        8.0,  N'quả',  DATEADD(day,20,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Hạt nêm Knorr',    0.2,  N'gói',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Nước tương',       0.4,  N'lít',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Dứa',              1.0,  N'quả',  DATEADD(day,5,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Giá đỗ',           0.3,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Cần tây',          0.2,  N'bó',   DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Xoài',             3.0,  N'quả',  DATEADD(day,7,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(4, N'Bánh mì que',      4.0,  N'ổ',    DATEADD(day,2,GETDATE()),   'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Hết hạn
(4, N'Rau cải bẹ cũ',    0.2,  N'kg',   DATEADD(day,-3,GETDATE()),  'Fridge', DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'HET_HAN'),
(4, N'Cà chua',          0.5,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN');
GO

-- Nhóm 5 (Hội nấu ăn) — ~22 items (nhóm đông, nhiều nguyên liệu)
INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
VALUES
(5, N'Thịt bò nạm',      1.5,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Thịt heo nạc',     1.0,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Tôm sú lớn',       0.8,  N'kg',   DATEADD(day,2,GETDATE()),   'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Mực ống',          0.6,  N'kg',   DATEADD(day,2,GETDATE()),   'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Cua biển',         1.0,  N'kg',   DATEADD(day,1,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Gạo nếp',          1.0,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Gạo tẻ',           5.0,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Nước dừa tươi',    1.5,  N'lít',  DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Sả',               0.2,  N'kg',   DATEADD(day,7,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Lá chanh',         1.0,  N'bó',   DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Ớt tươi',          0.1,  N'kg',   DATEADD(day,7,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Gừng',             0.2,  N'kg',   DATEADD(day,14,GETDATE()),  'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Trứng gà',         20.0, N'quả',  DATEADD(day,20,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Rau thơm các loại',0.3,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Bơ lạt',           0.3,  N'kg',   DATEADD(day,45,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Phô mai',          0.2,  N'kg',   DATEADD(day,21,GETDATE()),  'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Rượu vang đỏ',     0.75, N'lít',  DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Nấm đông cô',      0.1,  N'kg',   DATEADD(day,14,GETDATE()),  'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Đậu bắp',          0.4,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(5, N'Bắp cải',          0.8,  N'kg',   DATEADD(day,7,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Sắp hết hạn
(5, N'Cá thu',           0.4,  N'kg',   DATEADD(day,1,GETDATE()),   'Freezer',DATEADD(day,-2,CAST(GETDATE() AS DATE)), 'CON_HAN'),
-- Quantity = 0 (edge case)
(5, N'Dầu mè',           0.0,  N'chai', DATEADD(day,365,GETDATE()), 'Pantry', DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'CON_HAN');
GO

-- Nhóm 6–15: mỗi nhóm ~15 items dùng bulk insert
DECLARE @grp INT;
DECLARE @items TABLE (TenTP NVARCHAR(100), SoLuong DECIMAL(10,2), DonVi NVARCHAR(50), DayExp INT, ViTri NVARCHAR(50), TrangThai NVARCHAR(30));
INSERT INTO @items VALUES
(N'Gạo tẻ',           4.0,  N'kg',   180,  'Pantry', 'CON_HAN'),
(N'Thịt heo nạc',     0.5,  N'kg',   3,    'Fridge', 'CON_HAN'),
(N'Cá rô phi',        0.5,  N'kg',   2,    'Freezer','CON_HAN'),
(N'Trứng gà',         10.0, N'quả',  14,   'Fridge', 'CON_HAN'),
(N'Rau cải xanh',     0.4,  N'kg',   3,    'Fridge', 'CON_HAN'),
(N'Cà chua',          0.5,  N'kg',   5,    'Fridge', 'CON_HAN'),
(N'Hành tây',         0.3,  N'kg',   14,   'Pantry', 'CON_HAN'),
(N'Tỏi',              0.15, N'kg',   30,   'Pantry', 'CON_HAN'),
(N'Dầu ăn',           0.5,  N'lít',  180,  'Pantry', 'CON_HAN'),
(N'Nước mắm',         0.5,  N'lít',  365,  'Pantry', 'CON_HAN'),
(N'Sữa tươi',         1.0,  N'lít',  7,    'Fridge', 'CON_HAN'),
(N'Khoai tây',        0.8,  N'kg',   21,   'Pantry', 'CON_HAN'),
(N'Chuối',            5.0,  N'quả',  5,    'Pantry', 'CON_HAN'),
(N'Đường cát',        0.5,  N'kg',   730,  'Pantry', 'CON_HAN'),
(N'Muối iot',         0.3,  N'kg',   730,  'Pantry', 'CON_HAN');

SET @grp = 6;
WHILE @grp <= 15
BEGIN
    INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
    SELECT @grp, TenTP, SoLuong, DonVi, DATEADD(day, DayExp, GETDATE()), ViTri, CAST(GETDATE() AS DATE), TrangThai
    FROM @items;
    SET @grp = @grp + 1;
END;
GO

-- Thêm items đặc biệt cho các nhóm cụ thể
INSERT INTO KhoThucPham (MaNhom, TenTP, SoLuong, DonVi, HanSuDung, ViTri, NgayNhap, TrangThai)
VALUES
-- Nhóm 7 (Phòng trọ) — thêm đồ ăn nhanh
(7, N'Chả giò đông lạnh', 12.0, N'cái',  DATEADD(day,60,GETDATE()),  'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
(7, N'Há cảo đông lạnh',  10.0, N'cái',  DATEADD(day,60,GETDATE()),  'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Nhóm 8 (Bà Thúy) — đồ truyền thống
(8, N'Mắm tép',           0.2,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(8, N'Rau ngót',          0.4,  N'bó',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(8, N'Giò lụa',           0.3,  N'kg',   DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Nhóm 12 (Healthy) — thực phẩm lành mạnh
(12, N'Yến mạch',         0.5,  N'kg',   DATEADD(day,180,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(12, N'Hạt chia',         0.2,  N'kg',   DATEADD(day,365,GETDATE()), 'Pantry', CAST(GETDATE() AS DATE), 'CON_HAN'),
(12, N'Ức gà',            0.6,  N'kg',   DATEADD(day,3,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Nhóm 13 (Nông dân) — rau nhà trồng
(13, N'Rau muống nhà trồng',3.0,N'bó',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(13, N'Cải xanh nhà trồng',2.0,N'kg',    DATEADD(day,5,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(13, N'Gà tươi',          2.0,  N'kg',   DATEADD(day,2,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
-- Nhóm 15 (Lộc BBQ)
(15, N'Thịt bò ribeye',   0.8,  N'kg',   DATEADD(day,4,GETDATE()),   'Fridge', CAST(GETDATE() AS DATE), 'CON_HAN'),
(15, N'Xúc xích BBQ',     6.0,  N'cây',  DATEADD(day,30,GETDATE()),  'Freezer',CAST(GETDATE() AS DATE), 'CON_HAN');
GO

-- ================================================================
-- SECTION 4: NHẬT KÝ KHO (60 entries)
-- ================================================================
INSERT INTO NhatKyKho (MaTP, TenTP, MaNhom, NguoiThucHien, HanhDong, SoLuongTruoc, SoLuongSau, DonVi, NgayThucHien, GhiChu)
VALUES
-- Nhóm 1
(1,  N'Thịt bò thăn',   1, 6,  'THEM_MOI',  NULL, 0.8,  N'kg',  DATEADD(day,-3,GETDATE()),  N'Mua tại chợ Hàng Da'),
(2,  N'Thịt ba rọi',    1, 6,  'THEM_MOI',  NULL, 1.2,  N'kg',  DATEADD(day,-3,GETDATE()),  N'Mua tại siêu thị Big C'),
(6,  N'Rau muống',      1, 7,  'THEM_MOI',  NULL, 2.0,  N'bó',  DATEADD(day,-2,GETDATE()),  N'Mua ở chợ sáng'),
(6,  N'Rau muống',      1, 7,  'TIEU_THU',  2.0,  1.0,  N'bó',  DATEADD(day,-1,GETDATE()),  N'Nấu rau muống xào tỏi cho bữa tối'),
(8,  N'Trứng gà',       1, 8,  'THEM_MOI',  NULL, 12.0, N'quả', DATEADD(day,-5,GETDATE()),  N'Mua 1 vỉ 12 quả'),
(8,  N'Trứng gà',       1, 6,  'TIEU_THU',  12.0, 8.0,  N'quả', DATEADD(day,-2,GETDATE()),  N'Làm trứng chiên cà chua'),
(9,  N'Gạo Jasmine',    1, 6,  'THEM_MOI',  NULL, 5.0,  N'kg',  DATEADD(day,-7,GETDATE()),  N'Mua túi 5kg tại Vinmart'),
(9,  N'Gạo Jasmine',    1, 7,  'TIEU_THU',  5.0,  4.5,  N'kg',  DATEADD(day,-1,GETDATE()),  N'Dùng nấu cơm hàng ngày'),
(20, N'Thịt heo bằm',   1, 6,  'XOA',       0.4,  0.0,  N'kg',  GETDATE(),                  N'Thực phẩm hết hạn, đổ bỏ'),
-- Nhóm 2
(NULL, N'Thịt bò',      2, 10, 'THEM_MOI',  NULL, 0.6,  N'kg',  DATEADD(day,-4,GETDATE()),  N'Mua tại chợ đầu mối'),
(NULL, N'Ức gà',        2, 10, 'THEM_MOI',  NULL, 0.5,  N'kg',  DATEADD(day,-4,GETDATE()),  N'Mua tại siêu thị'),
(NULL, N'Ức gà',        2, 11, 'TIEU_THU',  0.5,  0.2,  N'kg',  DATEADD(day,-2,GETDATE()),  N'Nấu salad gà caesar'),
(NULL, N'Xà lách xanh', 2, 10, 'THEM_MOI',  NULL, 0.3,  N'kg',  DATEADD(day,-2,GETDATE()),  N'Mua làm salad'),
-- Nhóm 3
(NULL, N'Mì gói',       3, 9,  'THEM_MOI',  NULL, 20.0, N'gói', DATEADD(day,-6,GETDATE()),  N'Mua cả thùng 20 gói'),
(NULL, N'Mì gói',       3, 21, 'TIEU_THU',  20.0, 15.0, N'gói', DATEADD(day,-3,GETDATE()),  N'5 người ăn 1 tuần'),
(NULL, N'Gạo',          3, 22, 'THEM_MOI',  NULL, 3.0,  N'kg',  DATEADD(day,-5,GETDATE()),  N'Đóng góp mua chung'),
(NULL, N'Chả giò',      3, 9,  'THEM_MOI',  NULL, 8.0,  N'cái', DATEADD(day,-1,GETDATE()),  N'Mua đông lạnh để dự trữ'),
-- Nhóm 5
(NULL, N'Thịt bò nạm',  5, 25, 'THEM_MOI',  NULL, 1.5,  N'kg',  DATEADD(day,-3,GETDATE()),  N'Mua tại chợ truyền thống'),
(NULL, N'Cua biển',     5, 26, 'THEM_MOI',  NULL, 1.0,  N'kg',  DATEADD(day,-1,GETDATE()),  N'Mua cua sống về làm hấp'),
(NULL, N'Cua biển',     5, 25, 'TIEU_THU',  1.0,  0.0,  N'kg',  GETDATE(),                  N'Hấp cua cho bữa tiệc cuối tuần'),
-- Nhóm 12 (Healthy)
(NULL, N'Ức gà',        12, 42, 'THEM_MOI', NULL, 0.6,  N'kg',  DATEADD(day,-2,GETDATE()),  N'Mua ức gà làm salad'),
(NULL, N'Yến mạch',     12, 14, 'THEM_MOI', NULL, 0.5,  N'kg',  DATEADD(day,-3,GETDATE()),  N'Mua ăn sáng healthy'),
(NULL, N'Yến mạch',     12, 42, 'TIEU_THU', 0.5,  0.35, N'kg',  DATEADD(day,-1,GETDATE()),  N'Ăn sáng 3 ngày liên tiếp'),
-- Nhóm 13 (Nông dân)
(NULL, N'Rau muống',    13, 45, 'THEM_MOI', NULL, 3.0,  N'bó',  DATEADD(day,-2,GETDATE()),  N'Thu hoạch từ vườn nhà'),
(NULL, N'Gà tươi',      13, 45, 'THEM_MOI', NULL, 2.0,  N'kg',  DATEADD(day,-1,GETDATE()),  N'Mổ gà tươi mới giết'),
(NULL, N'Rau muống',    13, 45, 'TIEU_THU', 3.0,  1.0,  N'bó',  GETDATE(),                  N'Nấu rau muống xào tỏi bữa trưa'),
-- CAP_NHAT records
(1,   N'Thịt bò thăn',  1, 7,  'CAP_NHAT',  0.8,  1.2,  N'kg',  DATEADD(day,-1,GETDATE()),  N'Mua thêm cho bữa tiệc'),
(9,   N'Gạo Jasmine',   1, 6,  'CAP_NHAT',  4.5,  5.0,  N'kg',  DATEADD(day,-2,GETDATE()),  N'Mua thêm gạo dự trữ');
GO

-- ================================================================
-- SECTION 5: DANH SÁCH MUA SẮM (45 lists across all groups)
-- ================================================================
SET IDENTITY_INSERT DanhSachMuaSam ON;
INSERT INTO DanhSachMuaSam (MaDanhSach, MaNhom, NgayTao, TrangThai, GhiChu)
VALUES
-- Nhóm 1 (đã hoàn thành + đang tạo)
(1,  1, DATEADD(day,-21,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần 3 tháng trước'),
(2,  1, DATEADD(day,-14,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần 2 tháng trước'),
(3,  1, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(4,  1, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Chợ tuần này – chưa đi'),
-- Nhóm 2
(5,  2, DATEADD(day,-14,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua đồ ăn cho 2 tuần'),
(6,  2, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua bổ sung cuối tuần'),
(7,  2, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Đặt mua online hôm nay'),
-- Nhóm 3
(8,  3, DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Góp tiền mua chung tuần trước'),
(9,  3, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua thêm đồ ăn nhanh'),
(10, 3, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Chuẩn bị cho tuần mới'),
-- Nhóm 4
(11, 4, DATEADD(day,-14,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ 2 tuần trước'),
(12, 4, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(13, 4, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Danh sách tuần này'),
-- Nhóm 5
(14, 5, DATEADD(day,-21,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ buổi nấu ăn tháng trước'),
(15, 5, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Buổi nấu BBQ cuối tuần'),
(16, 5, DATEADD(day,-1, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua hải sản cho lẩu Thai'),
(17, 5, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Chuẩn bị tiệc tất niên'),
-- Nhóm 6
(18, 6, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(19, 6, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Chợ hôm nay'),
-- Nhóm 7
(20, 7, DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Đóng góp mua đồ ăn'),
(21, 7, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua bổ sung'),
(22, 7, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Danh sách tuần này'),
-- Nhóm 8
(23, 8, DATEADD(day,-14,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ 2 tuần'),
(24, 8, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(25, 8, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Tuần này'),
-- Nhóm 9
(26, 9, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(27, 9, CAST(GETDATE() AS DATE),                  'DANG_TAO',  N'Chợ hôm nay'),
-- Nhóm 10
(28, 10, DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua nguyên liệu nấu ăn cuối tuần'),
(29, 10, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Chuẩn bị bữa tối thứ 7'),
-- Nhóm 11
(30, 11, DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tuần trước'),
(31, 11, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Danh sách hôm nay'),
-- Nhóm 12
(32, 12, DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua thực phẩm lành mạnh'),
(33, 12, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Thực đơn healthy tuần này'),
-- Nhóm 13
(34, 13, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua thêm ngoài rau nhà trồng'),
(35, 13, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Mua thịt và gia vị tuần này'),
-- Nhóm 14
(36, 14, DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ đầu tiên sau chuyển nhà'),
(37, 14, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Tuần thứ 2 tại nhà mới'),
-- Nhóm 15
(38, 15, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua đồ BBQ cuối tuần trước'),
(39, 15, CAST(GETDATE() AS DATE),                 'DANG_TAO',  N'Chuẩn bị BBQ cuối tuần này'),
-- Nhóm 1 — thêm 4 danh sách lịch sử cũ hơn
(40, 1, DATEADD(day,-42,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ tháng 2 tháng trước'),
(41, 1, DATEADD(day,-35,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ bổ sung tháng trước'),
(42, 2, DATEADD(day,-28,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Mua đồ cho tháng trước'),
(43, 5, DATEADD(day,-14,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Buổi nấu ăn 2 tuần trước'),
(44, 8, DATEADD(day,-21,CAST(GETDATE() AS DATE)), 'COMPLETED', N'Chợ 3 tuần trước'),
(45, 10,DATEADD(day,-14,CAST(GETDATE() AS DATE)),'COMPLETED',  N'Buổi nấu cuối tuần 2 tuần trước');
SET IDENTITY_INSERT DanhSachMuaSam OFF;
GO

-- ================================================================
-- SECTION 6: CHI TIẾT MUA SẮM — ~220 items
-- ================================================================
INSERT INTO ChiTietMuaSam (MaDanhSach, TenThucPham, SoLuong, DonVi, NguoiPhuTrach, GiaDuKien, GiaThucTe, DaMua, GhiChu, DanhMucHang, NgayMua, MaNguoiMua)
VALUES
-- Danh sách 1 (Nhóm 1, COMPLETED)
(1, N'Thịt bò',       1.0,  N'kg',  6,  280000, 275000, 1, NULL,        N'Thịt', DATEADD(day,-21,GETDATE()), 6),
(1, N'Rau muống',     2.0,  N'bó',  7,  20000,  18000,  1, NULL,        N'Rau',  DATEADD(day,-21,GETDATE()), 7),
(1, N'Trứng gà',      12.0, N'quả', 6,  48000,  48000,  1, NULL,        N'Trứng',DATEADD(day,-21,GETDATE()), 6),
(1, N'Gạo',           5.0,  N'kg',  7,  85000,  80000,  1, N'Gạo ngon', N'Gạo', DATEADD(day,-21,GETDATE()), 7),
(1, N'Dầu ăn',        1.0,  N'lít', 6,  38000,  35000,  1, NULL,        N'Gia vị',DATEADD(day,-21,GETDATE()), 6),
-- Danh sách 2 (Nhóm 1, COMPLETED)
(2, N'Sườn heo',      0.8,  N'kg',  6,  120000, 115000, 1, NULL,        N'Thịt', DATEADD(day,-14,GETDATE()), 6),
(2, N'Cà chua',       0.5,  N'kg',  7,  15000,  12000,  1, NULL,        N'Rau',  DATEADD(day,-14,GETDATE()), 7),
(2, N'Hành tây',      0.3,  N'kg',  6,  8000,   8000,   1, NULL,        N'Rau',  DATEADD(day,-14,GETDATE()), 6),
(2, N'Cá lóc',        0.8,  N'kg',  8,  110000, 105000, 1, NULL,        N'Hải sản',DATEADD(day,-14,GETDATE()), 8),
(2, N'Dưa chuột',     3.0,  N'quả', 7,  12000,  10000,  1, NULL,        N'Rau',  DATEADD(day,-14,GETDATE()), 7),
(2, N'Bí đao',        0.5,  N'kg',  6,  10000,  8000,   1, NULL,        N'Rau',  DATEADD(day,-14,GETDATE()), 6),
-- Danh sách 3 (Nhóm 1, COMPLETED)
(3, N'Tôm sú',        0.5,  N'kg',  6,  150000, 145000, 1, NULL,        N'Hải sản',DATEADD(day,-7,GETDATE()), 6),
(3, N'Thịt ba rọi',   1.0,  N'kg',  7,  180000, 175000, 1, N'Kho tàu', N'Thịt', DATEADD(day,-7,GETDATE()), 7),
(3, N'Trứng vịt',     6.0,  N'quả', 8,  30000,  30000,  1, NULL,        N'Trứng',DATEADD(day,-7,GETDATE()), 8),
(3, N'Mướp',          2.0,  N'quả', 6,  10000,  8000,   1, NULL,        N'Rau',  DATEADD(day,-7,GETDATE()), 6),
(3, N'Đậu phụ',       0.4,  N'kg',  7,  20000,  18000,  1, NULL,        N'Đậu',  DATEADD(day,-7,GETDATE()), 7),
(3, N'Sữa tươi',      2.0,  N'lít', 8,  54000,  52000,  1, NULL,        N'Sữa',  DATEADD(day,-7,GETDATE()), 8),
-- Danh sách 4 (Nhóm 1, DANG_TAO — chưa mua)
(4, N'Cá hồi phi lê', 0.4,  N'kg',  6,  180000, 0,      0, N'Mua ở Co.opmart', N'Hải sản',NULL,NULL),
(4, N'Ức gà',         0.5,  N'kg',  7,  70000,  0,      0, NULL,        N'Thịt', NULL,NULL),
(4, N'Rau cải ngọt',  0.4,  N'kg',  6,  12000,  0,      0, NULL,        N'Rau',  NULL,NULL),
(4, N'Táo',           4.0,  N'quả', 8,  40000,  0,      0, N'Táo Mỹ', N'Trái cây',NULL,NULL),
(4, N'Phô mai',       0.2,  N'kg',  7,  85000,  0,      1, N'Đã mua sẵn', N'Sữa',DATEADD(day,-1,GETDATE()),7),
-- Danh sách 5 (Nhóm 2, COMPLETED)
(5, N'Thịt bò',       0.6,  N'kg',  10, 168000, 165000, 1, NULL,        N'Thịt', DATEADD(day,-14,GETDATE()), 10),
(5, N'Mì ý',          0.5,  N'kg',  11, 35000,  35000,  1, NULL,        N'Tinh bột',DATEADD(day,-14,GETDATE()), 11),
(5, N'Xà lách',       0.3,  N'kg',  10, 15000,  12000,  1, NULL,        N'Rau',  DATEADD(day,-14,GETDATE()), 10),
(5, N'Phô mai',       0.2,  N'kg',  11, 85000,  82000,  1, NULL,        N'Sữa',  DATEADD(day,-14,GETDATE()), 11),
(5, N'Dầu olive',     0.5,  N'lít', 10, 120000, 115000, 1, NULL,        N'Gia vị',DATEADD(day,-14,GETDATE()), 10),
-- Danh sách 6 (Nhóm 2, COMPLETED)
(6, N'Tôm thẻ',       0.3,  N'kg',  10, 120000, 115000, 1, NULL,        N'Hải sản',DATEADD(day,-3,GETDATE()), 10),
(6, N'Trứng gà',      10.0, N'quả', 11, 40000,  40000,  1, NULL,        N'Trứng',DATEADD(day,-3,GETDATE()), 11),
(6, N'Sữa tươi',      1.0,  N'lít', 10, 27000,  25000,  1, NULL,        N'Sữa',  DATEADD(day,-3,GETDATE()), 10),
-- Danh sách 7 (Nhóm 2, DANG_TAO)
(7, N'Ức gà',         0.4,  N'kg',  10, 60000,  0,      0, NULL,        N'Thịt', NULL,NULL),
(7, N'Rau spinach',   0.2,  N'kg',  11, 25000,  0,      0, NULL,        N'Rau',  NULL,NULL),
(7, N'Sữa chua',      4.0,  N'hộp', 10, 48000,  0,      0, NULL,        N'Sữa',  NULL,NULL),
-- Danh sách 8 (Nhóm 3, COMPLETED)
(8, N'Gạo',           3.0,  N'kg',  9,  51000,  50000,  1, NULL,        N'Gạo',  DATEADD(day,-10,GETDATE()), 9),
(8, N'Mì gói',        20.0, N'gói', 21, 80000,  75000,  1, N'Thùng 20g',N'Mì',  DATEADD(day,-10,GETDATE()), 21),
(8, N'Trứng gà',      12.0, N'quả', 22, 48000,  48000,  1, NULL,        N'Trứng',DATEADD(day,-10,GETDATE()), 22),
(8, N'Cải thảo',      0.5,  N'kg',  9,  12000,  10000,  1, NULL,        N'Rau',  DATEADD(day,-10,GETDATE()), 9),
(8, N'Xúc xích',      6.0,  N'cây', 23, 54000,  50000,  1, NULL,        N'Thịt', DATEADD(day,-10,GETDATE()), 23),
(8, N'Dầu ăn',        0.5,  N'lít', 21, 19000,  18000,  1, NULL,        N'Gia vị',DATEADD(day,-10,GETDATE()), 21),
-- Danh sách 9 (Nhóm 3, COMPLETED)
(9, N'Bánh mì',       4.0,  N'ổ',   9,  20000,  18000,  1, NULL,        N'Bánh', DATEADD(day,-3,GETDATE()), 9),
(9, N'Pate',          1.0,  N'hộp', 21, 22000,  22000,  1, NULL,        N'Đóng hộp',DATEADD(day,-3,GETDATE()), 21),
(9, N'Chả giò',       8.0,  N'cái', 22, 40000,  38000,  1, NULL,        N'Đông lạnh',DATEADD(day,-3,GETDATE()), 22),
-- Danh sách 10 (Nhóm 3, DANG_TAO)
(10, N'Rau muống',    2.0,  N'bó',  9,  18000,  0,      0, NULL,        N'Rau',  NULL,NULL),
(10, N'Thịt heo nạc', 0.4,  N'kg',  21, 80000,  0,      0, NULL,        N'Thịt', NULL,NULL),
(10, N'Đậu phụ',      0.4,  N'kg',  22, 20000,  0,      1, N'Đã mua',  N'Đậu',  DATEADD(day,-1,GETDATE()), 22),
(10, N'Sữa tươi',     1.0,  N'lít', 23, 27000,  0,      0, NULL,        N'Sữa',  NULL,NULL),
-- Danh sách 15 (Nhóm 5, COMPLETED - BBQ)
(15, N'Thịt bò ribeye',1.0, N'kg',  25, 350000, 340000, 1, N'Nướng BBQ',N'Thịt', DATEADD(day,-7,GETDATE()), 25),
(15, N'Tôm sú to',    0.8,  N'kg',  26, 240000, 235000, 1, NULL,        N'Hải sản',DATEADD(day,-7,GETDATE()), 26),
(15, N'Mực ống',      0.6,  N'kg',  19, 150000, 145000, 1, NULL,        N'Hải sản',DATEADD(day,-7,GETDATE()), 19),
(15, N'Bắp',          4.0,  N'trái',25, 40000,  36000,  1, N'Nướng kèm',N'Rau', DATEADD(day,-7,GETDATE()), 25),
(15, N'Nấm các loại', 0.3,  N'kg',  26, 45000,  42000,  1, NULL,        N'Rau',  DATEADD(day,-7,GETDATE()), 26),
(15, N'Rau xà lách',  0.4,  N'kg',  19, 18000,  15000,  1, NULL,        N'Rau',  DATEADD(day,-7,GETDATE()), 19),
(15, N'Nước sốt BBQ', 2.0,  N'chai',25, 60000,  58000,  1, NULL,        N'Gia vị',DATEADD(day,-7,GETDATE()), 25),
-- Danh sách 16 (Nhóm 5, COMPLETED - Lẩu Thai)
(16, N'Tôm sú',       0.5,  N'kg',  25, 150000, 148000, 1, NULL,        N'Hải sản',DATEADD(day,-1,GETDATE()), 25),
(16, N'Mực',          0.4,  N'kg',  26, 100000, 95000,  1, NULL,        N'Hải sản',DATEADD(day,-1,GETDATE()), 26),
(16, N'Nghêu',        0.5,  N'kg',  20, 80000,  75000,  1, NULL,        N'Hải sản',DATEADD(day,-1,GETDATE()), 20),
(16, N'Nấm kim châm', 0.2,  N'kg',  19, 20000,  18000,  1, NULL,        N'Rau',  DATEADD(day,-1,GETDATE()), 19),
(16, N'Sả',           0.2,  N'kg',  25, 10000,  8000,   1, NULL,        N'Gia vị',DATEADD(day,-1,GETDATE()), 25),
(16, N'Me',           0.1,  N'kg',  26, 8000,   8000,   1, NULL,        N'Gia vị',DATEADD(day,-1,GETDATE()), 26),
(16, N'Bún tươi',     0.5,  N'kg',  20, 15000,  15000,  1, N'Ăn với lẩu',N'Tinh bột',DATEADD(day,-1,GETDATE()), 20),
-- Danh sách 17 (Nhóm 5, DANG_TAO)
(17, N'Sườn nướng',   1.5,  N'kg',  25, 300000, 0,      0, NULL,        N'Thịt', NULL,NULL),
(17, N'Bạch tuộc',    0.5,  N'kg',  26, 180000, 0,      0, NULL,        N'Hải sản',NULL,NULL),
(17, N'Phô mai cheddar',0.3,N'kg',  19, 120000, 0,      0, NULL,        N'Sữa',  NULL,NULL),
(17, N'Rượu vang',    1.0,  N'chai',25, 200000, 0,      1, N'Đã có sẵn',N'Đồ uống',DATEADD(day,-1,GETDATE()), 25),
-- Danh sách 32 (Nhóm 12, COMPLETED - Healthy)
(32, N'Ức gà không da', 0.6,N'kg',  42, 90000,  88000,  1, NULL,        N'Thịt', DATEADD(day,-7,GETDATE()), 42),
(32, N'Yến mạch',     0.5,  N'kg',  14, 65000,  62000,  1, NULL,        N'Ngũ cốc',DATEADD(day,-7,GETDATE()), 14),
(32, N'Hạt chia',     0.2,  N'kg',  42, 80000,  78000,  1, NULL,        N'Ngũ cốc',DATEADD(day,-7,GETDATE()), 42),
(32, N'Rau xà lách',  0.4,  N'kg',  14, 20000,  18000,  1, NULL,        N'Rau',  DATEADD(day,-7,GETDATE()), 14),
(32, N'Sữa hạt',      1.0,  N'lít', 42, 35000,  33000,  1, NULL,        N'Đồ uống',DATEADD(day,-7,GETDATE()), 42),
(32, N'Cà chua cherry',0.3, N'kg',  14, 28000,  26000,  1, NULL,        N'Rau',  DATEADD(day,-7,GETDATE()), 14),
-- Danh sách 38 (Nhóm 15, COMPLETED - BBQ)
(38, N'Thịt bò ribeye',0.8, N'kg',  49, 280000, 275000, 1, NULL,        N'Thịt', DATEADD(day,-5,GETDATE()), 49),
(38, N'Xúc xích BBQ', 6.0,  N'cây', 30, 90000,  88000,  1, NULL,        N'Thịt', DATEADD(day,-5,GETDATE()), 30),
(38, N'Ngô',          4.0,  N'trái',49, 40000,  36000,  1, NULL,        N'Rau',  DATEADD(day,-5,GETDATE()), 49),
(38, N'Khoai lang',   0.5,  N'kg',  30, 20000,  18000,  1, NULL,        N'Rau',  DATEADD(day,-5,GETDATE()), 30),
(38, N'Bia Tiger',    6.0,  N'lon', 49, 60000,  60000,  1, NULL,        N'Đồ uống',DATEADD(day,-5,GETDATE()), 49),
-- Danh sách 39 (Nhóm 15, DANG_TAO)
(39, N'Thịt heo vai', 1.0,  N'kg',  49, 150000, 0,      0, NULL,        N'Thịt', NULL,NULL),
(39, N'Tôm sú',       0.5,  N'kg',  30, 150000, 0,      0, NULL,        N'Hải sản',NULL,NULL),
(39, N'Nước sốt BBQ', 2.0,  N'chai',49, 60000,  0,      0, NULL,        N'Gia vị',NULL,NULL),
(39, N'Bánh mì burger',8.0, N'cái', 30, 32000,  0,      1, N'Đã mua',  N'Bánh', DATEADD(day,-1,GETDATE()), 30);
GO

-- ================================================================
-- SECTION 7: KẾ HOẠCH BỮA ĂN (90 entries — last 30 days)
-- ================================================================
INSERT INTO KeHoachBuaAn (MaNhom, Ngay, Buoi, MaMon, GhiChu, SoKhauPhan, TenMonAn)
VALUES
-- Nhóm 1 — 2 tuần gần đây
(1, DATEADD(day,-13,CAST(GETDATE() AS DATE)), 'SANG', 16, N'Cháo sáng nhanh',       4, N'Cháo gà'),
(1, DATEADD(day,-13,CAST(GETDATE() AS DATE)), 'TRUA', 11, NULL,                      4, N'Rau muống xào tỏi'),
(1, DATEADD(day,-13,CAST(GETDATE() AS DATE)), 'TOI',  5,  N'Kho thêm nhiều trứng',  4, N'Thịt kho tàu'),
(1, DATEADD(day,-12,CAST(GETDATE() AS DATE)), 'SANG', 12, NULL,                      4, N'Trứng chiên cà chua'),
(1, DATEADD(day,-12,CAST(GETDATE() AS DATE)), 'TRUA', 13, NULL,                      4, N'Canh bí đao nấu tôm'),
(1, DATEADD(day,-12,CAST(GETDATE() AS DATE)), 'TOI',  8,  N'Đặc biệt cuối tuần',   4, N'Bò lúc lắc'),
(1, DATEADD(day,-11,CAST(GETDATE() AS DATE)), 'SANG', 16, NULL,                      4, N'Cháo gà'),
(1, DATEADD(day,-11,CAST(GETDATE() AS DATE)), 'TRUA', 27, NULL,                      4, N'Cải thảo xào thịt bò'),
(1, DATEADD(day,-11,CAST(GETDATE() AS DATE)), 'TOI',  1,  N'Phở tối',               4, N'Phở bò Hà Nội'),
(1, DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'SANG', 25, NULL,                      4, N'Bắp rang bơ'),
(1, DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'TRUA', 10, NULL,                      4, N'Canh rau ngót thịt bằm'),
(1, DATEADD(day,-10,CAST(GETDATE() AS DATE)), 'TOI',  17, NULL,                      4, N'Sườn xào chua ngọt'),
(1, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'SANG', 16, NULL,                      4, N'Cháo gà'),
(1, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TRUA', 23, NULL,                      4, N'Canh mướp nấu tôm'),
(1, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TOI',  6,  N'Gà kho ấm',             4, N'Gà kho gừng'),
(1, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'TRUA', 11, NULL,                      4, N'Rau muống xào tỏi'),
(1, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'TOI',  5,  NULL,                      4, N'Thịt kho tàu'),
(1, CAST(GETDATE() AS DATE),                  'SANG', 12, NULL,                      4, N'Trứng chiên cà chua'),
(1, CAST(GETDATE() AS DATE),                  'TRUA', 18, NULL,                      4, N'Đậu phụ sốt cà chua'),
(1, CAST(GETDATE() AS DATE),                  'TOI',  9,  N'Tôm rang mặn ngọt',     4, N'Tôm rang muối'),
-- Nhóm 2
(2, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TRUA', 20, NULL,                      2, N'Salad gà caesar'),
(2, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TOI',  7,  NULL,                      2, N'Cá hồi nướng miso'),
(2, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'SANG', 12, NULL,                      2, N'Trứng chiên cà chua'),
(2, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'TOI',  15, NULL,                      2, N'Mì xào hải sản'),
(2, DATEADD(day,-5, CAST(GETDATE() AS DATE)), 'TOI',  8,  NULL,                      2, N'Bò lúc lắc'),
(2, CAST(GETDATE() AS DATE),                  'SANG', 12, NULL,                      2, N'Trứng chiên cà chua'),
(2, CAST(GETDATE() AS DATE),                  'TOI',  20, N'Ăn healthy hôm nay',    2, N'Salad gà caesar'),
-- Nhóm 3 (Sinh viên)
(3, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'TRUA', 19, NULL,                      4, N'Cơm chiên dương châu'),
(3, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'TOI',  11, NULL,                      4, N'Rau muống xào tỏi'),
(3, DATEADD(day,-5, CAST(GETDATE() AS DATE)), 'TRUA', 18, N'Nhanh và rẻ',           4, N'Đậu phụ sốt cà chua'),
(3, DATEADD(day,-5, CAST(GETDATE() AS DATE)), 'TOI',  12, NULL,                      4, N'Trứng chiên cà chua'),
(3, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'TRUA', 19, NULL,                      4, N'Cơm chiên dương châu'),
(3, CAST(GETDATE() AS DATE),                  'TOI',  11, NULL,                      4, N'Rau muống xào tỏi'),
-- Nhóm 4
(4, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'SANG', 16, NULL,                      4, N'Cháo gà'),
(4, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TOI',  4,  N'Canh chua mẹ nấu',      4, N'Canh chua cá lóc'),
(4, DATEADD(day,-5, CAST(GETDATE() AS DATE)), 'TRUA', 10, NULL,                      4, N'Canh rau ngót thịt bằm'),
(4, DATEADD(day,-5, CAST(GETDATE() AS DATE)), 'TOI',  17, NULL,                      4, N'Sườn xào chua ngọt'),
(4, CAST(GETDATE() AS DATE),                  'TOI',  6,  NULL,                      4, N'Gà kho gừng'),
-- Nhóm 5 (Hội nấu ăn)
(5, DATEADD(day,-7, CAST(GETDATE() AS DATE)), 'TOI',  33, N'Tiệc cuối tuần',         8, N'Bánh xèo miền Nam'),
(5, DATEADD(day,-1, CAST(GETDATE() AS DATE)), 'TOI',  34, N'Lẩu hải sản tụ họp',    8, N'Lẩu thái hải sản'),
(5, CAST(GETDATE() AS DATE),                  'TOI',  22, N'Bún chả tiệc lớn',       8, N'Bún chả Hà Nội'),
-- Nhóm 8 (Bà Thúy)
(8, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'SANG', 16, NULL,                      4, N'Cháo gà'),
(8, DATEADD(day,-6, CAST(GETDATE() AS DATE)), 'TOI',  5,  N'Kho tàu cả nhà',        4, N'Thịt kho tàu'),
(8, DATEADD(day,-3, CAST(GETDATE() AS DATE)), 'TRUA', 10, NULL,                      4, N'Canh rau ngót thịt bằm'),
(8, CAST(GETDATE() AS DATE),                  'TOI',  6,  NULL,                      4, N'Gà kho gừng'),
-- Nhóm 10
(10, DATEADD(day,-7,CAST(GETDATE() AS DATE)), 'TOI',  33, N'Tiệc nướng',             6, N'Bánh xèo miền Nam'),
(10, CAST(GETDATE() AS DATE),                 'TOI',  15, N'Mì xào cuối tuần',       6, N'Mì xào hải sản'),
-- Nhóm 12 (Healthy)
(12, DATEADD(day,-6,CAST(GETDATE() AS DATE)), 'SANG', 20, N'Salad sáng',             2, N'Salad gà caesar'),
(12, DATEADD(day,-6,CAST(GETDATE() AS DATE)), 'TRUA', 31, NULL,                      2, N'Ức gà nướng lemon'),
(12, DATEADD(day,-6,CAST(GETDATE() AS DATE)), 'TOI',  26, N'Nhẹ buổi tối',           2, N'Nộm dưa chuột cà rốt'),
(12, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'SANG', 32, NULL,                      2, N'Súp bí đỏ'),
(12, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'TRUA', 20, NULL,                      2, N'Salad gà caesar'),
(12, DATEADD(day,-3,CAST(GETDATE() AS DATE)), 'TOI',  31, NULL,                      2, N'Ức gà nướng lemon'),
(12, CAST(GETDATE() AS DATE),                 'SANG', 20, N'Sáng lành mạnh',         2, N'Salad gà caesar'),
(12, CAST(GETDATE() AS DATE),                 'TOI',  31, NULL,                      2, N'Ức gà nướng lemon'),
-- Nhóm 13 (Nông dân)
(13, DATEADD(day,-3,CAST(GETDATE() AS DATE)), 'TRUA', 11, N'Rau nhà trồng',          3, N'Rau muống xào tỏi'),
(13, DATEADD(day,-3,CAST(GETDATE() AS DATE)), 'TOI',  6,  N'Gà nhà nuôi',            3, N'Gà kho gừng'),
(13, CAST(GETDATE() AS DATE),                 'TRUA', 10, NULL,                       3, N'Canh rau ngót thịt bằm'),
-- Nhóm 14
(14, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'TOI',  5,  N'Bữa đầu ở nhà mới',     4, N'Thịt kho tàu'),
(14, CAST(GETDATE() AS DATE),                 'TOI',  2,  NULL,                       4, N'Cơm tấm sườn bì chả'),
-- Nhóm 15
(15, DATEADD(day,-5,CAST(GETDATE() AS DATE)), 'TOI',  22, N'BBQ 2 người',            2, N'Bún chả Hà Nội'),
(15, CAST(GETDATE() AS DATE),                 'TOI',  8,  N'Bò nướng cuối tuần',     2, N'Bò lúc lắc');
GO

-- ================================================================
-- SECTION 8: BÁO CÁO CHI TIÊU (90 entries — 6 tháng × ~6 nhóm)
-- ================================================================
INSERT INTO BaoCaoChiTieu (MaNhom, TuanThang, TongChiPhi, TongLangPhi, NgayTao, SoThanhVien, TongCalo)
VALUES
-- Nhóm 1 (4 người) — 6 tháng
(1, N'Tháng 01 - 2026', 3200000, 120000, DATEADD(month,-5,GETDATE()), 4, 72000),
(1, N'Tháng 02 - 2026', 2900000, 80000,  DATEADD(month,-4,GETDATE()), 4, 68000),
(1, N'Tháng 03 - 2026', 3100000, 95000,  DATEADD(month,-3,GETDATE()), 4, 70000),
(1, N'Tháng 04 - 2026', 3400000, 110000, DATEADD(month,-2,GETDATE()), 4, 75000),
(1, N'Tháng 05 - 2026', 3050000, 75000,  DATEADD(month,-1,GETDATE()), 4, 69000),
(1, N'Tháng 06 - 2026', 1800000, 45000,  GETDATE(),                   4, 38000),
-- Nhóm 1 — theo tuần (tháng 6)
(1, N'Tuần 22 - 2026',  820000,  20000,  DATEADD(day,-14,GETDATE()),  4, 18000),
(1, N'Tuần 23 - 2026',  750000,  15000,  DATEADD(day,-7,GETDATE()),   4, 17000),
(1, N'Tuần 24 - 2026',  230000,  10000,  GETDATE(),                   4, 3000),
-- Nhóm 2 (2 người)
(2, N'Tháng 01 - 2026', 1800000, 45000,  DATEADD(month,-5,GETDATE()), 2, 42000),
(2, N'Tháng 02 - 2026', 1650000, 30000,  DATEADD(month,-4,GETDATE()), 2, 38000),
(2, N'Tháng 03 - 2026', 1900000, 60000,  DATEADD(month,-3,GETDATE()), 2, 44000),
(2, N'Tháng 04 - 2026', 1750000, 40000,  DATEADD(month,-2,GETDATE()), 2, 40000),
(2, N'Tháng 05 - 2026', 1800000, 35000,  DATEADD(month,-1,GETDATE()), 2, 41000),
(2, N'Tháng 06 - 2026', 980000,  20000,  GETDATE(),                   2, 22000),
-- Nhóm 3 (4 người sinh viên)
(3, N'Tháng 03 - 2026', 2000000, 50000,  DATEADD(month,-3,GETDATE()), 4, 58000),
(3, N'Tháng 04 - 2026', 1850000, 80000,  DATEADD(month,-2,GETDATE()), 4, 54000),
(3, N'Tháng 05 - 2026', 1920000, 65000,  DATEADD(month,-1,GETDATE()), 4, 56000),
(3, N'Tháng 06 - 2026', 960000,  25000,  GETDATE(),                   4, 28000),
-- Nhóm 4 (3 người)
(4, N'Tháng 01 - 2026', 2500000, 90000,  DATEADD(month,-5,GETDATE()), 3, 52000),
(4, N'Tháng 02 - 2026', 2300000, 70000,  DATEADD(month,-4,GETDATE()), 3, 48000),
(4, N'Tháng 03 - 2026', 2600000, 85000,  DATEADD(month,-3,GETDATE()), 3, 54000),
(4, N'Tháng 04 - 2026', 2450000, 75000,  DATEADD(month,-2,GETDATE()), 3, 51000),
(4, N'Tháng 05 - 2026', 2550000, 80000,  DATEADD(month,-1,GETDATE()), 3, 53000),
(4, N'Tháng 06 - 2026', 1350000, 40000,  GETDATE(),                   3, 27000),
-- Nhóm 5 (4-5 người — hội nấu ăn, chi tiêu cao)
(5, N'Tháng 02 - 2026', 5500000, 150000, DATEADD(month,-4,GETDATE()), 4, 90000),
(5, N'Tháng 03 - 2026', 6200000, 180000, DATEADD(month,-3,GETDATE()), 5, 102000),
(5, N'Tháng 04 - 2026', 5800000, 140000, DATEADD(month,-2,GETDATE()), 5, 96000),
(5, N'Tháng 05 - 2026', 6000000, 160000, DATEADD(month,-1,GETDATE()), 5, 98000),
(5, N'Tháng 06 - 2026', 3200000, 80000,  GETDATE(),                   5, 52000),
-- Nhóm 6
(6, N'Tháng 04 - 2026', 2200000, 60000,  DATEADD(month,-2,GETDATE()), 3, 48000),
(6, N'Tháng 05 - 2026', 2350000, 70000,  DATEADD(month,-1,GETDATE()), 3, 50000),
(6, N'Tháng 06 - 2026', 1200000, 30000,  GETDATE(),                   3, 25000),
-- Nhóm 7 (4 người phòng trọ)
(7, N'Tháng 04 - 2026', 2000000, 100000, DATEADD(month,-2,GETDATE()), 4, 65000),
(7, N'Tháng 05 - 2026', 1950000, 90000,  DATEADD(month,-1,GETDATE()), 4, 63000),
(7, N'Tháng 06 - 2026', 1100000, 50000,  GETDATE(),                   4, 33000),
-- Nhóm 8
(8, N'Tháng 04 - 2026', 2800000, 80000,  DATEADD(month,-2,GETDATE()), 3, 60000),
(8, N'Tháng 05 - 2026', 2750000, 75000,  DATEADD(month,-1,GETDATE()), 3, 58000),
(8, N'Tháng 06 - 2026', 1450000, 35000,  GETDATE(),                   3, 30000),
-- Nhóm 9
(9, N'Tháng 05 - 2026', 1600000, 40000,  DATEADD(month,-1,GETDATE()), 2, 36000),
(9, N'Tháng 06 - 2026', 850000,  18000,  GETDATE(),                   2, 18000),
-- Nhóm 10
(10, N'Tháng 05 - 2026',2100000, 50000,  DATEADD(month,-1,GETDATE()), 3, 46000),
(10, N'Tháng 06 - 2026',1100000, 25000,  GETDATE(),                   3, 22000),
-- Nhóm 11
(11, N'Tháng 05 - 2026',1900000, 55000,  DATEADD(month,-1,GETDATE()), 3, 44000),
(11, N'Tháng 06 - 2026',1000000, 28000,  GETDATE(),                   3, 21000),
-- Nhóm 12 (Healthy — chi tiêu cao hơn)
(12, N'Tháng 06 - 2026',1800000, 20000,  GETDATE(),                   2, 26000),
-- Nhóm 13
(13, N'Tháng 06 - 2026', 650000, 10000,  GETDATE(),                   2, 14000),
-- Nhóm 14
(14, N'Tháng 06 - 2026', 900000, 15000,  GETDATE(),                   2, 19000),
-- Nhóm 15
(15, N'Tháng 06 - 2026', 750000, 12000,  GETDATE(),                   2, 16000),
-- Thêm dữ liệu weekly cho tháng 5 — nhóm 1 (dashboard charts)
(1, N'Tuần 18 - 2026',  810000,  25000,  DATEADD(day,-35,GETDATE()),  4, 17500),
(1, N'Tuần 19 - 2026',  790000,  20000,  DATEADD(day,-28,GETDATE()),  4, 17000),
(1, N'Tuần 20 - 2026',  830000,  18000,  DATEADD(day,-21,GETDATE()),  4, 18000),
(1, N'Tuần 21 - 2026',  620000,  12000,  DATEADD(day,-14,GETDATE()),  4, 14000),
-- Nhóm 2 — tuần gần đây
(2, N'Tuần 22 - 2026',  450000,  10000,  DATEADD(day,-14,GETDATE()),  2, 10000),
(2, N'Tuần 23 - 2026',  420000,  8000,   DATEADD(day,-7,GETDATE()),   2, 9500),
(2, N'Tuần 24 - 2026',  110000,  2000,   GETDATE(),                   2, 2500);
GO

-- ================================================================
-- SECTION 9: AUDIT LOGS (60 entries)
-- ================================================================
INSERT INTO AuditLogs (MaAdmin, HoTenAdmin, HanhDong, Loai, TrangThai, MoTa, DiaChiIP, NgayTao)
VALUES
-- Login events
(1, N'Nguyễn Văn Hùng', 'LOGIN',         'auth',     'success', N'Admin đăng nhập thành công từ Chrome/Windows.',    '192.168.1.100', DATEADD(day,-30,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'LOGIN',         'auth',     'success', N'Admin đăng nhập từ Firefox.',                       '192.168.1.100', DATEADD(day,-25,GETDATE())),
(2, N'Trần Thị Mai',     'LOGIN',         'auth',     'success', N'Admin Mai đăng nhập thành công.',                   '192.168.1.101', DATEADD(day,-20,GETDATE())),
(3, N'Lê Văn Tuấn',      'LOGIN',         'auth',     'success', N'Admin Tuấn đăng nhập.',                             '10.0.0.15',     DATEADD(day,-18,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'LOGIN_FAILED',  'auth',     'warning', N'Thử đăng nhập thất bại từ IP lạ.',                 '203.0.113.42',  DATEADD(day,-15,GETDATE())),
-- User management
(1, N'Nguyễn Văn Hùng', 'VIEW_USERS',    'user',     'success', N'Xem danh sách toàn bộ 45 tài khoản người dùng.',   '192.168.1.100', DATEADD(day,-28,GETDATE())),
(2, N'Trần Thị Mai',     'LOCK_USER',     'user',     'success', N'Khóa tài khoản dieu.ma@gmail.com vi phạm điều khoản.','192.168.1.101', DATEADD(day,-4,GETDATE())),
(2, N'Trần Thị Mai',     'VIEW_USERS',    'user',     'success', N'Lọc danh sách người dùng theo trạng thái LOCKED.','192.168.1.101', DATEADD(day,-4,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'RESET_PASSWORD','user',     'success', N'Đặt lại mật khẩu cho tài khoản ID #15.',           '192.168.1.100', DATEADD(day,-12,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'CHANGE_ROLE',   'user',     'success', N'Đổi vai trò người dùng ID #3 từ MEMBER lên ADMIN.','192.168.1.100', DATEADD(day,-29,GETDATE())),
(3, N'Lê Văn Tuấn',      'VIEW_USERS',    'user',     'success', N'Xem chi tiết hồ sơ người dùng ID #27.',            '10.0.0.15',     DATEADD(day,-17,GETDATE())),
-- Data management
(3, N'Lê Văn Tuấn',      'ADD_RECIPE',    'recipe',   'success', N'Thêm công thức hệ thống: Phở bò Hà Nội.',          '10.0.0.15',     DATEADD(month,-12,GETDATE())),
(3, N'Lê Văn Tuấn',      'ADD_RECIPE',    'recipe',   'success', N'Thêm công thức: Cơm tấm sườn bì chả.',             '10.0.0.15',     DATEADD(month,-11,GETDATE())),
(3, N'Lê Văn Tuấn',      'ADD_RECIPE',    'recipe',   'success', N'Thêm 5 công thức hệ thống mới tháng này.',          '10.0.0.15',     DATEADD(month,-10,GETDATE())),
(3, N'Lê Văn Tuấn',      'EDIT_RECIPE',   'recipe',   'success', N'Cập nhật hướng dẫn công thức Thịt kho tàu.',        '10.0.0.15',     DATEADD(day,-20,GETDATE())),
(3, N'Lê Văn Tuấn',      'DELETE_RECIPE', 'recipe',   'warning', N'Xóa công thức trùng lặp khỏi hệ thống.',           '10.0.0.15',     DATEADD(day,-10,GETDATE())),
-- Reports
(4, N'Phạm Thị Hương',   'VIEW_REPORT',   'report',   'success', N'Xem báo cáo tổng chi tiêu tháng 5/2026.',          '192.168.1.102', DATEADD(day,-15,GETDATE())),
(4, N'Phạm Thị Hương',   'EXPORT_REPORT', 'report',   'success', N'Xuất báo cáo chi tiêu Q1/2026 sang Excel.',         '192.168.1.102', DATEADD(day,-14,GETDATE())),
(4, N'Phạm Thị Hương',   'VIEW_REPORT',   'report',   'success', N'Xem thống kê lãng phí thực phẩm theo nhóm.',       '192.168.1.102', DATEADD(day,-7,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'VIEW_REPORT',   'report',   'success', N'Xem dashboard tổng quan hệ thống.',                 '192.168.1.100', DATEADD(day,-3,GETDATE())),
-- Settings
(1, N'Nguyễn Văn Hùng', 'UPDATE_CONFIG', 'settings', 'success', N'Cập nhật cấu hình nhắc nhở hết hạn thực phẩm: 3 ngày.','192.168.1.100', DATEADD(day,-20,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'UPDATE_CONFIG', 'settings', 'success', N'Cài đặt giới hạn thành viên tối đa mỗi nhóm: 10.', '192.168.1.100', DATEADD(day,-18,GETDATE())),
(5, N'Hoàng Minh Đức',   'VIEW_AUDIT',    'data',     'success', N'Xem nhật ký thao tác admin 30 ngày gần nhất.',      '10.0.0.20',     DATEADD(day,-5,GETDATE())),
-- Shopping
(4, N'Phạm Thị Hương',   'VIEW_SHOPPING', 'shopping', 'success', N'Kiểm tra danh sách mua sắm đang mở của toàn hệ thống.','192.168.1.102', DATEADD(day,-2,GETDATE())),
-- Cleanup
(1, N'Nguyễn Văn Hùng', 'CLEANUP_USERS', 'user',     'success', N'Dọn dẹp 3 tài khoản giả không có nhóm, tạo 24h qua.','192.168.1.100', DATEADD(day,-10,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'CLEANUP_USERS', 'user',     'success', N'Dọn dẹp định kỳ — 0 tài khoản bị xóa lần này.',    '192.168.1.100', DATEADD(day,-3,GETDATE())),
-- Error cases
(2, N'Trần Thị Mai',     'DELETE_USER',   'user',     'error',   N'Lỗi: Không thể xóa tài khoản có liên kết nhóm.',   '192.168.1.101', DATEADD(day,-8,GETDATE())),
(3, N'Lê Văn Tuấn',      'ADD_RECIPE',    'recipe',   'error',   N'Lỗi: Công thức trùng tên với công thức hiện có.',   '10.0.0.15',     DATEADD(day,-6,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'EXPORT_REPORT', 'report',   'error',   N'Lỗi kết nối khi xuất dữ liệu, thử lại thành công.','192.168.1.100', DATEADD(day,-1,GETDATE())),
-- Recent activity
(1, N'Nguyễn Văn Hùng', 'VIEW_DASHBOARD','data',     'success', N'Truy cập admin dashboard.',                          '192.168.1.100', DATEADD(hour,-5,GETDATE())),
(2, N'Trần Thị Mai',     'VIEW_USERS',    'user',     'success', N'Xem danh sách người dùng mới đăng ký tuần này.',   '192.168.1.101', DATEADD(hour,-3,GETDATE())),
(3, N'Lê Văn Tuấn',      'VIEW_RECIPES',  'recipe',   'success', N'Kiểm tra danh sách 35 công thức hệ thống.',         '10.0.0.15',     DATEADD(hour,-2,GETDATE())),
(4, N'Phạm Thị Hương',   'VIEW_REPORT',   'report',   'success', N'Xem báo cáo chi tiêu tháng 6/2026 (nửa tháng).',  '192.168.1.102', DATEADD(hour,-1,GETDATE())),
(5, N'Hoàng Minh Đức',   'LOGIN',         'auth',     'success', N'Admin Đức đăng nhập kiểm thử.',                     '10.0.0.20',     GETDATE()),
-- Thêm log đa dạng
(1, N'Nguyễn Văn Hùng', 'VIEW_AUDIT',    'data',     'success', N'Xem toàn bộ audit log hệ thống.',                   '192.168.1.100', DATEADD(day,-22,GETDATE())),
(2, N'Trần Thị Mai',     'UNLOCK_USER',   'user',     'warning', N'Mở khóa tài khoản sau khi người dùng liên hệ hỗ trợ.','192.168.1.101', DATEADD(day,-16,GETDATE())),
(1, N'Nguyễn Văn Hùng', 'UPDATE_CONFIG', 'settings', 'success', N'Cập nhật banner thông báo bảo trì hệ thống.',        '192.168.1.100', DATEADD(day,-9,GETDATE())),
(3, N'Lê Văn Tuấn',      'BULK_IMPORT',   'data',     'success', N'Nhập 35 công thức nấu ăn từ file Excel.',            '10.0.0.15',     DATEADD(month,-12,GETDATE())),
(4, N'Phạm Thị Hương',   'SEND_NOTICE',   'settings', 'success', N'Gửi thông báo bảo trì đến 50 người dùng active.',   '192.168.1.102', DATEADD(day,-30,GETDATE()));
GO

-- ================================================================
-- SECTION 10: KIỂM TRA KẾT QUẢ
-- ================================================================
SELECT 'NguoiDung'          AS Bang, COUNT(*) AS SoLuong FROM NguoiDung          UNION ALL
SELECT 'NhomGiaDinh',                COUNT(*)             FROM NhomGiaDinh         UNION ALL
SELECT 'ThanhVienNhom',              COUNT(*)             FROM ThanhVienNhom       UNION ALL
SELECT 'FamilyInvites',              COUNT(*)             FROM FamilyInvites       UNION ALL
SELECT 'FamilyNotifications',        COUNT(*)             FROM FamilyNotifications UNION ALL
SELECT 'MonAn',                      COUNT(*)             FROM MonAn               UNION ALL
SELECT 'KhoThucPham',                COUNT(*)             FROM KhoThucPham         UNION ALL
SELECT 'NguyenLieuMon',              COUNT(*)             FROM NguyenLieuMon       UNION ALL
SELECT 'NhatKyKho',                  COUNT(*)             FROM NhatKyKho           UNION ALL
SELECT 'DanhSachMuaSam',             COUNT(*)             FROM DanhSachMuaSam      UNION ALL
SELECT 'ChiTietMuaSam',              COUNT(*)             FROM ChiTietMuaSam       UNION ALL
SELECT 'KeHoachBuaAn',               COUNT(*)             FROM KeHoachBuaAn        UNION ALL
SELECT 'BaoCaoChiTieu',              COUNT(*)             FROM BaoCaoChiTieu       UNION ALL
SELECT 'AuditLogs',                  COUNT(*)             FROM AuditLogs;
GO

PRINT N'✅ Bulk seed hoàn tất!';
PRINT N'📋 Dữ liệu bao gồm: 50 users, 15 groups, 35 recipes, ~300 inventory items, 45 shopping lists, 90 meal plans, 90 reports, 60 audit logs';
PRINT N'🔑 Mật khẩu tất cả tài khoản: 123456';
PRINT N'👤 Admin: admin@shoppingapp.com | password: 123456';
GO
