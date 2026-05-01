import { ReportsRepository } from './reports.repository';

export class ReportsService {
  private repo = new ReportsRepository();
  async getReports(groupId: number) { return this.repo.getByGroup(groupId); }
  async getSummary(groupId: number) { return this.repo.getSummary(groupId); }
  async create(data: any) { const id = await this.repo.create(data); return { MaBaoCao: id, ...data }; }
}
