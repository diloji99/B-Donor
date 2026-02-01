// Services/EmergencyAlertService.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace UniProject.Services
{
    public class EmergencyAlertService
    {
        private readonly ApplicationDbContext _context;
        private readonly CompositeNotificationService _notificationService;
        private readonly ILogger<EmergencyAlertService> _logger;

        public EmergencyAlertService(
            ApplicationDbContext context,
            CompositeNotificationService notificationService,
            ILogger<EmergencyAlertService> logger)
        {
            _context = context;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task BroadcastEmergencyAlert(int emergencyId)
        {
            var emergency = await _context.EmergencyRequests.FindAsync(emergencyId);
            if (emergency == null)
            {
                _logger.LogWarning($"Emergency {emergencyId} not found");
                return;
            }

            // Find matching donors
            var matchingDonors = await _context.Donors
                .Where(d => d.BloodGroup == emergency.BloodGroup && d.IsAvailable)
                .ToListAsync();

            _logger.LogInformation($"Broadcasting alert to {matchingDonors.Count} donors for blood group {emergency.BloodGroup}");

            var notificationTasks = new List<Task>();

            foreach (var donor in matchingDonors)
            {
                // Prepare email message
                var emailMessage = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #dc3545; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; background-color: #f8f9fa; }}
                            .button {{ display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }}
                            .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h2>🚨 EMERGENCY BLOOD REQUEST</h2>
                                <h3>Blood Group: {emergency.BloodGroup}</h3>
                            </div>
                            <div class='content'>
                                <p><strong>Dear {donor.Name},</strong></p>
                                <p>Your blood group <strong>{emergency.BloodGroup}</strong> is urgently needed at:</p>
                                
                                <div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                                    <p><strong>📍 Location:</strong> {emergency.Location}</p>
                                    <p><strong>💉 Units Required:</strong> {emergency.UnitsRequired}</p>
                                    <p><strong>📝 Description:</strong> {emergency.Description}</p>
                                    <p><strong>⏰ Emergency Created:</strong> {emergency.CreatedAt:yyyy-MM-dd HH:mm}</p>
                                </div>
                                
                                <p>Please respond immediately by clicking the button below:</p>
                                
                                <div style='text-align: center; margin: 25px 0;'>
                                    <a href='https://bdonar.university.edu/respond/{emergency.Id}' class='button'>I'M AVAILABLE TO DONATE</a>
                                </div>
                                
                                <p>If you're unable to donate, please let us know by updating your availability status in the system.</p>
                                
                                <p><strong>Important Notes:</strong></p>
                                <ul>
                                    <li>Please ensure you meet all donation requirements</li>
                                    <li>Bring your University ID when coming to donate</li>
                                    <li>Stay hydrated before donation</li>
                                </ul>
                            </div>
                            <div class='footer'>
                                <p>This is an automated message from the B-Donar System.</p>
                                <p>University of Vavuniya - Emergency Blood Donation System</p>
                                <p>If you wish to change your notification preferences, please log in to your donor dashboard.</p>
                            </div>
                        </div>
                    </body>
                    </html>";

                // Prepare SMS message (shortened)
                var smsMessage = $"EMERGENCY: Blood {emergency.BloodGroup} needed at {emergency.Location}. " +
                               $"Required: {emergency.UnitsRequired} units. " +
                               $"Please login to B-Donar system to respond.";

                // Send both email and SMS
                var notificationTask = _notificationService.SendBothAsync(
                    donor.Email,
                    donor.PhoneNumber,
                    $"🚨 EMERGENCY: Blood {emergency.BloodGroup} Required",
                    emailMessage,
                    smsMessage
                );

                notificationTasks.Add(notificationTask);
            }

            try
            {
                await Task.WhenAll(notificationTasks);
                _logger.LogInformation($"All notifications sent for emergency {emergencyId}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending notifications: {ex.Message}");
                // Continue even if some notifications fail
            }
        }

        public async Task SendWelcomeEmail(string donorName, string toEmail, string bloodGroup, string universityId)
        {
            try
            {
                var welcomeMessage = $@"
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; background-color: #f8f9fa; }}
                            .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h2>🎉 Welcome to B-Donar!</h2>
                                <p>University Blood Donor Emergency Alert System</p>
                            </div>
                            <div class='content'>
                                <p><strong>Dear {donorName},</strong></p>
                                <p>Thank you for registering as a blood donor with the University of Vavuniya. Your commitment to saving lives is greatly appreciated!</p>
                                
                                <div style='background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;'>
                                    <p><strong>📋 Your Registration Details:</strong></p>
                                    <ul>
                                        <li><strong>Name:</strong> {donorName}</li>
                                        <li><strong>University ID:</strong> {universityId}</li>
                                        <li><strong>Blood Group:</strong> {bloodGroup}</li>
                                    </ul>
                                </div>
                                
                                <p><strong>How the System Works:</strong></p>
                                <ol>
                                    <li>When an emergency blood requirement arises, you will receive instant notifications</li>
                                    <li>You can respond directly from the email or SMS</li>
                                    <li>The system will coordinate the donation process</li>
                                    <li>You can update your availability at any time</li>
                                </ol>
                                
                                <p><strong>Important:</strong></p>
                                <ul>
                                    <li>Keep your contact information updated</li>
                                    <li>Ensure you meet donation eligibility criteria</li>
                                    <li>You can opt-out of notifications at any time</li>
                                </ul>
                                
                                <p>Login to your donor dashboard: <a href='https://bdonar.university.edu/login'>https://bdonar.university.edu/login</a></p>
                            </div>
                            <div class='footer'>
                                <p>Thank you for being a life-saver!</p>
                                <p>B-Donar System Administration<br>
                                University of Vavuniya<br>
                                Contact: bdonar@university.edu</p>
                            </div>
                        </div>
                    </body>
                    </html>";

                await _notificationService.SendEmailAsync(
                    toEmail,
                    "Welcome to B-Donar - Blood Donor System",
                    welcomeMessage
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send welcome email: {ex.Message}");
            }
        }
    }
}