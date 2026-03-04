using MongoDB.Driver;
using Api.Models;
using Api.Configuration;
using Microsoft.Extensions.Options;

namespace Api.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<User>(settings.Value.UsersCollection);
        }

        public async Task<List<User>> GetAllAsync() => 
            await _users.Find(_ => true).ToListAsync();

        public async Task<User?> GetByIdAsync(string id) =>
            await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

        public async Task<User?> GetByEmailAsync(string email) =>
            await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

        public async Task<User> CreateAsync(User user)
        {
            user.Id = null; // Osiguravamo da Mongo generiše novi ID [cite: 31]
            // Ovde bi u realnoj aplikaciji dodali generisanje PasswordHash-a
            await _users.InsertOneAsync(user);
            return user;
        }

        public async Task<bool> UpdateAsync(string id, User user)
        {
            user.Id = id;
            var result = await _users.ReplaceOneAsync(u => u.Id == id, user);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _users.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }

        // Metoda za dodavanje adrese postojećem korisniku (MongoDB Update Push)
        public async Task<bool> AddAddressAsync(string userId, Address address)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Push(u => u.Addresses, address);
            var result = await _users.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;        
        }

        public async Task<bool> RemoveAddressAsync(string userId, string street)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.PullFilter(u => u.Addresses, 
                a => a.Street == street);
            var result = await _users.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
    }
}