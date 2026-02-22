using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GigatronAplikacija.Models;
public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string? OrderNumber { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public List<OrderItem> Items { get; set; } = new();

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal TotalAmount { get; set; }

    public string? Status { get; set; } // Pending, Shipped, Cancelled
}

public class OrderItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductId { get; set; }

    public string? ProductName { get; set; } // Čuvamo ime da ne radimo Lookup kasnije

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal UnitPriceAtPurchase { get; set; } // Snapshot cene!

    public int Quantity { get; set; }
}