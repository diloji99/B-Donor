// Controllers/DonorController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniProject.Services;
using first;
using first.Models;

namespace UniProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly CompositeNotificationService _notificationService;
        private readonly ILogger<DonorController> _logger;

        public DonorController(
            ApplicationDbContext context,
            CompositeNotificationService notificationService,
            ILogger<DonorController> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        // ===============================
        // GET: Active emergencies
        // ===============================
        [HttpGet("emergencies")]
        public async Task<IActionResult> GetActiveEmergencies()
        {
            var emergencies = await _context.EmergencyRequests
                .Where(e => e.IsActive)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.BloodGroup,
                    e.UnitsRequired,
                    e.Location,
                    e.Description,
                    e.CreatedAt
                })
                .ToListAsync();

            return Ok(emergencies);
        }

        // ======================================
        // POST: Donor accepts an emergency
        // ======================================
        [HttpPost("emergencies/{emergencyId}/accept")]
        public async Task<IActionResult> AcceptEmergency(
            int emergencyId,
            [FromBody] AcceptEmergencyRequest request)
        {
            // 1️⃣ Validate donor
            var donor = await _context.Donors.FindAsync(request.DonorId);
            if (donor == null)
                return NotFound(new { message = "Donor not found" });

            if (!donor.IsAvailable)
                return BadRequest(new { message = "You are currently unavailable for donation" });

            // 2️⃣ Validate emergency
            var emergency = await _context.EmergencyRequests.FindAsync(emergencyId);
            if (emergency == null || !emergency.IsActive)
                return NotFound(new { message = "Emergency not available" });

            // 3️⃣ Mark donor unavailable
            donor.IsAvailable = false;

            await _context.SaveChangesAsync();

            // 4️⃣ Send notification (background)
            _ = Task.Run(async () =>
            {
                try
                {
                    await _notificationService.SendEmailAsync(
                        donor.Email,
                        "Emergency Accepted - B-Donar System",
                        $"<p>Thank you <b>{donor.Name}</b> for accepting the emergency request.</p>"
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Notification error");
                }
            });

            return Ok(new
            {
                message = "Emergency accepted successfully",
                emergencyId,
                donor = donor.Name
            });
        }

        // ===============================
        // POST: Test notifications
        // ===============================
        [HttpPost("test-notification")]
        public async Task<IActionResult> TestNotification([FromBody] int donorId)
        {
            var donor = await _context.Donors.FindAsync(donorId);

            if (donor == null)
                return NotFound(new { message = "Donor not found" });

            try
            {
                await _notificationService.SendEmailAsync(
                    donor.Email,
                    "Test Notification - B-Donar",
                    $"<p>Hello {donor.Name}, your notifications are working correctly.</p>"
                );

                await _notificationService.SendSmsAsync(
                    donor.PhoneNumber,
                    $"B-Donar Test SMS - {DateTime.Now:HH:mm}"
                );

                return Ok(new { message = "Test notifications sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Test failed", error = ex.Message });
            }
        }
    }

    // ===============================
    // Request DTO
    // ===============================
    public class AcceptEmergencyRequest
    {
        public int DonorId { get; set; }
    }
}
