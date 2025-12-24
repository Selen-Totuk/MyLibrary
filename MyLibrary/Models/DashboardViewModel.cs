namespace MyLibrary.Models
{
    public class DashboardViewModel
    {
        public int TotalBooks { get; set; }
        public int Reading { get; set; }
        public int ToRead { get; set; }
        public int Finished { get; set; }
        public int Purchased { get; set; }
        public List<Book> Recent { get; set; } = new List<Book>();
    }
}