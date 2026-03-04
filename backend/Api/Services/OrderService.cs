using MongoDB.Driver;
using Api.Models;
using Api.Configuration;
using Microsoft.Extensions.Options;

namespace Api.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orders;
        private readonly IMongoCollection<User> _users;

        public OrderService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _orders = database.GetCollection<Order>(settings.Value.OrdersCollection);
            _users = database.GetCollection<User>(settings.Value.UsersCollection);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            order.Id = null;
            order.OrderDate = DateTime.UtcNow;
            await _orders.InsertOneAsync(order);
            return order;
        }

        public async Task<object?> GetOrderDetailsWithUserAsync(string orderId)
        {
            var order = await _orders.Find(o => o.Id == orderId).FirstOrDefaultAsync();
            if (order == null) return null;

            var user = await _users.Find(u => u.Id == order.UserId).FirstOrDefaultAsync();

            return new
            {
                OrderInfo = order,
                CustomerEmail = user?.Email,
                CustomerName = $"{user?.FirstName} {user?.LastName}"
            };
        }

        public async Task<bool> UpdateStatusAsync(string orderId, OrderStatus status)
        {
            var filter = Builders<Order>.Filter.Eq(o => o.Id, orderId);
            var update = Builders<Order>.Update.Set(o => o.Status, status);
            var result = await _orders.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Order>> GetUserOrdersAsync(string userId)
        {
            return await _orders.Find(o => o.UserId == userId).ToListAsync();
        }

        public async Task<List<Order>> GetByStatusAsync(OrderStatus status)
        {
            return await _orders.Find(o => o.Status == status).ToListAsync();
        }
    }
}