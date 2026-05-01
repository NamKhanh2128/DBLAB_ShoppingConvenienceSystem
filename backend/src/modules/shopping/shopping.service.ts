import { ShoppingRepository } from './shopping.repository';

export class ShoppingService {
  private repo = new ShoppingRepository();

  async getLists(groupId: number) { return this.repo.getListsByGroup(groupId); }
  async createList(groupId: number, ghiChu?: string) {
    const id = await this.repo.createList(groupId, ghiChu);
    return { MaDanhSach: id, MaNhom: groupId, GhiChu: ghiChu };
  }
  async updateStatus(id: number, status: string) { await this.repo.updateListStatus(id, status); }
  async deleteList(id: number) { await this.repo.deleteList(id); }

  async getItems(listId: number) { return this.repo.getItems(listId); }
  async addItem(listId: number, data: any) {
    const id = await this.repo.addItem(listId, data);
    return { MaCT: id, ...data };
  }
  async toggleItem(id: number, done: boolean) { await this.repo.toggleItem(id, done); }
  async updateItem(id: number, data: any) { await this.repo.updateItem(id, data); }
  async deleteItem(id: number) { await this.repo.deleteItem(id); }
}
