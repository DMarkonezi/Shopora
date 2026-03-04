using MongoDB.Driver;
using Api.Configuration;
using Microsoft.Extensions.Options;

namespace Api.Services
{
    public class DatabaseService
    {
        private readonly MongoClient _client;
        private readonly string _dbName;

        public DatabaseService(IOptions<MongoDbSettings> settings)
        {
            var mongoSettings = MongoClientSettings.FromConnectionString(settings.Value.ConnectionString);
            mongoSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
            _client = new MongoClient(mongoSettings);
            _dbName = settings.Value.DatabaseName;
        }

        public async Task<List<string>> GetDatabaseNamesAsync()
        {
            var databases = await _client.ListDatabasesAsync();
            var dbList = await databases.ToListAsync();
            return dbList.Select(db => db["name"].AsString).ToList();
        }

        public async Task DeleteAllDataAsync()
        {
            var database = _client.GetDatabase(_dbName);
            await database.DropCollectionAsync("products");
            await database.DropCollectionAsync("users");
            await database.DropCollectionAsync("orders");
            await database.DropCollectionAsync("reviews");
            await database.DropCollectionAsync("categories");
        }
    }
}