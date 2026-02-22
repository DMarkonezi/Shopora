using MongoDB.Driver;
using GigatronAplikacija.Models;
using GigatronAplikacija.Configuration;
using Microsoft.Extensions.Options;

namespace GigatronAplikacija.Services
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

        // Napredna metoda: Vraća narudžbinu zajedno sa osnovnim podacima o kupcu (Denormalizacija/Join simulacija)
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

        public async Task<List<Order>> GetUserOrdersAsync(string userId)
        {
            return await _orders.Find(o => o.UserId == userId).ToListAsync();
        }
    }
}