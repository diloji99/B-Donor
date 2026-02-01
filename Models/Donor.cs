using System.ComponentModel.DataAnnotations;

namespace UniProject.Models
{
    public class Donor
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string UniversityId { get; set; }

        [Required]
        public string BloodGroup { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        public string Email { get; set; }

        public DateTime LastDonationDate { get; set; }

        public bool IsAvailable { get; set; } = true;

        public string PasswordHash { get; set; }
    }
}
    

