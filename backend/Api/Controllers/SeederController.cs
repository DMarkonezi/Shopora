using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Api.Models;
using Api.Configuration;
using Microsoft.Extensions.Options;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeederController : ControllerBase
    {
        private readonly IMongoDatabase _db;

        public SeederController(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _db = client.GetDatabase(settings.Value.DatabaseName);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            // CATEGORIES
            var categories = _db.GetCollection<Category>("categories");
            await categories.DeleteManyAsync(_ => true);

            var electronics = new Category { Name = "Electronics", Slug = "electronics", IsActive = true };
            var laptops = new Category { Name = "Laptops", Slug = "laptops", IsActive = true };
            var phones = new Category { Name = "Phones", Slug = "phones", IsActive = true };
            await categories.InsertManyAsync([electronics, laptops, phones]);
            laptops.ParentCategoryId = electronics.Id;
            phones.ParentCategoryId = electronics.Id;
            await categories.ReplaceOneAsync(c => c.Id == laptops.Id, laptops);
            await categories.ReplaceOneAsync(c => c.Id == phones.Id, phones);

            // USERS
            var users = _db.GetCollection<User>("users");
            await users.DeleteManyAsync(_ => true);

            var user = new User
            {
                FirstName = "Marko",
                LastName = "Petrovic",
                Email = "marko@test.com",
                Password = "test123",
                Role = UserRole.Customer,
                Addresses =
                [
                    new Address { Street = "Knez Mihailova 10", City = "Beograd", ZipCode = "11000", IsDefault = true }
                ]
            };
            await users.InsertOneAsync(user);

            // PRODUCTS
            var products = _db.GetCollection<Product>("products");
            await products.DeleteManyAsync(_ => true);

            await products.InsertManyAsync([
                new Product
                {
                    Name = "MacBook Pro 14",
                    SKU = "MBP-14-2024",
                    Brand = "Apple",
                    Description = "Powerful laptop for professionals.",
                    Price = 1999.99m,
                    Stock = 15,
                    IsActive = true,
                    Category = new CategoryInfo { CategoryId = laptops.Id, Name = "Laptops" },
                    Specifications =
                    [
                        new Specification { Key = "RAM", Value = "16", Unit = "GB" },
                        new Specification { Key = "Storage", Value = "512", Unit = "GB" },
                        new Specification { Key = "CPU", Value = "Apple M3 Pro" }
                    ]
                },
                new Product
                {
                    Name = "Dell XPS 15",
                    SKU = "DELL-XPS-15",
                    Brand = "Dell",
                    Description = "Premium Windows laptop with OLED display.",
                    Price = 1599.99m,
                    Stock = 8,
                    IsActive = true,
                    Category = new CategoryInfo { CategoryId = laptops.Id, Name = "Laptops" },
                    Specifications =
                    [
                        new Specification { Key = "RAM", Value = "32", Unit = "GB" },
                        new Specification { Key = "Storage", Value = "1", Unit = "TB" },
                        new Specification { Key = "Display", Value = "OLED 15.6 inch" }
                    ]
                },
                new Product
                {
                    Name = "iPhone 15 Pro",
                    SKU = "IPH-15-PRO",
                    Brand = "Apple",
                    Description = "Latest iPhone with titanium design.",
                    Price = 1099.99m,
                    Stock = 25,
                    IsActive = true,
                    Category = new CategoryInfo { CategoryId = phones.Id, Name = "Phones" },
                    Specifications =
                    [
                        new Specification { Key = "Storage", Value = "256", Unit = "GB" },
                        new Specification { Key = "RAM", Value = "8", Unit = "GB" },
                        new Specification { Key = "Camera", Value = "48", Unit = "MP" }
                    ]
                },
                new Product
                {
                    Name = "Samsung Galaxy S24",
                    SKU = "SAM-S24",
                    Brand = "Samsung",
                    Description = "Flagship Android phone with AI features.",
                    Price = 899.99m,
                    Stock = 0,
                    IsActive = true,
                    Category = new CategoryInfo { CategoryId = phones.Id, Name = "Phones" },
                    Specifications =
                    [
                        new Specification { Key = "Storage", Value = "128", Unit = "GB" },
                        new Specification { Key = "RAM", Value = "12", Unit = "GB" },
                        new Specification { Key = "Battery", Value = "4000", Unit = "mAh" }
                    ]
                }
            ]);

            return Ok(new
            {
                Message = "Seed successful!",
                Users = 1,
                Products = 4,
                Categories = 3
            });
        }
    }
}