// Controllers/EmergencyController.cs (Updated)
using first;
using first.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniProject.Dtos;
using UniProject.Services;


namespace UniProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmergencyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmergencyAlertService _alertService;
        private readonly ILogger<EmergencyController> _logger;
        private readonly CompositeNotificationService _notificationService;

        public EmergencyController(
            ApplicationDbContext context,
            EmergencyAlertService alertService,
            ILogger<EmergencyController> logger,
            CompositeNotificationService notificationService)
        {
            _context = context;
            _alertService = alertService;
            _logger = logger;
            _notificationService = notificationService;
        }

 
        [HttpPost("create")]
        public async Task<IActionResult> CreateEmergency([FromBody] CreateEmergencyDto emergencyDto)
        {
            try
            {
                var emergency = new EmergencyRequest
                {
                    BloodGroup = emergencyDto.BloodGroup,
                    UnitsRequired = emergencyDto.UnitsRequired,
                    Location = emergencyDto.Location,
                    Description = emergencyDto.Description,
                    CreatedAt = DateTime.Now,
                    IsActive = true
                };

                await _context.EmergencyRequests.AddAsync(emergency);
                await _context.SaveChangesAsync();

                // Broadcast alerts asynchronously
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _alertService.BroadcastEmergencyAlert(emergency.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Failed to broadcast alerts: {ex.Message}");
                    }
                });

                return Ok(new
                {
                    message = "Emergency created and alerts are being sent",
                    emergencyId = emergency.Id,
                    donorsNotified = await _context.Donors
                        .CountAsync(d => d.BloodGroup == emergency.BloodGroup && d.IsAvailable),
                    timestamp = emergency.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating emergency: {ex.Message}");
                return StatusCode(500, new { message = "Failed to create emergency", error = ex.Message });
            }
        }


        [HttpPost("test-notifications")]
        public async Task<IActionResult> TestNotifications([FromBody] TestNotificationDto dto)
        {
            try
            {
                var testEmail = dto.Email;
                var testPhone = dto.PhoneNumber;

                // Test email
                await _notificationService.SendEmailAsync(
                    testEmail,
                    "B-Donar System Test Email",
                    "<h3>Test Email from B-Donar System</h3><p>This is a test email to verify the system is working correctly.</p>"
                );

                // Test SMS (limited to 160 chars)
                var testSmsMessage = $"B-Donar Test SMS - System working - {DateTime.Now:HH:mm}";
                await _notificationService.SendSmsAsync(testPhone, testSmsMessage);

                return Ok(new
                {
                    message = "Test notifications sent successfully",
                    emailSent = testEmail,
                    smsSent = testPhone
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Test failed", error = ex.Message });
            }
        }
    }

    public class TestNotificationDto
    {
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
