import { MealPlanRepository } from './meal-plan.repository';

export class MealPlanService {
  private repo = new MealPlanRepository();

  async getByDateRange(groupId: number, start: string, end: string) {
    return this.repo.getByGroupAndDate(groupId, start, end);
  }
  async getToday(groupId: number) { return this.repo.getToday(groupId); }
  async create(data: any) { const id = await this.repo.create(data); return { MaKeHoach: id, ...data }; }
  async update(id: number, data: any) { await this.repo.update(id, data); }
  async remove(id: number) { await this.repo.remove(id); }
}
