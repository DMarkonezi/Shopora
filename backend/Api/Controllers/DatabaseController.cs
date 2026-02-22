using Microsoft.AspNetCore.Mvc;
using GigatronAplikacija.Services;

namespace GigatronAplikacija.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController : ControllerBase
    {
        private readonly DatabaseService _service;

        public DatabaseController(DatabaseService service)
        {
            _service = service;
        }

        // Vraća listu svih baza na tvom MongoDB Docker kontejneru
        [HttpGet("list")]
        public async Task<IActionResult> ListDatabases()
        {
            var databases = await _service.GetDatabaseNamesAsync();
            return Ok(databases);
        }

        // Briše sve podatke iz tvojih e-commerce kolekcija
        // Podrazumevana vrednost je tvoja baza definisana u servisu
        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearAllData()
        {
            // Pozivamo servis koji smo prethodno napisali
            await _service.DeleteAllDataAsync();
            return Ok(new { Message = "Svi podaci iz Gigatron baze (proizvodi, korisnici, narudžbine, recenzije) su uspešno obrisani!" });
        }
    }
}