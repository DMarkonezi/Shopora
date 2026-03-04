using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewService _reviewService;

        public ReviewsController(ReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET: api/Reviews/product/{productId}
        // Dobavlja sve recenzije za određeni proizvod
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<List<Review>>> GetByProduct(string productId)
        {
            var reviews = await _reviewService.GetByProductAsync(productId);
            return Ok(reviews);
        }

        // GET: api/Reviews/product/{productId}/average
        // Vraća prosečnu ocenu proizvoda (koristi Aggregation Pipeline)
        [HttpGet("product/{productId}/average")]
        public async Task<ActionResult<double>> GetAverageRating(string productId)
        {
            var average = await _reviewService.GetAverageRatingAsync(productId);
            return Ok(new { ProductId = productId, AverageRating = average });
        }

        // GET: api/Reviews/user/{userId}
        // Dobavlja sve recenzije koje je napisao određeni korisnik
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Review>>> GetByUser(string userId)
        {
            var reviews = await _reviewService.GetByUserAsync(userId);
            return Ok(reviews);
        }

        // POST: api/Reviews
        // Kreira novu recenziju
        [HttpPost]
        public async Task<ActionResult<Review>> Create(Review review)
        {
            // Validacija ocene (mora biti između 1 i 5)
            if (review.Rating < 1 || review.Rating > 5)
            {
                return BadRequest("Ocena mora biti između 1 i 5.");
            }

            var createdReview = await _reviewService.CreateAsync(review);
            return Ok(createdReview);
        }

        // DELETE: api/Reviews/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _reviewService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound("Recenzija nije pronađena.");
            }
            return NoContent();
        }
    }
}