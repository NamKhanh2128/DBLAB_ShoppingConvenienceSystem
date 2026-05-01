import { AdminRepository } from './admin.repository';

export class AdminService {
  private repo = new AdminRepository();
  async getDashboard() { return this.repo.getDashboardStats(); }
  async getUsers() { return this.repo.getAllUsers(); }
  async updateUserStatus(id: number, status: string) { await this.repo.updateUserStatus(id, status); }
  async updateUserRole(id: number, role: string) { await this.repo.updateUserRole(id, role); }
  async deleteUser(id: number) { await this.repo.deleteUser(id); }
}
