using Microsoft.AspNetCore.Mvc;
using Api.Models;
using Api.Services;

namespace Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrdersController(OrderService orderService)
        {
            _orderService = orderService;
        }

        // POST: api/Orders
        // Kreira novu narudžbinu
        [HttpPost]
        public async Task<ActionResult<Order>> Create(Order order)
        {
            // Validacija: Narudžbina mora imati barem jedan artikal
            if (order.Items == null || !order.Items.Any())
            {
                return BadRequest("Narudžbina mora sadržati barem jedan proizvod.");
            }

            var createdOrder = await _orderService.CreateOrderAsync(order);
            return Ok(createdOrder);
        }

        // GET: api/Orders/user/{userId}
        // Vraća sve narudžbine za određenog korisnika
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Order>>> GetUserOrders(string userId)
        {
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }

        // GET: api/Orders/{id}/details
        // Vraća detalje narudžbine spojene sa podacima o korisniku (simulacija Join-a)
        [HttpGet("{id}/details")]
        public async Task<ActionResult<object>> GetOrderDetails(string id)
        {
            var details = await _orderService.GetOrderDetailsWithUserAsync(id);
            if (details == null)
            {
                return NotFound($"Narudžbina sa ID-em {id} nije pronađena.");
            }
            return Ok(details);
        }

        // PATCH: api/Orders/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] OrderStatus status)
        {
            var updated = await _orderService.UpdateStatusAsync(id, status);
            if (!updated)
                return NotFound($"Narudžbina sa ID-em {id} nije pronađena.");
            return Ok(new { Message = $"Status narudžbine uspešno promenjen na {status}." });
        }

        // GET: api/Orders/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<Order>>> GetByStatus(OrderStatus status)
        {
            var orders = await _orderService.GetByStatusAsync(status);
            return Ok(orders);
        }
    }
}