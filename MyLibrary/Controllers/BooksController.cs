using Microsoft.AspNetCore.Mvc;
using MyLibrary.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace MyLibrary.Controllers
{
    [Authorize]
    public class BooksController : Controller
    {
        private readonly LibraryDbContext _db;
        public BooksController(LibraryDbContext db) => _db = db;

        private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        // Tüm Kitaplar (Genel Liste)
        public async Task<IActionResult> Index() 
            => View(await _db.Books.Where(b => b.UserId == CurrentUserId).ToListAsync());

        // Özel Kategoriler
        public async Task<IActionResult> Reading() 
            => View("Index", await _db.Books.Where(b => b.UserId == CurrentUserId && b.Status == 1).ToListAsync());

        public async Task<IActionResult> ToRead() 
            => View("Index", await _db.Books.Where(b => b.UserId == CurrentUserId && b.Status == 2).ToListAsync());

        public async Task<IActionResult> Finished() 
            => View("Finished", await _db.Books.Where(b => b.UserId == CurrentUserId && b.Status == 3).ToListAsync());

        public async Task<IActionResult> Wishlist() 
            => View("Index", await _db.Books.Where(b => b.UserId == CurrentUserId && b.Status == 4).ToListAsync());

        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Book book, string? coverUrl)
        {
            book.UserId = CurrentUserId;
            if (!string.IsNullOrEmpty(coverUrl)) book.CoverImage = coverUrl;

            _db.Books.Add(book);
            await _db.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Delete(int id)
        {
            var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == id && b.UserId == CurrentUserId);
            if (book != null) { _db.Books.Remove(book); await _db.SaveChangesAsync(); }
            return RedirectToAction(nameof(Index));
        }
    }
}