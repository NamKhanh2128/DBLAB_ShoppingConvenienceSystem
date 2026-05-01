USE shoppingdb;
GO

-- ==========================================
-- SCRIPT QUẢN LÝ JOBS (THAY THẾ EVENT CỦA MYSQL)
-- ==========================================
-- Ghi chú: SQL Server sử dụng SQL Server Agent để lập lịch (Scheduling).
-- Bạn cần đảm bảo SQL Server Agent đang chạy (Running).
-- Dưới đây là script MẪU để tạo một Job quét thực phẩm hết hạn mỗi ngày.

/*
USE msdb;
GO

-- BƯỚC 1: Tạo Job
EXEC dbo.sp_add_job
    @job_name = N'Job_CapNhatThucPhamHetHan';
GO

-- BƯỚC 2: Thêm bước xử lý cho Job
EXEC sp_add_jobstep
    @job_name = N'Job_CapNhatThucPhamHetHan',
    @step_name = N'Update TrangThai KhoThucPham',
    @subsystem = N'TSQL',
    @command = N'
        USE shoppingdb;
        UPDATE KhoThucPham
        SET TrangThai = ''HET_HAN''
        WHERE HanSuDung < CAST(GETDATE() AS DATE) AND TrangThai != ''HET_HAN'';
    ',
    @retry_attempts = 1,
    @retry_interval = 5;
GO

-- BƯỚC 3: Tạo lịch trình (Chạy mỗi ngày lúc 00:01 AM)
EXEC sp_add_schedule
    @schedule_name = N'DailyAtMidnight',
    @freq_type = 4, -- Hằng ngày
    @freq_interval = 1,
    @active_start_time = 000100; -- 00:01:00
GO

-- BƯỚC 4: Gắn lịch trình vào Job
EXEC sp_attach_schedule
    @job_name = N'Job_CapNhatThucPhamHetHan',
    @schedule_name = N'DailyAtMidnight';
GO

-- BƯỚC 5: Thêm Job vào Server cục bộ
EXEC sp_add_jobserver
    @job_name = N'Job_CapNhatThucPhamHetHan',
    @server_name = N'(LOCAL)';
GO
*/
