using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniProject.Models
{
    public class DonorResponse
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int DonorId { get; set; }

        [ForeignKey("DonorId")]
        public Donor Donor { get; set; }

        [Required]
        public int EmergencyRequestId { get; set; }

        [ForeignKey("EmergencyRequestId")]
        public EmergencyRequest EmergencyRequest { get; set; }

        [Required]
        public bool Response { get; set; } // true for available, false for not available

        public DateTime RespondedAt { get; set; } = DateTime.Now;
    }
}
