using MongoDB.Driver;
using GigatronAplikacija.Models;
using GigatronAplikacija.Configuration;
using Microsoft.Extensions.Options;

namespace GigatronAplikacija.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _products;

        public ProductService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _products = database.GetCollection<Product>(settings.Value.ProductsCollection);
        }

        public async Task<List<Product>> GetAllAsync() => 
            await _products.Find(_ => true).ToListAsync();

        public async Task<Product?> GetByIdAsync(string id) =>
            await _products.Find(p => p.Id == id).FirstOrDefaultAsync();

        public async Task<Product> CreateAsync(Product product)
        {
            product.Id = null; // Mongo će sam generisati ID
            await _products.InsertOneAsync(product);
            return product;
        }

        public async Task<bool> UpdateAsync(string id, Product product)
        {
            product.Id = id;
            var result = await _products.ReplaceOneAsync(p => p.Id == id, product);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _products.DeleteOneAsync(p => p.Id == id);
            return result.DeletedCount > 0;
        }

        // Primer složenijeg filtriranja: Proizvodi određenog brenda skuplji od neke cene
        public async Task<List<Product>> GetFilteredAsync(string brand, decimal minPrice)
        {
            var filter = Builders<Product>.Filter.And(
                Builders<Product>.Filter.Eq(p => p.Brand, brand),
                Builders<Product>.Filter.Gt(p => p.Price, minPrice)
            );
            return await _products.Find(filter).ToListAsync();
        }

        // Paginacija - bitno za prodavnice sa mnogo artikala
        public async Task<List<Product>> GetPaginatedAsync(int skip, int limit)
        {
            return await _products.Find(_ => true)
                .Skip(skip)
                .Limit(limit)
                .ToListAsync();
        }
    }
}