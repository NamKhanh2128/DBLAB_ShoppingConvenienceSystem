-- Kiểm tra xem cơ sở dữ liệu đã tồn tại chưa, nếu chưa (NULL) thì mới tạo
IF DB_ID('shoppingdb') IS NULL
BEGIN
    -- Nếu bạn đang dùng SQL Server 2019 trở lên và muốn cấu hình chuẩn UTF-8 tương tự utf8mb4
    CREATE DATABASE shoppingdb COLLATE Latin1_General_100_CI_AS_SC_UTF8;
    
    -- (Hoặc dùng lệnh cơ bản dưới đây nếu chỉ cần lưu tiếng Việt bằng kiểu NVARCHAR như bạn đã làm ở các bảng)
    -- CREATE DATABASE shoppingdb;
END
GO

-- Chuyển sang sử dụng database vừa tạo
USE shoppingdb;
GO