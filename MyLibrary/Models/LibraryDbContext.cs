using Microsoft.EntityFrameworkCore;

namespace MyLibrary.Models {
    public class LibraryDbContext : DbContext {
        public LibraryDbContext(DbContextOptions<LibraryDbContext> options) : base(options) { }
        public DbSet<Book> Books { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            modelBuilder.Entity<Book>().Property(b => b.CreatedDate).HasDefaultValueSql("datetime('now')");
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        }
    }
}