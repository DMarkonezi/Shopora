using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace GigatronAplikacija.Models;
public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? ProductId { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    public string? UserName { get; set; } // Denormalizacija za brži prikaz

    public int Rating { get; set; } // 1-5

    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}