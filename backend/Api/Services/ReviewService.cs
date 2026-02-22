using MongoDB.Driver;
using GigatronAplikacija.Models;
using GigatronAplikacija.Configuration;
using Microsoft.Extensions.Options;

namespace GigatronAplikacija.Services
{
    public class ReviewService
    {
        private readonly IMongoCollection<Review> _reviews;

        public ReviewService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _reviews = database.GetCollection<Review>(settings.Value.ReviewsCollection);
        }

        public async Task<List<Review>> GetByProductAsync(string productId) =>
            await _reviews.Find(r => r.ProductId == productId).ToListAsync();

        public async Task<Review> CreateAsync(Review review)
        {
            review.Id = null;
            review.CreatedAt = DateTime.UtcNow;
            await _reviews.InsertOneAsync(review);
            return review;
        }

        // Specijalna metoda: Računanje prosečne ocene za proizvod koristeći Aggregation
        public async Task<double> GetAverageRatingAsync(string productId)
        {
            var filter = Builders<Review>.Filter.Eq(r => r.ProductId, productId);
            var result = await _reviews.Aggregate()
                .Match(filter)
                .Group(r => r.ProductId, g => new { Average = g.Average(r => r.Rating) })
                .FirstOrDefaultAsync();

            return result?.Average ?? 0.0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _reviews.DeleteOneAsync(r => r.Id == id);
            return result.DeletedCount > 0;
        }

        // Dobavljanje svih recenzija koje je ostavio specifičan korisnik
        public async Task<List<Review>> GetByUserAsync(string userId) =>
            await _reviews.Find(r => r.UserId == userId).ToListAsync();
    }
}