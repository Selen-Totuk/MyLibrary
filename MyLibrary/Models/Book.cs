using System.ComponentModel.DataAnnotations;

namespace MyLibrary.Models
{
    public class Book
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Kitap başlığı zorunludur")]
        public string Title { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Yazar adı zorunludur")]
        public string Author { get; set; } = string.Empty;
        
        // 1: Okuyorum, 2: Okuyacaklarım, 3: Okuduklarım, 4: Alacaklarım
        [Required]
        public int Status { get; set; } = 2; 
        
        public int TotalPages { get; set; }
        public int PagesRead { get; set; }
        public string? CoverImage { get; set; }
        public string? ThumbnailPath { get; set; } // Hata veren eksik kısım eklendi
        
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}