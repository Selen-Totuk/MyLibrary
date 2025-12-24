using System.ComponentModel.DataAnnotations;

namespace MyLibrary.Models {
    public class User {
        [Key] public int Id { get; set; }
        [Required(ErrorMessage = "Ad Soyad zorunludur")] public string FullName { get; set; } = "";
        [Required, EmailAddress] public string Email { get; set; } = "";
        [Required, MinLength(6)] public string Password { get; set; } = "";
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }
}