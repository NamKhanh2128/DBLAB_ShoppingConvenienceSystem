import { InventoryRepository } from './inventory.repository';

export class InventoryService {
  private repo = new InventoryRepository();

  async getInventory(groupId: number) { return this.repo.getByGroup(groupId); }
  async getExpiring(groupId: number) { return this.repo.getExpiring(groupId, 3); }
  async addFood(data: any) { const id = await this.repo.add(data); return { MaTP: id, ...data }; }
  async updateFood(id: number, data: any) { await this.repo.update(id, data); }
  async deleteFood(id: number) { await this.repo.remove(id); }
  async getCount(groupId: number) { return this.repo.countByGroup(groupId); }
}
