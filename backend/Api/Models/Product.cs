using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Api.Models;
public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    [BsonElement("sku")]
    public string? SKU { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Brand { get; set; }
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public List<Specification> Specifications { get; set; } = [];
    [BsonElement("images")]
    public List<byte[]> Images { get; set; } = [];
    public CategoryInfo? Category { get; set; }
    public double AverageRating { get; set; } = 0;
public int ReviewCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Specification
{
    public string? Key { get; set; }   // npr. "RAM"
    public string? Value { get; set; } // npr. "16"
    public string? Unit { get; set; }  // npr. "GB"
}

public class CategoryInfo
{
    public string? CategoryId { get; set; }
    public string? Name { get; set; }
}