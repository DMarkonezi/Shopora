using MongoDB.Driver;
using Api.Models;
using Api.Configuration;
using Microsoft.Extensions.Options;

namespace Api.Services
{
    public class CategoryService
    {
        private readonly IMongoCollection<Category> _categories;

        public CategoryService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _categories = database.GetCollection<Category>(settings.Value.CategoriesCollection);
        }

        public async Task<List<Category>> GetAllAsync() =>
            await _categories.Find(c => c.IsActive).ToListAsync();

        public async Task<Category?> GetByIdAsync(string id) =>
            await _categories.Find(c => c.Id == id).FirstOrDefaultAsync();

        public async Task<Category> CreateAsync(Category category)
        {
            category.Id = null;
            category.CreatedAt = DateTime.UtcNow;
            await _categories.InsertOneAsync(category);
            return category;
        }

        public async Task<bool> UpdateAsync(string id, Category category)
        {
            category.Id = id;
            category.UpdatedAt = DateTime.UtcNow;
            var result = await _categories.ReplaceOneAsync(c => c.Id == id, category);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _categories.DeleteOneAsync(c => c.Id == id);
            return result.DeletedCount > 0;
        }

        // Sve podkategorije za datu roditeljsku kategoriju
        public async Task<List<Category>> GetByParentAsync(string parentId) =>
            await _categories.Find(c => c.ParentCategoryId == parentId).ToListAsync();
    }
}