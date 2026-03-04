using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Api.Models;
public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("firstName")]
    public string? FirstName { get; set; }

    [BsonElement("lastName")]
    public string? LastName { get; set; }

    public string? Email { get; set; }
    
    public string? Password { get; set; }

    public List<Address> Addresses { get; set; } = [];

    public UserRole Role { get; set; } = UserRole.Customer;
}

public class Address
{
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; }
    public bool IsDefault { get; set; }
}

public enum UserRole { Admin, Customer, Support }