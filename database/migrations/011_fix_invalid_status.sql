-- Migration 011: Fix invalid TrangThai values in KhoThucPham
-- Root cause: inventory.repository.ts had typo 'HE_HAN' instead of 'HET_HAN'
-- causing all expired items to be stored with an unrecognized status,
-- which broke the waste (TongLangPhi) calculation in reports.

USE shoppingdb;
GO

-- Reclassify any rows stuck in the invalid 'HE_HAN' status.
-- Items whose HanSuDung has already passed get 'HET_HAN'; others get 'CON_HAN'.
UPDATE KhoThucPham
SET TrangThai   = CASE
                    WHEN HanSuDung < CAST(GETDATE() AS DATE) THEN 'HET_HAN'
                    ELSE 'CON_HAN'
                  END,
    NgayCapNhat = GETDATE()
WHERE TrangThai = 'HE_HAN';

-- Verification query (should return 0 after running the UPDATE above):
SELECT COUNT(*) AS StillInvalid FROM KhoThucPham WHERE TrangThai = 'HE_HAN';
