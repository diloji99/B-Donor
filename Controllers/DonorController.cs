using Microsoft.AspNetCore.Mvc;
using global::UniProject.Models;
using Microsoft.AspNetCore.Authorization;
// Controllers/DonorController.cs (Updated)
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UniProject.Dtos;
using UniProject.Services;


namespace UniProject.Controllers
    {
    [ApiController]
    [Route("api/[controller]")]
    public class DonorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmergencyAlertService _alertService;
        private readonly ILogger<DonorController> _logger;
        private readonly CompositeNotificationService _notificationService;
        private readonly IConfiguration _configuration;

        public DonorController(
            ApplicationDbContext context,
            EmergencyAlertService alertService,
            ILogger<DonorController> logger,
            CompositeNotificationService notificationService,
            IConfiguration configuration)
        {
            _context = context;
            _alertService = alertService;
            _logger = logger;
            _notificationService = notificationService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterDonor([FromBody] DonorRegistrationDto registrationDto)
        {
            try
            {
                // Validate phone number format
                if (!IsValidPhoneNumber(registrationDto.PhoneNumber))
                    return BadRequest(new { message = "Invalid phone number format" });

                // Validate email format
                if (!IsValidEmail(registrationDto.Email))
                    return BadRequest(new { message = "Invalid email format" });

                // Check if donor already exists
                var existingDonor = await _context.Donors
                    .FirstOrDefaultAsync(d => d.UniversityId == registrationDto.UniversityId ||
                                             d.Email == registrationDto.Email);

                if (existingDonor != null)
                    return BadRequest(new { message = "Donor already registered with this University ID or Email" });

                // Create new donor
                var donor = new Donor
                {
                    Name = registrationDto.Name,
                    UniversityId = registrationDto.UniversityId,
                    BloodGroup = registrationDto.BloodGroup,
                    PhoneNumber = FormatPhoneNumber(registrationDto.PhoneNumber),
                    Email = registrationDto.Email.ToLower(),
                    LastDonationDate = registrationDto.LastDonationDate,
                    IsAvailable = true,

                };

                await _context.Donors.AddAsync(donor);
                await _context.SaveChangesAsync();

                // Create default notification preferences
                var preferences = new NotificationPreferences
                {
                    DonorId = donor.Id,
                    ReceiveEmail = true,
                    ReceiveSms = true,
                    EmergencyAlerts = true,
                    UpdatedAt = DateTime.Now
                };
                await _context.NotificationPreferences.AddAsync(preferences);
                await _context.SaveChangesAsync();

                // Send welcome email
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _alertService.SendWelcomeEmail(
                            donor.Name,
                            donor.Email,
                            donor.BloodGroup,
                            donor.UniversityId
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Failed to send welcome email: {ex.Message}");
                    }
                });

                // Generate JWT token
                var token = GenerateJwtToken(donor.Id.ToString(), "Donor", donor.UniversityId);

                return Ok(new
                {
                    message = "Donor registered successfully",
                    donorId = donor.Id,
                    token,
                    donor = new
                    {
                        donor.Name,
                        donor.UniversityId,
                        donor.BloodGroup,
                        donor.Email,
                        donor.PhoneNumber
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Registration failed: {ex.Message}");
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
        }

        [Authorize(Roles = "Donor")]
        [HttpPost("test-notification")]
        public async Task<IActionResult> TestDonorNotification()
        {
            var donorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var donor = await _context.Donors.FindAsync(donorId);

            if (donor == null)
                return NotFound(new { message = "Donor not found" });

            try
            {
                // Test email
                await _notificationService.SendEmailAsync(
                    donor.Email,
                    "Test Notification - B-Donar System",
                    $"<h3>Test Notification</h3><p>Hello {donor.Name}, this is a test notification from the B-Donar system.</p>"
                );

                // Test SMS
                await _notificationService.SendSmsAsync(
                    donor.PhoneNumber,
                    $"B-Donar Test: Notifications working - {DateTime.Now:HH:mm}"
                );

                return Ok(new { message = "Test notifications sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Test failed", error = ex.Message });
            }
        }

        private bool IsValidPhoneNumber(string phoneNumber)
        {
            // Remove all non-digit characters
            var digits = new string(phoneNumber.Where(char.IsDigit).ToArray());
            return digits.Length >= 10;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private string FormatPhoneNumber(string phoneNumber)
        {
            // Remove all non-digit characters
            var digits = new string(phoneNumber.Where(char.IsDigit).ToArray());

            // Ensure it starts with country code for Sri Lanka
            if (digits.StartsWith("94") && digits.Length == 11)
                return $"+{digits}";
            else if (digits.StartsWith("0") && digits.Length == 10)
                return $"+94{digits.Substring(1)}";
            else
                return $"+{digits}";
        }

        private string GenerateJwtToken(string userId, string role, string uniqueName)
        {
            // JWT token generation logic (same as before)
            return "token";
        }
    }
    
}
