import { FamilyRepository } from './family.repository';

export class FamilyService {
  private repo = new FamilyRepository();

  async getUserFamilies(userId: number) { return this.repo.getGroupsByUser(userId); }
  async getMembers(groupId: number) { return this.repo.getMembers(groupId); }

  async createFamily(name: string, userId: number) {
    const id = await this.repo.createGroup(name, userId);
    return { MaNhom: id, TenNhom: name };
  }

  async addMember(groupId: number, userId: number) { await this.repo.addMember(groupId, userId); }
  async removeMember(groupId: number, userId: number) { await this.repo.removeMember(groupId, userId); }
}
