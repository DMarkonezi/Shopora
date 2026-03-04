using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Api.Models;
public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    public string? OrderNumber { get; set; }
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = [];

    [BsonRepresentation(BsonType.Decimal128)]
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    public ShippingAddress? ShippingAddress { get; set; }
}

public class OrderItem
{
    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductId { get; set; }
    public string? ProductName { get; set; } 
    [BsonRepresentation(BsonType.Decimal128)]
    public decimal UnitPriceAtPurchase { get; set; }
    public int Quantity { get; set; }
}

public class ShippingAddress
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? PhoneNumber { get; set; }
}

public enum OrderStatus { Pending, Confirmed, Shipped, Delivered, Cancelled }