using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;

        public UsersController(UserService userService)
        {
            _userService = userService;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        // GET: api/Users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetById(string id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound($"Korisnik sa ID-em {id} nije pronađen.");
            }
            return Ok(user);
        }

        // GET: api/Users/email/{email}
        [HttpGet("email/{email}")]
        public async Task<ActionResult<User>> GetByEmail(string email)
        {
            var user = await _userService.GetByEmailAsync(email);
            if (user == null)
            {
                return NotFound($"Korisnik sa email-om {email} nije pronađen.");
            }
            return Ok(user);
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> Create(User user)
        {
            // Provera da li email već postoji
            var existingUser = await _userService.GetByEmailAsync(user.Email);
            if (existingUser != null)
            {
                return BadRequest("Korisnik sa ovim email-om već postoji.");
            }

            var createdUser = await _userService.CreateAsync(user);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        }

        // PUT: api/Users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, User user)
        {
            var updated = await _userService.UpdateAsync(id, user);
            if (!updated)
            {
                return NotFound("Ažuriranje neuspešno. Korisnik nije pronađen.");
            }
            return NoContent();
        }

        // DELETE: api/Users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _userService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound("Brisanje neuspešno. Korisnik nije pronađen.");
            }
            return NoContent();
        }

        // POST: api/Users/{id}/address
        [HttpPost("{id}/address")]
        public async Task<IActionResult> AddAddress(string id, Address address)
        {
            var result = await _userService.AddAddressAsync(id, address);
            if (!result)
            {
                return NotFound("Dodavanje adrese neuspešno. Korisnik nije pronađen.");
            }
            return Ok("Adresa uspešno dodata korisniku.");
        }

        [HttpDelete("{id}/address")]
        public async Task<IActionResult> RemoveAddress(string id, [FromBody] string street)
        {
            var result = await _userService.RemoveAddressAsync(id, street);
            if (!result)
                return NotFound("Uklanjanje adrese neuspešno. Korisnik ili adresa nisu pronađeni.");
            return Ok("Adresa uspešno uklonjena.");
        }
    }
}