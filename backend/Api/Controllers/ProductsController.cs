using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductsController(ProductService productService)
        {
            _productService = productService;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetAll()
        {
            var products = await _productService.GetAllAsync();
            return Ok(products);
        }

        // GET: api/Products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(string id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound($"Proizvod sa ID-em {id} nije pronađen.");
            }
            return Ok(product);
        }

        // GET: api/Products/filter?brand=Asus&minPrice=50000
        [HttpGet("filter")]
        public async Task<ActionResult<List<Product>>> GetFiltered([FromQuery] string brand, [FromQuery] decimal minPrice)
        {
            var products = await _productService.GetFilteredAsync(brand, minPrice);
            return Ok(products);
        }

        // GET: api/Products/page?skip=0&limit=10
        [HttpGet("page")]
        public async Task<ActionResult<List<Product>>> GetPaginated([FromQuery] int skip = 0, [FromQuery] int limit = 10)
        {
            var products = await _productService.GetPaginatedAsync(skip, limit);
            return Ok(products);
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<Product>> Create(Product product)
        {
            var createdProduct = await _productService.CreateAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, createdProduct);
        }

        // PUT: api/Products/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Product product)
        {
            var updated = await _productService.UpdateAsync(id, product);
            if (!updated)
            {
                return NotFound("Ažuriranje neuspešno. Proizvod nije pronađen.");
            }
            return NoContent();
        }

        // DELETE: api/Products/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _productService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound("Brisanje neuspešno. Proizvod nije pronađen.");
            }
            return NoContent();
        }
    }
}