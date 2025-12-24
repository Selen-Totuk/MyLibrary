using Microsoft.AspNetCore.Mvc;
using MyLibrary.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace MyLibrary.Controllers {
    public class AccountController : Controller {
        private readonly LibraryDbContext _db;
        public AccountController(LibraryDbContext db) => _db = db;

        public IActionResult Register() => View();
        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Register(User user) {
            if (_db.Users.Any(u => u.Email == user.Email)) {
                ModelState.AddModelError("Email", "Bu e-posta zaten kayıtlı.");
                return View(user);
            }
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return RedirectToAction("Login");
        }

        public IActionResult Login() => View();
        [HttpPost, ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(string email, string password) {
            var user = _db.Users.FirstOrDefault(u => u.Email == email && u.Password == password);
            if (user == null) { ViewBag.Error = "Hatalı giriş!"; return View(); }

            var claims = new List<Claim> { 
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName) 
            };
            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            await HttpContext.SignInAsync(new ClaimsPrincipal(identity));
            return RedirectToAction("Index", "Books");
        }

        public async Task<IActionResult> Logout() {
            await HttpContext.SignOutAsync();
            return RedirectToAction("Login");
        }
    }
}