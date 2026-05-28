import { Response, NextFunction } from 'express';
import { getPool } from '../../config/database';
import sql from 'mssql';
import { createError } from '../utils/response';

export const authorizeRole = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return createError(res, 'Forbidden: Quyền truy cập bị từ chối', 403);
    }
    next();
  };
};

export const requireGroupRole = (allowedRoles: string[]) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const groupId = Number(req.params.groupId || req.query.groupId || req.body.groupId);

      if (!userId) {
        return createError(res, 'Yêu cầu đăng nhập để truy cập', 401);
      }

      if (!groupId) {
        return createError(res, 'Thiếu tham số ID nhóm gia đình (groupId)', 400);
      }

      const pool = await getPool();
      const result = await pool.request()
        .input('groupId', sql.Int, groupId)
        .input('userId', sql.Int, userId)
        .query(`
          SELECT VaiTro 
          FROM ThanhVienNhom 
          WHERE MaNhom = @groupId AND MaNguoiDung = @userId
        `);

      const member = result.recordset[0];
      if (!member) {
        return createError(res, 'Bạn không phải là thành viên của nhóm gia đình này', 403);
      }

      if (!allowedRoles.includes(member.VaiTro)) {
        return createError(res, 'Bạn không có quyền hạn phù hợp trong nhóm để thực hiện hành động này', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
