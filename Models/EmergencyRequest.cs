using System;
using System.ComponentModel.DataAnnotations;
using UniProject.Models;

namespace UniProject.Models
{
    public class EmergencyRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string BloodGroup { get; set; }

        [Required]
        public int UnitsRequired { get; set; }

        [Required]
        public string Location { get; set; }

        public string Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;
    }
}