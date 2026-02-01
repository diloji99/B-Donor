using Microsoft.EntityFrameworkCore;
using UniProject.Dtos;
using UniProject.Models;

namespace UniProject
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Donor> Donors { get; set; }
        public DbSet<EmergencyRequest> EmergencyRequests { get; set; }
        public DbSet<DonorResponse> DonorResponses { get; set; }
        public DbSet<NotificationLog> NotificationLogs { get; set; }
        public DbSet<NotificationPreferences> NotificationPreferences { get; set; }

    
    }
}
