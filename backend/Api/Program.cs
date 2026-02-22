using MongoDB.Driver;
using Microsoft.Extensions.Options;
using GigatronAplikacija.Configuration;
using GigatronAplikacija.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Povezivanje konfiguracije iz appsettings.json
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// 2. Registracija IMongoClient (Singleton - jedan za celu aplikaciju)
builder.Services.AddSingleton<IMongoClient>(sp => {
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.ConnectionString);
});

// 3. Registracija servisa za tvoje modele
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ReviewService>();
builder.Services.AddScoped<DatabaseService>();

// 4. Standardne API stvari
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware konfiguracija
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();