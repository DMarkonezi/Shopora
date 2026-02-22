using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GigatronAplikacija.Models;
public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("sku")] // Stock Keeping Unit (šifra artikla)
    public string? SKU { get; set; }

    public string? Name { get; set; }
    
    public string? Brand { get; set; }

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal Price { get; set; }

    public int Stock { get; set; }

    public List<Specification> Specifications { get; set; } = new();

    [BsonElement("images")]
    public List<byte[]> Images { get; set; } = new();
    
    public CategoryInfo? Category { get; set; }
}

public class Specification
{
    public string? Key { get; set; }   // npr. "RAM"
    public string? Value { get; set; } // npr. "16"
    public string? Unit { get; set; }  // npr. "GB"
}

public class CategoryInfo // Denormalizovan podatak o kategoriji radi brzine
{
    public string? CategoryId { get; set; }
    public string? Name { get; set; }
}