using Microsoft.AspNetCore.Mvc;
using MyLibrary.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MyLibrary.Controllers
{
    [Authorize]
    public class DashboardController : Controller
    {
        private readonly LibraryDbContext _db;
        public DashboardController(LibraryDbContext db) => _db = db;

        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
            
            var model = new DashboardViewModel
            {
                TotalBooks = await _db.Books.CountAsync(b => b.UserId == userId),
                Reading = await _db.Books.CountAsync(b => b.UserId == userId && b.Status == 1),
                ToRead = await _db.Books.CountAsync(b => b.UserId == userId && b.Status == 2),
                Finished = await _db.Books.CountAsync(b => b.UserId == userId && b.Status == 3),
                Purchased = await _db.Books.CountAsync(b => b.UserId == userId && b.Status == 4),
                Recent = await _db.Books
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.Id)
                    .Take(5)
                    .ToListAsync()
            };

            return View(model);
        }
    }
}