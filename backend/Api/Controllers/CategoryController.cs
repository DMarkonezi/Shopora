using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryService _categoryService;

        public CategoriesController(CategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<List<Category>>> GetAll()
        {
            var categories = await _categoryService.GetAllAsync();
            return Ok(categories);
        }

        // GET: api/Categories/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(string id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            if (category == null)
                return NotFound($"Kategorija sa ID-em {id} nije pronađena.");
            return Ok(category);
        }

        // GET: api/Categories/{parentId}/subcategories
        [HttpGet("{parentId}/subcategories")]
        public async Task<ActionResult<List<Category>>> GetSubcategories(string parentId)
        {
            var subcategories = await _categoryService.GetByParentAsync(parentId);
            return Ok(subcategories);
        }

        // POST: api/Categories
        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            var created = await _categoryService.CreateAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/Categories/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Category category)
        {
            var updated = await _categoryService.UpdateAsync(id, category);
            if (!updated)
                return NotFound("Ažuriranje neuspešno. Kategorija nije pronađena.");
            return NoContent();
        }

        // DELETE: api/Categories/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _categoryService.DeleteAsync(id);
            if (!deleted)
                return NotFound("Brisanje neuspešno. Kategorija nije pronađena.");
            return NoContent();
        }
    }
}