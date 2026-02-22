namespace GigatronAplikacija.Configuration
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        
        public string ProductsCollection { get; set; } = "products";
        public string OrdersCollection { get; set; } = "orders";
        public string UsersCollection { get; set; } = "users";
        public string ReviewsCollection { get; set; } = "reviews";
    }
}