import { RecipesRepository } from './recipes.repository';

export class RecipesService {
  private repo = new RecipesRepository();

  async getAll() { return this.repo.getAll(); }
  async getById(id: number) {
    const recipe = await this.repo.getById(id);
    if (!recipe) throw { statusCode: 404, message: 'Không tìm thấy món' };
    const ingredients = await this.repo.getIngredients(id);
    return { ...recipe, ingredients };
  }
  async create(data: any) { const id = await this.repo.create(data); return { MaMon: id, ...data }; }
  async update(id: number, data: any) { await this.repo.update(id, data); }
  async remove(id: number) { await this.repo.remove(id); }
}
